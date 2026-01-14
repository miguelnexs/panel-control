from django.db import models
from django.contrib.auth.models import User

class TenantConfiguration(models.Model):
    """Configuration settings for each tenant/administrator"""
    
    # Theme options
    THEME_CHOICES = [
        ('dark', 'Dark Theme'),
        ('light', 'Light Theme'),
        ('blue', 'Blue Theme'),
        ('green', 'Green Theme'),
        ('purple', 'Purple Theme'),
    ]
    
    # Layout options
    LAYOUT_CHOICES = [
        ('sidebar', 'Sidebar Navigation'),
        ('topbar', 'Top Navigation'),
        ('minimal', 'Minimal Layout'),
    ]
    
    tenant = models.OneToOneField('users.Tenant', on_delete=models.CASCADE, related_name='configuration')
    
    # Appearance settings
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default='dark')
    layout = models.CharField(max_length=20, choices=LAYOUT_CHOICES, default='sidebar')
    primary_color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    secondary_color = models.CharField(max_length=7, default='#1E40AF')
    company_name = models.CharField(max_length=100, default='My Company')
    company_logo = models.ImageField(upload_to='tenant_logos/', null=True, blank=True)
    favicon = models.ImageField(upload_to='tenant_favicons/', null=True, blank=True)
    
    # Custom domain settings
    custom_domain = models.CharField(max_length=255, null=True, blank=True, unique=True)
    subdomain = models.CharField(max_length=50, null=True, blank=True, unique=True)
    
    # Feature toggles
    enable_inventory = models.BooleanField(default=True)
    enable_sales = models.BooleanField(default=True)
    enable_clients = models.BooleanField(default=True)
    enable_reports = models.BooleanField(default=True)
    enable_web_store = models.BooleanField(default=False)
    
    # User preferences
    items_per_page = models.IntegerField(default=10)
    date_format = models.CharField(max_length=20, default='%Y-%m-%d')
    timezone = models.CharField(max_length=50, default='UTC')
    currency = models.CharField(max_length=3, default='USD')
    
    # Security settings
    session_timeout = models.IntegerField(default=30)  # minutes
    require_strong_passwords = models.BooleanField(default=True)
    enable_two_factor = models.BooleanField(default=False)
    
    # Created/Updated timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Config({self.tenant.admin.username if self.tenant and self.tenant.admin else 'Unknown'})"
    
    class Meta:
        verbose_name = "Tenant Configuration"
        verbose_name_plural = "Tenant Configurations"


class TenantTheme(models.Model):
    """Custom CSS themes for tenants"""
    
    tenant = models.ForeignKey('users.Tenant', on_delete=models.CASCADE, related_name='themes')
    name = models.CharField(max_length=50)
    css_variables = models.TextField(help_text="CSS custom properties in JSON format")
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Theme({self.tenant.admin.username if self.tenant and self.tenant.admin else 'Unknown'} - {self.name})"
    
    class Meta:
        unique_together = ['tenant', 'name']


class TenantPermission(models.Model):
    """Custom permissions for tenant users"""
    
    PERMISSION_CHOICES = [
        ('view_products', 'View Products'),
        ('create_products', 'Create Products'),
        ('edit_products', 'Edit Products'),
        ('delete_products', 'Delete Products'),
        ('view_clients', 'View Clients'),
        ('create_clients', 'Create Clients'),
        ('edit_clients', 'Edit Clients'),
        ('delete_clients', 'Delete Clients'),
        ('view_sales', 'View Sales'),
        ('create_sales', 'Create Sales'),
        ('edit_sales', 'Edit Sales'),
        ('delete_sales', 'Delete Sales'),
        ('view_reports', 'View Reports'),
        ('manage_users', 'Manage Users'),
        ('manage_settings', 'Manage Settings'),
    ]
    
    tenant = models.ForeignKey('users.Tenant', on_delete=models.CASCADE, related_name='permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tenant_permissions')
    permission = models.CharField(max_length=50, choices=PERMISSION_CHOICES)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_permissions')
    
    def __str__(self):
        return f"Permission({self.user.username} - {self.permission})"
    
    class Meta:
        unique_together = ['tenant', 'user', 'permission']