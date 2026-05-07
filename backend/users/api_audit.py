from django.utils.dateparse import parse_datetime
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .audit import get_user_role, get_user_tenant
from .models import Tenant
from .models_tenant_config import TenantActivityLog


class TenantActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden ver actividades.'}, status=status.HTTP_403_FORBIDDEN)

        tenant = None
        if role == 'admin':
            tenant = get_user_tenant(request.user)
            if not tenant:
                return Response({'detail': 'No tiene tenant asociado.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            tenant_id = request.query_params.get('tenant_id')
            if not tenant_id:
                return Response({'detail': 'tenant_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            tenant = Tenant.objects.filter(id=tenant_id).first()
            if not tenant:
                return Response({'detail': 'Tenant no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        qs = TenantActivityLog.objects.filter(tenant=tenant).select_related('actor').order_by('-created_at')
        qs = qs.exclude(actor_role__in=['admin', 'super_admin', ''])

        actor_id = request.query_params.get('actor_id')
        if actor_id:
            qs = qs.filter(actor_id=actor_id)

        action = request.query_params.get('action')
        if action:
            qs = qs.filter(action=action)

        resource_type = request.query_params.get('resource_type')
        if resource_type:
            qs = qs.filter(resource_type=resource_type)

        q = (request.query_params.get('q') or '').strip()
        if q:
            from django.db.models import Q
            qs = qs.filter(
                Q(actor_username__icontains=q)
                | Q(message__icontains=q)
                | Q(resource_type__icontains=q)
                | Q(resource_id__icontains=q)
            )

        date_from = request.query_params.get('from')
        if date_from:
            dt = parse_datetime(date_from)
            if dt:
                qs = qs.filter(created_at__gte=dt)

        date_to = request.query_params.get('to')
        if date_to:
            dt = parse_datetime(date_to)
            if dt:
                qs = qs.filter(created_at__lte=dt)

        try:
            limit = int(request.query_params.get('limit') or 200)
        except Exception:
            limit = 200
        limit = max(1, min(limit, 500))

        try:
            offset = int(request.query_params.get('offset') or 0)
        except Exception:
            offset = 0
        offset = max(0, offset)

        total = qs.count()
        page = qs[offset:offset + limit]

        results = []
        for a in page:
            results.append({
                'id': a.id,
                'created_at': a.created_at.isoformat(),
                'actor_id': a.actor_id,
                'actor_username': a.actor_username or (a.actor.username if a.actor else ''),
                'actor_role': a.actor_role,
                'action': a.action,
                'resource_type': a.resource_type,
                'resource_id': a.resource_id,
                'message': a.message,
                'metadata': a.metadata or {},
                'ip_address': a.ip_address,
            })

        return Response({'total': total, 'results': results}, status=status.HTTP_200_OK)
