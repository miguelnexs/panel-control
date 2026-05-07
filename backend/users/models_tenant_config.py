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
    enable_web_advertising = models.BooleanField(default=True)
    enable_web_sync = models.BooleanField(default=True)
    
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
        ('enforce_permissions', 'Enforce Permissions'),
        ('view_products', 'View Products'),
        ('create_products', 'Create Products'),
        ('edit_products', 'Edit Products'),
        ('delete_products', 'Delete Products'),
        ('view_categories', 'View Categories'),
        ('create_categories', 'Create Categories'),
        ('edit_categories', 'Edit Categories'),
        ('delete_categories', 'Delete Categories'),
        ('view_clients', 'View Clients'),
        ('create_clients', 'Create Clients'),
        ('edit_clients', 'Edit Clients'),
        ('delete_clients', 'Delete Clients'),
        ('view_sales', 'View Sales'),
        ('create_sales', 'Create Sales'),
        ('edit_sales', 'Edit Sales'),
        ('delete_sales', 'Delete Sales'),
        ('view_orders', 'View Orders'),
        ('edit_orders', 'Edit Orders'),
        ('delete_orders', 'Delete Orders'),
        ('view_services', 'View Services'),
        ('create_services', 'Create Services'),
        ('edit_services', 'Edit Services'),
        ('delete_services', 'Delete Services'),
        ('view_cashbox', 'View Cashbox'),
        ('edit_cashbox', 'Edit Cashbox'),
        ('view_web', 'View Web'),
        ('edit_web', 'Edit Web'),
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


class TenantActivityLog(models.Model):
    tenant = models.ForeignKey('users.Tenant', on_delete=models.CASCADE, related_name='activity_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    actor_username = models.CharField(max_length=150, blank=True, default='')
    actor_role = models.CharField(max_length=30, blank=True, default='')

    action = models.CharField(max_length=40)
    resource_type = models.CharField(max_length=60, blank=True, default='')
    resource_id = models.CharField(max_length=64, blank=True, default='')
    message = models.CharField(max_length=255, blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)

    ip_address = models.CharField(max_length=45, blank=True, default='')
    user_agent = models.CharField(max_length=300, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['tenant', 'actor', '-created_at']),
            models.Index(fields=['tenant', 'action', '-created_at']),
            models.Index(fields=['tenant', 'resource_type', '-created_at']),
        ]

    def __str__(self):
        who = self.actor_username or (self.actor.username if self.actor else 'unknown')
        return f"{self.tenant_id}:{who}:{self.action}:{self.resource_type}:{self.resource_id}"


def _support_audio_path(instance, filename: str) -> str:
    return f"support_audio/tenant_{instance.tenant_id}/{filename}"


class TenantSupportMessage(models.Model):
    tenant = models.ForeignKey('users.Tenant', on_delete=models.CASCADE, related_name='support_messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='support_messages')
    sender_username = models.CharField(max_length=150, blank=True, default='')
    sender_role = models.CharField(max_length=30, blank=True, default='')

    text = models.TextField(blank=True, default='')
    audio = models.FileField(upload_to=_support_audio_path, null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True, default='')
    duration_ms = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['tenant', 'sender_role', '-created_at']),
        ]


class TenantSupportChatState(models.Model):
    tenant = models.ForeignKey('users.Tenant', on_delete=models.CASCADE, related_name='support_chat_states')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_chat_states')
    last_seen_id = models.BigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['tenant', 'user']
        indexes = [
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['user', '-updated_at']),
        ]
