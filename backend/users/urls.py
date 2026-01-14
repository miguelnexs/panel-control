from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from . import api as api_views
from . import api_tenant_config as tenant_api_views
from . import views_tenant as tenant_views
from .api_subscription import SubscriptionPlanViewSet, TenantPlanViewSet
from . import api_stripe
from . import api_mercadopago
from . import api_google
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.decorators import login_required
from .decorators import super_admin_required, admin_required

router = DefaultRouter()
router.register(r'api/subscriptions/plans', SubscriptionPlanViewSet, basename='subscription-plans')
router.register(r'api/subscriptions/tenants', TenantPlanViewSet, basename='subscription-tenants')

urlpatterns = [
    # API segura (auth)
    path('api/auth/register/', api_views.RegisterView.as_view(), name='api_register'),
    path('api/auth/register-tenant/', api_views.RegisterTenantView.as_view(), name='api_register_tenant'),
    path('api/auth/login/', api_views.LoginView.as_view(), name='api_login'),
    path('api/auth/google/', api_google.GoogleLoginView.as_view(), name='api_google_login'),
    path('api/auth/me/', api_views.MeView.as_view(), name='api_me'),
    path('api/me/', api_views.MeView.as_view(), name='api_me_alt'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API de pagos (Stripe)
    path('api/payments/create-checkout-session/', api_stripe.CreateCheckoutSessionView.as_view(), name='api_create_checkout_session'),
    path('api/payments/webhook/', api_stripe.StripeWebhookView.as_view(), name='api_stripe_webhook'),

    # API de pagos (Mercado Pago)
    path('api/payments/create-preference/', api_mercadopago.CreatePreferenceView.as_view(), name='api_create_mp_preference'),
    path('api/payments/process-payment/', api_mercadopago.ProcessPaymentView.as_view(), name='api_process_mp_payment'),
    path('api/payments/mp-webhook/', api_mercadopago.MercadoPagoWebhookView.as_view(), name='api_mp_webhook'),

    # API de gestión de usuarios con RBAC
    path('api/users/', api_views.UsersView.as_view(), name='api_users'),
    path('api/users/<int:user_id>/', api_views.UserDetailView.as_view(), name='api_user_detail'),

    # Rutas públicas
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    
    # Rutas protegidas por login
    path('profile/', login_required(views.profile), name='profile'),
    
    # Rutas para administradores y super administradores
    path('users/', login_required(admin_required(views.user_list)), name='user_list'),
    path('users/create/', login_required(admin_required(views.user_create)), name='user_create'),
    path('users/<int:user_id>/edit/', login_required(admin_required(views.user_edit)), name='user_edit'),
    path('users/<int:user_id>/delete/', login_required(admin_required(views.user_delete)), name='user_delete'),
    path('admin-dashboard/', login_required(admin_required(views.admin_dashboard)), name='admin_dashboard'),
    
    # Rutas exclusivas para super administradores
    path('statistics/', login_required(super_admin_required(views.statistics)), name='statistics'),
    
    # Tenant Configuration API endpoints
    path('api/tenant/config/', tenant_api_views.TenantConfigurationView.as_view(), name='api_tenant_config'),
    path('api/tenant/themes/', tenant_api_views.TenantThemesView.as_view(), name='api_tenant_themes'),
    path('api/tenant/themes/<int:theme_id>/', tenant_api_views.TenantThemeDetailView.as_view(), name='api_tenant_theme_detail'),
    path('api/tenant/permissions/', tenant_api_views.TenantPermissionsView.as_view(), name='api_tenant_permissions'),
    path('api/tenant/permissions/<int:permission_id>/', tenant_api_views.TenantPermissionDetailView.as_view(), name='api_tenant_permission_detail'),
    
    # Super admin tenant management
    path('api/admin/tenants/', tenant_api_views.SuperAdminTenantsView.as_view(), name='api_admin_tenants'),
    
    # Tenant management views
    path('tenant/dashboard/', login_required(tenant_views.tenant_dashboard), name='tenant_dashboard'),
    path('tenant/settings/', login_required(tenant_views.tenant_settings), name='tenant_settings'),
    path('tenant/settings/payments/', login_required(tenant_views.tenant_payment_settings), name='tenant_payment_settings'),
    path('tenant/settings/whatsapp/', login_required(tenant_views.tenant_whatsapp_settings), name='tenant_whatsapp_settings'),
    path('tenant/settings/whatsapp/test/', login_required(tenant_views.tenant_whatsapp_test), name='tenant_whatsapp_test'),
    path('tenant/themes/', login_required(tenant_views.tenant_themes), name='tenant_themes'),
    path('tenant/permissions/', login_required(tenant_views.tenant_permissions), name='tenant_permissions'),
    path('super-admin/tenants/', login_required(super_admin_required(tenant_views.super_admin_tenants)), name='super_admin_tenants'),
    path('super-admin/tenants/<int:tenant_id>/', login_required(super_admin_required(tenant_views.super_admin_tenant_detail)), name='super_admin_tenant_detail'),
]

urlpatterns += router.urls
