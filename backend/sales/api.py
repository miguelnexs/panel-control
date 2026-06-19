from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from decimal import Decimal
from django.utils import timezone
import random
from django.db.models import Sum, Count
from django.conf import settings
from users.models import UserProfile, Tenant
from users.audit import log_activity
from users.models_tenant_config import TenantActivityLog
from clients.models import Client
from products.models import Product, ProductColor, ProductVariant, ProductSKU
from .models import Sale, SaleItem, OrderNotification, SalePayment
try:
    from cashbox.models import CashSession, CashTransaction
except ImportError:
    CashSession = None
    CashTransaction = None


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
    manual_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)


class SaleCreateSerializer(serializers.Serializer):
    client_id = serializers.IntegerField(required=False)
    client_full_name = serializers.CharField(required=False)
    client_cedula = serializers.CharField(required=False)
    client_email = serializers.EmailField(required=False)
    client_phone = serializers.CharField(required=False, allow_blank=True)
    client_address = serializers.CharField(required=False)
    payment_method = serializers.ChoiceField(choices=['cash', 'transfer', 'mixed'], required=False, default='cash')
    cash_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=Decimal('0.00'))
    transfer_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=Decimal('0.00'))
    change_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=Decimal('0.00'))
    status = serializers.ChoiceField(choices=['pending', 'apartado', 'processing', 'shipped', 'delivered', 'canceled'], required=False, default='pending')
    apartado_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=Decimal('0.00'))
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
        

class SalePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePayment
        fields = '__all__'



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
        payment_method = data.get('payment_method') or 'cash'
        status = data.get('status') or 'pending'
        cash_amount_in = Decimal(str(data.get('cash_amount') or '0'))
        transfer_amount_in = Decimal(str(data.get('transfer_amount') or '0'))
        change_amount_in = Decimal(str(data.get('change_amount') or '0'))
        apartado_amount_in = Decimal(str(data.get('apartado_amount') or '0'))
        # Generate unique order number
        base = timezone.now().strftime('%Y%m%d%H%M%S')
        suffix = f"{random.randint(1000, 9999)}"
        order_number = f"ORD-{base}-{suffix}"
        while Sale.objects.filter(order_number=order_number).exists():
            suffix = f"{random.randint(1000, 9999)}"
            order_number = f"ORD-{base}-{suffix}"
        sale = Sale.objects.create(
            client=client,
            tenant=tenant,
            total_amount=total,
            order_number=order_number,
            status=status,
            payment_method=payment_method,
            cash_amount=Decimal('0.00'),
            transfer_amount=Decimal('0.00'),
            change_amount=Decimal('0.00'),
            apartado_amount=Decimal('0.00'),
            apartado_date=timezone.now() if status == 'apartado' else None,
        )

        for it in data['items']:
            product = Product.objects.filter(id=it['product_id']).first()
            if not product or not product.active:
                return Response({'detail': 'Producto inválido o inactivo'}, status=400)
            qty = int(it['quantity'])
            if qty <= 0:
                return Response({'detail': 'Cantidad inválida'}, status=400)
            if product.sale_price is not None and product.sale_price > 0:
                unit_price = Decimal(str(product.sale_price))
            else:
                unit_price = Decimal(str(product.price))
            variant = None
            color = None
            sku_obj = None
            if it.get('color_id') or it.get('variant_id'):
                sku_obj = ProductSKU.objects.filter(
                    product=product,
                    color_id=it.get('color_id'),
                    variant_id=it.get('variant_id')
                ).first()
                if not sku_obj:
                    # Fallback for old data or simpler products that might only have colors in the old system
                    # but since we're refactoring, we enforce SKU existence.
                    return Response({'detail': 'Combinación de producto no encontrada'}, status=400)
                if sku_obj.stock < qty:
                    return Response({'detail': f'Stock insuficiente para esta combinación ({sku_obj.stock} disponibles)'}, status=400)
                color = sku_obj.color
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

            # Override with manual price if provided
            if it.get('manual_price') is not None:
                unit_price = Decimal(str(it['manual_price']))

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
                product_sku=(sku_obj.sku if sku_obj and sku_obj.sku else (product.sku or '')),
            )
            total += line_total

            # Solo descontar stock si no es un apartado
            if status != 'apartado':
                if sku_obj:
                    sku_obj.stock = int(sku_obj.stock) - qty
                    sku_obj.save(update_fields=['stock'])
                else:
                    product.inventory_qty = int(product.inventory_qty or 0) - qty
                    product.save(update_fields=['inventory_qty'])

        total = total.quantize(Decimal('0.01'))
        expected_total = apartado_amount_in if status == 'apartado' else total

        if payment_method == 'cash':
            # For cash, we store the amount applied to the sale (equal to expected_total) and change separately.
            if cash_amount_in < expected_total:
                return Response({'detail': 'Pago en efectivo insuficiente'}, status=400)
            cash_final = expected_total
            transfer_final = Decimal('0.00')
            change_final = max(Decimal('0.00'), change_amount_in)
        elif payment_method == 'transfer':
            cash_final = Decimal('0.00')
            transfer_final = expected_total
            change_final = Decimal('0.00')
        else:
            # Mixed: if transfer is omitted, infer from expected_total.
            transfer_candidate = transfer_amount_in if transfer_amount_in > 0 else (expected_total - cash_amount_in)
            if cash_amount_in <= 0 or transfer_candidate <= 0:
                return Response({'detail': 'Pago mixto inválido: debe incluir efectivo y transferencia'}, status=400)
            if (cash_amount_in + transfer_candidate).quantize(Decimal('0.01')) != expected_total:
                return Response({'detail': 'Pago mixto inválido: efectivo + transferencia debe ser igual al monto a pagar'}, status=400)
            cash_final = cash_amount_in.quantize(Decimal('0.01'))
            transfer_final = transfer_candidate.quantize(Decimal('0.01'))
            change_final = max(Decimal('0.00'), change_amount_in)

        sale.total_amount = total
        sale.cash_amount = cash_final
        sale.transfer_amount = transfer_final
        sale.change_amount = change_final
        sale.apartado_amount = apartado_amount_in if status == 'apartado' else Decimal('0.00')
        sale.save(update_fields=['total_amount', 'cash_amount', 'transfer_amount', 'change_amount', 'apartado_amount', 'apartado_date'])

        # Registrar pago inicial si es un apartado
        if status == 'apartado' and apartado_amount_in > 0:
            SalePayment.objects.create(
                sale=sale,
                amount=apartado_amount_in,
                payment_method=payment_method if payment_method != 'mixed' else 'cash',
                notes='Abono inicial (Separado)'
            )

        # Register in Cashbox if session is open
        if CashSession and CashTransaction:
            try:
                session = CashSession.objects.filter(tenant=tenant, status='open').first()
                if session:
                    # Cash part
                    if sale.cash_amount > 0:
                        CashTransaction.objects.create(
                            session=session,
                            type='sale',
                            amount=sale.cash_amount,
                            description=f"Venta {sale.order_number} (Efectivo)",
                            sale=sale
                        )
                        session.expected_cash += sale.cash_amount
                    
                    # Transfer part
                    if sale.transfer_amount > 0:
                        CashTransaction.objects.create(
                            session=session,
                            type='transfer_in',
                            amount=sale.transfer_amount,
                            description=f"Venta {sale.order_number} (Transferencia)",
                            sale=sale
                        )
                        session.expected_bank += sale.transfer_amount
                    
                    session.save()
            except Exception as e:
                print(f"Error registering cashbox transaction: {e}")

        try:
            items_meta = []
            for it in data['items']:
                items_meta.append({
                    'product_id': it.get('product_id'),
                    'color_id': it.get('color_id'),
                    'variant_id': it.get('variant_id'),
                    'quantity': it.get('quantity'),
                })
            log_activity(
                tenant=tenant,
                actor=request.user,
                action='sale.create',
                resource_type='sale',
                resource_id=str(sale.id),
                message=f'Nueva venta {sale.order_number}',
                metadata={'order_number': sale.order_number, 'total_amount': str(total), 'items': items_meta, 'client_id': client.id if client else None},
                request=request,
            )
        except Exception:
            pass

        # Create OrderNotification for the dashboard
        try:
            OrderNotification.objects.create(sale=sale, tenant=tenant, read=False)
        except Exception as e:
            print(f"Error creating notification: {e}")

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
            'client': {
                'id': client.id, 
                'full_name': client.full_name, 
                'email': client.email,
                'phone': client.phone,
                'address': client.address,
                'cedula': client.cedula,
                'identification_type': client.identification_type,
                'tax_regime': client.tax_regime,
                'city': client.city,
                'department': client.department
            },
            'total_amount': str(sale.total_amount),
            'payment_method': sale.payment_method,
            'cash_amount': str(sale.cash_amount),
            'transfer_amount': str(sale.transfer_amount),
            'change_amount': str(sale.change_amount),
            'dian_invoice_status': sale.dian_invoice_status,
            'dian_invoice_url': sale.dian_invoice_url,
            'created_at': sale.created_at.isoformat(),
            'order_number': sale.order_number,
            'items': items_out,
        }, status=201)


class SalesPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'


class SalesListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = SalesPagination

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        # Optimized with prefetch_related to load items and their relationships in bulk
        qs = Sale.objects.all().select_related('client').prefetch_related(
            'items__product', 
            'items__color', 
            'items__variant',
            'items__product__category',
            'payments'
        )
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
                        'sku': (si.product_sku if si.product_sku else (p.sku if p else '')),
                        'category_name': (getattr(p.category, 'name', None) if p else None),
                        'image': (abs_url(getattr(p, 'image', None) and p.image.url) if p and getattr(p, 'image', None) else None),
                        'active': (p.active if p else False),
                        'price': str(p.price) if p else '0',
                        'is_sale': p.is_sale if p else False,
                        'sale_price': str(p.sale_price) if p and p.sale_price else None,
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
                'client': {
                    'id': sale.client.id, 
                    'full_name': sale.client.full_name, 
                    'email': sale.client.email,
                    'phone': sale.client.phone,
                    'address': sale.client.address,
                    'cedula': sale.client.cedula,
                    'identification_type': sale.client.identification_type,
                    'tax_regime': sale.client.tax_regime,
                    'city': sale.client.city,
                    'department': sale.client.department
                },
                'total_amount': str(sale.total_amount),
                'payment_method': sale.payment_method,
                'cash_amount': str(sale.cash_amount),
                'transfer_amount': str(sale.transfer_amount),
                'change_amount': str(sale.change_amount),
                'dian_invoice_status': sale.dian_invoice_status,
                'dian_invoice_id': sale.dian_invoice_id,
                'dian_invoice_url': sale.dian_invoice_url,
                'dian_error_message': sale.dian_error_message,
                'apartado_amount': str(sale.apartado_amount),
                'apartado_date': sale.apartado_date.isoformat() if sale.apartado_date else None,
                'created_at': sale.created_at.isoformat(),
                'items_count': sale.items.count(),
                'items': items_out,
                'payments': [
                    {
                        'id': p.id,
                        'amount': str(p.amount),
                        'payment_method': p.payment_method,
                        'notes': p.notes,
                        'created_at': p.created_at.isoformat(),
                    } for p in sale.payments.all()
                ],
                'total_paid': str(sum(p.amount for p in sale.payments.all())),
            }
        if page is not None:
            return self.get_paginated_response([serialize(s) for s in page])
        return Response([serialize(s) for s in queryset])


class SalesStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = _get_user_tenant(request.user)
        if not tenant:
            try:
                role = request.user.profile.role
            except Exception:
                role = 'employee'
            if role == 'super_admin':
                tid = request.query_params.get('tenant_id')
                if tid:
                    tenant = Tenant.objects.filter(id=tid).first()
        qs = Sale.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        now = timezone.now()
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        total_sales = qs.count()
        total_amount = qs.aggregate(s=Sum('total_amount')).get('s') or Decimal('0.00')
        today_sales = qs.filter(created_at__gte=day_start).count()
        today_amount = qs.filter(created_at__gte=day_start).aggregate(s=Sum('total_amount')).get('s') or Decimal('0.00')
        month_sales = qs.filter(created_at__gte=month_start).count()
        
        # Daily sales for chart (last 14 days)
        daily_sales = []
        daily_amounts = []
        daily_labels = []
        days_map = {'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié', 'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb', 'Sun': 'Dom'}
        for i in range(13, -1, -1):
            d = now - timezone.timedelta(days=i)
            start = d.replace(hour=0, minute=0, second=0, microsecond=0)
            end = d.replace(hour=23, minute=59, second=59, microsecond=999999)
            sub_qs = qs.filter(created_at__range=(start, end))
            count = sub_qs.count()
            daily_sales.append(count)
            amount = sub_qs.aggregate(s=Sum('total_amount')).get('s') or 0
            daily_amounts.append(float(amount))
            en_day = d.strftime('%a')
            daily_labels.append(f"{days_map.get(en_day, en_day)} {d.day}")

        # Trend: last 7 days vs previous 7 days
        last7_start = (now - timezone.timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
        prev7_start = (now - timezone.timedelta(days=13)).replace(hour=0, minute=0, second=0, microsecond=0)
        prev7_end = (now - timezone.timedelta(days=7)).replace(hour=23, minute=59, second=59, microsecond=999999)
        last7_qs = qs.filter(created_at__gte=last7_start)
        prev7_qs = qs.filter(created_at__range=(prev7_start, prev7_end))
        last7_count = last7_qs.count()
        prev7_count = prev7_qs.count()
        last7_amount = last7_qs.aggregate(s=Sum('total_amount')).get('s') or Decimal('0.00')
        prev7_amount = prev7_qs.aggregate(s=Sum('total_amount')).get('s') or Decimal('0.00')
        sales_trend_pct = None
        amount_trend_pct = None
        try:
            if prev7_count > 0:
                sales_trend_pct = float((last7_count - prev7_count) / prev7_count * 100)
            else:
                sales_trend_pct = 100.0 if last7_count > 0 else 0.0
        except Exception:
            sales_trend_pct = None
        try:
            prev7_amount_f = float(prev7_amount)
            last7_amount_f = float(last7_amount)
            if prev7_amount_f > 0:
                amount_trend_pct = float((last7_amount_f - prev7_amount_f) / prev7_amount_f * 100)
            else:
                amount_trend_pct = 100.0 if last7_amount_f > 0 else 0.0
        except Exception:
            amount_trend_pct = None

        # Top products
        top_products = []
        best_product = None
        if tenant:
            top_qs = (
                SaleItem.objects.filter(sale__tenant=tenant, product__isnull=False)
                .values('product_id', 'product__name', 'product__image')
                .annotate(qty=Sum('quantity'), amount=Sum('line_total'))
                .order_by('-qty')[:10]
            )
            for tp in top_qs:
                row = {
                    'product_id': tp['product_id'],
                    'name': tp['product__name'] or 'Producto',
                    'image': str(tp['product__image'] or ''),
                    'qty': int(tp['qty'] or 0),
                    'amount': str(tp['amount'] or '0'),
                }
                top_products.append(row)
            if top_products:
                best_product = top_products[0]
            # Include deleted products (no FK) grouped by snapshot name
            orphan_qs = (
                SaleItem.objects.filter(sale__tenant=tenant, product__isnull=True)
                .values('product_name')
                .annotate(qty=Sum('quantity'), amount=Sum('line_total'))
                .order_by('-qty')[:5]
            )
            for tp in orphan_qs:
                top_products.append({
                    'product_id': None,
                    'name': tp['product_name'] or 'Producto desconocido',
                    'image': '',
                    'qty': int(tp['qty'] or 0),
                    'amount': str(tp['amount'] or '0'),
                })

        # Top seller (by audit logs)
        top_seller = None
        if tenant:
            try:
                seller = (
                    TenantActivityLog.objects.filter(tenant=tenant, action='sale.create').exclude(actor_role__in=['admin', 'super_admin', ''])
                    .values('actor_username')
                    .annotate(c=Count('id'))
                    .order_by('-c')
                    .first()
                )
                if seller and seller.get('actor_username'):
                    top_seller = {'username': seller['actor_username'], 'sales': int(seller['c'] or 0)}
            except Exception:
                top_seller = None

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
            'today_amount': str(today_amount),
            'month_sales': month_sales,
            'trend': {
                'last7_sales': last7_count,
                'prev7_sales': prev7_count,
                'sales_pct': sales_trend_pct,
                'last7_amount': str(last7_amount),
                'prev7_amount': str(prev7_amount),
                'amount_pct': amount_trend_pct,
            },
            'status_counts': status_counts,
            'chart_data': daily_sales,
            'chart_amounts': daily_amounts,
            'chart_labels': daily_labels,
            'top_products': top_products,
            'best_product': best_product,
            'top_seller': top_seller,
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
            raise ValidationError({'status': f'Estado inválido. Opciones válidas: {", ".join(valid.keys())}'})
        sale.status = new_status
        sale.save(update_fields=['status'])
        return Response({'id': sale.id, 'status': sale.status})

    def delete(self, request, pk):
        sale = Sale.objects.filter(id=pk).first()
        if not sale:
            from rest_framework.exceptions import NotFound
            raise NotFound('Pedido no encontrado')
        tenant = _get_user_tenant(request.user)
        if tenant and sale.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede eliminar pedidos de otro tenant.')

        # Sync with Cashbox: Delete associated transactions to revert balance
        if CashTransaction:
            transactions = CashTransaction.objects.filter(sale=sale)
            for tx in transactions:
                session = tx.session
                if tx.type == 'sale':
                    session.expected_cash -= tx.amount
                elif tx.type == 'transfer_in':
                    session.expected_bank -= tx.amount
                session.save()
                tx.delete()

        sale.delete()
        return Response({'ok': True}, status=204)


class SalesNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            tenant = _get_user_tenant(request.user)
            qs = OrderNotification.objects.all()
            if tenant:
                qs = qs.filter(tenant=tenant)
            unread = qs.filter(read=False).count()
            return Response({'unread': unread})
        except Exception as e:
            # Si hay error (ej: tabla no existe), devolver 0 en lugar de 500
            return Response({'unread': 0})


class SalesNotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        tenant = _get_user_tenant(request.user)
        qs = OrderNotification.objects.all()
        if tenant:
            qs = qs.filter(tenant=tenant)
        qs.update(read=True)
        return Response({'ok': True})


class SalePaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    @transaction.atomic
    def post(self, request, pk):
        sale = Sale.objects.filter(id=pk).first()
        if not sale:
            from rest_framework.exceptions import NotFound
            raise NotFound('Venta no encontrada')
        
        tenant = _get_user_tenant(request.user)
        if tenant and sale.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No puede agregar pagos a esta venta.')

        amount = Decimal(str(request.data.get('amount', 0)))
        payment_method = request.data.get('payment_method', 'cash')
        notes = request.data.get('notes', '')

        if amount <= 0:
            return Response({'detail': 'El monto debe ser mayor a 0'}, status=400)

        total_paid_before = sum(p.amount for p in sale.payments.all())
        remaining = sale.total_amount - total_paid_before

        if amount > remaining:
             return Response({'detail': f'El monto supera el saldo pendiente ({remaining})'}, status=400)

        payment = SalePayment.objects.create(
            sale=sale,
            amount=amount,
            payment_method=payment_method,
            notes=notes
        )

        # Register in Cashbox
        if CashSession and CashTransaction:
            try:
                session = CashSession.objects.filter(tenant=tenant, status='open').first()
                if session:
                    CashTransaction.objects.create(
                        session=session,
                        type='sale' if payment_method == 'cash' else 'transfer_in',
                        amount=amount,
                        description=f"Abono Venta {sale.order_number}",
                        sale=sale
                    )
                    if payment_method == 'cash':
                        session.expected_cash += amount
                    else:
                        session.expected_bank += amount
                    session.save()
            except Exception as e:
                print(f"Error registering cashbox transaction: {e}")

        # Check if fully paid
        total_paid_after = total_paid_before + amount
        if total_paid_after >= sale.total_amount:
            # Update status and DISCOUNT STOCK
            if sale.status == 'apartado':
                sale.status = 'delivered' # O 'processing'? El usuario dice "hasta que se termine de pagar"
                sale.save(update_fields=['status'])
                
                # Descontar stock ahora que se pagó completo
                for it in sale.items.all():
                    sku_obj = ProductSKU.objects.filter(
                        product=it.product,
                        color=it.color,
                        variant=it.variant
                    ).first()
                    
                    if sku_obj:
                        sku_obj.stock = int(sku_obj.stock) - it.quantity
                        sku_obj.save(update_fields=['stock'])
                    elif it.product:
                        it.product.inventory_qty = int(it.product.inventory_qty or 0) - it.quantity
                        it.product.save(update_fields=['inventory_qty'])

        return Response({
            'id': payment.id,
            'total_paid': str(total_paid_after),
            'remaining': str(sale.total_amount - total_paid_after),
            'status': sale.status
        })

class EmitDianInvoiceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        from .alegra_sync import AlegraAPI
        
        sale = Sale.objects.filter(id=pk).first()
        if not sale:
            from rest_framework.exceptions import NotFound
            raise NotFound('Venta no encontrada')
            
        tenant = _get_user_tenant(request.user)
        if tenant and sale.tenant != tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tiene permiso para facturar esta venta.')
            
        if sale.dian_invoice_status == 'emitted':
            return Response({'detail': 'La factura ya ha sido emitida previamente.'}, status=400)
            
        # Update client if new fiscal data is provided in the request
        data = request.data
        if 'identification_type' in data or 'tax_regime' in data or 'city' in data or 'cedula' in data:
            client = sale.client
            if 'cedula' in data: client.cedula = data['cedula']
            if 'identification_type' in data: client.identification_type = data['identification_type']
            if 'tax_regime' in data: client.tax_regime = data['tax_regime']
            if 'city' in data: client.city = data['city']
            if 'department' in data: client.department = data.get('department', '')
            if 'address' in data: client.address = data['address']
            client.save()
            
        try:
            api = AlegraAPI(tenant=tenant)
            res = api.create_dian_invoice(sale)
            
            # Extract ID and public URL (if available)
            sale.dian_invoice_id = str(res.get('id', ''))
            sale.dian_invoice_status = 'emitted'
            sale.dian_invoice_url = res.get('publicUrl', '')
            sale.dian_error_message = ''
            sale.save(update_fields=['dian_invoice_id', 'dian_invoice_status', 'dian_invoice_url', 'dian_error_message'])
            
            return Response({'detail': 'Factura electrónica emitida exitosamente.', 'invoice_id': sale.dian_invoice_id, 'public_url': sale.dian_invoice_url})
            
        except Exception as e:
            sale.dian_invoice_status = 'error'
            sale.dian_error_message = str(e)
            sale.save(update_fields=['dian_invoice_status', 'dian_error_message'])
            return Response({'detail': str(e)}, status=400)

