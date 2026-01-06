import mercadopago
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models_subscription import SubscriptionPlan
from .models import Tenant
import logging

logger = logging.getLogger(__name__)

class CreatePreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_code = request.data.get('plan_code')
        if not plan_code:
            return Response({'error': 'Plan code is required'}, status=status.HTTP_400_BAD_REQUEST)

        plan = get_object_or_404(SubscriptionPlan, code=plan_code)

        if plan.price <= 0:
            return Response({'error': 'This plan is free, no payment required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if Mercado Pago is configured
        if not settings.MERCADOPAGO_ACCESS_TOKEN or settings.MERCADOPAGO_ACCESS_TOKEN.startswith('TEST-placeholder'):
                return Response(
                    {'error': 'Mercado Pago is not configured. Please set MERCADOPAGO_ACCESS_TOKEN in backend/.env'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        tenant = request.user.tenant
        
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8080').rstrip('/')
        
        # Fix: Mercado Pago valida que la URL sea válida. 'localhost' a veces falla con auto_return.
        # Reemplazamos localhost por 127.0.0.1 para intentar pasar la validación.
        if 'localhost' in frontend_url:
             frontend_url = frontend_url.replace('localhost', '127.0.0.1')
             
        logger.info(f"Using FRONTEND_URL: {frontend_url}")
        
        try:
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            
            # Crear preferencia de pago (suscripción mensual simulada con recurrencia o pago único)
            # Para suscripciones reales se usa /preapproval, pero requiere configuración avanzada.
            # Usaremos Preferencias con "auto_return" para simular el flujo simple inicial.
            
            preference_data = {
                "items": [
                    {
                        "id": plan.code,
                        "title": f"Suscripción {plan.name}",
                        "quantity": 1,
                        "currency_id": "COP",
                        "unit_price": float(plan.price)
                    }
                ],
                "payer": {
                    "name": request.user.first_name,
                    "surname": request.user.last_name,
                    "email": request.user.email,
                },
                "back_urls": {
                    "success": f"{frontend_url}/payment",
                    "failure": f"{frontend_url}/payment",
                    "pending": f"{frontend_url}/payment"
                },
                "auto_return": "approved",
                "payment_methods": {
                    "excluded_payment_types": [],
                    "excluded_payment_methods": [],
                    "installments": 12  # Permitir hasta 12 cuotas
                },
                "external_reference": str(tenant.id),
                "statement_descriptor": "LOCALIX ADMIN",
                "binary_mode": True # Solo aceptar pagos aprobados o rechazados
            }
            
            logger.info(f"Creating preference with data: {preference_data}")

            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]
        
            if "init_point" not in preference:
                    logger.error(f"Error creating preference: {preference}")
                    return Response({'error': 'Error creating payment preference'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'url': preference["init_point"]})
            
        except Exception as e:
            logger.error(f"MercadoPago Error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            logger.info(">>> INICIO PROCESO DE PAGO <<<")
            logger.info(f"Datos recibidos: {request.data}")

            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            
            payment_data = request.data
            plan_code = payment_data.get('plan_code')
            plan = get_object_or_404(SubscriptionPlan, code=plan_code)
            
            logger.info(f"Procesando pago para plan: {plan.code}, Precio DB: {plan.price}")

            # Construir objeto de pago para MP - CORREGIDO
            payment_body = {
                "transaction_amount": float(plan.price),
                "token": payment_data.get("token"),
                "description": f"Suscripción {plan.name}",
                "installments": int(payment_data.get("installments", 1)),
                "payment_method_id": payment_data.get("payment_method_id"),
                "payer": {
                    "email": payment_data.get("payer", {}).get("email") or request.user.email,
                },
                "external_reference": str(request.user.tenant.id),
                "statement_descriptor": "LOCALIXADMIN",  # Max 22 chars, sin espacios
                "binary_mode": True  # Importante para evitar pagos pendientes
            }

            # AGREGAR MONEDA - ES NECESARIO
            # payment_body["currency_id"] = "COP"  # Para pagos directos se usa currency_id
            
            # Verificar si estamos usando credenciales de prueba
            mp_token = settings.MERCADOPAGO_ACCESS_TOKEN
            if mp_token and mp_token.startswith('TEST-'):
                logger.info("Usando credenciales de Sandbox (TEST)")
                
                # EVITAR RECHAZO POR AUTO-PAGO (Self-payment):
                # En Sandbox, si el email del pagador es igual al del dueño de las credenciales, falla.
                # Generamos un email aleatorio para pruebas.
                import time
                payment_body["payer"]["email"] = f"test_user_{int(time.time())}@test.com"
                
                # En Sandbox, forzar identificación genérica para evitar validaciones estrictas
                if "identification" not in payment_body["payer"]:
                    payment_body["payer"]["identification"] = {}
                
                payment_body["payer"]["identification"]["type"] = "CC"
                payment_body["payer"]["identification"]["number"] = "1020304050"
                
                # Agregar nombre y apellido genérico para evitar rechazos por falta de datos
                payment_body["payer"]["first_name"] = "Test"
                payment_body["payer"]["last_name"] = "User"
                
                # Eliminar issuer_id en Sandbox para dejar que MP lo infiera del token
                if "issuer_id" in payment_body:
                    del payment_body["issuer_id"]
                    
                logger.info(f"Modo Sandbox: Email, Doc, Nombre Payer modificados. Issuer ID removido.")

                # Para sandbox, agregar datos específicos
                payment_body["additional_info"] = {
                    "items": [
                        {
                            "id": plan.code,
                            "title": f"Suscripción {plan.name}",
                            "quantity": 1,
                            "unit_price": float(plan.price)
                        }
                    ]
                }
            
            # Agregar info basica del payer si viene
            if payment_data.get("payer", {}).get("identification"):
                 payment_body["payer"]["identification"] = payment_data.get("payer", {}).get("identification")
            
            # En Sandbox a veces fallan datos extra complejos, mantenerlo simple
            # Solo agregar issuer si viene explícito
            if payment_data.get("issuer_id") and payment_data.get("issuer_id") != 'null':
                 try:
                    payment_body["issuer_id"] = int(payment_data.get("issuer_id"))
                 except:
                    pass

            # Agregar transaction_details (necesario para PSE - financial_institution)
            if payment_data.get("transaction_details"):
                payment_body["transaction_details"] = payment_data.get("transaction_details")
            
            # Agregar additional_info (IP address, etc) si no existe
            if "additional_info" not in payment_body:
                payment_body["additional_info"] = {}

            if payment_data.get("additional_info"):
                payment_body["additional_info"].update(payment_data.get("additional_info"))
            
            # Agregar IP Address (Requerido para PSE)
            if not payment_body["additional_info"].get("ip_address"):
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0]
                else:
                    ip = request.META.get('REMOTE_ADDR')
                
                # Si estamos en local, MP requiere una IP válida formato IPv4
                if ip == '127.0.0.1' or ip == 'localhost':
                     ip = '127.0.0.1' # MP lo acepta en sandbox
                
                payment_body["additional_info"]["ip_address"] = ip

            # Configuración específica para PSE
            if payment_data.get("payment_method_id") == "pse":
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8080').rstrip('/')
                # Ajuste localhost para validación MP si es necesario
                if 'localhost' in frontend_url:
                     frontend_url = frontend_url.replace('localhost', '127.0.0.1')
                
                payment_body["callback_url"] = f"{frontend_url}/payment" # Volver a la misma página para ver estado
                
                # Asegurar tipo de persona y documento
                if not payment_body["payer"].get("entity_type"):
                     payment_body["payer"]["entity_type"] = "individual"
                
                if not payment_body["payer"].get("identification", {}).get("type"):
                     # Intentar inferir o usar default CC si no viene
                     pass 

            request_options = mercadopago.config.RequestOptions()
            request_options.custom_headers = {
                'x-idempotency-key': str(payment_data.get("token")) # Evitar duplicados
            }

            # Asegurar que el payer tenga email (obligatorio para MP)
            if "payer" not in payment_body or not isinstance(payment_body["payer"], dict):
                payment_body["payer"] = {}
            
            # Asegurar email si viene vacío
            if not payment_body["payer"].get("email"):
                payment_body["payer"]["email"] = request.user.email
            
            # Asegurar que el payer tenga al menos nombre y apellido
            if not payment_body["payer"].get("first_name"):
                payment_body["payer"]["first_name"] = request.user.first_name or "Test"
            if not payment_body["payer"].get("last_name"):
                payment_body["payer"]["last_name"] = request.user.last_name or "User"
            
            logger.info(f"Body final a enviar a MP: {payment_body}")

            # Diagnóstico de credenciales
            token = settings.MERCADOPAGO_ACCESS_TOKEN
            prefix = token.split('-')[0] if token else "None"
            logger.info(f"Usando Token con prefijo: {prefix}...")
            
            # USAR TARJETA DE PRUEBA CORRECTA PARA SANDBOX
            # Solo para debugging en sandbox
            if payment_body.get("payment_method_id") == "visa" or payment_body.get("payment_method_id") == "master":
                logger.info(f"Usando tarjeta de crédito en Sandbox - método: {payment_body.get('payment_method_id')}")
                logger.info(f"Token recibido del frontend: {payment_body.get('token')}")

            payment_response = sdk.payment().create(payment_body, request_options)
            payment = payment_response["response"]
            
            logger.info(f"Respuesta de MP: {payment}")

            if payment.get("status") == "approved":
                # Activar suscripción inmediatamente
                tenant = request.user.tenant
                # tenant.has_paid = True # No existe en modelo
                tenant.subscription_plan = plan
                # tenant.subscription_status = 'active' # No existe en modelo
                tenant.stripe_subscription_id = str(payment["id"]) # Usamos este campo para indicar pago
                tenant.save()
                
                return Response({"status": "approved", "id": payment["id"]})
            
            elif payment.get("status") == "pending" or payment.get("status") == "in_process":
                # Pagos offline (Efecty, etc) o en proceso
                response_data = {
                    "status": payment.get("status"),
                    "status_detail": payment.get("status_detail"),
                    "id": payment["id"],
                    "payment_method_id": payment.get("payment_method_id")
                }
                
                # Intentar obtener URL del ticket (para Efecty/offline) o Banco (PSE)
                if "transaction_details" in payment and "external_resource_url" in payment["transaction_details"]:
                    if payment.get("payment_method_id") == "pse":
                        response_data["redirect_url"] = payment["transaction_details"]["external_resource_url"]
                    else:
                        response_data["ticket_url"] = payment["transaction_details"]["external_resource_url"]
                    
                # Intentar obtener datos para mostrar QR o instrucciones
                if "point_of_interaction" in payment:
                    response_data["point_of_interaction"] = payment["point_of_interaction"]

                return Response(response_data)
                
            else:
                # Loggear respuesta completa de error de MP para debugging
                logger.error(f"Pago rechazado por MP: {payment}")
                
                status_detail = payment.get("status_detail")
                if not status_detail:
                    # Si no hay status_detail, buscar mensaje de error técnico
                    status_detail = payment.get("message")
                    if payment.get("cause"):
                         causes = [c.get("description") or c.get("code") for c in payment.get("cause", [])]
                         status_detail = f"{status_detail}: {', '.join(map(str, causes))}"
                
                if not status_detail:
                    status_detail = "Error desconocido"
                
                # Mensaje amigable para errores comunes en Sandbox
                if "cc_rejected_other_reason" in str(status_detail):
                    status_detail += " (Posible causa: Credenciales de Frontend/Backend no coinciden o tarjeta inválida para Sandbox)"

                return Response({
                    "status": payment.get("status"), 
                    "detail": status_detail,
                    "error": f"Pago no aprobado: {status_detail}",
                    "mp_response": payment # Devolver info para debug frontend
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Payment Error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class MercadoPagoWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        topic = request.query_params.get('topic') or request.query_params.get('type')
        id = request.query_params.get('id') or request.query_params.get('data.id')

        if topic == 'payment':
            try:
                sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
                payment_info = sdk.payment().get(id)
                payment = payment_info["response"]
                
                if payment['status'] == 'approved':
                    tenant_id = payment['external_reference']
                    # Activar suscripción
                    try:
                        tenant = Tenant.objects.get(id=tenant_id)
                        # Aquí deberíamos mapear el item ID al plan real, por ahora asumimos medio
                        # En una implementación real, extraer el plan del 'additional_info' o items
                        plan_code = payment['additional_info']['items'][0]['id']
                        plan = SubscriptionPlan.objects.get(code=plan_code)
                        
                        tenant.subscription_plan = plan
                        tenant.stripe_subscription_id = f"mp_{id}" # Guardamos ID de MP
                        tenant.save()
                        logger.info(f"Subscription activated for tenant {tenant_id}")
                    except Tenant.DoesNotExist:
                        logger.error(f"Tenant {tenant_id} not found")
                        
            except Exception as e:
                logger.error(f"Webhook Error: {str(e)}")
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)
