from django.urls import path
from .api_classes.policies import PolicyView, PublicPolicyView
from .api_classes.stats import StatsView
from .api_classes.portal import PortalView, PublicPortalView
from .api_classes.products import PublicProductsView, PublicProductDetailView
from .api_classes.categories import PublicCategoriesView
from .api_classes.settings import PublicSettingsView, WebSettingsView
from .api_classes.payments import PublicPaymentsView, PaymentMethodListCreateView, PaymentMethodDetailView
from .api_classes.checkout import PublicCheckoutView
from .api_classes.user_urls import (
    UserURLAvailabilityView, UserURLListCreateView, UserURLDetailView,
    SiteURLStatusView, SiteURLClaimView, PublicAutoClaimView
)
from .api_classes.visible_categories import (
    VisibleCategoriesView, VisibleCategoryUpdateView, VisibleCategoryStatusListView
)
from .api_classes.visible_products import VisibleProductsView, VisibleProductUpdateView
from .api_classes.templates import (
    TemplateListView, MyTemplateListCreateView, MyTemplateDetailView,
    TemplateAdminDetailView, TemplateCloneView
)
from .api_classes.google_config import TestGoogleConfigView
from .api_classes.banners import PublicBannersView, BannerListCreateView, BannerDetailView

urlpatterns = [
    path('templates/', TemplateListView.as_view(), name='templates_list'),
    path('templates/<int:pk>/', TemplateAdminDetailView.as_view(), name='templates_admin_detail'),
    path('templates/<int:pk>/clone/', TemplateCloneView.as_view(), name='template_clone'),
    path('templates/my/', MyTemplateListCreateView.as_view(), name='templates_my_list_create'),
    path('templates/my/<int:pk>/', MyTemplateDetailView.as_view(), name='templates_my_detail'),
    path('settings/', WebSettingsView.as_view(), name='web_settings'),
    path('google/test/', TestGoogleConfigView.as_view(), name='google_test'),
    path('payments/', PaymentMethodListCreateView.as_view(), name='payment_methods'),
    path('payments/<int:pk>/', PaymentMethodDetailView.as_view(), name='payment_method_detail'),
    path('banners/', BannerListCreateView.as_view(), name='banners'),
    path('banners/<int:pk>/', BannerDetailView.as_view(), name='banner_detail'),
    path('policy/', PolicyView.as_view(), name='policy'),
    path('stats/', StatsView.as_view(), name='web_stats'),
    path('portal/', PortalView.as_view(), name='web_portal'),
    path('public/portal/', PublicPortalView.as_view(), name='web_public_portal'),
    path('public/products/', PublicProductsView.as_view(), name='web_public_products'),
    path('public/products/<int:pk>/', PublicProductDetailView.as_view(), name='web_public_product_detail'),
    path('public/categories/', PublicCategoriesView.as_view(), name='web_public_categories'),
    path('public/banners/', PublicBannersView.as_view(), name='web_public_banners'),
    path('public/policy/', PublicPolicyView.as_view(), name='web_public_policy'),
    path('public/settings/', PublicSettingsView.as_view(), name='web_public_settings'),
    path('public/payments/', PublicPaymentsView.as_view(), name='web_public_payments'),
    path('public/checkout/', PublicCheckoutView.as_view(), name='web_public_checkout'),
    path('user-urls/availability/', UserURLAvailabilityView.as_view(), name='user_url_availability'),
    path('user-urls/', UserURLListCreateView.as_view(), name='user_url_list_create'),
    path('user-urls/<int:pk>/', UserURLDetailView.as_view(), name='user_url_detail'),
    path('visible-categories/', VisibleCategoriesView.as_view(), name='visible_categories'),
    path('visible-categories/<int:category_id>/', VisibleCategoryUpdateView.as_view(), name='visible_category_update'),
    path('visible-categories/status/', VisibleCategoryStatusListView.as_view(), name='visible_category_status'),
    path('visible-products/', VisibleProductsView.as_view(), name='visible_products'),
    path('visible-products/<int:product_id>/', VisibleProductUpdateView.as_view(), name='visible_product_update'),
    path('site-url/status/', SiteURLStatusView.as_view(), name='site_url_status'),
    path('site-url/claim/', SiteURLClaimView.as_view(), name='site_url_claim'),
    path('public/auto-claim/', PublicAutoClaimView.as_view(), name='public_auto_claim'),
]
