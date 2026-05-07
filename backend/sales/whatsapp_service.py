import requests
from config.models import AppSettings
from users.utils.crypto import decrypt_text

class WhatsAppService:
    def __init__(self, tenant=None):
        self.tenant = tenant
        self.settings = self._get_settings()
        self.config = self.settings.whatsapp_config if self.settings else {}

    def _get_settings(self):
        qs = AppSettings.objects.all()
        if self.tenant:
            qs = qs.filter(tenant=self.tenant)
        return qs.first()

    def send_template(self, to_phone, template_name, language='es', components=None):
        """
        Sends a WhatsApp template message using Meta Cloud API.
        """
        if not self.config:
            return {'error': 'No WhatsApp configuration found'}
            
        access_token = self.config.get('access_token')
        phone_number_id = self.config.get('phone_number_id')
        
        if access_token:
             # Decrypt if it looks encrypted (helper handles checking usually, 
             # but here we assume it is if stored via admin)
             try:
                 decrypted = decrypt_text(access_token)
                 if decrypted:
                     access_token = decrypted
             except Exception:
                 pass # Maybe not encrypted or failed

        if not access_token or not phone_number_id:
             return {'error': 'Missing WhatsApp credentials'}

        url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Simple number formatting
        to_phone = str(to_phone).replace('+', '').replace(' ', '')
        
        data = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language},
                "components": components or []
            }
        }
        
        try:
            resp = requests.post(url, json=data, headers=headers)
            return resp.json()
        except Exception as e:
            return {'error': str(e)}

    def send_order_confirmation(self, sale):
        if not sale.client.phone and not sale.client.full_name: 
             # Client might not have phone stored directly if it was a quick sale, 
             # but SaleCreateSerializer requires it? 
             # Sale model has client FK. Client model has phone?
             return
        
        # Check Client model for phone
        phone = getattr(sale.client, 'phone', None)
        # Or maybe it's in address or email? 
        # SaleCreateSerializer has client_full_name etc, but phone?
        # Let's assume Client model has phone.
        
        if not phone:
            return {'error': 'Client has no phone number'}

        # Example template: order_confirmation(order_number, total)
        components = [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": sale.order_number},
                    {"type": "text", "text": str(sale.total_amount)},
                ]
            }
        ]
        return self.send_template(phone, "order_confirmation", components=components)
