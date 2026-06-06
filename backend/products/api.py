from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Product, ProductImage
from users.models import UserProfile, Tenant
from users.audit import log_activity
from .models import Category
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Sum
from .models import ProductColor, ProductColorImage, ProductVariant, ProductFeature, ProductSKU


from rest_framework.views import APIView
from rest_framework.response import Response

class CheckSKUView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        sku = request.query_params.get('sku')
        if not sku:
            return Response({'available': True})
        
        tenant = _get_user_tenant(request.user)
        exists = Product.objects.filter(sku=sku, tenant=tenant).exists()
        
        # Si estamos editando, excluir el producto actual
        exclude_id = request.query_params.get('exclude_id')
        if exclude_id:
            exists = Product.objects.filter(sku=sku, tenant=tenant).exclude(id=exclude_id).exists()
            
        return Response({'available': not exists})

class ProductSKUSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSKU
        fields = ['id', 'color', 'variant', 'sku', 'stock', 'price_override', 'active']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    gallery = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'cost_price', 'description', 'category', 'sku', 'inventory_qty',
            'image', 'active', 'is_draft', 'position', 'created_at',
            'is_sale', 'sale_price', 'gallery'
        ]
        read_only_fields = ['gallery']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'sku': {'required': False, 'allow_blank': True},
        }

    def get_gallery(self, instance):
        request = self.context.get('request')
        try:
            gallery = []
            # Usamos filter y order_by con manejo de excepciones por si la tabla no existe aún
            for img in ProductImage.objects.filter(product=instance).order_by('position', 'id'):
                url = getattr(img.image, 'url', None)
                if request and url and isinstance(url, str) and url.startswith('/'):
                    url = request.build_absolute_uri(url)
                gallery.append({
                    'id': img.id,
                    'image': url,
                    'position': img.position
                })
            return gallery
        except Exception:
            # Si la tabla no existe o hay error de DB, devolvemos lista vacía
            return []

    def validate_name(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError('Nombre requerido, máximo 100 caracteres.')
        return value

    def validate_price(self, value):
        # Si es borrador, permitimos precio 0 o nulo
        is_draft = self.initial_data.get('is_draft') in [True, 'true', '1']
        if is_draft:
            return value

        if value is None or value <= 0:
            raise serializers.ValidationError('El precio debe ser mayor a cero para productos activos.')
            
        from decimal import Decimal, ROUND_HALF_UP
        return value.quantize(Decimal('0.00'), rounding=ROUND_HALF_UP)

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError('Descripción máximo 500 caracteres.')
        return value

    def validate_inventory_qty(self, value):
        is_draft = self.initial_data.get('is_draft') in [True, 'true', '1']
        if is_draft:
            return value

        if value is None or value < 0:
            raise serializers.ValidationError('Cantidad debe ser un entero positivo.')
        return value

    def validate_image(self, value):
        if value is None:
            return value
        ct = getattr(value, 'content_type', None)
        if ct and ct not in ('image/jpeg', 'image/png', 'image/webp'):
            raise serializers.ValidationError('Formato de imagen inválido (jpeg, png, webp).')
        return value

    def validate(self, attrs):
        # DEBUG: Capturar datos para identificar por qué falla el 400
        print(f"DEBUG: Validando producto {self.instance.id if self.instance else 'NUEVO'}")
        print(f"DEBUG: Attrs: {attrs}")
        print(f"DEBUG: Initial Data: {self.initial_data}")
        
        is_draft = attrs.get('is_draft', False) or (self.instance and self.instance.is_draft)
        
        # Si es borrador, relajamos validaciones
        if is_draft:
            if not attrs.get('name') and not (self.instance and self.instance.name):
                raise serializers.ValidationError({'name': 'El nombre es requerido incluso para borradores.'})
            return attrs

        # Validaciones para productos activos
        if not attrs.get('category') and not (self.instance and self.instance.category):
            raise serializers.ValidationError({'category': 'La categoría es obligatoria para productos activos.'})
        
        if not attrs.get('price') and not (self.instance and self.instance.price):
            raise serializers.ValidationError({'price': 'El precio es obligatorio para productos activos.'})

        request = self.context.get('request')
        if request and attrs.get('category'):
            tenant = _get_user_tenant(request.user)
            cat = attrs['category']
            if tenant and getattr(cat, 'tenant', None) != tenant:
                raise serializers.ValidationError({'category': 'La categoría no pertenece a su organización.'})
        return attrs

    def create(self, validated_data):
        if not validated_data.get('sku'):
            base = validated_data.get('name') or 'producto'
            import re
            base = re.sub(r'[^A-Za-z0-9\-]+', '-', base).strip('-')[:30] or 'producto'
            candidate = base
            i = 1
            # Import Q at the file level, it's already there (from django.db.models import Q)
            # Ensure tenant-specific SKU check
            tenant = validated_data.get('tenant')
            while Product.objects.filter(sku=candidate, tenant=tenant).exists():
                candidate = f"{base}-{i}"
                i += 1
            validated_data['sku'] = candidate
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        img = data.get('image')
        if request and img and isinstance(img, str) and img.startswith('/'):
            data['image'] = request.build_absolute_uri(img)
        data['category_name'] = getattr(instance.category, 'name', None)
        try:
            base_stock = int(getattr(instance, 'inventory_qty', 0) or 0)
        except Exception:
            base_stock = 0
        data['total_stock'] = instance.total_stock
        try:
            colors_data = []
            for color in ProductColor.objects.filter(product=instance).order_by('position', 'id'):
                images = []
                for ci in ProductColorImage.objects.filter(color=color).order_by('position', 'id'):
                    url = getattr(ci.image, 'url', None)
                    if request and url and isinstance(url, str) and url.startswith('/'):
                        url = request.build_absolute_uri(url)
                    images.append({'id': ci.id, 'image': url})
                colors_data.append({
                    'id': color.id,
                    'name': color.name,
                    'hex': color.hex,
                    'images': images,
                })
        except Exception:
            colors_data = []
        data['colors'] = colors_data
        try:
            variants_data = []
            for v in ProductVariant.objects.filter(product=instance).order_by('position', 'id'):
                variants_data.append({
                    'id': v.id,
                    'name': v.name,
                    'extra_price': str(v.extra_price),
                })
        except Exception:
            variants_data = []
        data['variants'] = variants_data
        try:
            features_data = []
            for f in ProductFeature.objects.filter(product=instance).order_by('position', 'id'):
                features_data.append({
                    'id': f.id,
                    'name': f.name,
                })
        except Exception:
            features_data = []
        data['features'] = features_data
        try:
            skus_data = []
            for sku_obj in ProductSKU.objects.filter(product=instance):
                skus_data.append({
                    'id': sku_obj.id,
                    'color': sku_obj.color_id,
                    'variant': sku_obj.variant_id,
                    'sku': sku_obj.sku,
                    'stock': sku_obj.stock,
                    'price_override': str(sku_obj.price_override) if sku_obj.price_override else None,
                    'active': sku_obj.active,
                })
        except Exception:
            skus_data = []
        data['skus'] = skus_data
        return data


class ProductListSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for listing products. 
    Removes heavy gallery, colors, and variant processing.
    """
    category_name = serializers.ReadOnlyField(source='category.name')
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'category_name', 'sku', 
            'image', 'active', 'is_draft', 'position', 'created_at',
            'is_sale', 'sale_price', 'inventory_qty', 'total_stock'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        img = data.get('image')
        if request and img and isinstance(img, str) and img.startswith('/'):
            data['image'] = request.build_absolute_uri(img)
            
        # Using the denormalized field directly for maximum speed
        data['total_stock'] = instance.total_stock
        return data

    def validate(self, attrs):
        # We now use the main ProductSerializer for validation logic in POST/PATCH
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)


def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()

def _get_user_role(user):
    try:
        return user.profile.role
    except UserProfile.DoesNotExist:
        return 'employee'


class ProductPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProductListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = ProductPagination

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductListSerializer
        return ProductSerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = Product.objects.filter(tenant=tenant)
        else:
            role = _get_user_role(self.request.user)
            if role == 'super_admin':
                qs = Product.objects.all()
            else:
                return Product.objects.none()
        
        # Denormalized total_stock eliminates the need for Subqueries or JOINS here
        qs = qs.select_related('category').only(
            'id', 'name', 'price', 'category__id', 'category__name', 'sku', 
            'image', 'active', 'is_draft', 'position', 'created_at',
            'is_sale', 'sale_price', 'inventory_qty', 'total_stock', 'description', 'cost_price'
        )
        
        ordering = self.request.query_params.get('ordering')
        if ordering:
            allowed = {'name', 'created_at', 'price', 'position', 'active'}
            if ordering.lstrip('-') in allowed:
                qs = qs.order_by(ordering)
            else:
                qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('-created_at')
            
        search = self.request.query_params.get('search')
        if search:
            # Import Q at the file level, it's already there (from django.db.models import Q)
            qs = qs.filter(
                Q(name__icontains=search) | 
                Q(sku__icontains=search) | 
                Q(description__icontains=search)
            )
            
        active_str = self.request.query_params.get('active')
        if active_str:
            if active_str.lower() in ['true', '1', 't']:
                qs = qs.filter(active=True)
            elif active_str.lower() in ['false', '0', 'f']:
                qs = qs.filter(active=False)
                
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
            
        return qs

    def perform_create(self, serializer):
        tenant = _get_user_tenant(self.request.user)
        role = _get_user_role(self.request.user)

        if not tenant and role != 'super_admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tiene tenant asignado. Contacte al administrador.')
        
        # Check plan limits
        if tenant and tenant.subscription_plan:
            plan = tenant.subscription_plan
            if plan.max_products != -1:
                count = Product.objects.filter(tenant=tenant).count()
                if count >= plan.max_products:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied(f'Límite de productos alcanzado ({plan.max_products}). Actualice su plan.')

        product = serializer.save(tenant=tenant)
        log_activity(
            tenant=tenant,
            actor=self.request.user,
            action='product.create',
            resource_type='product',
            resource_id=str(product.id),
            message=f'Producto creado: {product.name}',
            metadata={'name': product.name, 'sku': product.sku, 'price': str(product.price)},
            request=self.request,
        )


class ProductDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            return Product.objects.filter(tenant=tenant)
        role = _get_user_role(self.request.user)
        if role == 'super_admin':
            return Product.objects.all()
        return Product.objects.none()

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            # Capturar y loguear errores de validación para depuración
            import logging
            logger = logging.getLogger('django.request')
            if hasattr(e, 'detail'):
                print(f"DEBUG: Error de validación en PATCH {request.path}: {e.detail}")
            else:
                print(f"DEBUG: Error inesperado en PATCH {request.path}: {str(e)}")
            raise

    def perform_update(self, serializer):
        product = serializer.save()
        tenant = _get_user_tenant(self.request.user)
        log_activity(
            tenant=tenant,
            actor=self.request.user,
            action='product.update',
            resource_type='product',
            resource_id=str(product.id),
            message=f'Producto actualizado: {product.name}',
            metadata={'name': product.name, 'sku': product.sku, 'price': str(product.price), 'active': bool(product.active)},
            request=self.request,
        )

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            raise PermissionDenied('Solo administradores pueden eliminar productos.')
        tenant = _get_user_tenant(self.request.user)
        log_activity(
            tenant=tenant,
            actor=self.request.user,
            action='product.delete',
            resource_type='product',
            resource_id=str(instance.id),
            message=f'Producto eliminado: {instance.name}',
            metadata={'name': instance.name, 'sku': instance.sku},
            request=self.request,
        )
        instance.delete()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'active', 'position', 'created_at']

    def validate_name(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError('Nombre requerido, máximo 100 caracteres.')
        import re
        if not re.fullmatch(r"[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\-\s]+", value):
            raise serializers.ValidationError('Nombre contiene caracteres no permitidos.')
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError('Descripción máximo 500 caracteres.')
        return value

    def validate_image(self, value):
        if value is None:
            return value
        ct = getattr(value, 'content_type', None)
        if ct and ct not in ('image/jpeg', 'image/png', 'image/webp'):
            raise serializers.ValidationError('Formato de imagen inválido (jpeg, png, webp).')
        size = getattr(value, 'size', 0)
        if size and size > 5 * 1024 * 1024:
            raise serializers.ValidationError('La imagen supera 5MB.')
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        img = data.get('image')
        if request and img and isinstance(img, str) and img.startswith('/'):
            data['image'] = request.build_absolute_uri(img)
        return data


class CategoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class CategoryListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = CategoryPagination

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        qs = Category.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        else:
            role = _get_user_role(self.request.user)
            if role == 'super_admin':
                qs = qs
            elif role == 'admin':
                qs = qs.filter(tenant__isnull=True)
            else:
                qs = Category.objects.none()
        
        qs = qs.only('id', 'name', 'description', 'image', 'active', 'position', 'created_at')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        ordering = self.request.query_params.get('ordering') or '-created_at'
        allowed = {'name', 'created_at', 'active', 'position'}
        if ordering.lstrip('-') in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')
            
        return qs.only('id', 'name', 'description', 'image', 'active', 'position', 'created_at')

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            raise PermissionDenied('Solo administradores pueden crear categorías.')
        tenant = _get_user_tenant(self.request.user)
        if not tenant and role != 'super_admin':
            raise PermissionDenied('No tiene tenant asignado. Contacte al administrador.')

        if tenant and tenant.subscription_plan:
            plan = tenant.subscription_plan
            if plan.max_categories != -1:
                count = Category.objects.filter(tenant=tenant).count()
                if count >= plan.max_categories:
                    raise PermissionDenied(f'Límite de categorías alcanzado ({plan.max_categories}). Actualice su plan.')

        category = serializer.save(tenant=tenant if tenant else None)
        log_activity(
            tenant=tenant,
            actor=self.request.user,
            action='category.create',
            resource_type='category',
            resource_id=str(category.id),
            message=f'Categoría creada: {category.name}',
            metadata={'name': category.name, 'active': bool(category.active)},
            request=self.request,
        )


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'position', 'created_at']
        read_only_fields = ['created_at']

    def validate_image(self, value):
        if value is None:
            return value
        ct = getattr(value, 'content_type', None)
        if ct and ct not in ('image/jpeg', 'image/png', 'image/webp'):
            raise serializers.ValidationError('Formato de imagen inválido (jpeg, png, webp).')
        size = getattr(value, 'size', 0)
        if size and size > 5 * 1024 * 1024:
            raise serializers.ValidationError('La imagen supera 5MB.')
        return value


class ProductSKUListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSKUSerializer

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductSKU.objects.filter(product_id=product_id)

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)
        
        # Evitar IntegrityError si la combinación ya existe (creada automáticamente al añadir color/variante)
        color = serializer.validated_data.get('color')
        variant = serializer.validated_data.get('variant')
        
        existing = ProductSKU.objects.filter(product=product, color=color, variant=variant).first()
        if existing:
            # Si ya existe, actualizamos en lugar de crear
            serializer.instance = existing
            serializer.save(product=product)
        else:
            serializer.save(product=product)


class ProductSKUDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSKUSerializer

    def get_queryset(self):
        return ProductSKU.objects.all()


class ProductImageListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductImageSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        qs = ProductImage.objects.filter(product_id=product_id).order_by('position', 'id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return ProductImage.objects.none()
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            return ProductImage.objects.none()
        if not tenant and _get_user_role(self.request.user) != 'super_admin':
            return ProductImage.objects.none()
        return qs

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Producto no encontrado')
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede modificar la galería de otro tenant.')
        serializer.save(product=product)


class ProductImageDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductImageSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ProductImage.objects.all()
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = qs.filter(product__tenant=tenant)
        else:
            if _get_user_role(self.request.user) != 'super_admin':
                qs = ProductImage.objects.none()
        return qs


class CategoryDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            return Category.objects.filter(tenant=tenant)
        role = _get_user_role(self.request.user)
        if role == 'super_admin':
            return Category.objects.all()
        return Category.objects.none()

    def perform_update(self, serializer):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden editar categorías.')
        category = serializer.save()
        tenant = _get_user_tenant(self.request.user)
        log_activity(
            tenant=tenant,
            actor=self.request.user,
            action='category.update',
            resource_type='category',
            resource_id=str(category.id),
            message=f'Categoría actualizada: {category.name}',
            metadata={'name': category.name, 'active': bool(category.active)},
            request=self.request,
        )

    def perform_destroy(self, instance):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden eliminar categorías.')
        tenant = _get_user_tenant(self.request.user)
        log_activity(
            tenant=tenant,
            actor=self.request.user,
            action='category.delete',
            resource_type='category',
            resource_id=str(instance.id),
            message=f'Categoría eliminada: {instance.name}',
            metadata={'name': instance.name},
            request=self.request,
        )
        instance.delete()


class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'product', 'name', 'hex', 'position', 'created_at']
        read_only_fields = ['product', 'created_at']

    def validate_hex(self, value):
        import re
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value or ''):
            raise serializers.ValidationError('HEX debe ser #RRGGBB.')
        return value


class ProductColorListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductColorSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        qs = ProductColor.objects.filter(product_id=product_id).order_by('position', 'id')
        # Asegurar tenant
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return ProductColor.objects.none()
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            return ProductColor.objects.none()
        if not tenant and _get_user_role(self.request.user) != 'super_admin':
            return ProductColor.objects.none()
        return qs

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Producto no encontrado')
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede modificar colores de otro tenant.')
        color = serializer.save(product=product)
        try:
            # Crear combinaciones SKU para este color
            variants = list(ProductVariant.objects.filter(product=product).only('id'))
            if variants:
                for v in variants:
                    ProductSKU.objects.get_or_create(
                        product=product,
                        color=color,
                        variant=v,
                        defaults={'sku': '', 'stock': 0, 'active': True}
                    )
            else:
                ProductSKU.objects.get_or_create(
                    product=product,
                    color=color,
                    variant=None,
                    defaults={'sku': '', 'stock': 0, 'active': True}
                )
        except Exception:
            # Si hay algún problema (únicos/DB), lo ignoramos para no bloquear la creación del color
            pass
        log_activity(
            tenant=_get_user_tenant(self.request.user),
            actor=self.request.user,
            action='product.color.create',
            resource_type='product_color',
            resource_id=str(color.id),
            message=f'Color agregado: {color.name}',
            metadata={'product_id': product.id, 'color': color.name},
            request=self.request,
        )


class ProductColorDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductColorSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ProductColor.objects.all()
        # Filtrar por tenant del producto
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = qs.filter(product__tenant=tenant)
        else:
            if _get_user_role(self.request.user) != 'super_admin':
                qs = ProductColor.objects.none()
        return qs


class ProductColorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColorImage
        fields = ['id', 'color', 'image', 'position', 'created_at']
        read_only_fields = ['color', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        img = data.get('image')
        if request and img and isinstance(img, str) and img.startswith('/'):
            data['image'] = request.build_absolute_uri(img)
        return data


class ProductColorImageListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductColorImageSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        color_id = self.kwargs.get('color_id')
        qs = ProductColorImage.objects.filter(color_id=color_id).order_by('position', 'id')
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = qs.filter(color__product__tenant=tenant)
        else:
            if _get_user_role(self.request.user) != 'super_admin':
                qs = ProductColorImage.objects.none()
        return qs

    def perform_create(self, serializer):
        color_id = self.kwargs.get('color_id')
        color = ProductColor.objects.filter(id=color_id).select_related('product').first()
        if not color:
            from rest_framework.exceptions import NotFound
            raise NotFound('Color no encontrado')
        tenant = _get_user_tenant(self.request.user)
        if tenant and color.product.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede modificar imágenes de otro tenant.')
        if ProductColorImage.objects.filter(color=color).count() >= 4:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'image': 'Máximo 4 imágenes por color.'})
        serializer.save(color=color)


class ProductColorImageDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductColorImageSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ProductColorImage.objects.all().select_related('color__product')
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = qs.filter(color__product__tenant=tenant)
        else:
            if _get_user_role(self.request.user) != 'super_admin':
                qs = ProductColorImage.objects.none()
        return qs


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'name', 'extra_price', 'position', 'created_at']
        read_only_fields = ['product', 'created_at']

    def validate_name(self, value):
        if not value or len(value) > 50:
            raise serializers.ValidationError('Nombre requerido, máximo 50 caracteres.')
        return value

    def validate_extra_price(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError('El sobrecosto no puede ser negativo.')
            
        from decimal import Decimal, ROUND_HALF_UP
        return value.quantize(Decimal('0.00'), rounding=ROUND_HALF_UP)


class ProductVariantListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductVariantSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        qs = ProductVariant.objects.filter(product_id=product_id).order_by('position', 'id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return ProductVariant.objects.none()
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            return ProductVariant.objects.none()
        if not tenant and _get_user_role(self.request.user) != 'super_admin':
            return ProductVariant.objects.none()
        return qs

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Producto no encontrado')
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede modificar variantes de otro tenant.')
        variant = serializer.save(product=product)
        try:
            # Crear combinaciones SKU para esta variante
            colors = list(ProductColor.objects.filter(product=product).only('id'))
            if colors:
                for c in colors:
                    ProductSKU.objects.get_or_create(
                        product=product,
                        color=c,
                        variant=variant,
                        defaults={'sku': '', 'stock': 0, 'active': True}
                    )
            else:
                ProductSKU.objects.get_or_create(
                    product=product,
                    color=None,
                    variant=variant,
                    defaults={'sku': '', 'stock': 0, 'active': True}
                )
        except Exception:
            # No bloquear en caso de error de DB/duplicados
            pass
        log_activity(
            tenant=_get_user_tenant(self.request.user),
            actor=self.request.user,
            action='product.variant.create',
            resource_type='product_variant',
            resource_id=str(variant.id),
            message=f'Variante agregada: {variant.name}',
            metadata={'product_id': product.id, 'variant': variant.name},
            request=self.request,
        )


class ProductVariantDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductVariantSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ProductVariant.objects.all()
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = qs.filter(product__tenant=tenant)
        else:
            if _get_user_role(self.request.user) != 'super_admin':
                qs = ProductVariant.objects.none()
        return qs


class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ['id', 'product', 'name', 'position', 'created_at']
        read_only_fields = ['product', 'created_at']

    def validate_name(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError('Nombre requerido, máximo 100 caracteres.')
        return value


class ProductFeatureListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductFeatureSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        qs = ProductFeature.objects.filter(product_id=product_id).order_by('position', 'id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return ProductFeature.objects.none()
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            return ProductFeature.objects.none()
        if not tenant and _get_user_role(self.request.user) != 'super_admin':
            return ProductFeature.objects.none()
        return qs

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Producto no encontrado')
        tenant = _get_user_tenant(self.request.user)
        if tenant and product.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede modificar características de otro tenant.')
        serializer.save(product=product)


class ProductFeatureDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductFeatureSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ProductFeature.objects.all()
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            qs = qs.filter(product__tenant=tenant)
        else:
            if _get_user_role(self.request.user) != 'super_admin':
                qs = ProductFeature.objects.none()
        return qs


class ResolveSKUView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sku_code = request.query_params.get('sku', '').strip()
        if not sku_code:
            return Response({'detail': 'SKU parameter required'}, status=400)
            
        tenant = _get_user_tenant(request.user)
        
        # 1. Search in ProductSKU first (specific color/variant combination)
        sku_obj = ProductSKU.objects.filter(sku__iexact=sku_code, product__tenant=tenant, active=True).select_related('product', 'color', 'variant').first()
        if sku_obj:
            product = sku_obj.product
            # Fetch all skus and info for the product to match what the frontend expects
            from .api import ProductSerializer
            prod_serializer = ProductSerializer(product, context={'request': request})
            return Response({
                'found': True,
                'type': 'combination',
                'product': prod_serializer.data,
                'color_id': sku_obj.color_id,
                'variant_id': sku_obj.variant_id,
                'stock': sku_obj.stock,
                'sku': sku_obj.sku,
            })
            
        # 2. Search in main Product SKU
        product = Product.objects.filter(sku__iexact=sku_code, tenant=tenant, active=True).first()
        if product:
            from .api import ProductSerializer
            prod_serializer = ProductSerializer(product, context={'request': request})
            return Response({
                'found': True,
                'type': 'product',
                'product': prod_serializer.data,
                'color_id': None,
                'variant_id': None,
                'stock': product.inventory_qty,
                'sku': product.sku,
            })
            
        return Response({'found': False, 'detail': 'SKU no encontrado'}, status=200)

