import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

import traceback
from django.test import RequestFactory
from rest_framework.test import force_authenticate, APIRequestFactory
from users.models import User, UserProfile
from sales.api import SalesStatsView
from clients.api import ClientsStatsView

rf = APIRequestFactory()
req = rf.get('/sales/stats/')

profile = UserProfile.objects.filter(role='admin').exclude(user__is_superuser=True).first()
if profile:
    u = profile.user
    force_authenticate(req, user=u)

    view = SalesStatsView.as_view()
    try:
        res = view(req)
        res.render()
        print('SalesStats Status:', res.status_code)
        if res.status_code == 500:
            print('Content:', res.content)
    except Exception as e:
        print("EXCEPTION SalesStats:")
        traceback.print_exc()

    req_clients = rf.get('/clients/stats/')
    force_authenticate(req_clients, user=u)
    view2 = ClientsStatsView.as_view()
    try:
        res2 = view2(req_clients)
        res2.render()
        print('ClientsStats Status:', res2.status_code)
        if res2.status_code == 500:
            print('Content:', res2.content)
    except Exception as e:
        print("EXCEPTION ClientsStats:")
        traceback.print_exc()
else:
    print("No admin user found.")
