"""
Script to fix all existing sales that don't have the discount applied.
This iterates over all SaleItems and recalculates their unit_price using sale_price if available.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from decimal import Decimal
from sales.models import Sale, SaleItem
from products.models import Product, ProductVariant

def fix_all_sales():
    """Recalculate all sale items to apply discounts"""
    total_fixed = 0
    
    sales = Sale.objects.all().prefetch_related('items__product', 'items__variant')
    
    for sale in sales:
        sale_total = Decimal('0.00')
        items_fixed = 0
        
        for item in sale.items.all():
            product = item.product
            if not product:
                continue
            
            # Get the correct price: sale_price if available, else regular price
            if product.sale_price is not None and product.sale_price > 0:
                correct_price = Decimal(str(product.sale_price))
            else:
                correct_price = Decimal(str(product.price))
            
            # Add variant extra price if exists
            if item.variant:
                try:
                    correct_price += Decimal(str(item.variant.extra_price))
                except Exception:
                    pass
            
            # Update the item if price is different
            if item.unit_price != correct_price:
                old_price = item.unit_price
                old_line_total = item.line_total
                
                item.unit_price = correct_price
                item.line_total = correct_price * item.quantity
                item.save(update_fields=['unit_price', 'line_total'])
                
                items_fixed += 1
                total_fixed += 1
                
                print(f"  Fixed item {item.id}: {old_price} → {correct_price} (line_total: {old_line_total} → {item.line_total})")
            
            sale_total += item.line_total
        
        # Update sale total if any items were fixed
        if items_fixed > 0:
            if sale.total_amount != sale_total:
                print(f"Sale {sale.order_number}: total {sale.total_amount} → {sale_total} ({items_fixed} items fixed)")
                sale.total_amount = sale_total
                sale.save(update_fields=['total_amount'])
            else:
                print(f"Sale {sale.order_number}: {items_fixed} items fixed, total remains {sale_total}")

if __name__ == '__main__':
    print("Starting discount fix for all sales...")
    fix_all_sales()
    print("✅ Done!")
