import os
import django
import shutil
from django.core.files import File
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from webconfig.models import Template
from django.conf import settings

TEMPLATES_DIR = settings.BASE_DIR / 'templates'
MEDIA_TEMPLATES_DIR = settings.MEDIA_ROOT / 'templates' / 'images'

# Asegurar directorio de destino
os.makedirs(MEDIA_TEMPLATES_DIR, exist_ok=True)

print(f"Scanning {TEMPLATES_DIR}...")

def get_preview_image(path):
    # Lista de posibles nombres de imagen
    candidates = [
        'preview.png', 'preview.jpg', 'preview.jpeg',
        'screenshot.png', 'screenshot.jpg',
        'cover.png', 'cover.jpg',
        'public/preview.png', 'public/screenshot.png',
        'assets/icon.png', 'assets/splash-icon.png'
    ]
    
    for c in candidates:
        p = path / c
        if p.exists():
            return p
    return None

created_count = 0

for item in os.listdir(TEMPLATES_DIR):
    item_path = TEMPLATES_DIR / item
    
    if item_path.is_dir() and not item.startswith('.'):
        print(f"Found template folder: {item}")
        
        # Verificar si ya existe
        if Template.objects.filter(slug=item).exists():
            print(f"Template {item} already exists. Skipping.")
            continue
            
        # Buscar imagen
        image_path = get_preview_image(item_path)
        
        # Crear template
        tpl = Template(
            name=item.replace('-', ' ').replace('_', ' ').title(),
            slug=item,
            description=f"Plantilla {item} lista para usar.",
            demo_url=f"/demos/{item}/index.html", # Esto es un placeholder, en realidad necesitaría build
            tags=["Responsive", "Moderno", "React"]
        )
        
        if image_path:
            print(f"Found image: {image_path}")
            # Copiar y asignar imagen
            dest_name = f"{item}_{image_path.name}"
            with open(image_path, 'rb') as f:
                tpl.image.save(dest_name, File(f), save=False)
        
        tpl.save()
        print(f"Created template: {tpl.name}")
        created_count += 1

print(f"Finished. Created {created_count} templates.")
