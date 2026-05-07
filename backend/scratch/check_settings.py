import os
import django
import sys

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from config.models import AppSettings

for settings in AppSettings.objects.all():
    print(f"Tenant: {settings.tenant}")
    print(f"Google Config: {settings.google_config}")
