import requests
import zipfile
import io
import base64
from django.conf import settings

class DianService:
    # URLs
    URL_HABILITACION = "https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc?wsdl"
    URL_PRODUCCION = "https://vpfe.dian.gov.co/WcfDianCustomerServices.svc?wsdl"
    
    def __init__(self, environment='2'): # 1=Prod, 2=Test
        self.url = self.URL_PRODUCCION if environment == '1' else self.URL_HABILITACION
        
    def send_bill(self, file_name, xml_content):
        # 1. Zip the XML
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            zip_file.writestr(file_name, xml_content)
        
        zip_content = zip_buffer.getvalue()
        zip_base64 = base64.b64encode(zip_content).decode('utf-8')
        
        # 2. Build SOAP Envelope
        # NOTE: Needs actual TestSetId for testing
        soap_env = f"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wcf="http://wcf.dian.colombia">
   <soapenv:Header/>
   <soapenv:Body>
      <wcf:SendBillAsync>
         <wcf:fileName>{file_name}.zip</wcf:fileName>
         <wcf:contentFile>{zip_base64}</wcf:contentFile>
      </wcf:SendBillAsync>
   </soapenv:Body>
</soapenv:Envelope>"""

        # 3. Send Request
        headers = {'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'http://wcf.dian.colombia/IDianCustomerServices/SendBillAsync'}
        
        try:
            response = requests.post(self.url, data=soap_env, headers=headers, verify=True) # Set verify=False if cert issues
            return {
                'status_code': response.status_code,
                'content': response.text
            }
        except Exception as e:
            return {'error': str(e)}
