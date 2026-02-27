
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile, Tenant

def create_miguel_superuser():
    username = 'miguel'
    password = 'migel1457'
    email = 'miguel@localhost.com'
    
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    
    if created:
        print(f"Superuser '{username}' created.")
    else:
        print(f"Superuser '{username}' updated.")

    # Create or update profile
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = 'admin'
    profile.save()
    print(f"UserProfile for '{username}' set to 'admin'.")
    
    # Ensure tenant exists
    alias = f"tenant_{user.id}"
    schema_name = alias
    
    tenant, created = Tenant.objects.get_or_create(
        admin=user,
        defaults={
            'db_alias': alias, 
            'db_path': f"schema:{schema_name}",
            'name': 'Empresa de Miguel'
        }
    )
    if created:
        print(f"Tenant '{tenant.name}' created.")
    else:
        print(f"Tenant '{tenant.name}' already exists.")

    profile.tenant = tenant
    profile.save()

if __name__ == '__main__':
    create_miguel_superuser()
