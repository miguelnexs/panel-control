#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')

    # Patch for Python 3.14 without Pillow
    try:
        import PIL
    except ImportError:
        try:
            import django.db.models.fields.files
            django.db.models.fields.files.ImageField = django.db.models.fields.files.FileField
            import django.db.models
            django.db.models.ImageField = django.db.models.FileField
            print("WARNING: Pillow not found. ImageField patched to FileField.", file=sys.stderr)
        except ImportError:
            pass

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
