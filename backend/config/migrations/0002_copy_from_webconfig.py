from django.db import migrations


def copy_websettings_to_appsettings(apps, schema_editor):
    try:
        AppSettings = apps.get_model('config', 'AppSettings')
        WebSettings = apps.get_model('webconfig', 'WebSettings')
        if WebSettings is None:
            return
        for ws in WebSettings.objects.all():
            AppSettings.objects.create(
                primary_color=ws.primary_color,
                secondary_color=ws.secondary_color,
                font_family=ws.font_family,
                logo=ws.logo,
                logo_size_px=getattr(ws, 'logo_size_px', 36),
                currencies=ws.currencies,
                site_url=ws.site_url,
                tenant=ws.tenant,
                company_name=ws.company_name,
                company_nit=ws.company_nit,
                company_phone=ws.company_phone,
                company_whatsapp=ws.company_whatsapp,
                company_email=ws.company_email,
                company_address=ws.company_address,
                company_description=ws.company_description,
                printer_type=ws.printer_type,
                printer_name=ws.printer_name,
                paper_width_mm=ws.paper_width_mm,
                auto_print=ws.auto_print,
                receipt_footer=ws.receipt_footer,
            )
    except Exception:
        pass


class Migration(migrations.Migration):
    dependencies = [
        ('config', '0001_initial'),
        ('webconfig', '0019_websettings_logo_size_px'),
    ]

    operations = [
        migrations.RunPython(copy_websettings_to_appsettings, migrations.RunPython.noop),
    ]
