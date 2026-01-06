from django.db import models
import os
from uuid import uuid4
from django.utils.text import slugify
from users.models import Tenant


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    category = models.ForeignKey('Category', null=True, blank=True, on_delete=models.SET_NULL)
    sku = models.CharField(max_length=50, unique=True)
    inventory_qty = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    active = models.BooleanField(default=True)
    
    # DIAN Fields
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=19.00, help_text="Porcentaje de IVA (0, 5, 19)")
    unit_measure = models.CharField(max_length=10, default='94', help_text="Código de unidad (94=Unidad, KGM=Kilogramo)")
    
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    active = models.BooleanField(default=True)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50)
    hex = models.CharField(max_length=7)
    position = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.hex})"


def color_image_upload_path(instance, filename):
    base, ext = os.path.splitext(filename)
    safe_base = slugify(base) or 'imagen'
    uid = uuid4().hex[:8]
    product = instance.color.product
    sku = getattr(product, 'sku', str(product.id))
    tenant_part = f"tenant_{product.tenant_id}" if getattr(product, 'tenant_id', None) else 'tenant_public'
    return f"products/{tenant_part}/{sku}/colors/{instance.color.id}/{safe_base}-{uid}{ext.lower()}"


class ProductColorImage(models.Model):
    color = models.ForeignKey(ProductColor, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=color_image_upload_path)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=50)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (+{self.extra_price})"


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(max_length=100)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
