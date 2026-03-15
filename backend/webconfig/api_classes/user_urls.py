from rest_framework import serializers, generics, views, status, permissions
from rest_framework.response import Response
from webconfig.models import UserURL
from users.models import Tenant, UserProfile
from urllib.parse import urlparse
from .utils import _site_variants, _log

class UserURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserURL
        fields = ['id', 'url', 'created_at']


class UserURLAvailabilityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        raw = (request.query_params.get('url') or request.query_params.get('slug') or '').strip()
        if not raw:
            return Response({'available': False, 'message': 'URL requerida.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            parsed = urlparse(raw)
            if not (parsed.scheme and parsed.netloc):
                return Response({'available': False, 'message': 'URL inválida.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'available': False, 'message': 'URL inválida.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            exists = UserURL.objects.filter(url__in=_site_variants(raw)).exists()
        except Exception:
            return Response({'available': False, 'message': 'Servicio no disponible.'}, status=status.HTTP_200_OK)
        if exists:
            _log(request, f'user_url_availability:{raw}', False, request.user)
            return Response({'available': False, 'message': 'La URL ya está registrada.'}, status=status.HTTP_200_OK)
        return Response({'available': True, 'message': 'Disponible.'}, status=status.HTTP_200_OK)


class UserURLListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserURLSerializer
    def get_queryset(self):
        try:
            return UserURL.objects.filter(user=self.request.user).order_by('-created_at')
        except Exception:
            return UserURL.objects.none()
    def perform_create(self, serializer):
        raw = (self.request.data.get('url') or self.request.data.get('slug') or '').strip()
        if not raw:
            raise serializers.ValidationError({'url': 'URL requerida.'})
        try:
            parsed = urlparse(raw)
            if not (parsed.scheme and parsed.netloc):
                raise serializers.ValidationError({'url': 'URL inválida.'})
        except Exception:
            raise serializers.ValidationError({'url': 'URL inválida.'})
        canonical = raw[:-1] if raw.endswith('/') else raw
        if len(canonical) > 256:
            raise serializers.ValidationError({'url': 'La URL es demasiado larga.'})
        try:
            if UserURL.objects.filter(url__in=_site_variants(raw)).exists():
                _log(self.request, f'user_url_create:{raw}', False, self.request.user)
                raise serializers.ValidationError({'url': 'La URL ya está registrada.'})
            serializer.save(user=self.request.user, url=canonical)
        except Exception:
            raise serializers.ValidationError({'detail': 'Servicio no disponible.'})


class UserURLDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            obj = UserURL.objects.filter(id=pk).first()
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if not obj:
            return Response({'detail': 'URL no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        if obj.user != request.user:
            return Response({'detail': 'No autorizado para eliminar esta URL.'}, status=status.HTTP_403_FORBIDDEN)
        _log(request, f'user_url_delete:{obj.url}', True, request.user)
        obj.delete()
        return Response({'message': 'URL eliminada.'}, status=status.HTTP_200_OK)


class SiteURLStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            profile = getattr(request.user, 'profile', None)
            user_tenant = profile.tenant if profile else None
        except Exception:
            user_tenant = None
        try:
            my_urls = list(UserURL.objects.filter(user=request.user).order_by('-created_at'))
        except Exception:
            my_urls = []
        current = my_urls[0].url if my_urls else ''
        dups = []
        if current:
            try:
                dups = list(UserURL.objects.filter(url__in=_site_variants(current)).exclude(user=request.user))
            except Exception:
                dups = []
        return Response({
            'site_url': current,
            'tenant_id': getattr(user_tenant, 'id', None),
            'duplicates_count': len(dups),
            'duplicates': [{'id': x.id, 'user_id': getattr(x.user, 'id', None), 'url': x.url} for x in dups],
            'ok': len(dups) == 0,
        })


class SiteURLClaimView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            if not profile.tenant:
                # Intentar encontrar tenant existente donde el usuario es admin
                tenant = Tenant.objects.filter(admin=request.user).first()
                if not tenant:
                    # Crear nuevo tenant automáticamente
                    import uuid
                    uid = str(uuid.uuid4())[:8]
                    tenant = Tenant.objects.create(
                        admin=request.user,
                        name=f"Negocio de {request.user.username}",
                        db_alias=f"db_{request.user.id}_{uid}",
                        db_path=f"db_{request.user.id}_{uid}.sqlite3"
                    )
                profile.tenant = tenant
                profile.save(update_fields=['tenant'])
            user_tenant = profile.tenant
        except Exception:
            user_tenant = None

        site = (request.data.get('site_url') or request.data.get('site') or '').strip()
        if not user_tenant:
            # Si aún falla la creación del tenant, permitimos guardar la URL pero avisamos
            # Ojo: Para el funcionamiento completo se requiere tenant.
            # Pero si falló la creación, es mejor devolver error 500 o intentarlo.
            # Por ahora, si no hay tenant, fallamos como antes, pero ya intentamos crearlo.
            return Response({'detail': 'No se pudo asignar un espacio de trabajo (Tenant).'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not site:
            return Response({'detail': 'URL requerida.'}, status=status.HTTP_400_BAD_REQUEST)
            
        variants = _site_variants(site)
        try:
            conflict = UserURL.objects.filter(url__in=variants).exclude(user=request.user).first()
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if conflict:
            return Response({'detail': 'La URL ya está registrada por otro usuario.'}, status=status.HTTP_400_BAD_REQUEST)
        canonical = site[:-1] if site.endswith('/') else site
        try:
            mine = UserURL.objects.filter(user=request.user).order_by('-created_at').first()
            if mine:
                mine.url = canonical
                mine.save(update_fields=['url'])
            else:
                UserURL.objects.create(user=request.user, url=canonical)
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'site_url': canonical, 'tenant_id': getattr(user_tenant, 'id', None)})


class PublicAutoClaimView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        site = (request.data.get('site') or '').strip()
        aid = request.data.get('aid')
        if not site or not aid:
            return Response({'detail': 'site y aid requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from users.models import Tenant
            tenant = Tenant.objects.filter(admin_id=int(aid)).first()
        except Exception:
            tenant = None
        if not tenant:
            return Response({'detail': 'Tenant no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        from django.contrib.auth.models import User as AuthUser
        owner = AuthUser.objects.filter(id=tenant.admin_id).first()
        if not owner:
            return Response({'detail': 'Administrador no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        variants = _site_variants(site)
        try:
            conflict = UserURL.objects.filter(url__in=variants).exclude(user=owner).first()
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if conflict:
            return Response({'detail': 'La URL ya está registrada.'}, status=status.HTTP_400_BAD_REQUEST)
        canonical = site[:-1] if site.endswith('/') else site
        try:
            existing = UserURL.objects.filter(user=owner).order_by('-created_at').first()
            if existing:
                existing.url = canonical
                existing.save(update_fields=['url'])
            else:
                UserURL.objects.create(user=owner, url=canonical)
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'site_url': canonical, 'tenant_id': getattr(tenant, 'id', None)})
