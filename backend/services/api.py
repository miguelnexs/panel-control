from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Sum, Count
from .models import Service, ServiceCategory
from clients.models import Client
from users.models import UserProfile, Tenant


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'image', 'active', 'created_at']

    def validate_name(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError('Nombre requerido, máximo 100 caracteres.')
        import re
        if not re.fullmatch(r"[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\-\s]+", value):
            raise serializers.ValidationError('Nombre contiene caracteres no permitidos.')
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError('Descripción máximo 500 caracteres.')
        return value

    def validate_image(self, value):
        if value is None:
            return value
        ct = getattr(value, 'content_type', None)
        if ct and ct not in ('image/jpeg', 'image/png', 'image/webp'):
            raise serializers.ValidationError('Formato de imagen inválido (jpeg, png, webp).')
        size = getattr(value, 'size', 0)
        if size and size > 5 * 1024 * 1024:
            raise serializers.ValidationError('La imagen supera 5MB.')
        return value


class ServiceSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=ServiceCategory.objects.all(), required=False, allow_null=True)
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=True, allow_null=False)

    class Meta:
        model = Service
        fields = [
            'id', 'entry_date', 'exit_date', 'name', 'description', 'category', 'client',
            'third_party_provider', 'third_party_cost', 'value', 'status', 'active', 'created_at'
        ]

    def validate_name(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError('Nombre requerido, máximo 100 caracteres.')
        return value

    def validate_value(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError('Valor debe ser 0 o positivo.')
        q = value.as_tuple().exponent
        if q < -2:
            raise serializers.ValidationError('Valor máximo 2 decimales.')
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['client_name'] = getattr(instance.client, 'full_name', None)
        data['category_name'] = getattr(instance.category, 'name', None)
        return data

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs
        tenant = _get_user_tenant(request.user)
        cat = attrs.get('category')
        if tenant and cat and getattr(cat, 'tenant', None) != tenant:
            raise serializers.ValidationError({'category': 'La categoría no pertenece a su organización.'})
        cli = attrs.get('client')
        if tenant and cli and getattr(cli, 'tenant', None) != tenant:
            raise serializers.ValidationError({'client': 'El cliente no pertenece a su organización.'})
        entry = attrs.get('entry_date')
        exit_ = attrs.get('exit_date')
        if exit_ and entry and exit_ < entry:
            raise serializers.ValidationError({'exit_date': 'La fecha de salida no puede ser anterior a la de entrada.'})
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)


def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()


def _get_user_role(user):
    try:
        return user.profile.role
    except UserProfile.DoesNotExist:
        return 'employee'


class ServicePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class ServiceListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        qs = Service.objects.all().select_related('client', 'category')
        if tenant:
            qs = qs.filter(tenant=tenant)
        else:
            role = _get_user_role(self.request.user)
            if role != 'super_admin':
                return Service.objects.none()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search) | Q(client__full_name__icontains=search))
        ordering = self.request.query_params.get('ordering') or '-created_at'
        allowed = {'name', 'created_at', 'status', 'value', 'active'}
        if ordering.lstrip('-') in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        tenant = _get_user_tenant(self.request.user)
        role = _get_user_role(self.request.user)
        if not tenant and role != 'super_admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tiene tenant asignado. Contacte al administrador.')
        serializer.save(tenant=tenant if tenant else None)


class ServiceDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            return Service.objects.filter(tenant=tenant).select_related('client', 'category')
        role = _get_user_role(self.request.user)
        if role == 'super_admin':
            return Service.objects.all().select_related('client', 'category')
        return Service.objects.none()

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            raise PermissionDenied('Solo administradores pueden eliminar servicios.')
        instance.delete()


class ServiceCategoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class ServiceCategoryListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceCategorySerializer
    pagination_class = ServiceCategoryPagination

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        qs = ServiceCategory.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        else:
            role = _get_user_role(self.request.user)
            if role != 'super_admin':
                return ServiceCategory.objects.none()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        ordering = self.request.query_params.get('ordering') or '-created_at'
        allowed = {'name', 'created_at', 'active'}
        if ordering.lstrip('-') in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden crear categorías de servicios.')
        tenant = _get_user_tenant(self.request.user)
        serializer.save(tenant=tenant if tenant else None)


class ServiceCategoryDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceCategorySerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            return ServiceCategory.objects.filter(tenant=tenant)
        role = _get_user_role(self.request.user)
        if role == 'super_admin':
            return ServiceCategory.objects.all()
        return ServiceCategory.objects.none()

    def perform_update(self, serializer):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden editar categorías de servicios.')
        serializer.save()

    def perform_destroy(self, instance):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden eliminar categorías de servicios.')
        instance.delete()


from rest_framework.views import APIView
from rest_framework.response import Response


class ServiceStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = _get_user_tenant(request.user)
        qs = Service.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        else:
            role = _get_user_role(request.user)
            if role != 'super_admin':
                qs = Service.objects.none()
        total = qs.count()
        delivered = qs.filter(status='entregado').count()
        received = qs.filter(status='recibido').count()
        total_value = qs.aggregate(s=Sum('value'))['s'] or 0
        return Response({
            'total': total,
            'delivered': delivered,
            'received': received,
            'total_value': float(total_value),
        })
