from django.db import models
import os
from django.utils.text import slugify
from users.models import Tenant


def config_logo_upload_path(instance, filename):
    try:
        base, ext = os.path.splitext(filename)
        safe = slugify(base) or 'logo'
        tenant_id = getattr(instance, 'tenant_id', None)
        folder = f"tenant_{tenant_id}" if tenant_id else "tenant_public"
        return f"web/logo/{folder}/{safe}{ext.lower()}"
    except Exception:
        return f"web/logo/{filename}"


class AppSettings(models.Model):
    primary_color = models.CharField(max_length=7, default='#0ea5e9')
    secondary_color = models.CharField(max_length=7, default='#1f2937')
    font_family = models.CharField(max_length=80, default='Inter, system-ui, sans-serif')
    logo = models.ImageField(upload_to=config_logo_upload_path, null=True, blank=True)
    logo_size_px = models.PositiveIntegerField(default=36)
    currencies = models.CharField(max_length=64, default='COP')
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    updated_at = models.DateTimeField(auto_now=True)
    company_name = models.CharField(max_length=120, blank=True, default='')
    company_nit = models.CharField(max_length=40, blank=True, default='')
    company_phone = models.CharField(max_length=30, blank=True, default='')
    company_whatsapp = models.CharField(max_length=30, blank=True, default='')
    company_email = models.EmailField(blank=True, default='')
    company_address = models.CharField(max_length=200, blank=True, default='')
    company_description = models.TextField(blank=True, default='')
    printer_type = models.CharField(max_length=20, blank=True, default='system')
    printer_name = models.CharField(max_length=120, blank=True, default='')
    paper_width_mm = models.PositiveIntegerField(default=58)
    auto_print = models.BooleanField(default=True)
    receipt_footer = models.TextField(blank=True, default='')
    whatsapp_config = models.JSONField(default=dict, blank=True)
    google_config = models.JSONField(default=dict, blank=True)
    page_content = models.JSONField(default=dict, blank=True)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    free_shipping_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pickup_enabled = models.BooleanField(default=True)
