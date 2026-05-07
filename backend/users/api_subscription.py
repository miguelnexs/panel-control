from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
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
        try:
            if self.request.user.is_superuser:
                return True
            if hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'super_admin':
                return True
        except:
            pass
        return False

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
        Assign this plan to a specific user (by user_id).
        Creates a Tenant if it doesn't exist.
        Body: { "user_id": 123 }
        """
        if not self.check_super_admin():
            return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
        
        plan = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"detail": "user_id es requerido."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id)
            tenant = Tenant.objects.filter(admin=user).first()
            
            if not tenant:
                # Create Tenant if it doesn't exist
                from .tenant import ensure_tenant_for_user
                ensure_tenant_for_user(user)
                tenant = Tenant.objects.get(admin=user)
            
            tenant.subscription_plan = plan
            tenant.has_paid = True # Assume paid if assigned by super admin
            tenant.save()
            
            # Actualizar el perfil del usuario para que sea admin si no lo es
            try:
                profile = UserProfile.objects.filter(user=user).first()
                if not profile:
                    profile = UserProfile.objects.create(user=user, role='admin', tenant=tenant)
                elif profile.role not in ['admin', 'super_admin']:
                    profile.role = 'admin'
                    profile.tenant = tenant
                    profile.save()
            except:
                pass
            
            return Response({"detail": f"Plan {plan.name} asignado a {user.username}"})
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": f"Error asignando plan: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TenantPlanSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    admin_id = serializers.IntegerField(source='id', read_only=True)
    plan_name = serializers.SerializerMethodField()
    plan_id = serializers.SerializerMethodField()
    db_alias = serializers.SerializerMethodField()
    
    clients_count = serializers.SerializerMethodField()
    sales_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'admin_id', 'plan_name', 'plan_id', 'db_alias', 'clients_count', 'sales_count', 'products_count']

    def get_plan_name(self, obj):
        try:
            tenant = getattr(obj, 'tenant', None)
            if tenant and tenant.subscription_plan:
                return tenant.subscription_plan.name
        except:
            pass
        return "Sin Plan"

    def get_plan_id(self, obj):
        try:
            tenant = getattr(obj, 'tenant', None)
            if tenant and tenant.subscription_plan:
                return tenant.subscription_plan.id
        except:
            pass
        return None

    def get_db_alias(self, obj):
        try:
            tenant = getattr(obj, 'tenant', None)
            if tenant:
                return tenant.db_alias
        except:
            pass
        return "N/A"

    def get_clients_count(self, obj):
        try:
            tenant = getattr(obj, 'tenant', None)
            if tenant:
                from django.apps import apps
                Client = apps.get_model('clients', 'Client')
                return Client.objects.filter(tenant=tenant).count()
        except:
            pass
        return 0

    def get_sales_count(self, obj):
        try:
            tenant = getattr(obj, 'tenant', None)
            if tenant:
                from django.apps import apps
                Sale = apps.get_model('sales', 'Sale')
                return Sale.objects.filter(tenant=tenant).count()
        except:
            pass
        return 0

    def get_products_count(self, obj):
        try:
            tenant = getattr(obj, 'tenant', None)
            if tenant:
                from django.apps import apps
                Product = apps.get_model('products', 'Product')
                return Product.objects.filter(tenant=tenant).count()
        except:
            pass
        return 0

class TenantPlanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TenantPlanSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print(f"ERROR in TenantPlanViewSet.list: {str(e)}")
            traceback.print_exc()
            return Response({"detail": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_queryset(self):
        is_superadmin = False
        try:
            if self.request.user.is_superuser or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'super_admin'):
                is_superadmin = True
        except:
            pass

        if not is_superadmin:
             return User.objects.none()
        
        # Query all users that could be admins (is_staff or role='admin' or has a tenant)
        # We exclude super admins from the list to avoid self-assignment confusion if desired, 
        # but for now let's show all potential customers.
        from django.db.models import Q
        return User.objects.filter(
            Q(is_staff=True) | 
            Q(profile__role='admin') | 
            Q(profile__role='employer') |
            Q(tenant__isnull=False)
        ).distinct().select_related('profile', 'tenant', 'tenant__subscription_plan')
