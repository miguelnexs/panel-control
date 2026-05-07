from django.contrib import admin
from django import forms
from users.admin import role_admin_site
from .models import PaymentMethod, Banner, Policy, VisitStat, VisibleProduct, VisibleCategory, AccessLog, UserURL
from users.utils.crypto import encrypt_text

class PaymentMethodForm(forms.ModelForm):
    public_key = forms.CharField(required=False, widget=forms.TextInput(attrs={'size': 60}), help_text="Public Key / Client ID")
    private_key = forms.CharField(required=False, widget=forms.PasswordInput(attrs={'size': 60}), help_text="Secret Key / Access Token (Will be encrypted)")

    class Meta:
        model = PaymentMethod
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            extra = self.instance.extra_config or {}
            self.fields['public_key'].initial = extra.get('public_key', '')
            if extra.get('private_key'):
                self.fields['private_key'].widget.attrs['placeholder'] = "********"
                self.fields['private_key'].required = False

    def save(self, commit=True):
        instance = super().save(commit=False)
        extra = instance.extra_config or {}
        
        if self.cleaned_data.get('public_key'):
            extra['public_key'] = self.cleaned_data['public_key']
            
        if self.cleaned_data.get('private_key'):
            extra['private_key'] = encrypt_text(self.cleaned_data['private_key'])
            
        instance.extra_config = extra
        if commit:
            instance.save()
        return instance

class PaymentMethodAdmin(admin.ModelAdmin):
    form = PaymentMethodForm
    list_display = ('name', 'provider', 'fee_percent', 'active')
    list_filter = ('active', 'provider')
    search_fields = ('name', 'provider')
    fieldsets = (
        ('General', {
            'fields': ('name', 'provider', 'active', 'currencies', 'fee_percent', 'tenant')
        }),
        ('Integration Keys', {
            'fields': ('public_key', 'private_key'),
            'description': 'Enter the API keys provided by the payment gateway.'
        }),
        ('Advanced', {
            'fields': ('extra_config',),
            'classes': ('collapse',),
        }),
    )
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'active', 'position', 'created_at')
    list_filter = ('active',)
    search_fields = ('title',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class PolicyAdmin(admin.ModelAdmin):
    list_display = ('updated_at',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class VisitStatAdmin(admin.ModelAdmin):
    list_display = ('date', 'visits', 'conversions')
    list_filter = ('date',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class VisibleProductAdmin(admin.ModelAdmin):
    list_display = ('product', 'active', 'position', 'updated_at')
    list_filter = ('active',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class VisibleCategoryAdmin(admin.ModelAdmin):
    list_display = ('category', 'active', 'position', 'updated_at')
    list_filter = ('active',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

class AccessLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'path', 'success', 'created_at')
    list_filter = ('success',)
    search_fields = ('path',)
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}

role_admin_site.register(PaymentMethod, PaymentMethodAdmin)
role_admin_site.register(Banner, BannerAdmin)
role_admin_site.register(Policy, PolicyAdmin)
role_admin_site.register(VisitStat, VisitStatAdmin)
role_admin_site.register(VisibleProduct, VisibleProductAdmin)
role_admin_site.register(VisibleCategory, VisibleCategoryAdmin)
role_admin_site.register(AccessLog, AccessLogAdmin)
 
class UserURLAdmin(admin.ModelAdmin):
    list_display = ('url', 'user', 'created_at')
    search_fields = ('url', 'user__username', 'user__email')
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return True
    def has_change_permission(self, request, obj=None): return True
    def has_delete_permission(self, request, obj=None): return True
    def get_model_perms(self, request): return {'add': True, 'change': True, 'delete': True, 'view': True}
 
role_admin_site.register(UserURL, UserURLAdmin)
