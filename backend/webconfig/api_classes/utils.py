import datetime
from urllib.parse import urlparse
from webconfig.models import AccessLog

def _site_variants(site: str):
    try:
        s = (site or '').strip()
        if not s:
            return []
        base = s[:-1] if s.endswith('/') else s
        variants = {base, base + '/'}
        parsed = urlparse(base)
        if parsed.scheme and parsed.netloc:
            host = parsed.hostname or ''
            port = parsed.port
            other = None
            if host == 'localhost':
                other = '127.0.0.1'
            elif host == '127.0.0.1':
                other = 'localhost'
            if other:
                netloc = other if port is None else f"{other}:{port}"
                alt = f"{parsed.scheme}://{netloc}"
                variants.update({alt, alt + '/'})
        return list(variants)
    except Exception:
        return [site]


def _ua(request):
    try:
        return (request.headers.get('User-Agent', '') or '')[:255]
    except Exception:
        return ''

def _log(request, path, success, user=None):
    try:
        AccessLog.objects.create(
            user=user,
            path=(path or '')[:255],
            success=bool(success),
            user_agent=_ua(request)
        )
    except Exception:
        pass
