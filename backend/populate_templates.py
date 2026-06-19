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
        
        # Define default page content based on slug
        page_content = {}
        if item == 'blank-template':
            page_content = {
                "settings": {
                    "company_name": "Mi Tienda en Blanco",
                    "company_description": "Una plantilla limpia para empezar desde cero.",
                    "primary_color": "#3b82f6",
                    "secondary_color": "#f3f4f6",
                    "font_family": "Inter",
                    "logo": None
                },
                "sections": [],
                "sectionData": {}
            }
        elif item == 'plantilla-alternativa':
            page_content = {
                "settings": {
                    "company_name": "Estilo Esmeralda",
                    "company_description": "Un diseño elegante con tonos esmeralda y tipografía moderna.",
                    "primary_color": "#10b981",
                    "secondary_color": "#f0fdf4",
                    "font_family": "Outfit",
                    "logo": None
                },
                "sections": [
                    { "id": "announcement-1", "type": "announcement", "label": "Barra de Anuncio", "icon": "📢", "visible": True, "order": 0 },
                    { "id": "header-1", "type": "header", "label": "Encabezado", "icon": "🏠", "visible": True, "order": 1 },
                    { "id": "hero-1", "type": "hero", "label": "Hero Principal", "icon": "⭐", "visible": True, "order": 2 },
                    { "id": "products-1", "type": "products", "label": "Productos Destacados", "icon": "🛍️", "visible": True, "order": 3 },
                    { "id": "footer-1", "type": "footer", "label": "Pie de Página", "icon": "📋", "visible": True, "order": 4 }
                ],
                "sectionData": {
                    "announcement-1": { "text": "¡Descuento del 10% en tu primera compra usando el código VERDE!" },
                    "header-1": { "nav_links": ["Inicio", "Colección", "Ofertas", "Contacto"] },
                    "hero-1": {
                        "badge": "Tendencias de Verano",
                        "title": "Conéctate con la naturaleza y",
                        "description": "Explora nuestra selección orgánica de productos sostenibles fabricados con amor.",
                        "cta_primary": "Ver Colección",
                        "cta_secondary": "Leer Blog"
                    },
                    "products-1": {
                        "title": "Colección Orgánica",
                        "subtitle": "Productos amigables con el medio ambiente cuidadosamente seleccionados."
                    },
                    "footer-1": { "city": "Medellín, Colombia", "phone": "+57 4 987 6543", "email": "hola@esmeralda.com" }
                }
            }
        elif item == 'plantilla-boutique':
            page_content = {
                "settings": {
                    "company_name": "AURA Boutique",
                    "company_description": "Colecciones de alta costura diseñadas para trascender el tiempo y las tendencias.",
                    "primary_color": "#1a1a1a",
                    "secondary_color": "#faf9f6",
                    "font_family": "Playfair Display",
                    "logo": None
                },
                "sections": [
                    { "id": "announcement-1", "type": "announcement", "label": "Barra de Anuncio", "icon": "📢", "visible": True, "order": 0 },
                    { "id": "header-1", "type": "header", "label": "Encabezado", "icon": "🏠", "visible": True, "order": 1 },
                    { "id": "hero-1", "type": "hero", "label": "Hero Principal", "icon": "⭐", "visible": True, "order": 2 },
                    { "id": "advantages-1", "type": "advantages", "label": "Ventajas", "icon": "✅", "visible": True, "order": 3 },
                    { "id": "products-1", "type": "products", "label": "Productos Destacados", "icon": "🛍️", "visible": True, "order": 4 },
                    { "id": "banner-1", "type": "banner", "label": "Banner Promocional", "icon": "🎯", "visible": True, "order": 5 },
                    { "id": "footer-1", "type": "footer", "label": "Pie de Página", "icon": "📋", "visible": True, "order": 6 }
                ],
                "sectionData": {
                    "announcement-1": { "text": "✨ Disfruta de envío prioritario de cortesía en todas las órdenes de esta semana | Colección limitada" },
                    "header-1": {
                        "top_phone": "+34 912 345 678",
                        "top_email": "concierge@auraboutique.com",
                        "top_promo": "Atención Personalizada 24/7",
                        "nav_link_0": "Nueva Colección",
                        "nav_link_1": "Editorial",
                        "nav_link_2": "Vestidos",
                        "nav_link_3": "Accesorios",
                        "nav_link_4": "La Maison"
                    },
                    "hero-1": {
                        "layout": "split",
                        "bg_type": "color",
                        "bg_color": "#faf9f6",
                        "badge": "Colección Atelier 2026",
                        "title": "La sofisticación se encuentra en la sutileza",
                        "description": "Una curaduría exclusiva de piezas minimalistas fabricadas con materiales orgánicos y confeccionadas a mano.",
                        "cta_primary": "Explorar Edición",
                        "cta_secondary": "Ver Lookbook",
                        "image": "/images/boutique/hero.jpg"
                    },
                    "advantages-1": {
                        "items": [
                            { "title": "Envío de Cortesía", "desc": "Entrega express gratuita en empaque biodegradable" },
                            { "title": "Materiales Nobles", "desc": "100% lino orgánico y seda natural certificada" },
                            { "title": "Edición Limitada", "desc": "Lotes numerados para garantizar exclusividad" },
                            { "title": "Atención Selecta", "desc": "Asesoría de estilo personalizada uno a uno" }
                        ]
                    },
                    "products-1": {
                        "title": "Las Piezas Esenciales",
                        "subtitle": "Elementos fundamentales y siluetas atemporales diseñadas para perdurar en tu armario.",
                        "product_name_1": "Abrigo Largo de Lana Merino",
                        "product_price_1": "$480,000",
                        "product_image_1": "/images/boutique/product1.jpg",
                        "product_name_2": "Vestido Minimal de Seda",
                        "product_price_2": "$320,000",
                        "product_image_2": "/images/boutique/product2.jpg",
                        "product_name_3": "Bolso Satchel de Cuero Vegano",
                        "product_price_3": "$250,000",
                        "product_image_3": "/images/boutique/product3.jpg",
                        "product_name_4": "Gafas de Sol Clásicas Acetato",
                        "product_price_4": "$180,000",
                        "product_image_4": "/images/boutique/product4.jpg"
                    },
                    "banner-1": {
                        "badge": "Únete a la Maison",
                        "title": "Recibe invitaciones a nuestras ventas privadas y adelantos editoriales",
                        "description": "Suscríbete para recibir un 10% de bienvenida en tu primera orden y ser parte de nuestra comunidad selecta.",
                        "cta": "Inscribirse",
                        "image": "/images/boutique/banner.jpg"
                    },
                    "footer-1": {
                        "city": "Barcelona, España",
                        "phone": "+34 93 123 4567",
                        "email": "hola@auraboutique.com"
                    }
                }
            }
        elif item == 'plantilla-brutalista':
            page_content = {
                "settings": {
                    "company_name": "KULTURA Studio",
                    "company_description": "Estética urbana radical, ropa y accesorios streetwear con carácter e identidad sin compromisos.",
                    "primary_color": "#FF5F00",
                    "secondary_color": "#ffffff",
                    "font_family": "Outfit",
                    "logo": None
                },
                "sections": [
                    { "id": "announcement-1", "type": "announcement", "label": "Barra de Anuncio", "icon": "📢", "visible": True, "order": 0 },
                    { "id": "header-1", "type": "header", "label": "Encabezado", "icon": "🏠", "visible": True, "order": 1 },
                    { "id": "hero-1", "type": "hero", "label": "Hero Principal", "icon": "⭐", "visible": True, "order": 2 },
                    { "id": "advantages-1", "type": "advantages", "label": "Ventajas", "icon": "✅", "visible": True, "order": 3 },
                    { "id": "products-1", "type": "products", "label": "Productos Destacados", "icon": "🛍️", "visible": True, "order": 4 },
                    { "id": "banner-1", "type": "banner", "label": "Banner Promocional", "icon": "🎯", "visible": True, "order": 5 },
                    { "id": "footer-1", "type": "footer", "label": "Pie de Página", "icon": "📋", "visible": True, "order": 6 }
                ],
                "sectionData": {
                    "announcement-1": { "text": "🔥 KULTURA DROP VOL. 4 DISPONIBLE AHORA — UNIDADES LIMITADAS EN TODO EL PLANETA 🔥" },
                    "header-1": {
                        "top_phone": "+1 (555) 909-0909",
                        "top_email": "drop@kulturastudio.com",
                        "top_promo": "Ventas por tiempo limitado",
                        "nav_link_0": "DROPS",
                        "nav_link_1": "Colecciones",
                        "nav_link_2": "Zapatillas",
                        "nav_link_3": "Accesorios",
                        "nav_link_4": "Manifiesto"
                    },
                    "hero-1": {
                        "layout": "full",
                        "bg_type": "gradient",
                        "bg_gradient": "linear-gradient(135deg, #FF5F00 0%, #FFB300 100%)",
                        "badge": "STREETWEAR MANIFESTO",
                        "title": "DISEÑO RUIDOSO. CULTURA CALLEJERA.",
                        "description": "Rompemos los estándares de la moda convencional con siluetas oversized y prints experimentales creados en colaboración con artistas gráficos underground.",
                        "cta_primary": "COMPRAR DROP",
                        "cta_secondary": "VER MANIFIESTO"
                    },
                    "advantages-1": {
                        "items": [
                            { "title": "ENVÍOS AL TOQUE", "desc": "Envío prioritario con tracking en tiempo real a todo el mundo" },
                            { "title": "PAGO PROTEGIDO", "desc": "Transacciones blindadas en criptomonedas y dinero fiat" },
                            { "title": "DEVOLUCIONES FAST", "desc": "Tienes 30 días para cambiar de opinión sin preguntas" },
                            { "title": "COMUNIDAD VIP", "desc": "Acceso a nuestro canal privado de Discord para preventas" }
                        ]
                    },
                    "products-1": {
                        "title": "LOS MÁS BUSCADOS",
                        "subtitle": "Nuestros bestsellers urbanos que vuelan de las estanterías en minutos. No duermas.",
                        "product_name_1": "Hoodie Oversized 'Khaos'",
                        "product_price_1": "$185,000",
                        "product_image_1": "/images/brutalista/product1.jpg",
                        "product_name_2": "Pantalón Cargo Táctico Negro",
                        "product_price_2": "$210,000",
                        "product_image_2": "/images/brutalista/product2.jpg",
                        "product_name_3": "Gorra Trucker Neon Orange",
                        "product_price_3": "$75,000",
                        "product_image_3": "/images/brutalista/product3.jpg",
                        "product_name_4": "Zapatillas Cyber-Pulse V1",
                        "product_price_4": "$390,000",
                        "product_image_4": "/images/brutalista/product4.jpg"
                    },
                    "banner-1": {
                        "badge": "KULTURA CLUB",
                        "title": "Sé el primero en enterarte de las preventas exclusivas",
                        "description": "Únete a nuestra lista VIP y recibe los códigos de acceso secretos para las colecciones cápsula.",
                        "cta": "REGISTRARME",
                        "image": "/images/brutalista/banner.jpg"
                    },
                    "footer-1": {
                        "city": "Medellín / Tokio",
                        "phone": "+57 321 000 0000",
                        "email": "soporte@kulturastudio.com"
                    }
                }
            }
        elif item == 'plantilla-cyber':
            page_content = {
                "settings": {
                    "company_name": "NEON NEXUS",
                    "company_description": "Tecnología de última generación, periféricos avanzados, hardware gamer y gadgets futuristas.",
                    "primary_color": "#06b6d4",
                    "secondary_color": "#0f172a",
                    "font_family": "Outfit",
                    "logo": None
                },
                "sections": [
                    { "id": "announcement-1", "type": "announcement", "label": "Barra de Anuncio", "icon": "📢", "visible": True, "order": 0 },
                    { "id": "header-1", "type": "header", "label": "Encabezado", "icon": "🏠", "visible": True, "order": 1 },
                    { "id": "hero-1", "type": "hero", "label": "Hero Principal", "icon": "⭐", "visible": True, "order": 2 },
                    { "id": "advantages-1", "type": "advantages", "label": "Ventajas", "icon": "✅", "visible": True, "order": 3 },
                    { "id": "products-1", "type": "products", "label": "Productos Destacados", "icon": "🛍️", "visible": True, "order": 4 },
                    { "id": "banner-1", "type": "banner", "label": "Banner Promocional", "icon": "🎯", "visible": True, "order": 5 },
                    { "id": "footer-1", "type": "footer", "label": "Pie de Página", "icon": "📋", "visible": True, "order": 6 }
                ],
                "sectionData": {
                    "announcement-1": { "text": "⚡ CÓDIGO 'CYBER26': 20% DE DESCUENTO EN TECLADOS MECÁNICOS Y GADGETS PREMIUM ⚡" },
                    "header-1": {
                        "top_phone": "+57 311 777 8888",
                        "top_email": "nexus@neonnexus.io",
                        "top_promo": "Envío gratis global",
                        "nav_link_0": "Periféricos",
                        "nav_link_1": "Componentes",
                        "nav_link_2": "Monitores",
                        "nav_link_3": "Gadgets",
                        "nav_link_4": "Comunidad"
                    },
                    "hero-1": {
                        "layout": "full",
                        "bg_type": "gradient",
                        "bg_gradient": "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)",
                        "badge": "NEXT-GEN HARDWARE",
                        "title": "EQUIPA TU ESTACIÓN DE COMBATE",
                        "description": "El armamento definitivo para los entusiastas de la tecnología y gaming competitivo. Diseñado para ofrecer rendimiento puro e inmersión absoluta.",
                        "cta_primary": "EXPLORAR EQUIPOS",
                        "cta_secondary": "VER DRIVERS"
                    },
                    "advantages-1": {
                        "items": [
                            { "title": "DESPACHO VELOZ", "desc": "Envío seguro en cajas reforzadas con despacho el mismo día" },
                            { "title": "GARANTÍA NEXUS", "desc": "2 años de cobertura oficial directa con reemplazo inmediato" },
                            { "title": "CYBER RETORNO", "desc": "Prueba el periférico por 14 días. Si no te gusta, devuélvelo" },
                            { "title": "SOPORTE AVANZADO", "desc": "Ingenieros de soporte listos en nuestro Discord y WhatsApp" }
                        ]
                    },
                    "products-1": {
                        "title": "ARMAMENTO RECOMENDADO",
                        "subtitle": "Equipamiento seleccionado por profesionales para llevar tus reflejos y productividad al siguiente nivel.",
                        "product_name_1": "Teclado Mecánico Nexus-65",
                        "product_price_1": "$320,000",
                        "product_image_1": "/images/cyber/product1.jpg",
                        "product_name_2": "Mouse Gamer Inalámbrico Cyber-Glide",
                        "product_price_2": "$195,000",
                        "product_image_2": "/images/cyber/product2.jpg",
                        "product_name_3": "Auriculares 7.1 Nexus-Pulse Audio",
                        "product_price_3": "$285,000",
                        "product_image_3": "/images/cyber/product3.jpg",
                        "product_name_4": "Micrófono de Condensador Nexus-Stream",
                        "product_price_4": "$235,000",
                        "product_image_4": "/images/cyber/product4.jpg"
                    },
                    "banner-1": {
                        "badge": "BOLETÍN NEXUS",
                        "title": "Actualiza tu firmware. Suscríbete.",
                        "description": "Únete a la red y recibe un 15% de descuento en periféricos, noticias de hardware exclusivo y códigos beta de juegos.",
                        "cta": "ENLAZAR",
                        "image": "/images/cyber/banner.jpg"
                    },
                    "footer-1": {
                        "city": "Medellín / Cyber-City",
                        "phone": "+57 300 000 0000",
                        "email": "soporte@neonnexus.io"
                    }
                }
            }


        # Crear template
        tpl = Template(
            name="Plantilla en Blanco" if item == 'blank-template' else (
                "Plantilla Esmeralda" if item == 'plantilla-alternativa' else (
                    "Plantilla Boutique Luxury" if item == 'plantilla-boutique' else (
                        "Plantilla Brutalista Urban" if item == 'plantilla-brutalista' else (
                            "Plantilla Cyber Tech" if item == 'plantilla-cyber' else item.replace('-', ' ').replace('_', ' ').title()
                        )
                    )
                )
            ),
            slug=item,
            description="Comienza a diseñar tu sitio desde un lienzo limpio." if item == 'blank-template' else (
                "Diseño moderno y ecológico con tipografía Outfit." if item == 'plantilla-alternativa' else (
                    "Diseño exclusivo y minimalista con fuente Playfair Display para boutiques y marcas de lujo." if item == 'plantilla-boutique' else (
                        "Diseño urbano neo-brutalista de alto contraste y tipografía Outfit para marcas modernas." if item == 'plantilla-brutalista' else (
                            "Tema oscuro futurista cyberpunk con colores de acento vibrantes para hardware y gaming." if item == 'plantilla-cyber' else f"Plantilla {item} lista para usar."
                        )
                    )
                )
            ),
            demo_url=f"/demos/{item}/index.html",
            tags=["Limpio", "Vacio"] if item == 'blank-template' else (
                ["Ecológico", "Elegante", "Outfit"] if item == 'plantilla-alternativa' else (
                    ["Moda", "Lujo", "Minimalista", "Playfair"] if item == 'plantilla-boutique' else (
                        ["Brutalista", "Urbano", "Contraste", "Outfit"] if item == 'plantilla-brutalista' else (
                            ["Cyberpunk", "Oscuro", "Tecnología", "Gamer"] if item == 'plantilla-cyber' else ["Responsive", "Moderno", "React"]
                        )
                    )
                )
            ),
            page_content=page_content
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
