from rest_framework import serializers, generics, views, status, permissions
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
import re
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import PaymentMethod, Banner, Policy, VisitStat, VisibleProduct, AccessLog, VisibleCategory, UserURL, Template
from config.models import AppSettings
from django.db import models
from users.utils.crypto import encrypt_text, is_encrypted_text
from products.api import ProductSerializer
from products.models import Product, Category, ProductColor, ProductVariant
from sales.models import Sale, SaleItem
from clients.models import Client
from users.models import Tenant, UserProfile
from decimal import Decimal
import datetime, random, string
from django.db import transaction
from urllib.parse import urlparse

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


class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = ['id', 'primary_color', 'secondary_color', 'font_family', 'logo', 'currencies', 'updated_at',
                  'company_name','company_nit','company_phone','company_whatsapp','company_email','company_address','company_description',
                  'printer_type','printer_name','paper_width_mm','auto_print','receipt_footer', 'whatsapp_config', 'page_content',
                  'shipping_cost', 'free_shipping_threshold', 'pickup_enabled']

    def validate_whatsapp_config(self, value):
        if isinstance(value, dict):
            if 'access_token' in value:
                token = value['access_token']
                if token and not is_encrypted_text(token):
                    value['access_token'] = encrypt_text(token)
        return value

    def update(self, instance, validated_data):
        if 'whatsapp_config' in validated_data:
            new_config = validated_data['whatsapp_config']
            old_config = instance.whatsapp_config or {}
            
            # Preserve sensitive keys if not provided in update
            if 'access_token' not in new_config and 'access_token' in old_config:
                new_config['access_token'] = old_config['access_token']
                
            validated_data['whatsapp_config'] = new_config
            
        return super().update(instance, validated_data)


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'provider', 'fee_percent', 'active', 'currencies', 'extra_config', 'created_at']

    def validate_extra_config(self, value):
        if isinstance(value, dict):
            if 'private_key' in value:
                pk = value['private_key']
                if pk and not is_encrypted_text(pk):
                    value['private_key'] = encrypt_text(pk)
        return value

    def update(self, instance, validated_data):
        if 'extra_config' in validated_data:
            new_config = validated_data['extra_config']
            old_config = instance.extra_config or {}
            
            # Preserve sensitive keys if not provided in update
            if 'private_key' not in new_config and 'private_key' in old_config:
                new_config['private_key'] = old_config['private_key']
                
            validated_data['extra_config'] = new_config
            
        return super().update(instance, validated_data)


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'slug', 'image', 'zip_file', 'demo_url', 'color', 'tags', 'is_personal', 'owner', 'page_content']


class TemplateListView(generics.ListAPIView):
    queryset = Template.objects.filter(is_active=True)
    serializer_class = TemplateSerializer
    permission_classes = [permissions.AllowAny]

class TemplateAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        return Template.objects.all()
    def update(self, request, *args, **kwargs):
        try:
            profile = UserProfile.objects.filter(user=request.user).first()
            role = getattr(profile, 'role', 'employee')
        except Exception:
            role = 'employee'
        if role not in ('super_admin', 'admin'):
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

class TemplateCloneView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            original = Template.objects.get(pk=pk)
        except Template.DoesNotExist:
            return Response({'detail': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Generate unique slug
            import time
            slug_base = original.slug or 'template'
            new_slug = f"{slug_base}-copy-{int(time.time())}"
            
            new_template = Template(
                name=f"{original.name} (Copy)",
                description=original.description,
                slug=new_slug,
                demo_url=original.demo_url,
                color=original.color,
                tags=original.tags,
                is_personal=True,
                owner=request.user,
                page_content=original.page_content,
                is_active=True
            )
            
            # Copy files if they exist
            from django.core.files.base import ContentFile
            
            if original.image:
                try:
                    f_img = original.image.open()
                    new_template.image.save(original.image.name.split('/')[-1], ContentFile(f_img.read()), save=False)
                    f_img.close()
                except Exception as e:
                    print(f"Error copying image: {e}")

            if original.zip_file:
                try:
                    f_zip = original.zip_file.open()
                    new_template.zip_file.save(original.zip_file.name.split('/')[-1], ContentFile(f_zip.read()), save=False)
                    f_zip.close()
                except Exception as e:
                    print(f"Error copying zip: {e}")

            new_template.save()
            return Response(TemplateSerializer(new_template).data)
        except Exception as e:
            print(f"Error cloning template: {e}")
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MyTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        return Template.objects.filter(owner=self.request.user, is_personal=True).order_by('-created_at')
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, is_personal=True, is_active=True)

class MyTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        return Template.objects.filter(owner=self.request.user, is_personal=True)

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'link', 'active', 'position', 'created_at']


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = ['id', 'shipping_text', 'returns_text', 'privacy_text', 'updated_at']


class UserURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserURL
        fields = ['id', 'url', 'created_at']


class StatsSerializer(serializers.Serializer):
    visits_total = serializers.IntegerField()
    conversions_total = serializers.IntegerField()


class WebSettingsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get(self, request):
        
        # Seleccionar configuración específica del tenant del usuario
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
        except Exception:
            user_tenant = None
        if user_tenant:
            ws = AppSettings.objects.filter(tenant=user_tenant).first()
            if not ws:
                ws = AppSettings.objects.create(tenant=user_tenant)
        else:
            ws = AppSettings.objects.first() or AppSettings.objects.create()
        try:
            if not ws.logo:
                ws.logo.name = 'web/logo/logo_2.png'
                ws.save(update_fields=['logo'])
        except Exception:
            pass
        
        data = AppSettingsSerializer(ws).data
        if request.user.is_authenticated:
            personal = Template.objects.filter(owner=request.user, is_personal=True).order_by('-created_at').first()
            if personal and personal.page_content:
                data['page_content'] = {**data.get('page_content', {}), **personal.page_content}

        return Response(data)

    def put(self, request):
        
        # Actualizar configuración aislada por tenant
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
        except Exception:
            user_tenant = None
        if user_tenant:
            ws = AppSettings.objects.filter(tenant=user_tenant).first()
            if not ws:
                ws = AppSettings.objects.create(tenant=user_tenant)
        else:
            ws = AppSettings.objects.first() or AppSettings.objects.create()
        data = request.data.copy()
        if 'receipt_footer' in data:
            import re
            t = str(data.get('receipt_footer') or '')
            t = re.sub(r"<\s*script[\s\S]*?>[\s\S]*?<\s*/\s*script\s*>", "", t, flags=re.IGNORECASE)
            data['receipt_footer'] = t
        serializer = AppSettingsSerializer(ws, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PaymentMethodListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        try:
            tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant or None
        except Exception:
            tenant = None
        qs = PaymentMethod.objects.all().order_by('id')
        if tenant:
            qs = qs.filter(tenant=tenant)
        return qs
    def perform_create(self, serializer):
        try:
            tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant or None
        except Exception:
            tenant = None
        serializer.save(tenant=tenant)


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        try:
            tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant or None
        except Exception:
            tenant = None
        qs = PaymentMethod.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        return qs


class BannerListCreateView(generics.ListCreateAPIView):
    queryset = Banner.objects.all().order_by('position', '-created_at')
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        obj = serializer.save()
        # Enforce only one active banner
        if obj.active:
            Banner.objects.exclude(id=obj.id).update(active=False)


class BannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def perform_update(self, serializer):
        obj = serializer.save()
        if obj.active:
            Banner.objects.exclude(id=obj.id).update(active=False)

class PublicBannersView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        items = Banner.objects.filter(active=True).order_by('position', '-created_at')
        def abs_image(b):
            try:
                url = b.image.url if b.image else None
                if url and isinstance(url, str) and url.startswith('/'):
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                return None
        def resolve_image(b):
            try:
                if b.image:
                    url = b.image.url
                    if isinstance(url, str) and url.startswith('/'):
                        return request.build_absolute_uri(url)
                    return url
                if b.link:
                    return b.link
            except Exception:
                pass
            return None
        return Response([{
            'id': b.id,
            'title': b.title,
            'image': resolve_image(b),
            'position': b.position,
            'created_at': b.created_at,
        } for b in items])

class PolicyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        pol = Policy.objects.first()
        if not pol:
            pol = Policy.objects.create()
        return Response(PolicySerializer(pol).data)

    def put(self, request):
        pol = Policy.objects.first()
        if not pol:
            pol = Policy.objects.create()
        def sanitize(text):
            try:
                if text is None:
                    return ''
                t = str(text)
                t = re.sub(r"<\s*script[\s\S]*?>[\s\S]*?<\s*/\s*script\s*>", "", t, flags=re.IGNORECASE)
                return t
            except Exception:
                return ''
        data = request.data.copy()
        for k in ['shipping_text','returns_text','privacy_text']:
            if k in data:
                data[k] = sanitize(data.get(k))
        serializer = PolicySerializer(pol, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        agg = VisitStat.objects.aggregate(visits_total=models.Sum('visits'), conversions_total=models.Sum('conversions'))
        return Response({
            'visits_total': int(agg.get('visits_total') or 0),
            'conversions_total': int(agg.get('conversions_total') or 0),
        })


class VisibleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibleProduct
        fields = ['product', 'active', 'position']


class VisibleProductsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        items = VisibleProduct.objects.filter(active=True).order_by('position', 'product_id')
        return Response([VisibleProductSerializer(v).data for v in items])


class VisibleProductUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, product_id):
        obj, _ = VisibleProduct.objects.get_or_create(product_id=product_id)
        active = request.data.get('active')
        position = request.data.get('position')
        if active is not None:
            obj.active = bool(active)
        if position is not None:
            try:
                obj.position = int(position)
            except Exception:
                pass
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
        except Exception:
            user_tenant = None
        try:
            product = Product.objects.filter(id=product_id).first()
            if product and user_tenant and getattr(product, 'tenant', None) is None:
                product.tenant = user_tenant
                product.save(update_fields=['tenant'])
        except Exception:
            pass
        obj.save()
        return Response(VisibleProductSerializer(obj).data)
class PortalView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        ok = request.user and request.user.is_authenticated
        _log(request, 'portal', ok, request.user if ok else None)
        if not ok:
            return Response({'detail': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        vis_ids = list(VisibleProduct.objects.filter(active=True).values_list('product_id', flat=True))
        prods = Product.objects.filter(id__in=vis_ids)
        settings = AppSettings.objects.first() or AppSettings.objects.create()
        policy = Policy.objects.first() or Policy.objects.create()
        return Response({
            'settings': AppSettingsSerializer(settings).data,
            'policy': PolicySerializer(policy).data,
            'products': ProductSerializer(prods, many=True, context={'request': request}).data,
        })


class PublicPortalView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_portal', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        tenants = []
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile') and getattr(uu.user.profile, 'tenant', None):
                tenant = uu.user.profile.tenant
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        vis_ids = list(VisibleProduct.objects.filter(active=True).order_by('position', 'product_id').values_list('product_id', flat=True))
        base_qs = Product.objects.filter(id__in=vis_ids)
        prods = base_qs.filter(tenant=tenant) if tenant else Product.objects.none()
        if tenant and not prods.exists():
            prods = Product.objects.filter(tenant=tenant, active=True)
        settings = AppSettings.objects.filter(tenant=tenant).first() if tenant else None
        policy = Policy.objects.first() or Policy.objects.create()
        return Response({
            'settings': (AppSettingsSerializer(settings).data if settings else {}),
            'policy': PolicySerializer(policy).data,
            'products': ProductSerializer(prods, many=True).data,
        })


class PublicProductsView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_products', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        vis_ids = list(VisibleProduct.objects.filter(active=True).order_by('position', 'product_id').values_list('product_id', flat=True))
        base_qs = Product.objects.filter(id__in=vis_ids, active=True).order_by('-created_at')
        prods = base_qs.filter(tenant=tenant) if tenant else Product.objects.none()

        # Filtros adicionales
        if prods.exists():
            # Filtro por Categoría
            cat_id = request.query_params.get('category')
            if cat_id:
                prods = prods.filter(category_id=cat_id)
            
            # Filtro por Búsqueda (Nombre o Descripción)
            search = request.query_params.get('search')
            if search:
                prods = prods.filter(Q(name__icontains=search) | Q(description__icontains=search))
            
            # Filtro por Precio
            min_price = request.query_params.get('min_price')
            if min_price:
                try:
                    prods = prods.filter(price__gte=float(min_price))
                except ValueError:
                    pass
            
            max_price = request.query_params.get('max_price')
            if max_price:
                try:
                    prods = prods.filter(price__lte=float(max_price))
                except ValueError:
                    pass
            
            # Ordenamiento
            ordering = request.query_params.get('ordering')
            if ordering == 'price_asc':
                prods = prods.order_by('price')
            elif ordering == 'price_desc':
                prods = prods.order_by('-price')
            elif ordering == 'name_asc':
                prods = prods.order_by('name')
            elif ordering == 'newest':
                prods = prods.order_by('-created_at')

        return Response(ProductSerializer(prods, many=True, context={'request': request}).data)


class PublicProductDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, pk):
        _log(request, f'public_product_detail:{pk}', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        vis_ids = list(VisibleProduct.objects.filter(active=True).order_by('position', 'product_id').values_list('product_id', flat=True))
        if pk not in vis_ids:
            return Response({'detail': 'Producto no visible'}, status=status.HTTP_404_NOT_FOUND)
        qs = Product.objects.filter(id=pk)
        if tenant:
            qs = qs.filter(tenant=tenant)
        else:
            qs = Product.objects.none()
        prod = qs.first()
        if not prod:
            return Response({'detail': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(prod, context={'request': request}).data)

class PublicPolicyView(views.APIView):
    permission_classes = [permissions.AllowAny]
    @method_decorator(cache_page(300))
    def get(self, request):
        _log(request, 'public_policy', True, None)
        pol = Policy.objects.first() or Policy.objects.create()
        return Response(PolicySerializer(pol).data)


class PublicSettingsView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_settings', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        ws = AppSettings.objects.filter(tenant=tenant).first() if tenant else None
        data = AppSettingsSerializer(ws).data if ws else {}
        data['google_client_id'] = getattr(settings, 'GOOGLE_CLIENT_ID', '')
        return Response(data)

class PublicPaymentsView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_payments', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        ws = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        if tenant is None:
            ws = AppSettings.objects.first() or AppSettings.objects.create()
            tenant = ws.tenant
        qs = PaymentMethod.objects.filter(active=True)
        if tenant:
            qs = qs.filter(tenant=tenant)
        safe = []
        for pm in qs:
            item = {
                'id': pm.id,
                'name': pm.name,
                'provider': pm.provider,
                'fee_percent': pm.fee_percent,
                'currencies': pm.currencies,
                'active': pm.active,
            }
            ec = pm.extra_config or {}
            if pm.provider == 'whatsapp':
                phone = ec.get('phone') or ec.get('phone_number') or ((ws and ws.company_whatsapp) or (ws and ws.company_phone))
                template = ec.get('template') or 'Hola, quiero confirmar mi pago para la orden {order_number} por {total}.'
                item['whatsapp'] = {'phone': phone, 'template': template}
            elif pm.provider == 'mercadopago':
                item['extra_config'] = {
                    'public_key': ec.get('public_key')
                }
            elif pm.provider in ('paypal','stripe','credit_card'):
                pass
            safe.append(item)
        return Response(safe)


class PublicCheckoutView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        _log(request, 'public_checkout', False, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        if tenant is None:
            ws = AppSettings.objects.first() or AppSettings.objects.create()
            tenant = ws.tenant
        
        # Check plan limits for public checkout
        if tenant and tenant.subscription_plan:
            plan = tenant.subscription_plan
            if plan.max_transactions_per_month != -1:
                from django.utils import timezone
                now = timezone.now()
                month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                current_sales = Sale.objects.filter(tenant=tenant, created_at__gte=month_start).exclude(status='canceled').count()
                if current_sales >= plan.max_transactions_per_month:
                    return Response({'detail': 'El comercio ha alcanzado su límite de órdenes mensuales. Contacte al administrador.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data or {}
        items = data.get('items') or []
        client = data.get('client') or {}
        payment_method_id = data.get('payment_method_id')
        if not items:
            return Response({'detail': 'No hay items'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                # Crear/obtener cliente
                full_name = (client.get('name') or '').strip()
                cedula = (client.get('cedula') or '').strip()
                email = (client.get('email') or '').strip()
                address = (client.get('address') or '').strip()
                if not full_name or not cedula:
                    raise ValueError('Nombre y cédula son requeridos')
                cli = Client.objects.filter(tenant=tenant, cedula=cedula).first()
                if not cli:
                    cli = Client.objects.create(full_name=full_name, cedula=cedula, email=email or 'no-reply@example.com', address=address or '', tenant=tenant)

                # Generar número de orden único
                base = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
                suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
                order_number = f'ORD-{base}-{suffix}'
                sale = Sale.objects.create(order_number=order_number, client=cli, tenant=tenant, total_amount=Decimal('0'), status='pending')
                total_amount = Decimal('0')
                for it in items:
                    pid = it.get('product_id')
                    qty = int(it.get('quantity') or 0)
                    color_id = it.get('color_id')
                    variant_id = it.get('variant_id')
                    if not pid or qty <= 0:
                        raise ValueError('Item inválido')
                    product = Product.objects.filter(id=pid).first()
                    if not product:
                        raise ValueError('Producto no existe')
                    if tenant and getattr(product, 'tenant_id', None) != getattr(tenant, 'id', None):
                        raise ValueError('Producto no pertenece a la tienda')
                    price = Decimal(str(product.price))
                    variant = None
                    # Stock handling
                    if color_id:
                        color = ProductColor.objects.filter(id=color_id, product=product).first()
                        if not color:
                            raise ValueError('Color inválido')
                        if color.stock < qty:
                            raise ValueError('Stock insuficiente del color')
                        color.stock -= qty
                        color.save(update_fields=['stock'])
                    else:
                        if product.inventory_qty < qty:
                            raise ValueError('Stock insuficiente')
                        product.inventory_qty -= qty
                        product.save(update_fields=['inventory_qty'])
                    if variant_id:
                        variant = ProductVariant.objects.filter(id=variant_id, product=product).first()
                        if not variant:
                            raise ValueError('Variante inválida')
                        try:
                            price = price + Decimal(str(variant.extra_price))
                        except Exception:
                            pass
                    SaleItem.objects.create(sale=sale, product=product, quantity=qty, unit_price=price, line_total=(price * qty), color=color if color_id else None, variant=variant)
                    total_amount += (price * qty)
                sale.total_amount = total_amount
                sale.save(update_fields=['total_amount'])
                _log(request, 'public_checkout', True, None)
                try:
                    from sales.models import OrderNotification
                    OrderNotification.objects.create(sale=sale, tenant=tenant, read=False)
                except Exception:
                    pass
                
                # Process Payment
                payment_url = None
                if payment_method_id:
                    try:
                        pm = PaymentMethod.objects.filter(id=payment_method_id).first()
                        if pm and pm.active:
                            if tenant and pm.tenant_id != tenant.id:
                                # Payment method not from this tenant
                                pass
                            else:
                                processor = PaymentProcessor(pm)
                                # Determine return URLs
                                base_url = site if site else 'http://localhost:5173'
                                if not base_url.startswith('http'):
                                    base_url = f'https://{base_url}'
                                
                                return_url = f"{base_url}/checkout?order={sale.order_number}&status=success"
                                cancel_url = f"{base_url}/checkout?order={sale.order_number}&status=cancel"
                                
                                result = processor.create_payment_intent(sale, return_url, cancel_url)
                                if result and 'payment_url' in result:
                                    payment_url = result['payment_url']
                    except Exception as e:
                        # Log error but don't fail the order creation? 
                        # Or should we fail? Usually better to fail if payment init fails.
                        # But for now let's just log and return order.
                        print(f"Payment init failed: {e}")
                        pass

                return Response({
                    'order_number': sale.order_number, 
                    'total_amount': total_amount,
                    'payment_url': payment_url
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VisibleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibleCategory
        fields = ['category', 'active', 'position']


class VisibleCategoriesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        items = VisibleCategory.objects.filter(active=True).order_by('position', 'category_id')
        return Response([VisibleCategorySerializer(v).data for v in items])


class VisibleCategoryUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, category_id):
        obj, _ = VisibleCategory.objects.get_or_create(category_id=category_id)
        active = request.data.get('active')
        position = request.data.get('position')
        if active is not None:
            obj.active = bool(active)
        if position is not None:
            try:
                obj.position = int(position)
            except Exception:
                pass
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant or None
        except Exception:
            user_tenant = None
        try:
            category = Category.objects.filter(id=category_id).first()
            if category and user_tenant and getattr(category, 'tenant', None) is None:
                category.tenant = user_tenant
                category.save(update_fields=['tenant'])
        except Exception:
            pass
        obj.save()
        return Response(VisibleCategorySerializer(obj).data)

class VisibleCategoryStatusListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            profile = getattr(request.user, 'profile', None)
            user_tenant = profile.tenant if profile else None
            role = profile.role if profile else 'employee'
        except Exception:
            user_tenant = None
            role = 'employee'
        if user_tenant:
            cats = Category.objects.filter(tenant=user_tenant).order_by('name', 'id')
        else:
            if role == 'super_admin':
                cats = Category.objects.all().order_by('name', 'id')
            elif role == 'admin':
                cats = Category.objects.filter(tenant__isnull=True).order_by('name', 'id')
            else:
                cats = Category.objects.none()
        result = []
        for c in cats:
            vc = VisibleCategory.objects.filter(category=c).first()
            result.append({
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'image': c.image.url if c.image else None,
                'visible': bool(vc and vc.active),
                'position': int(getattr(vc, 'position', 0) or 0),
            })
        return Response(result)


class PublicCategoriesView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        _log(request, 'public_categories', True, None)
        aid = request.query_params.get('aid')
        site = request.query_params.get('site')
        tenant = None
        if site:
            uu = UserURL.objects.filter(url__in=_site_variants(site)).order_by('-created_at').first()
            if uu and hasattr(uu.user, 'profile'):
                tenant = getattr(uu.user.profile, 'tenant', None)
        if tenant is None and aid:
            try:
                from users.models import Tenant
                tenant = Tenant.objects.filter(admin_id=int(aid)).first()
            except Exception:
                tenant = None
        
        if not tenant:
            return Response([])

        # Get categories for this tenant that are active
        cats_qs = Category.objects.filter(tenant=tenant, active=True)
        # Get visible categories entries, ordered by position
        visible_qs = VisibleCategory.objects.filter(category__in=cats_qs, active=True).select_related('category').order_by('position', 'category_id')
        
        cats = [vc.category for vc in visible_qs]

        return Response([{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'image': (request.build_absolute_uri(c.image.url) if (getattr(c, 'image', None) and getattr(c.image, 'url', None) and str(c.image.url).startswith('/')) else (c.image.url if getattr(c, 'image', None) else None)),
        } for c in cats])
class UserURLAvailabilityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        raw = (request.query_params.get('url') or request.query_params.get('slug') or '').strip()
        if not raw:
            return Response({'available': False, 'message': 'URL requerida.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            parsed = urlparse(raw)
            if not (parsed.scheme and parsed.netloc):
                return Response({'available': False, 'message': 'URL inválida.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'available': False, 'message': 'URL inválida.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            exists = UserURL.objects.filter(url__in=_site_variants(raw)).exists()
        except Exception:
            return Response({'available': False, 'message': 'Servicio no disponible.'}, status=status.HTTP_200_OK)
        if exists:
            _log(request, f'user_url_availability:{raw}', False, request.user)
            return Response({'available': False, 'message': 'La URL ya está registrada.'}, status=status.HTTP_200_OK)
        return Response({'available': True, 'message': 'Disponible.'}, status=status.HTTP_200_OK)


class UserURLListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserURLSerializer
    def get_queryset(self):
        try:
            return UserURL.objects.filter(user=self.request.user).order_by('-created_at')
        except Exception:
            return UserURL.objects.none()
    def perform_create(self, serializer):
        raw = (self.request.data.get('url') or self.request.data.get('slug') or '').strip()
        if not raw:
            raise serializers.ValidationError({'url': 'URL requerida.'})
        try:
            parsed = urlparse(raw)
            if not (parsed.scheme and parsed.netloc):
                raise serializers.ValidationError({'url': 'URL inválida.'})
        except Exception:
            raise serializers.ValidationError({'url': 'URL inválida.'})
        canonical = raw[:-1] if raw.endswith('/') else raw
        if len(canonical) > 256:
            raise serializers.ValidationError({'url': 'La URL es demasiado larga.'})
        try:
            if UserURL.objects.filter(url__in=_site_variants(raw)).exists():
                _log(self.request, f'user_url_create:{raw}', False, self.request.user)
                raise serializers.ValidationError({'url': 'La URL ya está registrada.'})
            serializer.save(user=self.request.user, url=canonical)
        except Exception:
            raise serializers.ValidationError({'detail': 'Servicio no disponible.'})


class UserURLDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            obj = UserURL.objects.filter(id=pk).first()
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if not obj:
            return Response({'detail': 'URL no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        if obj.user != request.user:
            return Response({'detail': 'No autorizado para eliminar esta URL.'}, status=status.HTTP_403_FORBIDDEN)
        _log(request, f'user_url_delete:{obj.url}', True, request.user)
        obj.delete()
        return Response({'message': 'URL eliminada.'}, status=status.HTTP_200_OK)


class SiteURLStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            profile = getattr(request.user, 'profile', None)
            user_tenant = profile.tenant if profile else None
        except Exception:
            user_tenant = None
        try:
            my_urls = list(UserURL.objects.filter(user=request.user).order_by('-created_at'))
        except Exception:
            my_urls = []
        current = my_urls[0].url if my_urls else ''
        dups = []
        if current:
            try:
                dups = list(UserURL.objects.filter(url__in=_site_variants(current)).exclude(user=request.user))
            except Exception:
                dups = []
        return Response({
            'site_url': current,
            'tenant_id': getattr(user_tenant, 'id', None),
            'duplicates_count': len(dups),
            'duplicates': [{'id': x.id, 'user_id': getattr(x.user, 'id', None), 'url': x.url} for x in dups],
            'ok': len(dups) == 0,
        })


class SiteURLClaimView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            if not profile.tenant:
                # Intentar encontrar tenant existente donde el usuario es admin
                tenant = Tenant.objects.filter(admin=request.user).first()
                if not tenant:
                    # Crear nuevo tenant automáticamente
                    import uuid
                    uid = str(uuid.uuid4())[:8]
                    tenant = Tenant.objects.create(
                        admin=request.user,
                        name=f"Negocio de {request.user.username}",
                        db_alias=f"db_{request.user.id}_{uid}",
                        db_path=f"db_{request.user.id}_{uid}.sqlite3"
                    )
                profile.tenant = tenant
                profile.save(update_fields=['tenant'])
            user_tenant = profile.tenant
        except Exception:
            user_tenant = None

        site = (request.data.get('site_url') or request.data.get('site') or '').strip()
        if not user_tenant:
            # Si aún falla la creación del tenant, permitimos guardar la URL pero avisamos
            # Ojo: Para el funcionamiento completo se requiere tenant.
            # Pero si falló la creación, es mejor devolver error 500 o intentarlo.
            # Por ahora, si no hay tenant, fallamos como antes, pero ya intentamos crearlo.
            return Response({'detail': 'No se pudo asignar un espacio de trabajo (Tenant).'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not site:
            return Response({'detail': 'URL requerida.'}, status=status.HTTP_400_BAD_REQUEST)
            
        variants = _site_variants(site)
        try:
            conflict = UserURL.objects.filter(url__in=variants).exclude(user=request.user).first()
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if conflict:
            return Response({'detail': 'La URL ya está registrada por otro usuario.'}, status=status.HTTP_400_BAD_REQUEST)
        canonical = site[:-1] if site.endswith('/') else site
        try:
            mine = UserURL.objects.filter(user=request.user).order_by('-created_at').first()
            if mine:
                mine.url = canonical
                mine.save(update_fields=['url'])
            else:
                UserURL.objects.create(user=request.user, url=canonical)
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'site_url': canonical, 'tenant_id': getattr(user_tenant, 'id', None)})


class PublicAutoClaimView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        site = (request.data.get('site') or '').strip()
        aid = request.data.get('aid')
        if not site or not aid:
            return Response({'detail': 'site y aid requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from users.models import Tenant
            tenant = Tenant.objects.filter(admin_id=int(aid)).first()
        except Exception:
            tenant = None
        if not tenant:
            return Response({'detail': 'Tenant no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        from django.contrib.auth.models import User as AuthUser
        owner = AuthUser.objects.filter(id=tenant.admin_id).first()
        if not owner:
            return Response({'detail': 'Administrador no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        variants = _site_variants(site)
        try:
            conflict = UserURL.objects.filter(url__in=variants).exclude(user=owner).first()
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if conflict:
            return Response({'detail': 'La URL ya está registrada.'}, status=status.HTTP_400_BAD_REQUEST)
        canonical = site[:-1] if site.endswith('/') else site
        try:
            existing = UserURL.objects.filter(user=owner).order_by('-created_at').first()
            if existing:
                existing.url = canonical
                existing.save(update_fields=['url'])
            else:
                UserURL.objects.create(user=owner, url=canonical)
        except Exception:
            return Response({'detail': 'Servicio no disponible.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'site_url': canonical, 'tenant_id': getattr(tenant, 'id', None)})
