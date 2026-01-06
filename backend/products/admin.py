from django.contrib import admin
from users.admin import role_admin_site
from .models import Category, Product, ProductColor, ProductColorImage, ProductVariant, ProductFeature

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'active', 'created_at')
    list_filter = ('active', 'category')
    search_fields = ('name', 'sku')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class ProductColorAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'hex', 'stock', 'position')
    list_filter = ('product',)
    search_fields = ('name', 'product__name', 'product__sku')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class ProductColorImageAdmin(admin.ModelAdmin):
    list_display = ('color', 'position', 'created_at')
    list_filter = ('color',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

role_admin_site.register(Category, CategoryAdmin)
role_admin_site.register(Product, ProductAdmin)
role_admin_site.register(ProductColor, ProductColorAdmin)
role_admin_site.register(ProductColorImage, ProductColorImageAdmin)

class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'extra_price', 'position', 'created_at')
    list_filter = ('product',)
    search_fields = ('name', 'product__name', 'product__sku')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

role_admin_site.register(ProductVariant, ProductVariantAdmin)

class ProductFeatureAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'position', 'created_at')
    list_filter = ('product',)
    search_fields = ('name', 'product__name', 'product__sku')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

role_admin_site.register(ProductFeature, ProductFeatureAdmin)
