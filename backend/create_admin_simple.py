import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile

def main():
    username = 'admin'
    password = 'adminpassword'
    email = 'admin@example.com'

    if not User.objects.filter(username=username).exists():
        print(f"Creating user {username}...")
        user = User.objects.create_superuser(username, email, password)
        # Asegurar perfil si es necesario (depende de señales, pero aquí lo forzamos si el modelo UserProfile lo requiere)
        # En este proyecto parece que UserProfile es clave.
        try:
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.role = 'super_admin'
            profile.save()
        except Exception as e:
            print(f"Error creating profile: {e}")
            # Si UserProfile se crea automáticamente por señal, esto podría ser redundante o fallar si faltan campos.
        print("Superuser created successfully.")
    else:
        print("Superuser already exists.")

if __name__ == '__main__':
    main()
