
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile, Tenant

def create_admin_user():
    username = 'admin'
    password = 'password123'
    email = 'admin@localhost.com'
    
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists.")
        user = User.objects.get(username=username)
        # Update password just in case
        user.set_password(password)
        user.save()
    else:
        user = User.objects.create_user(username=username, email=email, password=password)
        print(f"User '{username}' created.")

    # Create or update profile
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = 'admin'
    profile.save()
    print(f"UserProfile for '{username}' set to 'admin'.")
    
    # Ensure tenant exists (though middleware/logic might do it, better to be safe)
    # The ensure_tenant_for_user logic creates it based on ID.
    # We can just let the login flow handle it, or pre-create it.
    # Let's pre-create it to avoid any first-request issues.
    
    alias = f"tenant_{user.id}"
    schema_name = alias
    
    tenant, created = Tenant.objects.get_or_create(
        admin=user,
        defaults={
            'db_alias': alias, 
            'db_path': f"schema:{schema_name}",
            'name': 'Mi Empresa Local'
        }
    )
    if created:
        print(f"Tenant '{tenant.name}' created.")
    else:
        print(f"Tenant '{tenant.name}' already exists.")

    profile.tenant = tenant
    profile.save()

if __name__ == '__main__':
    create_admin_user()
