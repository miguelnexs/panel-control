from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.db.models import Q
from webconfig.models import VisibleProduct, UserURL
from products.models import Product
from products.api import ProductSerializer
from .utils import _log, _site_variants

class PublicProductsView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_products', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        vis_ids = list(VisibleProduct.objects.filter(active=True).order_by('position', 'product_id').values_list('product_id', flat=True))
        base_qs = Product.objects.filter(id__in=vis_ids, active=True).order_by('-created_at')
        prods = base_qs.filter(tenant=tenant) if tenant else Product.objects.none()

        # Filtros adicionales
        if prods.exists():
            # Filtro por Categoría
            cat_id = request.query_params.get('category')
            if cat_id:
                prods = prods.filter(category_id=cat_id)
            
            # Filtro por Búsqueda (Nombre o Descripción)
            search = request.query_params.get('search')
            if search:
                prods = prods.filter(Q(name__icontains=search) | Q(description__icontains=search))
            
            # Filtro por Precio
            min_price = request.query_params.get('min_price')
            if min_price:
                try:
                    prods = prods.filter(price__gte=float(min_price))
                except ValueError:
                    pass
            
            max_price = request.query_params.get('max_price')
            if max_price:
                try:
                    prods = prods.filter(price__lte=float(max_price))
                except ValueError:
                    pass
            
            # Ordenamiento
            ordering = request.query_params.get('ordering')
            if ordering == 'price_asc':
                prods = prods.order_by('price')
            elif ordering == 'price_desc':
                prods = prods.order_by('-price')
            elif ordering == 'name_asc':
                prods = prods.order_by('name')
            elif ordering == 'newest':
                prods = prods.order_by('-created_at')

        return Response(ProductSerializer(prods, many=True, context={'request': request}).data)


class PublicProductDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, pk):
        _log(request, f'public_product_detail:{pk}', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        vis_ids = list(VisibleProduct.objects.filter(active=True).order_by('position', 'product_id').values_list('product_id', flat=True))
        if pk not in vis_ids:
            return Response({'detail': 'Producto no visible'}, status=status.HTTP_404_NOT_FOUND)
        qs = Product.objects.filter(id=pk)
        if tenant:
            qs = qs.filter(tenant=tenant)
        else:
            qs = Product.objects.none()
        prod = qs.first()
        if not prod:
            return Response({'detail': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(prod, context={'request': request}).data)
