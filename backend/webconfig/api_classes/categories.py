from rest_framework import views, permissions
from rest_framework.response import Response
from webconfig.models import VisibleCategory, UserURL
from products.models import Category
from .utils import _log, _site_variants

class PublicCategoriesView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_categories', True, None)
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
        
        if not tenant:
            return Response([])

        # Get categories for this tenant that are active
        cats_qs = Category.objects.filter(tenant=tenant, active=True)
        # Get visible categories entries, ordered by position
        visible_qs = VisibleCategory.objects.filter(category__in=cats_qs, active=True).select_related('category').order_by('position', 'category_id')
        
        cats = [vc.category for vc in visible_qs]

        return Response([{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'image': (request.build_absolute_uri(c.image.url) if (getattr(c, 'image', None) and getattr(c.image, 'url', None) and str(c.image.url).startswith('/')) else (c.image.url if getattr(c, 'image', None) else None)),
        } for c in cats])
