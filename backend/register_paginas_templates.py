"""
Script para registrar las plantillas de la carpeta Paginas/ en la base de datos
como plantillas globales del sistema (sin owner, is_personal=False).

Uso: python register_paginas_templates.py
"""
import os
import sys
import django
import shutil
from pathlib import Path

# Force UTF-8 stdout for Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from webconfig.models import Template
from django.conf import settings
from django.core.files import File

# Definicion de las 4 plantillas con sus metadatos
PAGINAS_DIR = Path(__file__).resolve().parent.parent / 'Paginas'

TEMPLATES_DATA = [
    {
        'slug': 'viral',
        'folder': 'Viral',
        'name': 'Viral - Urban Carry',
        'description': 'Diseno bold y moderno inspirado en streetwear. Perfecto para ropa, accesorios y productos urbanos. Animaciones suaves y fondo oscuro impactante.',
        'color': 'from-gray-900 to-zinc-800',
        'tags': ['Oscuro', 'Streetwear', 'Moderno', 'React'],
    },
    {
        'slug': 'burbuja',
        'folder': 'burbuja',
        'name': 'Burbuja - Estilo Glass',
        'description': 'Plantilla con glassmorphism elegante, colores vibrantes y efectos de desenfoque. Ideal para tiendas con productos premium y de lujo.',
        'color': 'from-purple-600 to-pink-600',
        'tags': ['Glassmorphism', 'Colorido', 'Premium', 'React'],
    },
    {
        'slug': 'charis-luxe-elegance',
        'folder': 'charis-luxe-elegance',
        'name': 'Charis Luxe - Elegancia',
        'description': 'Diseno minimalista y elegante con tipografia serif sofisticada. Ideal para moda femenina, joyeria y productos de lujo.',
        'color': 'from-rose-900 to-stone-800',
        'tags': ['Elegante', 'Minimalista', 'Moda', 'React'],
    },
    {
        'slug': 'kooat-shop-clean',
        'folder': 'kooat-shop-clean',
        'name': 'Kooat Shop - Clean',
        'description': 'Tienda limpia y profesional con diseno blanco y grises. Excelente UX para catalogos grandes. Incluye filtros, carrito y checkout completo.',
        'color': 'from-sky-600 to-blue-700',
        'tags': ['Limpio', 'Profesional', 'Catalogo', 'React'],
    },
]

# Carpeta destino donde Django sirve los demos -> backend/templates/<slug>/
BACKEND_TEMPLATES_DIR = settings.BASE_DIR / 'templates'
MEDIA_TEMPLATES_DIR = settings.MEDIA_ROOT / 'templates' / 'images'
os.makedirs(BACKEND_TEMPLATES_DIR, exist_ok=True)
os.makedirs(MEDIA_TEMPLATES_DIR, exist_ok=True)

def find_preview_image(folder_path):
    candidates = [
        'public/preview.png', 'public/preview.jpg',
        'public/screenshot.png', 'public/screenshot.jpg',
        'public/cover.png', 'public/cover.jpg',
        'preview.png', 'preview.jpg',
        'screenshot.png', 'screenshot.jpg',
        'logo.png',
    ]
    for c in candidates:
        p = folder_path / c
        if p.exists():
            return p
    return None

created = 0
updated = 0
skipped = 0

for tpl_data in TEMPLATES_DATA:
    slug = tpl_data['slug']
    folder_name = tpl_data['folder']
    paginas_folder = PAGINAS_DIR / folder_name
    dist_folder = paginas_folder / 'dist'

    if not paginas_folder.exists():
        print(f"[SKIP] Carpeta no encontrada: {paginas_folder}")
        skipped += 1
        continue

    if not dist_folder.exists():
        print(f"[SKIP] {folder_name} no tiene dist/ -- ejecuta npm run build primero")
        skipped += 1
        continue

    # Demo URL servida por Django bajo /demos/<slug>/
    demo_url = f'/demos/{slug}/'

    # Buscar imagen de preview
    preview_img = find_preview_image(paginas_folder)

    # Crear o actualizar en BD (sin owner)
    existing = Template.objects.filter(slug=slug).first()

    if existing:
        if not existing.is_personal:
            existing.name = tpl_data['name']
            existing.description = tpl_data['description']
            existing.color = tpl_data['color']
            existing.tags = tpl_data['tags']
            existing.demo_url = demo_url
            existing.is_active = True
            existing.owner = None
            existing.is_personal = False

            if preview_img and not existing.image:
                img_dest_name = f"{slug}_{preview_img.name}"
                with open(preview_img, 'rb') as f:
                    existing.image.save(img_dest_name, File(f), save=False)

            existing.save()
            print(f"[UPDATED] {tpl_data['name']}")
            updated += 1
        else:
            print(f"[SKIP] Es personal: {tpl_data['name']}")
            skipped += 1
    else:
        tpl = Template(
            name=tpl_data['name'],
            slug=slug,
            description=tpl_data['description'],
            color=tpl_data['color'],
            tags=tpl_data['tags'],
            demo_url=demo_url,
            is_active=True,
            is_personal=False,
            owner=None,
        )

        if preview_img:
            img_dest_name = f"{slug}_{preview_img.name}"
            with open(preview_img, 'rb') as f:
                tpl.image.save(img_dest_name, File(f), save=False)

        tpl.save()
        print(f"[CREATED] {tpl_data['name']}")
        created += 1

print(f"\n--- DONE ---")
print(f"Creadas: {created}  |  Actualizadas: {updated}  |  Saltadas: {skipped}")
print("Plantillas disponibles en /webconfig/templates/")
