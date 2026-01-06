import os
import django
import sys

# Agregar el directorio actual al path
sys.path.append(os.getcwd())

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "globetrek_backend.settings")
django.setup()

print("Django setup complete")

try:
    from users import urls
    print("Import successful")
except Exception as e:
    import traceback
    traceback.print_exc()
