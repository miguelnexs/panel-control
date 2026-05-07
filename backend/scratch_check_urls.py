import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from webconfig.models import UserURL
from django.contrib.auth.models import User

print("URLs registradas:")
for uu in UserURL.objects.all():
    print(f"User: {uu.user.username}, URL: {uu.url}")
