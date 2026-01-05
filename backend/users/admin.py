from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Tenant, PrivateNote
from .forms import UserRegistrationForm

# Define un administrador en línea para el modelo UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil de Usuario'
    fieldsets = (
        ('Información Personal', {
            'fields': ('phone', 'address', 'birth_date', 'cedula')
        }),
        ('Información Laboral', {
            'fields': ('role', 'position', 'department', 'hire_date')
        }),
    )

# Define un nuevo administrador de usuarios
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'is_staff')
    list_filter = ('is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

    # Formulario de creación que incluye usuario, contraseñas y rol
    add_form = UserRegistrationForm
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    def get_role(self, obj):
        try:
            return obj.profile.get_role_display()
        except UserProfile.DoesNotExist:
            return "Sin rol asignado"
    get_role.short_description = 'Rol'
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )

    def has_module_permission(self, request):
        return True
    def has_view_permission(self, request, obj=None):
        return True
    def has_add_permission(self, request):
        return True
    def has_change_permission(self, request, obj=None):
        return True
    def has_delete_permission(self, request, obj=None):
        return True
    def get_model_perms(self, request):
        return {'add': True, 'change': True, 'delete': True, 'view': True}

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'cedula', 'position', 'department')
    list_filter = ('role', 'department')
    search_fields = ('user__username', 'user__email', 'cedula', 'position', 'department')
    ordering = ('user__username',)

    def has_module_permission(self, request):
        return True
    def has_view_permission(self, request, obj=None):
        return True
    def has_add_permission(self, request):
        return True
    def has_change_permission(self, request, obj=None):
        return True
    def has_delete_permission(self, request, obj=None):
        return True
    def get_model_perms(self, request):
        return {'add': True, 'change': True, 'delete': True, 'view': True}


# AdminSite restringido por rol (solo Super Administrador)
class RoleRestrictedAdminSite(AdminSite):
    site_header = 'Administración'
    site_title = 'Admin'
    index_title = 'Panel de Administración'

    def has_permission(self, request):
        user = request.user
        if not user.is_authenticated or not user.is_active:
            return False
        return True

    def each_context(self, request):
        ctx = super().each_context(request)
        try:
            from config.models import AppSettings
            company = ''
            tenant = None
            try:
                profile = getattr(request.user, 'profile', None)
                tenant = getattr(profile, 'tenant', None)
            except Exception:
                tenant = None
            ws = None
            if tenant:
                ws = AppSettings.objects.filter(tenant=tenant).first()
            if ws is None:
                ws = AppSettings.objects.first()
            company = (ws and getattr(ws, 'company_name', '') or '').strip()
            if company:
                self.site_header = f'Administración {company}'
                self.site_title = f'Admin {company}'
                ctx['site_header'] = self.site_header
                ctx['site_title'] = self.site_title
        except Exception:
            pass
        return ctx


# Instancia del admin restringido
role_admin_site = RoleRestrictedAdminSite(name='role_admin')

# Registrar modelos en el admin restringido
role_admin_site.register(User, UserAdmin)
role_admin_site.register(UserProfile, UserProfileAdmin)
role_admin_site.register(Tenant)
role_admin_site.register(PrivateNote)
