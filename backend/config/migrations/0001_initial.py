from django.db import migrations, models
import django.db.models.deletion
import config.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AppSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('primary_color', models.CharField(default='#0ea5e9', max_length=7)),
                ('secondary_color', models.CharField(default='#1f2937', max_length=7)),
                ('font_family', models.CharField(default='Inter, system-ui, sans-serif', max_length=80)),
                ('logo', models.ImageField(blank=True, null=True, upload_to=config.models.config_logo_upload_path)),
                ('logo_size_px', models.PositiveIntegerField(default=36)),
                ('currencies', models.CharField(default='COP', max_length=64)),
                ('site_url', models.URLField(blank=True, default='http://localhost:8080/')),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company_name', models.CharField(blank=True, default='', max_length=120)),
                ('company_nit', models.CharField(blank=True, default='', max_length=40)),
                ('company_phone', models.CharField(blank=True, default='', max_length=30)),
                ('company_whatsapp', models.CharField(blank=True, default='', max_length=30)),
                ('company_email', models.EmailField(blank=True, default='', max_length=254)),
                ('company_address', models.CharField(blank=True, default='', max_length=200)),
                ('company_description', models.TextField(blank=True, default='')),
                ('printer_type', models.CharField(blank=True, default='system', max_length=20)),
                ('printer_name', models.CharField(blank=True, default='', max_length=120)),
                ('paper_width_mm', models.PositiveIntegerField(default=58)),
                ('auto_print', models.BooleanField(default=True)),
                ('receipt_footer', models.TextField(blank=True, default='')),
                ('tenant', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.tenant')),
            ],
        ),
    ]
