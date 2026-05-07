from django.db import migrations, models
import re


def fill_missing_sku(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    for p in Product.objects.all():
        sku = getattr(p, 'sku', None)
        if not sku:
            base = re.sub(r'[^A-Za-z0-9\-]+', '-', (getattr(p, 'name', '') or 'producto')).strip('-')
            if not base:
                base = 'producto'
            base = base[:30]
            candidate = base
            i = 1
            while Product.objects.filter(sku=candidate).exists():
                candidate = f"{base}-{i}"
                i += 1
            p.sku = candidate
            p.save(update_fields=['sku'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_remove_product_height_cm_remove_product_length_cm_and_more'),
    ]

    operations = [
        migrations.RunPython(fill_missing_sku, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='product',
            name='sku',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]

