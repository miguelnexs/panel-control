from rest_framework import serializers, views, permissions
from rest_framework.response import Response
from webconfig.models import VisibleProduct
from products.models import Product

class VisibleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibleProduct
        fields = ['product', 'active', 'position']


class VisibleProductsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        items = VisibleProduct.objects.filter(active=True).order_by('position', 'product_id')
        return Response([VisibleProductSerializer(v).data for v in items])


class VisibleProductUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, product_id):
        obj, _ = VisibleProduct.objects.get_or_create(product_id=product_id)
        active = request.data.get('active')
        position = request.data.get('position')
        if active is not None:
            obj.active = bool(active)
        if position is not None:
            try:
                obj.position = int(position)
            except Exception:
                pass
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
        except Exception:
            user_tenant = None
        try:
            product = Product.objects.filter(id=product_id).first()
            if product and user_tenant and getattr(product, 'tenant', None) is None:
                product.tenant = user_tenant
                product.save(update_fields=['tenant'])
        except Exception:
            pass
        obj.save()
        return Response(VisibleProductSerializer(obj).data)
