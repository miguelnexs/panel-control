from django.db import models
from django.contrib.auth.models import User
from users.models import Tenant
from clients.models import Client


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='service_categories/', null=True, blank=True)
    active = models.BooleanField(default=True)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ServiceDefinition(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='service_definitions/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estimated_duration = models.CharField(max_length=100, blank=True, help_text="Ej: 2 horas, 3 días")
    active = models.BooleanField(default=True)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Service(models.Model):
    STATUS_CHOICES = (
        ('recibido', 'Recibido'),
        ('entregado', 'Entregado'),
    )
    entry_date = models.DateField()
    exit_date = models.DateField(null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(ServiceCategory, null=True, blank=True, on_delete=models.SET_NULL)
    service_definition = models.ForeignKey(ServiceDefinition, null=True, blank=True, on_delete=models.SET_NULL)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='services')
    worker = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_services')
    third_party_provider = models.CharField(max_length=100, blank=True)
    third_party_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='recibido')
    active = models.BooleanField(default=True)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
