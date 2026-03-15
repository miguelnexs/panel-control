from rest_framework import serializers, generics, views, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from webconfig.models import Banner

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'link', 'active', 'position', 'created_at']


class BannerListCreateView(generics.ListCreateAPIView):
    queryset = Banner.objects.all().order_by('position', '-created_at')
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        obj = serializer.save()
        # Enforce only one active banner
        if obj.active:
            Banner.objects.exclude(id=obj.id).update(active=False)


class BannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def perform_update(self, serializer):
        obj = serializer.save()
        if obj.active:
            Banner.objects.exclude(id=obj.id).update(active=False)


class PublicBannersView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        items = Banner.objects.filter(active=True).order_by('position', '-created_at')
        def abs_image(b):
            try:
                url = b.image.url if b.image else None
                if url and isinstance(url, str) and url.startswith('/'):
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                return None
        def resolve_image(b):
            try:
                if b.image:
                    url = b.image.url
                    if isinstance(url, str) and url.startswith('/'):
                        return request.build_absolute_uri(url)
                    return url
                if b.link:
                    return b.link
            except Exception:
                pass
            return None
        return Response([{
            'id': b.id,
            'title': b.title,
            'image': resolve_image(b),
            'position': b.position,
            'created_at': b.created_at,
        } for b in items])
