from django.core.management.base import BaseCommand
from products.models import Product, ProductColor, ProductVariant, ProductSKU


class Command(BaseCommand):
    help = "Crea combinaciones de SKU faltantes para cada producto, color y variante"

    def handle(self, *args, **options):
        created = 0
        for p in Product.objects.all():
            colors = list(ProductColor.objects.filter(product=p).only('id'))
            variants = list(ProductVariant.objects.filter(product=p).only('id'))
            if colors and variants:
                for c in colors:
                    for v in variants:
                        obj, was_created = ProductSKU.objects.get_or_create(
                            product=p, color=c, variant=v,
                            defaults={'sku': '', 'stock': 0, 'active': True}
                        )
                        if was_created:
                            created += 1
            elif colors:
                for c in colors:
                    obj, was_created = ProductSKU.objects.get_or_create(
                        product=p, color=c, variant=None,
                        defaults={'sku': '', 'stock': 0, 'active': True}
                    )
                    if was_created:
                        created += 1
            elif variants:
                for v in variants:
                    obj, was_created = ProductSKU.objects.get_or_create(
                        product=p, color=None, variant=v,
                        defaults={'sku': '', 'stock': 0, 'active': True}
                    )
                    if was_created:
                        created += 1
        self.stdout.write(self.style.SUCCESS(f"SKUs creados: {created}"))
