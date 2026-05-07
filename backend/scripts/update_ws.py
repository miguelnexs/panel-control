import os, sys
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "globetrek_backend.settings")
import django
django.setup()
from webconfig.models import WebSettings
from users.models import Tenant

tenant = Tenant.objects.filter(id=10).first()
ws = WebSettings.objects.filter(tenant=tenant).first()
if ws:
    ws.site_url = "http://localhost:8080/"
    ws.save(update_fields=["site_url"])
print("Updated:", (ws.id if ws else None), (ws.site_url if ws else None))
for extra in WebSettings.objects.filter(site_url="http://localhost:8080/", tenant__isnull=True):
    extra.site_url = "http://localhost:8080/unused"
    extra.save(update_fields=["site_url"])
print("Cleaned unassigned site_url duplicates.")
