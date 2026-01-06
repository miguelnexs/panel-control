from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models_subscription import SubscriptionPlan
from .models import Tenant, UserProfile

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        return SubscriptionPlan.objects.all().order_by('price')

    def check_super_admin(self):
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile.is_super_admin():
            return False
        return True

    def create(self, request, *args, **kwargs):
        if not self.check_super_admin():
            return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not self.check_super_admin():
            return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if not self.check_super_admin():
            return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign_to_tenant(self, request, pk=None):
        """
        Assign this plan to a specific tenant (by user_id of the tenant admin).
        Body: { "user_id": 123 }
        """
        if not self.check_super_admin():
            return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
        
        plan = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"detail": "user_id es requerido."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            tenant = Tenant.objects.get(admin__id=user_id)
            tenant.subscription_plan = plan
            tenant.save()
            return Response({"detail": f"Plan {plan.name} asignado a {tenant.admin.username}"})
        except Tenant.DoesNotExist:
            return Response({"detail": "Tenant no encontrado para ese usuario."}, status=status.HTTP_404_NOT_FOUND)

class TenantPlanSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='admin.username')
    email = serializers.CharField(source='admin.email')
    admin_id = serializers.IntegerField(source='admin.id')
    plan_name = serializers.CharField(source='subscription_plan.name', allow_null=True)
    plan_id = serializers.IntegerField(source='subscription_plan.id', allow_null=True)
    
    clients_count = serializers.SerializerMethodField()
    sales_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = ['id', 'username', 'email', 'admin_id', 'plan_name', 'plan_id', 'db_alias', 'clients_count', 'sales_count', 'products_count']

    def get_clients_count(self, obj):
        from clients.models import Client
        return Client.objects.filter(tenant=obj).count()

    def get_sales_count(self, obj):
        from sales.models import Sale
        return Sale.objects.filter(tenant=obj).count()

    def get_products_count(self, obj):
        from products.models import Product
        return Product.objects.filter(tenant=obj).count()

class TenantPlanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TenantPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile.is_super_admin():
             return Tenant.objects.none()
        return Tenant.objects.select_related('admin', 'subscription_plan').all()
