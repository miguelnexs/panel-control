import os
import sys
from pathlib import Path


def setup_django():
    # Ensure project root and package are on sys.path
    base_dir = Path(__file__).resolve().parents[2]
    package_dir = base_dir / 'globetrek_backend'
    for p in [str(base_dir), str(package_dir)]:
        if p not in sys.path:
            sys.path.insert(0, p)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
    import django
    django.setup()


def main():
    setup_django()
    from django.contrib.auth.models import User
    from users.models import UserProfile

    username = os.environ.get('ADMIN_USERNAME', 'admin1')
    password = os.environ.get('ADMIN_PASSWORD', 'Admin#2025!')
    email = os.environ.get('ADMIN_EMAIL', 'admin1@example.com')

    user, created = User.objects.get_or_create(username=username)
    user.email = email
    user.is_staff = True
    user.is_superuser = False
    if password:
        user.set_password(password)
    user.save()

    profile, p_created = UserProfile.objects.get_or_create(user=user)
    profile.role = 'admin'
    profile.save()

    print(f"Admin user {'created' if created else 'updated'}: {username}")


if __name__ == '__main__':
    main()