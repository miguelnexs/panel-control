from django.db import models
from users.models import Tenant
from clients.models import Client
from products.models import Product, ProductColor, ProductVariant


class Sale(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('apartado', 'Apartado'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('canceled', 'Cancelado'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Efectivo'),
        ('transfer', 'Transferencia'),
        ('mixed', 'Mixto'),
    )
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    order_number = models.CharField(max_length=32, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash',
    )
    cash_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transfer_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    apartado_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    DIAN_STATUS_CHOICES = (
        ('not_emitted', 'No Emitida'),
        ('emitted', 'Emitida'),
        ('error', 'Error'),
    )
    apartado_date = models.DateTimeField(null=True, blank=True)
    dian_invoice_id = models.CharField(max_length=64, blank=True, null=True)
    dian_invoice_url = models.URLField(max_length=500, blank=True, null=True)
    dian_invoice_status = models.CharField(max_length=20, choices=DIAN_STATUS_CHOICES, default='not_emitted')
    dian_error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
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
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)


class SalePayment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Efectivo'),
        ('transfer', 'Transferencia'),
    )
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago de {self.amount} para Venta {self.sale.order_number}"
