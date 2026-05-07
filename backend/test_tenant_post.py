import os
import django
import sys
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from rest_framework.test import APIClient

from django.contrib.auth.models import User
from clients.models import Client as ClientModel

try:
    user = User.objects.get(username='burbuja')
    client_model = ClientModel.objects.filter(tenant=user.profile.tenant).first()
    if not client_model:
        # Create a test client for this tenant
        from users.models import Tenant
        tenant = user.profile.tenant
        client_model = ClientModel.objects.create(
            full_name="Test Client",
            cedula="123456789",
            tenant=tenant
        )

    payload = {
        "name": "Test Service",
        "description": "Test description",
        "value": 100,
        "entry_date": "2026-04-23",
        "client": client_model.id,
        "status": "recibido"
    }

    c = APIClient()
    c.force_authenticate(user=user)
    response = c.post('/services/', payload, format='json')
    
    print(f"Status: {response.status_code}")
    if response.status_code >= 400:
        print(f"Response: {response.data}")
    else:
        print("Success!")

except Exception as e:
    print("CRASHED!")
    traceback.print_exc()
