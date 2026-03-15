from rest_framework import views, status, permissions
from rest_framework.response import Response
from webconfig.models import VisibleProduct, Policy, UserURL
from products.models import Product
from config.models import AppSettings
from products.api import ProductSerializer
from .policies import PolicySerializer
from .settings import AppSettingsSerializer
from .utils import _log, _site_variants

class PortalView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        ok = request.user and request.user.is_authenticated
        _log(request, 'portal', ok, request.user if ok else None)
        if not ok:
            return Response({'detail': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        vis_ids = list(VisibleProduct.objects.filter(active=True).values_list('product_id', flat=True))
        prods = Product.objects.filter(id__in=vis_ids)
        settings = AppSettings.objects.first() or AppSettings.objects.create()
        policy = Policy.objects.first() or Policy.objects.create()
        return Response({
            'settings': AppSettingsSerializer(settings).data,
            'policy': PolicySerializer(policy).data,
            'products': ProductSerializer(prods, many=True, context={'request': request}).data,
        })


class PublicPortalView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_portal', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        tenants = []
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile') and getattr(uu.user.profile, 'tenant', None):
                tenant = uu.user.profile.tenant
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        vis_ids = list(VisibleProduct.objects.filter(active=True).order_by('position', 'product_id').values_list('product_id', flat=True))
        base_qs = Product.objects.filter(id__in=vis_ids)
        prods = base_qs.filter(tenant=tenant) if tenant else Product.objects.none()
        if tenant and not prods.exists():
            prods = Product.objects.filter(tenant=tenant, active=True)
        settings = AppSettings.objects.filter(tenant=tenant).first() if tenant else None
        policy = Policy.objects.first() or Policy.objects.create()
        return Response({
            'settings': (AppSettingsSerializer(settings).data if settings else {}),
            'policy': PolicySerializer(policy).data,
            'products': ProductSerializer(prods, many=True).data,
        })
