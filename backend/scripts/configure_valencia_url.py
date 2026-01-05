import os
import sys
from pathlib import Path
from urllib.parse import urlparse


def setup_django():
    # Backend directory
    base_dir = Path(__file__).resolve().parents[1]
    package_dir = base_dir / 'globetrek_backend'
    for p in [str(base_dir), str(package_dir)]:
        if p not in sys.path:
            sys.path.insert(0, p)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
    import django
    django.setup()


def canonical_url(raw: str) -> str:
    s = (raw or '').strip()
    if not s:
        return s
    s = s[:-1] if s.endswith('/') else s
    return s


def main():
    setup_django()
    from django.contrib.auth.models import User
    from users.models import UserProfile, Tenant
    from config.models import AppSettings
    from webconfig.models import UserURL

    username = os.environ.get('VALENCIA_USERNAME', 'valencia')
    password = os.environ.get('VALENCIA_PASSWORD', 'Valencia#2025!')
    email = os.environ.get('VALENCIA_EMAIL', 'valencia@example.com')
    site = os.environ.get('VALENCIA_SITE', 'https://puralocion.online/')

    # Create or update user
    user, _ = User.objects.get_or_create(username=username, defaults={'email': email})
    user.email = email
    user.is_staff = True
    user.is_superuser = False
    if password:
        user.set_password(password)
    user.save()

    # Profile as admin
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = 'admin'
    profile.save()

    # Ensure tenant linked to admin user
    tenant, _ = Tenant.objects.get_or_create(
        admin=user,
        defaults={
            'db_alias': f'tenant_{user.id}',
            'db_path': f'/tenants/{user.id}',
        }
    )

    # Ensure AppSettings for tenant
    ws, _ = AppSettings.objects.get_or_create(tenant=tenant)
    if not ws.company_name:
        ws.company_name = 'Valencia'
    ws.save()

    # Assign public URL to user
    canon = canonical_url(site)
    parsed = urlparse(canon)
    if not (parsed.scheme and parsed.netloc):
        raise ValueError('VALENCIA_SITE inválida')
    # Replace or create own UserURL
    mine = UserURL.objects.filter(user=user, url__in=[canon, canon + '/']).first()
    conflict = UserURL.objects.filter(url__in=[canon, canon + '/']).exclude(user=user).first()
    if conflict:
        raise RuntimeError('La URL ya está registrada por otro usuario')
    if not mine:
        existing = UserURL.objects.filter(user=user).order_by('-created_at').first()
        if existing and existing.url not in (canon, canon + '/'):
            existing.url = canon
            existing.save(update_fields=['url'])
        else:
            UserURL.objects.create(user=user, url=canon)

    # Also map local dev origin to the same user for dashboard/site testing
    dev_urls = [
        os.environ.get('VALENCIA_DEV_SITE', 'http://localhost:8000/'),
        os.environ.get('VALENCIA_DEV_SITE2', 'http://localhost:5173/'),
    ]
    created_devs = []
    for dev_url in dev_urls:
        dev_canon = canonical_url(dev_url)
        if dev_canon not in (canon, canon + '/'):
            if not UserURL.objects.filter(user=user, url__in=[dev_canon, dev_canon + '/']).exists():
                UserURL.objects.create(user=user, url=dev_canon)
                created_devs.append(dev_canon)
    print(f"Configured user '{username}' with tenant_id={tenant.id} and public URL={canon} and dev URLs={created_devs}")


if __name__ == '__main__':
    main()
