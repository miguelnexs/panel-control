from django.urls import path
from .api import SaleView, SalesListView, SalesStatsView, SalesNotificationCountView, SalesNotificationMarkReadView, SalesStatusUpdateView
from .api_payment import PaymentInitView, PublicSalePaymentView
from .api_receipt import SendReceiptView

urlpatterns = [
    path('', SaleView.as_view(), name='sales_create'),
    path('receipt/send/<int:pk>/', SendReceiptView.as_view(), name='sales_send_receipt'),
    path('payment/init/', PaymentInitView.as_view(), name='payment_init'),
    path('public/payment/', PublicSalePaymentView.as_view(), name='public_sale_payment'),
    path('list/', SalesListView.as_view(), name='sales_list'),
    path('stats/', SalesStatsView.as_view(), name='sales_stats'),
    path('notifications/count/', SalesNotificationCountView.as_view(), name='sales_notifications_count'),
    path('notifications/read/', SalesNotificationMarkReadView.as_view(), name='sales_notifications_read'),
    path('status/<int:pk>/', SalesStatusUpdateView.as_view(), name='sales_status_update'),
]
