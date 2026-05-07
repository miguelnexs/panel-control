from django.contrib import admin
from .models import Service, ServiceCategory


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'client', 'value', 'status', 'active', 'tenant', 'created_at')
    list_filter = ('status', 'active', 'tenant', 'category')
    search_fields = ('name', 'description', 'client__full_name', 'third_party_provider')
    date_hierarchy = 'created_at'


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'active', 'tenant', 'created_at')
    list_filter = ('active', 'tenant')
    search_fields = ('name', 'description')
    date_hierarchy = 'created_at'

