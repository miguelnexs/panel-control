from django.urls import path
from . import api as api_views

urlpatterns = [
    path('', api_views.ClientsListCreateView.as_view(), name='clients_list_create'),
    path('<int:pk>/', api_views.ClientsDetailView.as_view(), name='clients_detail'),
    path('stats/', api_views.ClientsStatsView.as_view(), name='clients_stats'),
    path('orders/<int:client_id>/', api_views.ClientsOrdersView.as_view(), name='clients_orders'),
]
