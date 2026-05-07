from django.contrib import admin
from .models import DianCompanyConfig, DianResolution, DianClientInfo, ElectronicInvoice
from users.admin import role_admin_site

class DianCompanyConfigAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'environment', 'nit')

class DianResolutionAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'prefix', 'resolution_number', 'active', 'date_to')

class DianClientInfoAdmin(admin.ModelAdmin):
    list_display = ('client', 'document_type', 'person_type')

class ElectronicInvoiceAdmin(admin.ModelAdmin):
    list_display = ('sale', 'cufe', 'status', 'created_at')
    list_filter = ('status',)

role_admin_site.register(DianCompanyConfig, DianCompanyConfigAdmin)
role_admin_site.register(DianResolution, DianResolutionAdmin)
role_admin_site.register(DianClientInfo, DianClientInfoAdmin)
role_admin_site.register(ElectronicInvoice, ElectronicInvoiceAdmin)
