import os
import sys
import django
from django.core.files import File

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globetrek_backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Tenant
from products.models import Product, ProductColor, ProductColorImage, ProductVariant, ProductSKU

def create_product_with_variations():
    try:
        user = User.objects.get(username='miguel')
        print(f"Usuario 'miguel' encontrado (ID: {user.id})")
    except User.DoesNotExist:
        print("Error: No se encontró el usuario 'miguel'.")
        return

    # Obtener el tenant del usuario 'miguel'
    # Primero buscamos si tiene Tenant asociado como admin
    try:
        tenant = Tenant.objects.get(admin=user)
        print(f"Tenant encontrado para 'miguel': {tenant.name} (ID: {tenant.id})")
    except Tenant.DoesNotExist:
        # Si no existe, buscamos el de ID 3 o creamos uno
        tenant = Tenant.objects.filter(admin=user).first()
        if not tenant:
            tenant = Tenant.objects.filter(id=3).first()
        if not tenant:
            tenant = Tenant.objects.first()
        print(f"Tenant usado: {tenant.name if tenant else 'Ninguno'} (ID: {tenant.id if tenant else 'None'})")

    if not tenant:
        print("Error: No hay ningún tenant disponible en la base de datos.")
        return

    # Limpiar producto de prueba si ya existía para evitar duplicados
    sku_base = "CAM-ASNT"
    Product.objects.filter(tenant=tenant, sku=sku_base).delete()
    print(f"Limpieza de productos previos con SKU: '{sku_base}' completada.")

    # Crear el producto principal
    product = Product.objects.create(
        tenant=tenant,
        name="Camiseta Assent Premium",
        price=50000.00,
        cost_price=25000.00,
        description="Camiseta deportiva Assent de alto rendimiento, ideal para entrenamiento y uso casual. Esta prenda cuenta con tecnología transpirable y un ajuste premium.",
        sku=sku_base,
        inventory_qty=0, # El inventario total se calcula por la suma de los SKUs
        active=True
    )
    print(f"Producto principal creado: '{product.name}' (SKU: {product.sku})")

    # Intentar asignar imagen principal
    media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media')
    main_img_path = os.path.join(media_dir, 'products', 'ROJO.jpg')
    if os.path.exists(main_img_path):
        with open(main_img_path, 'rb') as f:
            product.image.save('main_cam_asnt.jpg', File(f), save=True)
            print("Imagen principal asignada al producto.")

    # Crear Colores
    colores_data = [
        {"name": "Rojo", "hex": "#FF0000", "img_file": "ROJO.jpg"},
        {"name": "Azul", "hex": "#0000FF", "img_file": "AZ.jpg"},
        {"name": "Verde", "hex": "#00FF00", "img_file": "VERDE.jfif"}
    ]

    colores_creados = []
    for c_data in colores_data:
        color = ProductColor.objects.create(
            product=product,
            name=c_data["name"],
            hex=c_data["hex"]
        )
        colores_creados.append((color, c_data["img_file"]))
        print(f"Color creado: {color.name} (Hex: {color.hex})")

        # Asignar imagen específica al color si existe
        color_img_path = os.path.join(media_dir, 'products', c_data["img_file"])
        if os.path.exists(color_img_path):
            with open(color_img_path, 'rb') as f:
                # ProductColorImage tiene color, image, position
                color_image_obj = ProductColorImage.objects.create(color=color)
                color_image_obj.image.save(c_data["img_file"], File(f), save=True)
                print(f"Imagen '{c_data['img_file']}' asignada al color {color.name}.")
        else:
            print(f"Advertencia: No se encontró la imagen '{color_img_path}' para el color {color.name}.")

    # Crear Variantes (Tallas)
    variantes_data = [
        {"name": "Talla S", "extra_price": 0.00},
        {"name": "Talla M", "extra_price": 5000.00} # Incrementa 5,000 COP para talla M
    ]

    variantes_creadas = []
    for v_data in variantes_data:
        variant = ProductVariant.objects.create(
            product=product,
            name=v_data["name"],
            extra_price=v_data["extra_price"]
        )
        variantes_creadas.append(variant)
        print(f"Variante creada: {variant.name} (Precio extra: {variant.extra_price})")

    # Crear SKUs para cada combinación de color y variante (Color x Variante)
    # Todos deben tener un SKU único
    # Formato: CAM-ASNT-[ROJ/AZU/VER]-[S/M]
    for color, _ in colores_creados:
        color_code = color.name[:3].upper() # ROJ, AZU, VER
        for variant in variantes_creadas:
            variant_code = variant.name.split()[-1].upper() # S, M
            sku_combinacion = f"{sku_base}-{color_code}-{variant_code}"
            
            # Stock de prueba diferente para cada uno
            stock = 10
            if color_code == 'ROJ':
                stock = 15 if variant_code == 'S' else 20
            elif color_code == 'AZU':
                stock = 25 if variant_code == 'S' else 30
            else:
                stock = 35 if variant_code == 'S' else 40

            sku_obj = ProductSKU.objects.create(
                product=product,
                color=color,
                variant=variant,
                sku=sku_combinacion,
                stock=stock
            )
            print(f"ProductSKU creado: {sku_obj} (Stock: {sku_obj.stock}, SKU: {sku_obj.sku})")

    print("\n¡Producto de prueba con variantes y colores creado exitosamente!")

if __name__ == '__main__':
    create_product_with_variations()
