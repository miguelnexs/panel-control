from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import Http404, JsonResponse
from .decorators import admin_required
from .models import UserProfile
from webconfig.models import PaymentMethod
from config.models import AppSettings
from users.utils.crypto import encrypt_text, is_encrypted_text
try:
    from sales.whatsapp_service import WhatsAppService
except ImportError:
    WhatsAppService = None

def ensure_tenant_for_user(user):
    try:
        if not user.profile.tenant:
            raise Http404("No tenant associated with user")
    except UserProfile.DoesNotExist:
        raise Http404("User profile not found")

@login_required
@admin_required
def tenant_dashboard(request):
    return render(request, 'users/tenant_dashboard.html')

@login_required
@admin_required
def tenant_settings(request):
    return render(request, 'users/tenant_settings.html')

@login_required
@admin_required
def tenant_themes(request):
    return render(request, 'users/tenant_themes.html')

@login_required
@admin_required
def tenant_permissions(request):
    return render(request, 'users/tenant_permissions.html')

@login_required
def super_admin_tenants(request):
    return render(request, 'users/super_admin_tenants.html')

@login_required
def super_admin_tenant_detail(request, tenant_id):
    return render(request, 'users/super_admin_tenant_detail.html')

@login_required
@admin_required
def tenant_payment_settings(request):
    """Payment methods configuration for tenant"""
    ensure_tenant_for_user(request.user)
    tenant = request.user.profile.tenant
    
    if request.method == 'POST':
        method_id = request.POST.get('method_id')
        name = request.POST.get('name')
        provider = request.POST.get('provider')
        fee_percent = request.POST.get('fee_percent', 0)
        active = request.POST.get('active') == 'on'
        
        # Extra config fields
        public_key = request.POST.get('public_key')
        private_key = request.POST.get('private_key')
        phone_number = request.POST.get('phone_number')
        
        extra_config = {}
        if public_key:
            extra_config['public_key'] = public_key
        if phone_number:
            extra_config['phone_number'] = phone_number
        
        if method_id:
            # Update existing
            method = get_object_or_404(PaymentMethod, id=method_id, tenant=tenant)
            method.name = name
            method.provider = provider
            method.fee_percent = fee_percent
            method.active = active
            
            # Preserve existing config if not overwritten
            current_config = method.extra_config or {}
            
            # Handle private key encryption
            if private_key:
                extra_config['private_key'] = encrypt_text(private_key)
            elif 'private_key' in current_config:
                extra_config['private_key'] = current_config['private_key']
            
            # Merge other fields
            current_config.update(extra_config)
            method.extra_config = current_config
            method.save()
            messages.success(request, f'Método de pago {name} actualizado.')
        else:
            # Create new
            if private_key:
                extra_config['private_key'] = encrypt_text(private_key)
            
            PaymentMethod.objects.create(
                tenant=tenant,
                name=name,
                provider=provider,
                fee_percent=fee_percent,
                active=active,
                extra_config=extra_config
            )
            messages.success(request, f'Método de pago {name} creado.')
        
        return redirect('tenant_payment_settings')
        
    payment_methods = PaymentMethod.objects.filter(tenant=tenant)
    
    context = {
        'payment_methods': payment_methods,
        'tenant': tenant,
    }
    
    return render(request, 'users/tenant_payment_settings.html', context)


@login_required
@admin_required
def tenant_whatsapp_settings(request):
    """WhatsApp configuration for tenant"""
    ensure_tenant_for_user(request.user)
    tenant = request.user.profile.tenant
        
    settings, created = AppSettings.objects.get_or_create(tenant=tenant)
    current_config = settings.whatsapp_config or {}
    
    if request.method == 'POST':
        phone_number_id = request.POST.get('phone_number_id')
        business_account_id = request.POST.get('business_account_id')
        access_token = request.POST.get('access_token')
        enable_notifications = request.POST.get('enable_notifications') == 'on'
        
        config = {
            'phone_number_id': phone_number_id,
            'business_account_id': business_account_id,
            'enable_notifications': enable_notifications
        }
        
        if access_token:
            config['access_token'] = encrypt_text(access_token)
        elif 'access_token' in current_config:
            config['access_token'] = current_config['access_token']
            
        settings.whatsapp_config = config
        settings.save()
        messages.success(request, 'Configuración de WhatsApp actualizada.')
        return redirect('tenant_whatsapp_settings')
        
    context = {
        'config': current_config,
        'tenant': tenant,
    }
    
    return render(request, 'users/tenant_whatsapp_settings.html', context)


@login_required
@admin_required
def tenant_whatsapp_test(request):
    """Test WhatsApp configuration"""
    ensure_tenant_for_user(request.user)
    tenant = request.user.profile.tenant
    
    if request.method == 'POST':
        test_phone = request.POST.get('test_phone')
        
        if not test_phone:
            messages.error(request, 'Debe ingresar un número de teléfono.')
            return redirect('tenant_whatsapp_settings')
            
        try:
            if WhatsAppService:
                ws = WhatsAppService(tenant=tenant)
                # Send a simple hello message template or text
                # Note: For initial testing without approved templates, 
                # we might need to use a pre-approved "hello_world" template if using sandbox
                # or just try to send a text if the session is open (usually requires template for business init)
                
                # Using a generic "hello_world" template often available in Meta apps
                success_response = ws.send_template(
                    to_phone=test_phone,
                    template_name="hello_world",
                    language="en_US"
                )
                
                if success_response and not success_response.get('error'):
                    messages.success(request, f'Mensaje de prueba enviado a {test_phone}')
                else:
                    err = success_response.get('error') if success_response else 'Unknown error'
                    messages.error(request, f'Error al enviar mensaje: {err}')
            else:
                messages.error(request, 'Servicio de WhatsApp no disponible.')
                
        except Exception as e:
            messages.error(request, f'Error: {str(e)}')
            
    return redirect('tenant_whatsapp_settings')
