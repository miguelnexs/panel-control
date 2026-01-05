from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .utils.crypto import encrypt_text, is_encrypted_text

# Import tenant configuration models
from .models_tenant_config import TenantConfiguration, TenantTheme, TenantPermission
from .models_subscription import SubscriptionPlan

# Definición de roles
ROLE_CHOICES = (
    ('super_admin', 'Super Administrador'),
    ('admin', 'Administrador'),
    ('employer', 'Empleador'),
    ('employee', 'Empleado'),
)

class Tenant(models.Model):
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant')
    db_alias = models.CharField(max_length=64, unique=True)
    db_path = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, default="Mi Negocio")
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='tenants')
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Tenant({self.admin.username})"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL, related_name='users')
    # Datos sensibles cifrados en reposo (almacenados como texto cifrado)
    phone = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Validador para cédula (formato numérico)
    cedula_validator = RegexValidator(
        regex=r'^\d{8,12}$',
        message='La cédula debe contener entre 8 y 12 dígitos numéricos.'
    )
    cedula = models.CharField(
        max_length=12, 
        validators=[cedula_validator],
        unique=True,
        null=True,
        blank=True,
        verbose_name='Número de Cédula'
    )
    
    # Campos adicionales para empleados
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name='Cargo')
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name='Departamento')
    hire_date = models.DateField(null=True, blank=True, verbose_name='Fecha de contratación')

    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def is_super_admin(self):
        return self.role == 'super_admin'
    
    def is_admin(self):
        return self.role == 'admin' or self.role == 'super_admin'
    
    def is_employee(self):
        return self.role == 'employee'

    def save(self, *args, **kwargs):
        # Cifrar campos sensibles si no están cifrados ya
        if self.phone and not is_encrypted_text(self.phone):
            self.phone = encrypt_text(self.phone)
        if self.address and not is_encrypted_text(self.address):
            self.address = encrypt_text(self.address)
        super().save(*args, **kwargs)


class PrivateNote(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note({self.author.username})"
