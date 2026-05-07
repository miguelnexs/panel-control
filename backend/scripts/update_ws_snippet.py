from webconfig.models import WebSettings
from users.models import Tenant
t = Tenant.objects.filter(id=10).first()
ws = WebSettings.objects.filter(tenant=t).first()
if ws:
    ws.site_url = 'http://localhost:8080/'
    ws.save(update_fields=['site_url'])
print('WS for tenant 10:', (ws.id if ws else None), (ws.site_url if ws else None))
for extra in WebSettings.objects.filter(site_url='http://localhost:8080/', tenant__isnull=True):
    extra.site_url = 'http://localhost:8080/unused'
    extra.save(update_fields=['site_url'])
print('Cleaned duplicates')
