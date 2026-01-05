from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webconfig', '0012_alter_userurl_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userurl',
            name='slug',
        ),
        migrations.AddField(
            model_name='userurl',
            name='url',
            field=models.URLField(max_length=256, unique=True, default='http://example.com/'),
            preserve_default=False,
        ),
    ]

