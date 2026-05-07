from django.http import JsonResponse
from django.db import connections

def health(request):
    db_ok = True
    try:
        connections['default'].cursor()
    except Exception:
        db_ok = False

    status = 200 if db_ok else 503
    return JsonResponse({
        "status": "ok" if db_ok else "degraded",
        "database": db_ok,
    }, status=status)

