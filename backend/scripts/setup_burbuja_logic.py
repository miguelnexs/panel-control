from django.contrib.auth.models import User
from users.models import UserProfile, Tenant
from config.models import AppSettings
from webconfig.models import UserURL, PaymentMethod
from users.utils.crypto import encrypt_text
import os

username = 'burbuja'
email = 'burbuja@example.com'
site = 'http://192.168.101.11:8080'

# 1. Create User
user, created = User.objects.get_or_create(username=username, defaults={'email': email})
if created:
    user.set_password('Burbuja#2026!')
    user.save()
    print(f"User '{username}' created.")

# 2. Profile
profile, _ = UserProfile.objects.get_or_create(user=user)
profile.role = 'admin'
profile.save()

# 3. Tenant
tenant, _ = Tenant.objects.get_or_create(
    admin=user,
    defaults={
        'db_alias': f'tenant_burbuja',
        'db_path': f'/tenants/burbuja',
    }
)

# 4. AppSettings
ws, _ = AppSettings.objects.get_or_create(tenant=tenant)
ws.company_name = 'La Burbuja Tecnológica'
ws.save()

# 5. UserURL
UserURL.objects.get_or_create(user=user, url=site)
print(f"URL '{site}' linked to user '{username}'.")

# 6. Payment Method (Mercado Pago)
mp_public_key = os.environ.get('BURBUJA_MP_PUBLIC_KEY', 'TEST-5256646b-e09e-4b4b-81aa-861357c6453f')
mp_access_token = os.environ.get('BURBUJA_MP_ACCESS_TOKEN', 'TEST-8272584144573420-030811-9270830498263720-12345678')

mp_method, created = PaymentMethod.objects.get_or_create(
    tenant=tenant,
    provider='mercadopago',
    defaults={
        'name': 'Mercado Pago',
        'active': True,
        'extra_config': {
            'public_key': mp_public_key,
            'private_key': encrypt_text(mp_access_token)
        }
    }
)
if not created:
    mp_method.extra_config = {
        'public_key': mp_public_key,
        'private_key': encrypt_text(mp_access_token)
    }
    mp_method.active = True
    mp_method.save()

print(f"Mercado Pago configured for tenant '{tenant.id}'.")
