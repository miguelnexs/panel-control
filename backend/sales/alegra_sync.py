import requests
import base64
import logging
from config.models import AppSettings
from users.utils.crypto import decrypt_text

logger = logging.getLogger(__name__)

class AlegraAPI:
    def __init__(self, tenant=None):
        if tenant:
            ws = AppSettings.objects.filter(tenant=tenant).first()
        else:
            ws = AppSettings.objects.first()
            
        if not ws or not ws.alegra_config:
            raise Exception("Alegra no está configurado.")
            
        email = ws.alegra_config.get('email')
        token_encrypted = ws.alegra_config.get('token')
        
        if not email or not token_encrypted:
            raise Exception("Credenciales de Alegra incompletas.")
            
        try:
            token = decrypt_text(token_encrypted)
        except Exception:
            raise Exception("No se pudo descifrar el token de Alegra.")
            
        auth_string = f"{email}:{token}"
        auth_base64 = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
        
        self.headers = {
            'Authorization': f'Basic {auth_base64}',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        self.base_url = 'https://api.alegra.com/api/v1'

    def _request(self, method, endpoint, **kwargs):
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        response = requests.request(method, url, headers=self.headers, timeout=15, **kwargs)
        if not response.ok:
            try:
                error_data = response.json()
                if 'error' in error_data and isinstance(error_data['error'], dict) and 'message' in error_data['error']:
                    error_msg = f"Alegra: {error_data['error']['message']}"
                elif 'message' in error_data:
                    error_msg = f"Alegra: {error_data['message']}"
                else:
                    error_msg = f"Alegra API Error ({response.status_code}): {response.text}"
            except Exception:
                error_msg = f"Alegra API Error ({response.status_code}): {response.text}"
            
            logger.error(error_msg)
            raise Exception(error_msg)
        return response.json()

    def sync_client(self, client_instance):
        """Busca el cliente en Alegra por cédula. Si no existe, lo crea."""
        cedula = client_instance.cedula
        if not cedula:
            raise Exception("El cliente debe tener una identificación (Cédula/NIT) para facturar.")
            
        # 1. Buscar cliente
        search_res = self._request('GET', f'/contacts?query={cedula}')
        for contact in search_res:
            if str(contact.get('identification', '')) == str(cedula):
                return contact['id']

        # 2. Crear cliente si no existe
        identification_type = client_instance.identification_type or 'CC'
        # Split name for nameObject
        name_parts = (client_instance.full_name or "Sin Nombre").strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "Apellido"
        
        raw_regime = (client_instance.tax_regime or "SIMPLIFIED_REGIME").upper()
        if "SIMPLIFICADO" in raw_regime:
            alegra_regime = "SIMPLIFIED_REGIME"
        elif "COMUN" in raw_regime or "COMÚN" in raw_regime:
            alegra_regime = "COMMON_REGIME"
        elif "ORDINARIO" in raw_regime:
            alegra_regime = "ORDINARY_REGIME"
        else:
            alegra_regime = raw_regime if raw_regime in ["SIMPLIFIED_REGIME", "COMMON_REGIME", "ORDINARY_REGIME"] else "SIMPLIFIED_REGIME"

        payload = {
            "nameObject": {
                "firstName": first_name,
                "lastName": last_name
            },
            "identificationObject": {
                "type": identification_type, 
                "number": str(cedula)
            },
            "kindOfPerson": "PERSON_ENTITY",
            "regime": alegra_regime,
            "email": client_instance.email or None,
            "phonePrimary": client_instance.phone or None,
            "address": {
                "address": client_instance.address or "No registrada",
                "city": client_instance.city or "Bogotá",
            },
            "type": ["client"]
        }
            
        res = self._request('POST', '/contacts', json=payload)
        return res['id']

    def _get_or_create_generic_item(self):
        """Asegura que exista un ítem genérico para poder facturar sin sincronizar todo el inventario."""
        # Buscar ítem genérico
        res = self._request('GET', '/items?query=Venta General')
        for it in res:
            if it.get('name') == 'Venta General':
                return it['id']
                
        # Si no existe, crearlo
        payload = {
            "name": "Venta General",
            "price": 0
        }
        res_create = self._request('POST', '/items', json=payload)
        return res_create['id']

    def create_dian_invoice(self, sale_instance):
        """Emite la factura electrónica en Alegra para una venta específica."""
        # 1. Sincronizar cliente
        alegra_client_id = self.sync_client(sale_instance.client)

        # 2. Obtener ID del ítem genérico
        generic_item_id = self._get_or_create_generic_item()

        # 3. Construir ítems (Usamos un ítem por cada línea de la venta)
        items = []
        for item in sale_instance.items.all():
            items.append({
                "id": generic_item_id,
                "name": item.product_name or "Producto",
                "price": float(item.unit_price),
                "quantity": int(item.quantity)
            })

        if not items:
            raise Exception("La venta no tiene ítems.")

        # 4. Payload de la factura
        # Omitimos paymentForm y paymentMethod para que Alegra use los valores por defecto 
        # (o los asigne automáticamente según los términos y la configuración de cuenta).
        payload = {
            "date": sale_instance.created_at.strftime('%Y-%m-%d'),
            "dueDate": sale_instance.created_at.strftime('%Y-%m-%d'),
            "client": {"id": alegra_client_id},
            "items": items,
            "stamp": {
                "generateStamp": True # Requerimiento principal para DIAN
            }
        }

        # 5. Enviar a Alegra
        res = self._request('POST', '/invoices', json=payload)
        
        return res
