from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from .models import Sale, SaleItem
from webconfig.models import PaymentMethod, UserURL
from products.models import Product, ProductColor, ProductVariant
from users.models import Tenant
from .payment_service import PaymentProcessor
from config.models import AppSettings
from users.utils.crypto import decrypt_text
import mercadopago
from django.utils import timezone

def _site_variants(site):
    if not site: return []
    s = site.lower().strip().rstrip('/')
    return [s, s + '/', s.replace('https://', 'http://'), s.replace('http://', 'https://')]

class PaymentInitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        sale_id = request.data.get('sale_id')
        method_id = request.data.get('payment_method_id')
        return_url = request.data.get('return_url')
        cancel_url = request.data.get('cancel_url')

        if not all([sale_id, method_id, return_url, cancel_url]):
            return Response({'detail': 'Missing parameters (sale_id, payment_method_id, return_url, cancel_url)'}, status=status.HTTP_400_BAD_REQUEST)

        sale = get_object_or_404(Sale, id=sale_id)
        
        # Check tenant permission if applicable
        # Assuming request.user has profile with tenant
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant
            if user_tenant and sale.tenant != user_tenant:
                return Response({'detail': 'Not found'}, status=404)
        except Exception:
            pass

        method = get_object_or_404(PaymentMethod, id=method_id)
        
        # Verify method belongs to same tenant or is public/global (if logic allows)
        # For now, strict tenant check if method has tenant
        if method.tenant and method.tenant != sale.tenant:
             return Response({'detail': 'Invalid payment method for this tenant'}, status=400)

        if not method.active:
             return Response({'detail': 'Payment method inactive'}, status=400)

        try:
            processor = PaymentProcessor(method)
            result = processor.create_payment_intent(sale, return_url, cancel_url)
            return Response(result)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)

class PublicSalePaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # 1. Resolver Tenant
            aid = request.data.get('aid') or request.GET.get('aid')
            site = request.data.get('site') or request.GET.get('site')
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
                return Response({'detail': 'Store configuration not found'}, status=404)

            # 2. Obtener Método de Pago (MercadoPago)
            mp_method = PaymentMethod.objects.filter(tenant=tenant, provider='mercadopago', active=True).first()
            if not mp_method:
                return Response({'detail': 'Mercado Pago no está activo para esta tienda'}, status=400)
            
            config = mp_method.extra_config or {}
            encrypted_private = config.get('private_key')
            access_token = decrypt_text(encrypted_private) if encrypted_private else None
            
            if not access_token:
                return Response({'detail': 'Configuración de pago inválida (falta clave)'}, status=500)

            # 3. Datos
            items_data = request.data.get('items', [])
            total_amount = float(request.data.get('total_amount', 0))
            customer = request.data.get('customer', {})
            mp_payment_data = request.data.get('payment_data', {})

            if not mp_payment_data:
                 return Response({'detail': 'Faltan datos de pago de MercadoPago'}, status=400)

            # Robust data extraction for MP Bricks (might be wrapped in formData)
            if 'formData' in mp_payment_data:
                mp_payment_data = mp_payment_data['formData']

            # 4. Crear/Obtener Cliente y Sale
            from clients.models import Client
            import datetime
            import random
            import string
            from decimal import Decimal

            full_name = customer.get('full_name') or customer.get('fullName') or 'Guest'
            email = customer.get('email') or 'no-reply@example.com'
            cedula = customer.get('cedula') or '000000'
            phone = customer.get('phone') or ''
            address = customer.get('address') or ''

            client_obj, created = Client.objects.get_or_create(
                tenant=tenant,
                cedula=cedula,
                defaults={
                    'full_name': full_name,
                    'email': email,
                    'phone': phone,
                    'address': address
                }
            )
            
            # Update client info if it already existed but new info is provided
            if not created:
                updated = False
                if full_name and client_obj.full_name != full_name:
                    client_obj.full_name = full_name
                    updated = True
                if email and client_obj.email != email:
                    client_obj.email = email
                    updated = True
                if phone and client_obj.phone != phone:
                    client_obj.phone = phone
                    updated = True
                if address and client_obj.address != address:
                    client_obj.address = address
                    updated = True
                if updated:
                    client_obj.save()

            # Generar número de orden único
            base = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            order_number = f'ORD-{base}-{suffix}'

            sale = Sale.objects.create(
                tenant=tenant,
                client=client_obj,
                status='pending',
                total_amount=Decimal(str(total_amount)),
                order_number=order_number
            )

            deducted_items = []
            try:
                for item in items_data:
                    p_id = item.get('id')
                    c_id = item.get('color_id')
                    v_id = item.get('variant_id')
                    qty = int(item.get('quantity', 1))

                    product = Product.objects.filter(id=p_id).first()
                    if not product or not product.active:
                        raise Exception(f"Producto {item.get('name', 'Product')} no disponible")

                    color = None
                    if c_id:
                        color = ProductColor.objects.filter(id=c_id, product=product).first()
                        if not color:
                            raise Exception(f"Color no disponible para {product.name}")
                        if color.stock < qty:
                            raise Exception(f"Stock insuficiente para {product.name} (color: {color.name})")
                    else:
                        if (product.inventory_qty or 0) < qty:
                            raise Exception(f"Stock insuficiente para {product.name}")

                    variant = None
                    if v_id:
                        variant = ProductVariant.objects.filter(id=v_id, product=product).first()

                    # Deduct stock
                    if color:
                        color.stock = int(color.stock) - qty
                        color.save(update_fields=['stock'])
                        deducted_items.append({'type': 'color', 'obj': color, 'qty': qty})
                    else:
                        product.inventory_qty = int(product.inventory_qty or 0) - qty
                        product.save(update_fields=['inventory_qty'])
                        deducted_items.append({'type': 'product', 'obj': product, 'qty': qty})

                    SaleItem.objects.create(
                        sale=sale,
                        product=product,
                        color=color,
                        variant=variant,
                        product_name=product.name,
                        product_sku=product.sku or '',
                        quantity=qty,
                        unit_price=Decimal(str(item.get('price', 0))),
                        line_total=Decimal(str(item.get('price', 0) * qty))
                    )
            except Exception as e:
                # Restore stock if something failed during creation
                for di in deducted_items:
                    if di['type'] == 'color':
                        di['obj'].stock = int(di['obj'].stock) + di['qty']
                        di['obj'].save(update_fields=['stock'])
                    else:
                        di['obj'].inventory_qty = int(di['obj'].inventory_qty or 0) + di['qty']
                        di['obj'].save(update_fields=['inventory_qty'])
                sale.status = 'canceled'
                sale.save()
                return Response({'detail': str(e)}, status=400)

            # 5. Procesar Pago
            sdk = mercadopago.SDK(access_token)

            payment_body = {
                "transaction_amount": total_amount,
                "token": mp_payment_data.get("token"),
                "description": f"Orden {sale.order_number}",
                "installments": int(mp_payment_data.get("installments", 1)),
                "payment_method_id": mp_payment_data.get("payment_method_id"),
                "payer": {
                    "email": mp_payment_data.get("payer", {}).get("email") or email,
                },
                "external_reference": str(sale.id),
                "binary_mode": True
            }

            if mp_payment_data.get("issuer_id"):
                payment_body["issuer_id"] = int(mp_payment_data.get("issuer_id"))

            # Añadir IP para seguridad
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
            if ip == '127.0.0.1' or ip == 'localhost' or ':' in str(ip): 
                ip = '127.0.0.1'
            
            payment_body["additional_info"] = {
                "ip_address": ip,
                "items": [{"title": i.get('name'), "quantity": i.get('quantity'), "unit_price": float(i.get('price'))} for i in items_data]
            }

            payment_response = sdk.payment().create(payment_body)
            payment = payment_response["response"]

            def restore_stock():
                for di in deducted_items:
                    if di['type'] == 'color':
                        di['obj'].stock = int(di['obj'].stock) + di['qty']
                        di['obj'].save(update_fields=['stock'])
                    else:
                        di['obj'].inventory_qty = int(di['obj'].inventory_qty or 0) + di['qty']
                        di['obj'].save(update_fields=['inventory_qty'])

            if payment_response["status"] >= 400:
                sale.status = 'canceled'
                sale.save()
                restore_stock()
                return Response({
                    "status": "error",
                    "detail": payment.get("message", "Error en Mercado Pago"),
                    "mp_response": payment
                }, status=400)

            status_detail = payment.get("status_detail") or payment.get("message")
            
            if payment.get("status") == "approved":
                sale.status = 'pending' # 'completed' would be better but let's stick to STATUS_CHOICES
                sale.payment_id = str(payment.get("id"))
                sale.save()
                
                # Create notification for the merchant
                try:
                    from .models import OrderNotification
                    OrderNotification.objects.create(sale=sale, tenant=tenant, read=False)
                except Exception as e:
                    print(f"Error creating notification: {e}")

                return Response({
                    "status": "approved", 
                    "id": payment["id"], 
                    "sale_id": sale.id,
                    "order_number": sale.order_number
                })
            
            elif payment.get("status") in ["pending", "in_process"]:
                sale.payment_id = str(payment.get("id"))
                sale.save()

                # Create notification for the merchant even if pending
                try:
                    from .models import OrderNotification
                    OrderNotification.objects.create(sale=sale, tenant=tenant, read=False)
                except Exception as e:
                    print(f"Error creating notification: {e}")

                return Response({
                    "status": payment.get("status"), 
                    "id": payment["id"], 
                    "sale_id": sale.id, 
                    "order_number": sale.order_number,
                    "detail": status_detail
                })
            
            else:
                sale.status = 'canceled'
                sale.save()
                restore_stock()
                return Response({
                    "status": "rejected", 
                    "detail": status_detail, 
                    "error": f"Pago rechazado: {status_detail}",
                    "mp_response": payment 
                }, status=400)

        except Exception as e:
            return Response({'detail': str(e)}, status=500)
