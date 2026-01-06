import os
import sys
import django

# Asegurar que el directorio raíz del proyecto esté en sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PROJECT_DIR = os.path.join(BASE_DIR, 'globetrek_backend')
for p in (PROJECT_DIR, BASE_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile


def main():
    username = os.environ.get('SUPERADMIN_USERNAME', 'superadmin')
    password = os.environ.get('SUPERADMIN_PASSWORD', 'SuperAdmin#2025!')
    email = os.environ.get('SUPERADMIN_EMAIL', 'superadmin@example.com')

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': 'Super',
            'last_name': 'Admin',
        }
    )

    # Asegurar credenciales y permisos completos en admin
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()

    # Vincular perfil con rol de super administrador
    UserProfile.objects.update_or_create(
        user=user,
        defaults={
            'role': 'super_admin',
        }
    )

    print(f"Super admin {'creado' if created else 'actualizado'}: {username}")


if __name__ == '__main__':
    main()