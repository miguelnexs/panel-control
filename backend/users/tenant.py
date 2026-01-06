from threading import local
from django.conf import settings
from django.db import connections
from django.utils.deprecation import MiddlewareMixin
from .models import Tenant, UserProfile, PrivateNote

_tl = local()

def get_current_tenant_alias():
    return getattr(_tl, 'tenant_alias', None)

def ensure_tenant_for_user(user):
    """Ensure tenant DB exists for the admin linked to the user and set thread-local alias."""
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        _tl.tenant_alias = None
        return None

    if profile.role == 'super_admin':
        _tl.tenant_alias = None
        return None

    if profile.role in ('admin', 'employer'):
        admin = user
    else:
        # employee: must have a tenant assigned
        if profile.tenant and profile.tenant.admin:
            admin = profile.tenant.admin
        else:
            _tl.tenant_alias = None
            return None

    alias = f"tenant_{admin.id}"
    schema_name = alias

    tenant, created = Tenant.objects.get_or_create(
        admin=admin,
        defaults={'db_alias': alias, 'db_path': f"schema:{schema_name}"}
    )
    if tenant.db_alias != alias or tenant.db_path != f"schema:{schema_name}":
        tenant.db_alias = alias
        tenant.db_path = f"schema:{schema_name}"
        tenant.save()

    # Asegurar que el perfil del admin está vinculado al tenant
    try:
        admin_profile = admin.profile
        if admin_profile.tenant_id != tenant.id:
            admin_profile.tenant = tenant
            admin_profile.save()
    except UserProfile.DoesNotExist:
        pass

    # Register alias dynamically for Postgres with per-tenant schema
    if alias not in settings.DATABASES:
        default_db = settings.DATABASES['default']
        settings.DATABASES[alias] = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': default_db['NAME'],
            'USER': default_db['USER'],
            'PASSWORD': default_db['PASSWORD'],
            'HOST': default_db['HOST'],
            'PORT': default_db['PORT'],
            'OPTIONS': {
                'options': f"-c search_path={schema_name} -c client_encoding=UTF8 -c lc_messages=C"
            },
            'ATOMIC_REQUESTS': False,
            'AUTOCOMMIT': True,
            'CONN_MAX_AGE': 0,
            'TIME_ZONE': settings.TIME_ZONE,
        }
        # connections.databases = settings.DATABASES

        # Ensure schema exists in the default database
        try:
            with connections['default'].cursor() as cursor:
                cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"')
        except Exception:
            pass

    # Initialize tables for tenant-routed models (example: PrivateNote)
    try:
        conn = connections[alias]
        with conn.schema_editor() as editor:
            try:
                editor.create_model(PrivateNote)
            except Exception:
                # Table likely exists
                pass
    except Exception:
        pass

    _tl.tenant_alias = alias
    return alias


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            ensure_tenant_for_user(user)
        else:
            _tl.tenant_alias = None
        return None
