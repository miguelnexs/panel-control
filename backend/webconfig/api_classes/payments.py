from rest_framework import serializers, generics, views, permissions
from rest_framework.response import Response
from webconfig.models import PaymentMethod, UserURL
from config.models import AppSettings
from users.utils.crypto import encrypt_text, is_encrypted_text
from .utils import _log, _site_variants

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'provider', 'fee_percent', 'active', 'currencies', 'extra_config', 'created_at']

    def validate_extra_config(self, value):
        if isinstance(value, dict):
            if 'private_key' in value:
                pk = value['private_key']
                if pk and not is_encrypted_text(pk):
                    value['private_key'] = encrypt_text(pk)
        return value

    def update(self, instance, validated_data):
        if 'extra_config' in validated_data:
            new_config = validated_data['extra_config']
            old_config = instance.extra_config or {}
            
            # Preserve sensitive keys if not provided in update
            if 'private_key' not in new_config and 'private_key' in old_config:
                new_config['private_key'] = old_config['private_key']
                
            validated_data['extra_config'] = new_config
            
        return super().update(instance, validated_data)


class PaymentMethodListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        try:
            tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant or None
        except Exception:
            tenant = None
        qs = PaymentMethod.objects.all().order_by('id')
        if tenant:
            qs = qs.filter(tenant=tenant)
        return qs
    def perform_create(self, serializer):
        try:
            tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant or None
        except Exception:
            tenant = None
        serializer.save(tenant=tenant)


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        try:
            tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant or None
        except Exception:
            tenant = None
        qs = PaymentMethod.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        return qs


class PublicPaymentsView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_payments', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        ws = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        if tenant is None:
            ws = AppSettings.objects.first() or AppSettings.objects.create()
            tenant = ws.tenant
        qs = PaymentMethod.objects.filter(active=True)
        if tenant:
            qs = qs.filter(tenant=tenant)
        safe = []
        for pm in qs:
            item = {
                'id': pm.id,
                'name': pm.name,
                'provider': pm.provider,
                'fee_percent': pm.fee_percent,
                'currencies': pm.currencies,
                'active': pm.active,
            }
            ec = pm.extra_config or {}
            if pm.provider == 'whatsapp':
                phone = ec.get('phone') or ec.get('phone_number') or ((ws and ws.company_whatsapp) or (ws and ws.company_phone))
                template = ec.get('template') or 'Hola, quiero confirmar mi pago para la orden {order_number} por {total}.'
                item['whatsapp'] = {'phone': phone, 'template': template}
            elif pm.provider == 'mercadopago':
                item['extra_config'] = {
                    'public_key': ec.get('public_key')
                }
            elif pm.provider in ('paypal','stripe','credit_card'):
                pass
            safe.append(item)
        return Response(safe)
