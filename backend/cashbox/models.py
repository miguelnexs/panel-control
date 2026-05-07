from django.db import models
from django.conf import settings
from users.models import Tenant
from decimal import Decimal

class CashSession(models.Model):
    STATUS_CHOICES = (
        ('open', 'Abierta'),
        ('closed', 'Cerrada'),
    )
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Cash tracking
    initial_cash = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    expected_cash = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    actual_cash = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # Bank tracking
    initial_bank = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    expected_bank = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    actual_bank = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Sesión {self.id} - {self.user.username} ({self.status})"

class CashTransaction(models.Model):
    TYPE_CHOICES = (
        ('sale', 'Venta'),
        ('service', 'Servicio'),
        ('income', 'Ingreso manual'),
        ('expense', 'Egreso/Gasto'),
        ('transfer_in', 'Transferencia recibida'),
        ('transfer_out', 'Transferencia enviada'),
    )
    session = models.ForeignKey(CashSession, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional references
    sale = models.ForeignKey('sales.Sale', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.amount}"
