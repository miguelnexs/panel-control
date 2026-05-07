import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from sales.models import SalePayment
print(f"SalePayment found: {SalePayment}")
