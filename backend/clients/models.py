from django.db import models
from users.models import Tenant


class Client(models.Model):
    CLIENT_TYPES = [
        ('person', 'Persona Natural'),
        ('company', 'Empresa'),
    ]
    client_type = models.CharField(max_length=10, choices=CLIENT_TYPES, default='person')
    full_name = models.CharField(max_length=150)
    cedula = models.CharField(max_length=20, blank=True, null=True) # Cédula o NIT
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, default='')
    identification_type = models.CharField(max_length=50, blank=True, null=True, default='CC') # CC, NIT, CE, etc.
    tax_regime = models.CharField(max_length=50, blank=True, null=True, default='O-99') # O-99, O-47, etc.
    city = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['cedula']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.full_name
