from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from .models import Sale, SaleItem
from webconfig.models import PaymentMethod, UserURL
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
            aid = request.data.get('aid')
            site = request.data.get('site')
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
                # Fallback
                ws = AppSettings.objects.first()
                if ws: tenant = ws.tenant

            if not tenant:
                return Response({'detail': 'Store configuration not found'}, status=404)

            # 2. Obtener Método de Pago (MercadoPago)
            mp_method = PaymentMethod.objects.filter(tenant=tenant, provider='mercadopago', active=True).first()
            if not mp_method:
                return Response({'detail': 'Mercado Pago not active for this store'}, status=400)
            
            config = mp_method.extra_config or {}
            encrypted_private = config.get('private_key')
            access_token = decrypt_text(encrypted_private) if encrypted_private else None
            
            if not access_token:
                return Response({'detail': 'Payment configuration invalid (missing key)'}, status=500)

            # 3. Datos
            items_data = request.data.get('items', [])
            total_amount = float(request.data.get('total_amount', 0))
            customer = request.data.get('customer', {})
            mp_payment_data = request.data.get('payment_data', {})

            if not mp_payment_data:
                 return Response({'detail': 'Missing payment data from MercadoPago'}, status=400)

            # 4. Crear Sale
            sale = Sale.objects.create(
                tenant=tenant,
                status='pending',
                total_amount=total_amount,
                customer_name=customer.get('fullName', 'Guest'),
                customer_email=customer.get('email', ''),
                customer_phone=customer.get('phone', ''),
                payment_method=mp_method,
                created_at=timezone.now()
            )

            for item in items_data:
                SaleItem.objects.create(
                    sale=sale,
                    product_name=item.get('name', 'Product'),
                    quantity=item.get('quantity', 1),
                    unit_price=item.get('price', 0),
                    total_price=item.get('price', 0) * item.get('quantity', 1)
                )

            # 5. Procesar Pago
            sdk = mercadopago.SDK(access_token)

            payment_body = {
                "transaction_amount": total_amount,
                "token": mp_payment_data.get("token"),
                "description": f"Order #{sale.order_number}",
                "installments": int(mp_payment_data.get("installments", 1)),
                "payment_method_id": mp_payment_data.get("payment_method_id"),
                "payer": {
                    "email": mp_payment_data.get("payer", {}).get("email") or customer.get('email'),
                },
                "external_reference": str(sale.id),
                "binary_mode": True
            }

            if mp_payment_data.get("issuer_id"):
                payment_body["issuer_id"] = int(mp_payment_data.get("issuer_id"))

            # Añadir IP para seguridad
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
            if ip == '127.0.0.1' or ip == 'localhost': ip = '127.0.0.1'
            
            payment_body["additional_info"] = {
                "ip_address": ip,
                "items": items_data
            }

            payment_response = sdk.payment().create(payment_body)
            payment = payment_response["response"]

            status_detail = payment.get("status_detail") or payment.get("message")
            
            if payment.get("status") == "approved":
                sale.status = 'completed'
                sale.payment_status = 'paid'
                sale.transaction_id = str(payment.get("id"))
                sale.save()
                return Response({"status": "approved", "id": payment["id"], "sale_id": sale.id})
            
            elif payment.get("status") in ["pending", "in_process"]:
                sale.transaction_id = str(payment.get("id"))
                sale.save()
                return Response({"status": payment.get("status"), "id": payment["id"], "sale_id": sale.id, "detail": status_detail})
            
            else:
                sale.status = 'cancelled'
                sale.save()
                return Response({
                    "status": "rejected", 
                    "detail": status_detail, 
                    "error": f"Payment rejected: {status_detail}",
                    "mp_response": payment 
                }, status=400)

        except Exception as e:
            return Response({'detail': str(e)}, status=500)
