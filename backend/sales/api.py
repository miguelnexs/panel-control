from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from decimal import Decimal
from django.utils import timezone
import random
from django.db.models import Sum, Count
from users.models import UserProfile, Tenant
from clients.models import Client
from products.models import Product, ProductColor, ProductVariant
from .models import Sale, SaleItem, OrderNotification


def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()


class SaleItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    color_id = serializers.IntegerField(required=False, allow_null=True)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)


class SaleCreateSerializer(serializers.Serializer):
    client_id = serializers.IntegerField(required=False)
    client_full_name = serializers.CharField(required=False)
    client_cedula = serializers.CharField(required=False)
    client_email = serializers.EmailField(required=False)
    client_phone = serializers.CharField(required=False, allow_blank=True)
    client_address = serializers.CharField(required=False)
    items = SaleItemInputSerializer(many=True)

    def validate(self, attrs):
        items = attrs.get('items') or []
        if not items:
            raise serializers.ValidationError({'items': 'Debe incluir al menos un producto'})
        
        # Validar teléfono si se proporciona
        phone = attrs.get('client_phone')
        if phone:
            import re
            if not re.match(r'^\d{7,15}$', phone):
                raise serializers.ValidationError({'client_phone': 'El teléfono debe contener entre 7 y 15 dígitos.'})
                
        return attrs


class SaleView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    @transaction.atomic
    def post(self, request):
        ser = SaleCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        tenant = _get_user_tenant(request.user)

        # Verify plan limits
        if tenant and tenant.subscription_plan:
            plan = tenant.subscription_plan
            if plan.max_transactions_per_month != -1:
                now = timezone.now()
                month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                current_sales = Sale.objects.filter(tenant=tenant, created_at__gte=month_start).exclude(status='canceled').count()
                if current_sales >= plan.max_transactions_per_month:
                     return Response({'detail': f'Ha alcanzado el límite de transacciones mensuales de su plan ({plan.max_transactions_per_month}). Actualice su plan para continuar.'}, status=403)

        client = None
        if data.get('client_id'):
            client = Client.objects.filter(id=data['client_id']).first()
        else:
            if not data.get('client_full_name') or not data.get('client_cedula') or not data.get('client_email') or not data.get('client_address'):
                return Response({'detail': 'Datos de cliente incompletos'}, status=400)
            client = Client.objects.create(
                full_name=data['client_full_name'],
                cedula=data['client_cedula'],
                email=data['client_email'],
                phone=data.get('client_phone', ''),
                address=data['client_address'],
                tenant=tenant,
            )

        total = Decimal('0.00')
        # Generate unique order number
        base = timezone.now().strftime('%Y%m%d%H%M%S')
        suffix = f"{random.randint(1000, 9999)}"
        order_number = f"ORD-{base}-{suffix}"
        while Sale.objects.filter(order_number=order_number).exists():
            suffix = f"{random.randint(1000, 9999)}"
            order_number = f"ORD-{base}-{suffix}"
        sale = Sale.objects.create(client=client, tenant=tenant, total_amount=total, order_number=order_number)

        for it in data['items']:
            product = Product.objects.filter(id=it['product_id']).first()
            if not product or not product.active:
                return Response({'detail': 'Producto inválido o inactivo'}, status=400)
            qty = int(it['quantity'])
            if qty <= 0:
                return Response({'detail': 'Cantidad inválida'}, status=400)
            unit_price = Decimal(str(product.price))
            variant = None
            color = None
            if it.get('color_id'):
                color = ProductColor.objects.filter(id=it['color_id'], product=product).first()
                if not color:
                    return Response({'detail': 'Color inválido'}, status=400)
                if color.stock < qty:
                    return Response({'detail': 'Stock insuficiente para el color'}, status=400)
            else:
                if (product.inventory_qty or 0) < qty:
                    return Response({'detail': 'Stock insuficiente del producto'}, status=400)
            if it.get('variant_id'):
                variant = ProductVariant.objects.filter(id=it['variant_id'], product=product).first()
                if not variant:
                    return Response({'detail': 'Variante inválida'}, status=400)
                try:
                    unit_price = unit_price + Decimal(str(variant.extra_price))
                except Exception:
                    pass

            line_total = unit_price * qty
            SaleItem.objects.create(
                sale=sale,
                product=product,
                color=color,
                variant=variant,
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
                product_name=product.name or '',
                product_sku=product.sku or '',
            )
            total += line_total

            if color:
                color.stock = int(color.stock) - qty
                color.save(update_fields=['stock'])
            else:
                product.inventory_qty = int(product.inventory_qty or 0) - qty
                product.save(update_fields=['inventory_qty'])

        sale.total_amount = total
        sale.save(update_fields=['total_amount'])

        # Send WhatsApp confirmation if configured
        try:
            from .whatsapp_service import WhatsAppService
            ws = WhatsAppService(tenant=tenant)
            ws.send_order_confirmation(sale)
        except Exception:
            pass

        items_out = []
        for si in sale.items.select_related('product', 'color', 'variant'):
            items_out.append({
                'product': si.product.name if si.product else si.product_name,
                'color': si.color.name if si.color else None,
                'variant': si.variant.name if si.variant else None,
                'variant_extra': (str(si.variant.extra_price) if si.variant else None),
                'quantity': si.quantity,
                'unit_price': str(si.unit_price),
                'line_total': str(si.line_total),
            })
        return Response({
            'id': sale.id,
            'client': {'id': client.id, 'full_name': client.full_name},
            'total_amount': str(sale.total_amount),
            'created_at': sale.created_at.isoformat(),
            'order_number': sale.order_number,
            'items': items_out,
        }, status=201)


class SalesPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class SalesListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = SalesPagination

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        qs = Sale.objects.all().select_related('client')
        if tenant:
            qs = qs.filter(tenant=tenant)
        status = self.request.query_params.get('status')
        if status in dict(Sale.STATUS_CHOICES):
            qs = qs.filter(status=status)
        return qs.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        def abs_url(path):
            try:
                if path and isinstance(path, str):
                    if path.startswith('http://') or path.startswith('https://'):
                        return path
                    if path.startswith('/'):
                        return request.build_absolute_uri(path)
                    return request.build_absolute_uri('/' + path)
            except Exception:
                return path
            return path
        def serialize(sale):
            items_out = []
            for si in sale.items.select_related('product', 'color', 'variant', 'product__category').all():
                p = si.product
                c = si.color
                v = si.variant
                items_out.append({
                    'product': {
                        'id': p.id if p else None,
                        'name': (p.name if p else si.product_name),
                        'description': (p.description if p else ''),
                        'sku': (p.sku if p else si.product_sku),
                        'category_name': (getattr(p.category, 'name', None) if p else None),
                        'image': (abs_url(getattr(p, 'image', None) and p.image.url) if p and getattr(p, 'image', None) else None),
                        'active': (p.active if p else False),
                    },
                    'color': ({
                        'id': c.id,
                        'name': c.name,
                        'hex': c.hex,
                    } if c else None),
                    'variant': ({
                        'id': v.id,
                        'name': v.name,
                        'extra_price': str(v.extra_price),
                    } if v else None),
                    'quantity': si.quantity,
                    'unit_price': str(si.unit_price),
                    'line_total': str(si.line_total),
                })
            dian_info = None
            if hasattr(sale, 'electronic_invoice'):
                ei = sale.electronic_invoice
                dian_info = {
                    'status': ei.status,
                    'cufe': ei.cufe,
                    'created_at': ei.created_at.isoformat(),
                    'xml_url': abs_url(ei.xml_file.url) if ei.xml_file else None,
                    'pdf_url': abs_url(ei.pdf_file.url) if ei.pdf_file else None,
                }

            return {
                'id': sale.id,
                'order_number': sale.order_number,
                'status': sale.status,
                'dian': dian_info,
                'client': {'id': sale.client.id, 'full_name': sale.client.full_name},
                'total_amount': str(sale.total_amount),
                'created_at': sale.created_at.isoformat(),
                'items_count': sale.items.count(),
                'items': items_out,
            }
        if page is not None:
            return self.get_paginated_response([serialize(s) for s in page])
        return Response([serialize(s) for s in queryset])


class SalesStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = _get_user_tenant(request.user)
        qs = Sale.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        now = timezone.now()
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        total_sales = qs.count()
        total_amount = qs.aggregate(s=Sum('total_amount')).get('s') or Decimal('0.00')
        today_sales = qs.filter(created_at__gte=day_start).count()
        month_sales = qs.filter(created_at__gte=month_start).count()
        status_counts = {
            'pending': qs.filter(status='pending').count(),
            'shipped': qs.filter(status='shipped').count(),
            'delivered': qs.filter(status='delivered').count(),
            'canceled': qs.filter(status='canceled').count(),
        }
        return Response({
            'total_sales': total_sales,
            'total_amount': str(total_amount),
            'today_sales': today_sales,
            'month_sales': month_sales,
            'status_counts': status_counts,
        })


class SalesStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def patch(self, request, pk):
        sale = Sale.objects.filter(id=pk).first()
        if not sale:
            from rest_framework.exceptions import NotFound
            raise NotFound('Pedido no encontrado')
        tenant = _get_user_tenant(request.user)
        if tenant and sale.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede modificar pedidos de otro tenant.')
        new_status = (request.data or {}).get('status')
        valid = dict(Sale.STATUS_CHOICES)
        if new_status not in valid:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'status': 'Estado inválido. Use pending, shipped, delivered, canceled.'})
        sale.status = new_status
        sale.save(update_fields=['status'])
        return Response({'id': sale.id, 'status': sale.status})


class SalesNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        tenant = _get_user_tenant(request.user)
        qs = OrderNotification.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        unread = qs.filter(read=False).count()
        return Response({'unread': unread})


class SalesNotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        tenant = _get_user_tenant(request.user)
        qs = OrderNotification.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        qs.update(read=True)
        return Response({'ok': True})
