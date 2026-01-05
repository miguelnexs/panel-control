from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0005_saleitem_snapshot_and_ondelete'),
    ]

    operations = [
        migrations.AlterField(
            model_name='saleitem',
            name='color',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='products.productcolor'),
        ),
        migrations.AlterField(
            model_name='saleitem',
            name='variant',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='products.productvariant'),
        ),
    ]

