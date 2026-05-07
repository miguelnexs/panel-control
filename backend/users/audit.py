from typing import Any, Dict, Optional

from django.contrib.auth.models import User

from .models import Tenant, UserProfile
from .models_tenant_config import TenantActivityLog


def get_user_tenant(user: User) -> Optional[Tenant]:
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except Exception:
        try:
            return Tenant.objects.filter(admin=user).first()
        except Exception:
            return None


def get_user_role(user: User) -> str:
    try:
        return user.profile.role
    except Exception:
        return 'employee'


def log_activity(
    *,
    tenant: Optional[Tenant],
    actor: Optional[User],
    action: str,
    resource_type: str = '',
    resource_id: str = '',
    message: str = '',
    metadata: Optional[Dict[str, Any]] = None,
    request: Any = None,
) -> None:
    try:
        if not tenant:
            return
        actor_username = ''
        actor_role = ''
        if actor:
            actor_username = actor.username or ''
            actor_role = get_user_role(actor)
        ip = ''
        ua = ''
        if request is not None:
            try:
                ip = request.META.get('REMOTE_ADDR', '') or ''
            except Exception:
                ip = ''
            try:
                ua = request.META.get('HTTP_USER_AGENT', '') or ''
            except Exception:
                ua = ''

        safe_metadata = metadata or {}
        TenantActivityLog.objects.create(
            tenant=tenant,
            actor=actor,
            actor_username=actor_username,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type or '',
            resource_id=str(resource_id or ''),
            message=message or '',
            metadata=safe_metadata,
            ip_address=ip,
            user_agent=ua[:300],
        )
    except Exception:
        return

