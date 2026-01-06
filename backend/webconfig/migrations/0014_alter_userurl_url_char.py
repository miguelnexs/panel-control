from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webconfig', '0013_userurl_urlfield'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userurl',
            name='url',
            field=models.CharField(max_length=512, unique=True),
        ),
    ]

