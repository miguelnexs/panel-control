from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Product
from users.models import UserProfile, Tenant
from .models import Category
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Sum
from .models import ProductColor, ProductColorImage, ProductVariant, ProductFeature


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'description', 'category', 'sku', 'inventory_qty',
            'image', 'active', 'created_at',
            'is_sale', 'sale_price'
        ]

    def validate_name(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError('Nombre requerido, máximo 100 caracteres.')
        import re
        if not re.fullmatch(r"[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\-\s]+", value):
            raise serializers.ValidationError('Nombre contiene caracteres no permitidos.')
        return value

    def validate_price(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError('Precio debe ser positivo.')
        q = value.as_tuple().exponent
        if q < -2:
            raise serializers.ValidationError('Precio debe tener 2 decimales como máximo.')
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError('Descripción máximo 500 caracteres.')
        return value

    def validate_inventory_qty(self, value):
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        img = data.get('image')
        if request and img and isinstance(img, str) and img.startswith('/'):
            data['image'] = request.build_absolute_uri(img)
        data['category_name'] = getattr(instance.category, 'name', None)
        try:
            color_sum = (ProductColor.objects.filter(product=instance).aggregate(total=Sum('stock')) or {}).get('total') or 0
        except Exception:
            color_sum = 0
        try:
            base_stock = int(getattr(instance, 'inventory_qty', 0) or 0)
        except Exception:
            base_stock = 0
        data['colors_stock_total'] = int(color_sum)
        data['total_stock'] = int(base_stock + color_sum)
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
                    'stock': color.stock,
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
        return data

    def validate(self, attrs):
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
            from .models import Product
            while Product.objects.filter(sku=candidate).exists():
                candidate = f"{base}-{i}"
                i += 1
            validated_data['sku'] = candidate
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


class ProductListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        if tenant:
            return Product.objects.filter(tenant=tenant).order_by('-created_at')
        role = _get_user_role(self.request.user)
        if role == 'super_admin':
            return Product.objects.all().order_by('-created_at')
        return Product.objects.none()

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

        serializer.save(tenant=tenant)


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

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            raise PermissionDenied('Solo administradores pueden eliminar productos.')
        instance.delete()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'active', 'created_at']

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
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        ordering = self.request.query_params.get('ordering') or '-created_at'
        allowed = {'name', 'created_at', 'active'}
        if ordering.lstrip('-') in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden crear categorías.')
        tenant = _get_user_tenant(self.request.user)
        if not tenant and role != 'super_admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tiene tenant asignado. Contacte al administrador.')
        
        # Check plan limits
        if tenant and tenant.subscription_plan:
            plan = tenant.subscription_plan
            if plan.max_categories != -1:
                count = Category.objects.filter(tenant=tenant).count()
                if count >= plan.max_categories:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied(f'Límite de categorías alcanzado ({plan.max_categories}). Actualice su plan.')

        serializer.save(tenant=tenant if tenant else None)


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
        serializer.save()

    def perform_destroy(self, instance):
        role = _get_user_role(self.request.user)
        if role not in ('admin', 'super_admin'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo administradores pueden eliminar categorías.')
        instance.delete()


class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'product', 'name', 'hex', 'stock', 'position', 'created_at']
        read_only_fields = ['product', 'created_at']

    def validate_hex(self, value):
        import re
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value or ''):
            raise serializers.ValidationError('HEX debe ser #RRGGBB.')
        return value

    def validate_stock(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError('Stock debe ser entero positivo.')
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
        serializer.save(product=product)


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
            raise serializers.ValidationError('Sobrecosto debe ser 0 o positivo.')
        q = value.as_tuple().exponent
        if q < -2:
            raise serializers.ValidationError('Sobrecosto máximo 2 decimales.')
        return value


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
        serializer.save(product=product)


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
