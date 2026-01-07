from django.urls import path
from . import api as api_views

urlpatterns = [
    path('', api_views.ServiceListCreateView.as_view(), name='services_list_create'),
    path('<int:pk>/', api_views.ServiceDetailView.as_view(), name='services_detail'),
    path('categories/', api_views.ServiceCategoryListCreateView.as_view(), name='service_categories_list_create'),
    path('categories/<int:pk>/', api_views.ServiceCategoryDetailView.as_view(), name='service_categories_detail'),
    path('stats/', api_views.ServiceStatsView.as_view(), name='services_stats'),
]

