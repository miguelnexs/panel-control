from django.db import models
import os
from uuid import uuid4
from django.utils.text import slugify
from users.models import Tenant


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Precio de compra/costo del producto")
    description = models.TextField(blank=True)
    category = models.ForeignKey('Category', null=True, blank=True, on_delete=models.SET_NULL)
    sku = models.CharField(max_length=50)
    inventory_qty = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    active = models.BooleanField(default=True)
    is_draft = models.BooleanField(default=False, help_text="Si es borrador, se permiten campos incompletos")
    position = models.PositiveIntegerField(default=0)
    
    # Offer Fields
    is_sale = models.BooleanField(default=False)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Denormalized total stock for ultra-fast listing
    total_stock = models.IntegerField(default=0, db_index=True)
    
    # DIAN Fields
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=19.00, help_text="Porcentaje de IVA (0, 5, 19)")
    unit_measure = models.CharField(max_length=10, default='94', help_text="Código de unidad (94=Unidad, KGM=Kilogramo)")
    
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['tenant', 'active', '-created_at']),
            models.Index(fields=['tenant', 'category', 'active', '-created_at']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['tenant', 'sku'], name='unique_sku_per_tenant')
        ]

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['tenant', 'active', 'position', '-created_at']),
        ]

    def __str__(self):
        return self.name


class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50)
    hex = models.CharField(max_length=7)
    position = models.PositiveIntegerField(default=0)
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


class ProductSKU(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='skus')
    color = models.ForeignKey(ProductColor, on_delete=models.CASCADE, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    sku = models.CharField(max_length=50, blank=True)
    stock = models.PositiveIntegerField(default=0)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Precio especial para esta combinación")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'color', 'variant')
        indexes = [
            models.Index(fields=['product', 'stock']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.color.name if self.color else ''} {self.variant.name if self.variant else ''} ({self.sku})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='products/gallery/')
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Imagen {self.id} de {self.product.name}"


# Signals to maintain denormalized total_stock
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum

def update_product_total_stock(product):
    if not product:
        return
    sku_stock = ProductSKU.objects.filter(product=product).aggregate(total=Sum('stock'))['total'] or 0
    product.total_stock = (product.inventory_qty or 0) + sku_stock
    # Use update to avoid triggering save() signals recursively if not careful, 
    # but here we want to update the DB directly
    Product.objects.filter(id=product.id).update(total_stock=product.total_stock)

@receiver(post_save, sender=Product)
def product_post_save(sender, instance, **kwargs):
    # Only update if inventory_qty changed or on creation
    update_product_total_stock(instance)

@receiver(post_save, sender=ProductSKU)
@receiver(post_delete, sender=ProductSKU)
def sku_stock_changed(sender, instance, **kwargs):
    update_product_total_stock(instance.product)
