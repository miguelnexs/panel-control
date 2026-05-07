from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .audit import get_user_role, get_user_tenant
from .models import Tenant
from .models_tenant_config import TenantSupportMessage, TenantSupportChatState

from django.db.models import Q, F, OuterRef, Subquery, Count


class TenantSupportUnreadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            since_id = int(request.query_params.get('since_id') or 0)
        except Exception:
            since_id = 0
        since_id = max(0, since_id)

        if role == 'admin':
            tenant = get_user_tenant(request.user)
            if not tenant:
                return Response({'detail': 'No tiene tenant asociado.'}, status=status.HTTP_404_NOT_FOUND)
            qs = TenantSupportMessage.objects.filter(tenant=tenant).exclude(sender_id=request.user.id)
            qs = qs.filter(sender_role='super_admin')
        else:
            tenant_id = request.query_params.get('tenant_id')
            qs = TenantSupportMessage.objects.all().exclude(sender_id=request.user.id)
            qs = qs.filter(sender_role='admin')
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)

        latest = qs.order_by('-id').values_list('id', flat=True).first() or 0
        unread = qs.filter(id__gt=since_id).count() if since_id else qs.count()
        return Response({'latest_id': latest, 'unread': unread}, status=status.HTTP_200_OK)


class TenantSupportChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        user = request.user

        state_last_seen = TenantSupportChatState.objects.filter(user=user, tenant=OuterRef('pk')).values('last_seen_id')[:1]
        last_id_sq = TenantSupportMessage.objects.filter(tenant=OuterRef('pk')).order_by('-id').values('id')[:1]
        last_created_sq = TenantSupportMessage.objects.filter(tenant=OuterRef('pk')).order_by('-id').values('created_at')[:1]
        last_text_sq = TenantSupportMessage.objects.filter(tenant=OuterRef('pk')).order_by('-id').values('text')[:1]
        last_sender_sq = TenantSupportMessage.objects.filter(tenant=OuterRef('pk')).order_by('-id').values('sender_username')[:1]
        last_sender_role_sq = TenantSupportMessage.objects.filter(tenant=OuterRef('pk')).order_by('-id').values('sender_role')[:1]

        if role == 'admin':
            tenant = get_user_tenant(user)
            if not tenant:
                return Response({'detail': 'No tiene tenant asociado.'}, status=status.HTTP_404_NOT_FOUND)
            qs = Tenant.objects.filter(id=tenant.id)
            qs = qs.annotate(
                last_seen_id=Subquery(state_last_seen),
                last_message_id=Subquery(last_id_sq),
                last_message_at=Subquery(last_created_sq),
                last_message_text=Subquery(last_text_sq),
                last_message_sender=Subquery(last_sender_sq),
                last_message_sender_role=Subquery(last_sender_role_sq),
            )
            qs = qs.annotate(
                unread=Count(
                    'support_messages',
                    filter=Q(support_messages__sender_role='super_admin') & Q(support_messages__id__gt=F('last_seen_id')),
                )
            )
        else:
            qs = Tenant.objects.all()
            qs = qs.annotate(
                last_seen_id=Subquery(state_last_seen),
                last_message_id=Subquery(last_id_sq),
                last_message_at=Subquery(last_created_sq),
                last_message_text=Subquery(last_text_sq),
                last_message_sender=Subquery(last_sender_sq),
                last_message_sender_role=Subquery(last_sender_role_sq),
            )
            qs = qs.annotate(
                unread=Count(
                    'support_messages',
                    filter=Q(support_messages__sender_role='admin') & Q(support_messages__id__gt=F('last_seen_id')),
                )
            )

        results = []
        for t in qs.order_by('-last_message_at', '-id'):
            results.append({
                'tenant_id': t.id,
                'tenant_name': t.name,
                'admin_username': t.admin.username,
                'last_message_id': int(t.last_message_id or 0),
                'last_message_at': t.last_message_at.isoformat() if getattr(t, 'last_message_at', None) else None,
                'last_message_text': str(t.last_message_text or ''),
                'last_message_sender': str(t.last_message_sender or ''),
                'last_message_sender_role': str(t.last_message_sender_role or ''),
                'unread': int(getattr(t, 'unread', 0) or 0),
                'last_seen_id': int(getattr(t, 'last_seen_id', 0) or 0),
            })

        total_unread = sum(r['unread'] for r in results)
        return Response({'total_unread': total_unread, 'results': results}, status=status.HTTP_200_OK)


class TenantSupportMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            last_seen_id = int(request.data.get('last_seen_id') or 0)
        except Exception:
            last_seen_id = 0
        last_seen_id = max(0, last_seen_id)

        if role == 'admin':
            tenant = get_user_tenant(request.user)
            if not tenant:
                return Response({'detail': 'No tiene tenant asociado.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            tenant_id = request.data.get('tenant_id')
            if not tenant_id:
                return Response({'detail': 'tenant_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            tenant = Tenant.objects.filter(id=tenant_id).first()
            if not tenant:
                return Response({'detail': 'Tenant no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        state, _ = TenantSupportChatState.objects.get_or_create(tenant=tenant, user=request.user)
        if last_seen_id > state.last_seen_id:
            state.last_seen_id = last_seen_id
            state.save(update_fields=['last_seen_id', 'updated_at'])

        return Response({'ok': True, 'tenant_id': tenant.id, 'last_seen_id': state.last_seen_id}, status=status.HTTP_200_OK)


class TenantSupportMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _resolve_tenant(self, request):
        role = get_user_role(request.user)
        if role == 'admin':
            tenant = get_user_tenant(request.user)
            if not tenant:
                return None, Response({'detail': 'No tiene tenant asociado.'}, status=status.HTTP_404_NOT_FOUND)
            return tenant, None
        if role == 'super_admin':
            tenant_id = request.query_params.get('tenant_id') or request.data.get('tenant_id')
            if not tenant_id:
                return None, Response({'detail': 'tenant_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            tenant = Tenant.objects.filter(id=tenant_id).first()
            if not tenant:
                return None, Response({'detail': 'Tenant no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            return tenant, None
        return None, Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

    def get(self, request):
        tenant, err = self._resolve_tenant(request)
        if err:
            return err

        qs = TenantSupportMessage.objects.filter(tenant=tenant).select_related('sender').order_by('-created_at')

        since_id = request.query_params.get('since_id')
        if since_id:
            try:
                qs = qs.filter(id__gt=int(since_id))
            except Exception:
                pass

        try:
            limit = int(request.query_params.get('limit') or 50)
        except Exception:
            limit = 50
        limit = max(1, min(limit, 200))

        try:
            offset = int(request.query_params.get('offset') or 0)
        except Exception:
            offset = 0
        offset = max(0, offset)

        total = qs.count()
        page = qs[offset:offset + limit]

        results = []
        for m in page:
            results.append({
                'id': m.id,
                'created_at': m.created_at.isoformat(),
                'sender_id': m.sender_id,
                'sender_username': m.sender_username or (m.sender.username if m.sender else ''),
                'sender_role': m.sender_role,
                'type': 'audio' if bool(m.audio) else 'text',
                'text': m.text or '',
                'duration_ms': m.duration_ms,
                'mime_type': m.mime_type,
                'audio_url': m.audio.url if m.audio else '',
            })

        return Response({'total': total, 'results': results}, status=status.HTTP_200_OK)

    def post(self, request):
        tenant, err = self._resolve_tenant(request)
        if err:
            return err

        audio = request.FILES.get('audio')
        text = (request.data.get('text') or '').strip()
        if not audio and not text:
            return Response({'detail': 'Debe enviar audio o texto.'}, status=status.HTTP_400_BAD_REQUEST)

        role = get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            duration_ms = int(request.data.get('duration_ms') or 0)
        except Exception:
            duration_ms = 0
        mime = getattr(audio, 'content_type', '') or '' if audio else ''

        msg = TenantSupportMessage.objects.create(
            tenant=tenant,
            sender=request.user,
            sender_username=request.user.username or '',
            sender_role=role,
            text=text,
            audio=audio if audio else None,
            mime_type=(mime[:100] if audio else ''),
            duration_ms=(max(0, duration_ms) if audio else 0),
        )

        return Response({
            'id': msg.id,
            'created_at': msg.created_at.isoformat(),
            'sender_id': msg.sender_id,
            'sender_username': msg.sender_username,
            'sender_role': msg.sender_role,
            'type': 'audio' if bool(msg.audio) else 'text',
            'text': msg.text or '',
            'duration_ms': msg.duration_ms,
            'mime_type': msg.mime_type,
            'audio_url': msg.audio.url if msg.audio else '',
        }, status=status.HTTP_201_CREATED)
