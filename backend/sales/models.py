from django.db import models
from users.models import Tenant
from clients.models import Client
from products.models import Product, ProductColor, ProductVariant


class Sale(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('canceled', 'Cancelado'),
    )
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    order_number = models.CharField(max_length=32, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(ProductColor, null=True, blank=True, on_delete=models.SET_NULL)
    variant = models.ForeignKey(ProductVariant, null=True, blank=True, on_delete=models.SET_NULL)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    product_name = models.CharField(max_length=120, blank=True, default='')
    product_sku = models.CharField(max_length=64, blank=True, default='')


class OrderNotification(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
