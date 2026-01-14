from django.db import models
import os
from django.utils.text import slugify
from users.models import Tenant


def web_logo_upload_path(instance, filename):
    try:
        base, ext = os.path.splitext(filename)
        safe = slugify(base) or 'logo'
        tenant_id = getattr(instance, 'tenant_id', None)
        folder = f"tenant_{tenant_id}" if tenant_id else "tenant_public"
        return f"web/logo/{folder}/{safe}{ext.lower()}"
    except Exception:
        return f"web/logo/{filename}"


class PaymentMethod(models.Model):
    name = models.CharField(max_length=50)
    provider = models.CharField(max_length=50)
    fee_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    active = models.BooleanField(default=True)
    currencies = models.CharField(max_length=64, default='COP')
    extra_config = models.JSONField(default=dict, blank=True)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class Banner(models.Model):
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='web/banners/', null=True, blank=True)
    link = models.URLField(blank=True)
    active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class Policy(models.Model):
    shipping_text = models.TextField(blank=True)
    returns_text = models.TextField(blank=True)
    privacy_text = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class VisitStat(models.Model):
    date = models.DateField()
    visits = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)


class VisibleProduct(models.Model):
    product = models.OneToOneField('products.Product', on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class AccessLog(models.Model):
    user = models.ForeignKey('auth.User', null=True, blank=True, on_delete=models.SET_NULL)
    path = models.CharField(max_length=255)
    success = models.BooleanField(default=False)
    user_agent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class VisibleCategory(models.Model):
    category = models.OneToOneField('products.Category', on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class UserURL(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    url = models.URLField(max_length=256, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} -> {self.url}"


class Template(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True, null=True, blank=True)
    image = models.ImageField(upload_to='templates/images/', null=True, blank=True)
    zip_file = models.FileField(upload_to='templates/files/', null=True, blank=True)
    demo_url = models.URLField(blank=True)
    color = models.CharField(max_length=50, blank=True)
    tags = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey('auth.User', null=True, blank=True, on_delete=models.SET_NULL)
    is_personal = models.BooleanField(default=False)
    page_content = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
