import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import User
from users.models import UserProfile, Tenant
from webconfig.models import PaymentMethod
from sales.models import Sale, SaleItem
from clients.models import Client
from sales.payment_service import PaymentProcessor
from users.utils.crypto import encrypt_text, decrypt_text
from sales.whatsapp_service import WhatsAppService
from config.models import AppSettings

def run_verification():
    print("Starting verification...")

    # 1. Setup Tenant and User
    print("1. Setting up Tenant and User...")
    user, _ = User.objects.get_or_create(username='test_admin')
    
    if hasattr(user, 'tenant'):
        tenant = user.tenant
    else:
        tenant = Tenant.objects.create(
            admin=user,
            db_alias='test_alias',
            db_path='test_path'
        )
    
    if not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user, tenant=tenant, role='admin')
    else:
        user.profile.tenant = tenant
        user.profile.save()

    # 2. Setup Payment Method (Stripe Mock)
    print("2. Setting up Payment Method (Stripe Mock)...")
    pm_config = {
        'public_key': 'pk_test_123',
        'private_key': encrypt_text('sk_test_123_secret')
    }
    
    pm, _ = PaymentMethod.objects.get_or_create(
        tenant=tenant,
        provider='stripe',
        defaults={
            'name': 'Stripe Test',
            'active': True,
            'extra_config': pm_config
        }
    )
    # Ensure config is updated if it existed
    pm.extra_config = pm_config
    pm.save()

    # Verify encryption
    saved_pk = pm.extra_config['private_key']
    decrypted_pk = decrypt_text(saved_pk)
    if decrypted_pk == 'sk_test_123_secret':
        print("   [PASS] Payment Method Private Key is correctly encrypted/decrypted.")
    else:
        print(f"   [FAIL] Encryption check failed. Got {decrypted_pk}")

    # 3. Create a Client and Sale
    print("3. Creating a Client and Sale...")
    client, created = Client.objects.get_or_create(
        cedula='123456789',
        defaults={
            'full_name': 'Test Client',
            'email': 'test@client.com',
            'phone': '573001234567',
            'address': 'Test Address',
            'tenant': tenant
        }
    )
    print(f"   Client created: {created}, ID: {client.id}, Tenant: {client.tenant}")

    # Use a unique order number for each run or delete existing
    order_number = 'ORD-TEST-002'
    Sale.objects.filter(order_number=order_number).delete()

    try:
        sale = Sale.objects.create(
            tenant=tenant,
            client=client,
            total_amount=100.00,
            order_number=order_number
        )
        print(f"   Sale created: ID {sale.id}, Client: {sale.client_id}")
    except Exception as e:
        print(f"   [FAIL] Sale creation failed: {e}")
        return
    
    # 4. Test Payment Processor
    print("4. Testing Payment Processor...")
    try:
        processor = PaymentProcessor(pm)
        # Mocking Stripe to avoid actual network calls or import errors if library not fully configured
        # But wait, PaymentProcessor imports stripe. 
        # If I don't have a valid key, Stripe call will fail.
        # I should mock the internal method or handle the error gracefully.
        
        # Actually, for verification, verifying the internal logic up to the call is enough.
        # But let's try to call it and expect an AuthenticationError from Stripe, which confirms it TRIED to use the key.
        try:
            processor.create_payment_intent(sale, 'http://return', 'http://cancel')
        except Exception as e:
            # We expect an error because the key is fake 'sk_test_123_secret'
            # If the error comes from Stripe, it means our integration reached Stripe.
            err_str = str(e)
            if 'stripe' in err_str.lower() or 'authentication' in err_str.lower() or 'key' in err_str.lower():
                 print(f"   [PASS] Processor attempted to contact Stripe (Error: {err_str})")
            else:
                 print(f"   [WARN] Unexpected error: {err_str}")

    except Exception as e:
        print(f"   [FAIL] Payment Processor init failed: {e}")

    # 5. WhatsApp Service Verification
    print("5. Testing WhatsApp Service Configuration...")
    wa_config = {
        'phone_number_id': '123456',
        'access_token': encrypt_text('wa_token_secret')
    }
    settings, _ = AppSettings.objects.get_or_create(tenant=tenant)
    settings.whatsapp_config = wa_config
    settings.save()
    
    ws = WhatsAppService(tenant=tenant)
    # We can't easily mock requests.post in this simple script without mock library,
    # but we can check if it loaded the config correctly.
    if ws.config.get('phone_number_id') == '123456':
        print("   [PASS] WhatsApp Service loaded config.")
    else:
        print("   [FAIL] WhatsApp Service config load failed.")
        
    # Check decryption inside service (by peeking, or trust previous test)
    # The service decrypts on the fly in send_template. 
    # We won't call send_template to avoid spamming/errors, but we verified crypto utils above.

    print("Verification Complete.")

if __name__ == '__main__':
    run_verification()
