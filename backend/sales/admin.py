from django.contrib import admin
from users.admin import role_admin_site
from .models import Sale, SaleItem, OrderNotification

class SaleAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'client', 'status', 'total_amount', 'created_at')
    list_filter = ('status',)
    search_fields = ('order_number', 'client__full_name')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product', 'color', 'quantity', 'unit_price', 'line_total')
    list_filter = ('sale', 'product')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class OrderNotificationAdmin(admin.ModelAdmin):
    list_display = ('sale', 'tenant', 'read', 'created_at')
    list_filter = ('read',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

role_admin_site.register(Sale, SaleAdmin)
role_admin_site.register(SaleItem, SaleItemAdmin)
role_admin_site.register(OrderNotification, OrderNotificationAdmin)
