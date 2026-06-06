import os
import sys
import django

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Tenant, UserProfile
from products.models import Product, ProductColor, ProductVariant, ProductSKU

def main():
    try:
        user = User.objects.get(username='miguel')
        print(f"User found: {user.username} (ID: {user.id})")
        
        try:
            profile = user.profile
            print(f"Profile role: {profile.role}")
            print(f"Profile tenant: {profile.tenant}")
        except UserProfile.DoesNotExist:
            print("UserProfile does not exist.")
            profile = None
            
        # Let's list tenants
        tenants = Tenant.objects.all()
        print(f"\nTotal tenants in DB: {tenants.count()}")
        for t in tenants:
            print(f"Tenant ID: {t.id}, Name: {t.name}, Admin: {t.admin.username if t.admin else 'None'}")
            
    except User.DoesNotExist:
        print("User 'miguel' not found.")
        print("\nAll users:")
        for u in User.objects.all():
            print(f"- {u.username} (ID: {u.id})")

if __name__ == '__main__':
    main()
