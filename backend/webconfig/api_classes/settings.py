from rest_framework import serializers, views, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.conf import settings
from config.models import AppSettings
from users.utils.crypto import encrypt_text, is_encrypted_text
from webconfig.models import Template, UserURL
from .utils import _site_variants, _log

class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = ['id', 'primary_color', 'secondary_color', 'font_family', 'logo', 'currencies', 'updated_at',
                  'company_name','company_nit','company_phone','company_whatsapp','company_email','company_address','company_description',
                  'printer_type','printer_name','paper_width_mm','auto_print','receipt_footer', 'whatsapp_config', 'google_config', 'page_content',
                  'shipping_cost', 'free_shipping_threshold', 'pickup_enabled']

    def validate_whatsapp_config(self, value):
        if isinstance(value, dict):
            if 'access_token' in value:
                token = value['access_token']
                if token and not is_encrypted_text(token):
                    value['access_token'] = encrypt_text(token)
        return value

    def validate_google_config(self, value):
        try:
            if isinstance(value, dict):
                # Encrypt app_password if present
                if 'app_password' in value:
                    pwd = value['app_password']
                    if pwd and not is_encrypted_text(pwd):
                        value['app_password'] = encrypt_text(str(pwd))
            return value
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise serializers.ValidationError(f"Error procesando configuración de Google: {str(e)}")

    def update(self, instance, validated_data):
        if 'whatsapp_config' in validated_data:
            new_config = validated_data['whatsapp_config']
            old_config = instance.whatsapp_config or {}
            
            # Preserve sensitive keys if not provided in update
            if 'access_token' not in new_config and 'access_token' in old_config:
                new_config['access_token'] = old_config['access_token']
                
            validated_data['whatsapp_config'] = new_config

        if 'google_config' in validated_data:
            new_config = validated_data['google_config']
            old_config = instance.google_config or {}
            
            # Preserve sensitive keys if not provided in update
            if 'app_password' not in new_config and 'app_password' in old_config:
                new_config['app_password'] = old_config['app_password']
                
            validated_data['google_config'] = new_config
            
        return super().update(instance, validated_data)


class WebSettingsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get(self, request):
        
        # Seleccionar configuración específica del tenant del usuario
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
        except Exception:
            user_tenant = None
        if user_tenant:
            ws = AppSettings.objects.filter(tenant=user_tenant).first()
            if not ws:
                ws = AppSettings.objects.create(tenant=user_tenant)
        else:
            ws = AppSettings.objects.first() or AppSettings.objects.create()
        try:
            if not ws.logo:
                ws.logo.name = 'web/logo/logo_2.png'
                ws.save(update_fields=['logo'])
        except Exception:
            pass
        
        data = AppSettingsSerializer(ws).data
        if request.user.is_authenticated:
            personal = Template.objects.filter(owner=request.user, is_personal=True).order_by('-created_at').first()
            if personal and personal.page_content:
                data['page_content'] = {**data.get('page_content', {}), **personal.page_content}

        return Response(data)

    def put(self, request):
        try:
            # Actualizar configuración aislada por tenant
            try:
                user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
            except Exception:
                user_tenant = None
            if user_tenant:
                ws = AppSettings.objects.filter(tenant=user_tenant).first()
                if not ws:
                    ws = AppSettings.objects.create(tenant=user_tenant)
            else:
                ws = AppSettings.objects.first() or AppSettings.objects.create()
            
            data = request.data.copy()
            if 'receipt_footer' in data:
                import re
                t = str(data.get('receipt_footer') or '')
                t = re.sub(r"<\s*script[\s\S]*?>[\s\S]*?<\s*/\s*script\s*>", "", t, flags=re.IGNORECASE)
                data['receipt_footer'] = t
            
            serializer = AppSettingsSerializer(ws, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except serializers.ValidationError as e:
            raise e
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'detail': f'Error guardando configuración: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicSettingsView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_settings', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
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
        ws = AppSettings.objects.filter(tenant=tenant).first() if tenant else None
        data = AppSettingsSerializer(ws).data if ws else {}
        data['google_client_id'] = getattr(settings, 'GOOGLE_CLIENT_ID', '')
        return Response(data)
