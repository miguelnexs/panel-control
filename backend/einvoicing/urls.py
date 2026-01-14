from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DianConfigView, DianResolutionViewSet, ElectronicInvoiceViewSet, EmitInvoiceView
from .api_alegra import AlegraConfigView, EmitAlegraInvoiceView

router = DefaultRouter()
router.register(r'resolutions', DianResolutionViewSet, basename='dian-resolution')
router.register(r'invoices', ElectronicInvoiceViewSet, basename='dian-invoice')

urlpatterns = [
    # DIAN Native (Existing)
    path('config/', DianConfigView.as_view(), name='dian-config'),
    path('emit/<int:sale_id>/', EmitInvoiceView.as_view(), name='dian-emit'),
    
    # Alegra Integration (New)
    path('alegra/config/', AlegraConfigView.as_view(), name='alegra-config'),
    path('alegra/emit/<int:sale_id>/', EmitAlegraInvoiceView.as_view(), name='alegra-emit'),
    
    path('', include(router.urls)),
]
