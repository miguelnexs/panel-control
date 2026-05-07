from django.db import models

class SubscriptionPlan(models.Model):
    PLAN_CHOICES = (
        ('basic', 'Plan Básico'),
        ('medium', 'Plan Medio'),
        ('advanced', 'Plan Avanzado'),
    )

    code = models.CharField(max_length=20, choices=PLAN_CHOICES, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Limits
    max_users = models.IntegerField(default=1, help_text="Number of users allowed. -1 for unlimited.")
    max_products = models.IntegerField(default=50, help_text="Number of products allowed. -1 for unlimited.")
    max_categories = models.IntegerField(default=10, help_text="Number of categories allowed. -1 for unlimited.")
    max_transactions_per_month = models.IntegerField(default=100, help_text="Number of transactions allowed per month. -1 for unlimited.")
    
    # Features
    # Basic
    enable_basic_dashboard = models.BooleanField(default=True)
    enable_basic_sales = models.BooleanField(default=True)
    enable_basic_stats = models.BooleanField(default=True)
    enable_user_management = models.BooleanField(default=True)
    
    # Medium
    enable_advanced_sales_analysis = models.BooleanField(default=False)
    enable_inventory_management = models.BooleanField(default=False)
    enable_detailed_reports = models.BooleanField(default=False)
    enable_third_party_integrations = models.BooleanField(default=False)
    enable_supplier_management = models.BooleanField(default=False)
    enable_daily_backups = models.BooleanField(default=False)
    
    # Advanced
    enable_web_store = models.BooleanField(default=False)
    enable_custom_domain = models.BooleanField(default=False)
    enable_marketing_tools = models.BooleanField(default=False)
    enable_api_access = models.BooleanField(default=False)
    enable_priority_support = models.BooleanField(default=False)
    enable_whatsapp_notifications = models.BooleanField(default=False)
    enable_electronic_invoicing = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
