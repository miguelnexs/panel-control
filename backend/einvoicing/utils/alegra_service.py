import requests
import base64
import json
from ..models import AlegraCompanyConfig, AlegraMapping, ElectronicInvoice

class AlegraService:
    BASE_URL = "https://api.alegra.com/api/v1/"

    def __init__(self, tenant):
        self.tenant = tenant
        try:
            self.config = AlegraCompanyConfig.objects.get(tenant=tenant)
        except AlegraCompanyConfig.DoesNotExist:
            raise Exception("Alegra no está configurado para esta empresa")
            
        self.auth_header = self._get_auth_header()

    def _get_auth_header(self):
        # Alegra uses Basic Auth with email:token
        credentials = f"{self.config.user_email}:{self.config.api_key}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return {"Authorization": f"Basic {encoded}"}

    def _get_mapping(self, type, internal_id):
        return AlegraMapping.objects.filter(
            tenant=self.tenant, type=type, internal_id=internal_id
        ).first()

    def _save_mapping(self, type, internal_id, alegra_id):
        AlegraMapping.objects.create(
            tenant=self.tenant, type=type, internal_id=internal_id, alegra_id=alegra_id
        )

    def sync_client(self, client):
        # Check if exists
        mapping = self._get_mapping('client', client.id)
        if mapping:
            return mapping.alegra_id

        # Create in Alegra
        # Note: In a real app, you should first SEARCH by identification to avoid duplicates
        # if the DB mapping is missing but it exists in Alegra.
        
        payload = {
            "name": client.full_name,
            "identification": client.cedula,
            "email": client.email if client.email else "noemail@example.com",
            "phonePrimary": client.phone,
            "address": {
                "address": client.address
            },
            # Defaults
            "kind": "person", 
        }
        
        # Search first to be safe
        search_url = f"{self.BASE_URL}contacts?identification={client.cedula}"
        search_res = requests.get(search_url, headers=self.auth_header)
        if search_res.status_code == 200 and len(search_res.json()) > 0:
            alegra_id = str(search_res.json()[0]['id'])
            self._save_mapping('client', client.id, alegra_id)
            return alegra_id

        # Create
        response = requests.post(f"{self.BASE_URL}contacts", json=payload, headers=self.auth_header)
        if response.status_code in [200, 201]:
            data = response.json()
            alegra_id = str(data['id'])
            self._save_mapping('client', client.id, alegra_id)
            return alegra_id
        else:
            raise Exception(f"Error creando cliente en Alegra: {response.text}")

    def sync_product(self, product):
        mapping = self._get_mapping('product', product.id)
        if mapping:
            return mapping.alegra_id

        # Search first by SKU (Reference)
        if product.sku:
            search_url = f"{self.BASE_URL}items?reference={product.sku}"
            search_res = requests.get(search_url, headers=self.auth_header)
            if search_res.status_code == 200 and len(search_res.json()) > 0:
                alegra_id = str(search_res.json()[0]['id'])
                self._save_mapping('product', product.id, alegra_id)
                return alegra_id

        payload = {
            "name": product.name,
            "price": [{"price": float(product.price)}], 
            "reference": product.sku if product.sku else f"INT-{product.id}",
            "description": product.description,
            "inventory": {
                "unit": "unit", # Default
            }
        }

        response = requests.post(f"{self.BASE_URL}items", json=payload, headers=self.auth_header)
        if response.status_code in [200, 201]:
            data = response.json()
            alegra_id = str(data['id'])
            self._save_mapping('product', product.id, alegra_id)
            return alegra_id
        else:
             raise Exception(f"Error creando producto en Alegra: {response.text}")

    def emit_invoice(self, sale, electronic_invoice):
        # Ensure client and products are synced
        try:
            client_alegra_id = self.sync_client(sale.client)
            
            items = []
            for item in sale.items.all():
                if item.product:
                     prod_id = self.sync_product(item.product)
                     items.append({
                         "id": int(prod_id),
                         "price": float(item.unit_price),
                         "quantity": item.quantity,
                     })
                else:
                     # Generic item handling if product is deleted or null
                     items.append({
                         "name": item.product_name or "Item Genérico",
                         "price": float(item.unit_price),
                         "quantity": item.quantity,
                     })

            payload = {
                "date": sale.created_at.strftime("%Y-%m-%d"),
                "dueDate": sale.created_at.strftime("%Y-%m-%d"),
                "client": int(client_alegra_id),
                "items": items,
                "paymentMethod": "cash", # Defaulting to cash for MVP
                "status": "open", 
                "stamp": {"generateStamp": True}, # Important for Electronic Invoicing
            }

            response = requests.post(f"{self.BASE_URL}invoices", json=payload, headers=self.auth_header)
            
            if response.status_code in [200, 201]:
                data = response.json()
                # Update ElectronicInvoice
                electronic_invoice.external_id = str(data['id'])
                electronic_invoice.status = 'sent' # Sent to Alegra
                
                # Check if it has stamp immediately (sometimes async)
                # For now we assume success
                if 'stamp' in data and data['stamp']:
                     electronic_invoice.cufe = data['stamp'].get('cufe')
                     electronic_invoice.status = 'accepted' # DIAN accepted via Alegra
                
                electronic_invoice.save()
                return data
            else:
                error_msg = response.text
                electronic_invoice.status = 'error'
                electronic_invoice.external_status_message = error_msg
                electronic_invoice.save()
                raise Exception(f"Error emitiendo factura en Alegra: {error_msg}")
                
        except Exception as e:
            electronic_invoice.status = 'error'
            electronic_invoice.external_status_message = str(e)
            electronic_invoice.save()
            raise e
