import stripe
import mercadopago
from decimal import Decimal
from django.conf import settings
from webconfig.models import PaymentMethod
from users.utils.crypto import decrypt_text

class PaymentProcessor:
    def __init__(self, payment_method: PaymentMethod):
        self.method = payment_method
        self.config = payment_method.extra_config or {}
        self.public_key = self.config.get('public_key')
        encrypted_private = self.config.get('private_key')
        self.private_key = decrypt_text(encrypted_private) if encrypted_private else None
        
        if not self.private_key:
            raise ValueError(f"Private key not configured for {payment_method.provider}")

    def create_payment_intent(self, sale, return_url=None, cancel_url=None):
        """
        Creates a payment intent/preference/session depending on the provider.
        Returns a dict with 'checkout_url' or 'client_secret' and 'payment_id'.
        """
        provider = (self.method.provider or '').lower()
        
        if 'stripe' in provider:
            return self._create_stripe_session(sale, return_url, cancel_url)
        elif 'mercadopago' in provider:
            return self._create_mercadopago_preference(sale, return_url, cancel_url)
        elif 'paypal' in provider:
            return self._create_paypal_order(sale, return_url, cancel_url)
        else:
            raise ValueError(f"Provider {self.method.provider} not supported")

    def _create_stripe_session(self, sale, return_url, cancel_url):
        stripe.api_key = self.private_key
        
        line_items = []
        for item in sale.items.all():
            line_items.append({
                'price_data': {
                    'currency': 'cop', # Assuming COP, should use tenant currency
                    'product_data': {
                        'name': item.product_name,
                    },
                    'unit_amount': int(item.unit_price * 100), # Stripe expects cents
                },
                'quantity': item.quantity,
            })

        # Fallback if no items (e.g. manual sale)
        if not line_items:
             line_items.append({
                'price_data': {
                    'currency': 'cop',
                    'product_data': {
                        'name': f"Order {sale.order_number}",
                    },
                    'unit_amount': int(sale.total_amount * 100),
                },
                'quantity': 1,
            })

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=return_url + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=cancel_url,
            client_reference_id=str(sale.id),
            metadata={
                'sale_id': sale.id,
                'order_number': sale.order_number
            }
        )
        
        return {
            'checkout_url': session.url,
            'payment_id': session.id,
            'provider': 'stripe'
        }

    def _create_mercadopago_preference(self, sale, return_url, cancel_url):
        sdk = mercadopago.SDK(self.private_key)
        
        items = []
        for item in sale.items.all():
            items.append({
                "title": item.product_name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "currency_id": "COP"
            })
            
        if not items:
            items.append({
                "title": f"Order {sale.order_number}",
                "quantity": 1,
                "unit_price": float(sale.total_amount),
                "currency_id": "COP"
            })

        preference_data = {
            "items": items,
            "back_urls": {
                "success": return_url,
                "failure": cancel_url,
                "pending": return_url
            },
            "auto_return": "approved",
            "external_reference": str(sale.id),
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        return {
            'checkout_url': preference["init_point"], # or sandbox_init_point
            'payment_id': preference["id"],
            'provider': 'mercadopago'
        }

    def _create_paypal_order(self, sale, return_url, cancel_url):
        # Placeholder for PayPal logic
        # Would require requests to PayPal API using Client ID and Secret (Private Key)
        # to get access token, then create order.
        return {
            'checkout_url': f"{return_url}?mock_paypal=true",
            'payment_id': f"PAYPAL-{sale.id}",
            'provider': 'paypal'
        }
