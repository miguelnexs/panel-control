import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from sales.alegra_sync import AlegraAPI
from sales.models import Sale

sale = Sale.objects.get(id=16)
api = AlegraAPI(tenant=sale.tenant)
generic_item_id = api._get_or_create_generic_item()
alegra_client_id = api.sync_client(sale.client)

payload = {
    "date": sale.created_at.strftime('%Y-%m-%d'),
    "dueDate": sale.created_at.strftime('%Y-%m-%d'),
    "client": {"id": alegra_client_id},
    "items": [
        {
            "id": generic_item_id,
            "name": "Producto prueba",
            "price": float(sale.items.first().unit_price),
            "quantity": int(sale.items.first().quantity)
        }
    ],
    "stamp": {
        "generateStamp": True
    }
}

try:
    res = api._request('POST', '/invoices', json=payload)
    print("SUCCESS CREATE INVOICE:", res.get("id"))
except Exception as e:
    import traceback
    traceback.print_exc()
    print("FAILED CREATE INVOICE:", repr(e))
