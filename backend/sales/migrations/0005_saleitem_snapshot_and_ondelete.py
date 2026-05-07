from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0004_saleitem_variant'),
        ('products', '0012_alter_productfeature_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='saleitem',
            name='product_name',
            field=models.CharField(default='', blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='saleitem',
            name='product_sku',
            field=models.CharField(default='', blank=True, max_length=64),
        ),
        migrations.AlterField(
            model_name='saleitem',
            name='product',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='products.product'),
        ),
    ]

