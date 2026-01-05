from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DianConfigView, DianResolutionViewSet, ElectronicInvoiceViewSet, EmitInvoiceView

router = DefaultRouter()
router.register(r'resolutions', DianResolutionViewSet, basename='dian-resolution')
router.register(r'invoices', ElectronicInvoiceViewSet, basename='dian-invoice')

urlpatterns = [
    path('config/', DianConfigView.as_view(), name='dian-config'),
    path('emit/<int:sale_id>/', EmitInvoiceView.as_view(), name='dian-emit'),
    path('', include(router.urls)),
]
