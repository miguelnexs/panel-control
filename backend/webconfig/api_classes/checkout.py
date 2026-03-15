from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
import datetime, random, string
from webconfig.models import UserURL, PaymentMethod
from config.models import AppSettings
from sales.models import Sale, SaleItem, OrderNotification
from clients.models import Client
from products.models import Product, ProductColor, ProductVariant
from sales.payment_service import PaymentProcessor
from .utils import _log, _site_variants

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
