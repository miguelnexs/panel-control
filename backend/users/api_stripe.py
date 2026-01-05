import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models_subscription import SubscriptionPlan
from .models import Tenant

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_code = request.data.get('plan_code')
        if not plan_code:
            return Response({'error': 'Plan code is required'}, status=status.HTTP_400_BAD_REQUEST)

        plan = get_object_or_404(SubscriptionPlan, code=plan_code)

        if plan.price <= 0:
            return Response({'error': 'This plan is free, no payment required'}, status=status.HTTP_400_BAD_REQUEST)

        tenant = request.user.tenant
        
        # Check if Stripe is configured
        if settings.STRIPE_SECRET_KEY.startswith('sk_test_placeholder') or not settings.STRIPE_SECRET_KEY:
            return Response(
                {'error': 'Stripe is not configured. Please set STRIPE_SECRET_KEY in backend/.env'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            # Create or retrieve Stripe Customer
            if not tenant.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=tenant.name,
                    metadata={
                        'tenant_id': tenant.id,
                        'user_id': request.user.id
                    }
                )
                tenant.stripe_customer_id = customer.id
                tenant.save()
            else:
                # Optional: Update customer info if needed
                pass

            # Create Checkout Session
            checkout_session = stripe.checkout.Session.create(
                customer=tenant.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'cop',
                            'product_data': {
                                'name': plan.name,
                                'description': plan.description,
                            },
                            'unit_amount': int(plan.price * 100),  # Stripe uses cents
                            'recurring': {
                                'interval': 'month',
                            },
                        },
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=settings.FRONTEND_URL + '/download?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=settings.FRONTEND_URL + '/precios',
                metadata={
                    'plan_code': plan.code,
                    'tenant_id': tenant.id
                }
            )

            return Response({'url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            # Fulfill the purchase...
            self.handle_checkout_session(session)

        return Response(status=status.HTTP_200_OK)

    def handle_checkout_session(self, session):
        tenant_id = session.get('metadata', {}).get('tenant_id')
        plan_code = session.get('metadata', {}).get('plan_code')
        
        if tenant_id and plan_code:
            try:
                tenant = Tenant.objects.get(id=tenant_id)
                plan = SubscriptionPlan.objects.get(code=plan_code)
                tenant.subscription_plan = plan
                tenant.stripe_subscription_id = session.get('subscription')
                tenant.save()
            except Tenant.DoesNotExist:
                pass
            except SubscriptionPlan.DoesNotExist:
                pass
