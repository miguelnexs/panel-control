from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webconfig', '0016_alter_websettings_logo'),
    ]

    operations = [
        migrations.AddField(
            model_name='websettings',
            name='printer_type',
            field=models.CharField(default='system', blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='websettings',
            name='printer_name',
            field=models.CharField(default='', blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='websettings',
            name='paper_width_mm',
            field=models.PositiveIntegerField(default=58),
        ),
        migrations.AddField(
            model_name='websettings',
            name='auto_print',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='websettings',
            name='receipt_footer',
            field=models.TextField(default='', blank=True),
        ),
    ]

