from rest_framework import serializers, views, permissions
from rest_framework.response import Response
from webconfig.models import VisibleCategory
from products.models import Category

class VisibleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibleCategory
        fields = ['category', 'active', 'position']


class VisibleCategoriesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        items = VisibleCategory.objects.filter(active=True).order_by('position', 'category_id')
        return Response([VisibleCategorySerializer(v).data for v in items])


class VisibleCategoryUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, category_id):
        obj, _ = VisibleCategory.objects.get_or_create(category_id=category_id)
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
            category = Category.objects.filter(id=category_id).first()
            if category and user_tenant and getattr(category, 'tenant', None) is None:
                category.tenant = user_tenant
                category.save(update_fields=['tenant'])
        except Exception:
            pass
        obj.save()
        return Response(VisibleCategorySerializer(obj).data)


class VisibleCategoryStatusListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            profile = getattr(request.user, 'profile', None)
            user_tenant = profile.tenant if profile else None
            role = profile.role if profile else 'employee'
        except Exception:
            user_tenant = None
            role = 'employee'
        if user_tenant:
            cats = Category.objects.filter(tenant=user_tenant).order_by('name', 'id')
        else:
            if role == 'super_admin':
                cats = Category.objects.all().order_by('name', 'id')
            elif role == 'admin':
                cats = Category.objects.filter(tenant__isnull=True).order_by('name', 'id')
            else:
                cats = Category.objects.none()
        result = []
        for c in cats:
            vc = VisibleCategory.objects.filter(category=c).first()
            result.append({
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'image': c.image.url if c.image else None,
                'visible': bool(vc and vc.active),
                'position': int(getattr(vc, 'position', 0) or 0),
            })
        return Response(result)
