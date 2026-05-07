import os
import sys
import django

# Asegurar que el directorio raíz del proyecto esté en sys.path
# En Docker, el proyecto se monta en /app
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PROJECT_DIR = os.path.join(BASE_DIR, 'globetrek_backend')
for p in (BASE_DIR, PROJECT_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile


def main():
    username = os.environ.get('SUPERADMIN_USERNAME', 'superadmin')
    password = os.environ.get('SUPERADMIN_PASSWORD')  # no default password
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
    # Solo establecer/rotar contraseña si viene por entorno o el usuario fue creado
    if password or created:
        if not password:
            from django.utils.crypto import get_random_string
            password = get_random_string(16)
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
