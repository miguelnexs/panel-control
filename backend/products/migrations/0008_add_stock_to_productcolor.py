from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0007_merge_20251112_1528'),
    ]

    operations = [
        migrations.AddField(
            model_name='productcolor',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
    ]

