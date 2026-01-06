from django.contrib import admin
from users.admin import role_admin_site
from .models import Client

class ClientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'cedula', 'email', 'created_at')
    search_fields = ('full_name', 'cedula', 'email')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

role_admin_site.register(Client, ClientAdmin)
