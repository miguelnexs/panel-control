from django.urls import path
from . import api as api_views

urlpatterns = [
    path('check-sku/', api_views.CheckSKUView.as_view(), name='check_sku'),
    path('', api_views.ProductListCreateView.as_view(), name='products_list_create'),
    path('<int:pk>/', api_views.ProductDetailView.as_view(), name='products_detail'),
    path('categories/', api_views.CategoryListCreateView.as_view(), name='categories_list_create'),
    path('categories/<int:pk>/', api_views.CategoryDetailView.as_view(), name='categories_detail'),
    path('<int:product_id>/colors/', api_views.ProductColorListCreateView.as_view(), name='product_colors_list_create'),
    path('colors/<int:pk>/', api_views.ProductColorDetailView.as_view(), name='product_colors_detail'),
    path('colors/<int:color_id>/images/', api_views.ProductColorImageListCreateView.as_view(), name='product_color_images_list_create'),
    path('color-images/<int:pk>/', api_views.ProductColorImageDetailView.as_view(), name='product_color_images_detail'),
    path('<int:product_id>/variants/', api_views.ProductVariantListCreateView.as_view(), name='product_variants_list_create'),
    path('variants/<int:pk>/', api_views.ProductVariantDetailView.as_view(), name='product_variants_detail'),
    path('<int:product_id>/features/', api_views.ProductFeatureListCreateView.as_view(), name='product_features_list_create'),
    path('features/<int:pk>/', api_views.ProductFeatureDetailView.as_view(), name='product_features_detail'),
    path('<int:product_id>/gallery/', api_views.ProductImageListCreateView.as_view(), name='product_gallery_list_create'),
    path('gallery/<int:pk>/', api_views.ProductImageDetailView.as_view(), name='product_gallery_detail'),
    path('<int:product_id>/skus/', api_views.ProductSKUListCreateView.as_view(), name='product_skus_list_create'),
    path('skus/<int:pk>/', api_views.ProductSKUDetailView.as_view(), name='product_skus_detail'),
]
