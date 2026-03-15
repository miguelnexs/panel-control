from rest_framework import serializers, views, status, permissions
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from webconfig.models import Policy
from .utils import _log
import re

class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = ['id', 'shipping_text', 'returns_text', 'privacy_text', 'updated_at']


class PolicyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        pol = Policy.objects.first()
        if not pol:
            pol = Policy.objects.create()
        return Response(PolicySerializer(pol).data)

    def put(self, request):
        pol = Policy.objects.first()
        if not pol:
            pol = Policy.objects.create()
        def sanitize(text):
            try:
                if text is None:
                    return ''
                t = str(text)
                t = re.sub(r"<\s*script[\s\S]*?>[\s\S]*?<\s*/\s*script\s*>", "", t, flags=re.IGNORECASE)
                return t
            except Exception:
                return ''
        data = request.data.copy()
        for k in ['shipping_text','returns_text','privacy_text']:
            if k in data:
                data[k] = sanitize(data.get(k))
        serializer = PolicySerializer(pol, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PublicPolicyView(views.APIView):
    permission_classes = [permissions.AllowAny]
    @method_decorator(cache_page(300))
    def get(self, request):
        _log(request, 'public_policy', True, None)
        pol = Policy.objects.first() or Policy.objects.create()
        return Response(PolicySerializer(pol).data)
