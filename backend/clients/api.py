from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.utils import timezone
from .models import Client
from sales.models import Sale, SaleItem
from users.models import UserProfile, Tenant


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'full_name', 'cedula', 'email', 'address', 'created_at']

    def validate_full_name(self, value):
        if not value or len(value) < 3:
            raise serializers.ValidationError('Nombre completo es obligatorio.')
        return value

    def validate_cedula(self, value):
        import re
        if not re.fullmatch(r"\d{6,12}", value or ''):
            raise serializers.ValidationError('Cédula debe ser numérica de 6 a 12 dígitos.')
        return value

    def validate_email(self, value):
        return value

    def validate_address(self, value):
        if not value or len(value) < 5:
            raise serializers.ValidationError('Dirección es obligatoria.')
        return value


def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()


class ClientsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class ClientsListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = ClientsPagination

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        qs = Client.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(Q(full_name__icontains=q) | Q(cedula__icontains=q) | Q(email__icontains=q) | Q(address__icontains=q))
        ordering = self.request.query_params.get('ordering') or '-created_at'
        allowed = {'full_name', 'cedula', 'email', 'created_at'}
        if ordering.lstrip('-') in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        tenant = _get_user_tenant(self.request.user)
        serializer.save(tenant=tenant)


class ClientsDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            return Client.objects.filter(tenant=tenant)
        return Client.objects.all()


class ClientsStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = _get_user_tenant(request.user)
        qs = Client.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        total = qs.count()
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = qs.filter(created_at__gte=month_start).count()
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        new_today = qs.filter(created_at__gte=day_start).count()
        by_city = []
        for c in qs.values_list('address', flat=True)[:200]:
            city = ''
            if c:
                parts = [p.strip() for p in str(c).split(',') if p.strip()]
                if parts:
                    city = parts[-1]
            by_city.append(city or 'Desconocido')
        from collections import Counter
        city_counts = Counter(by_city)
        top_cities = [{'label': k, 'count': v} for k, v in city_counts.most_common(6)]
        domains = []
        for em in qs.values_list('email', flat=True)[:500]:
            if em and '@' in em:
                domains.append(em.split('@')[-1].strip().lower())
        domain_counts = Counter(domains)
        unique_domains = len(domain_counts)
        return Response({'total': total, 'new_this_month': new_this_month, 'new_today': new_today, 'unique_domains': unique_domains, 'top_cities': top_cities})


class ClientsOrdersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, client_id):
        tenant = _get_user_tenant(request.user)
        client = Client.objects.filter(id=client_id).first()
        if not client:
            return Response({'detail': 'Cliente no encontrado'}, status=404)
        if tenant and client.tenant_id != getattr(tenant, 'id', None):
            return Response({'detail': 'No autorizado'}, status=403)
        sales = Sale.objects.filter(client=client).order_by('-created_at')
        out = []
        for s in sales:
            items = []
            for si in s.items.select_related('product', 'color'):
                items.append({
                    'product': si.product.name,
                    'color': si.color.name if si.color else None,
                    'quantity': si.quantity,
                    'unit_price': str(si.unit_price),
                    'line_total': str(si.line_total),
                })
            out.append({
                'id': s.id,
                'order_number': s.order_number,
                'status': s.status,
                'total_amount': str(s.total_amount),
                'created_at': s.created_at.isoformat(),
                'items': items,
            })
        return Response({'client': ClientSerializer(client).data, 'orders': out})
