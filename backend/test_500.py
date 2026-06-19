import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

import traceback
from django.test import RequestFactory
from rest_framework.test import force_authenticate, APIRequestFactory
from users.models import User
from sales.api import SalesStatsView

rf = APIRequestFactory()
req = rf.get('/sales/stats/')
u = User.objects.filter(is_superuser=True).first() or User.objects.first()
force_authenticate(req, user=u)

view = SalesStatsView.as_view()
try:
    res = view(req)
    res.render()
    print('Status:', res.status_code)
    print('Content:', res.content)
except Exception as e:
    traceback.print_exc()
