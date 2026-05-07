from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('config', '0002_copy_from_webconfig'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='appsettings',
            name='site_url',
        ),
    ]
