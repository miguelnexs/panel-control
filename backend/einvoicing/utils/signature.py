import base64
import hashlib
from lxml import etree
from signxml import XMLSigner, XMLVerifier

class InvoiceSigner:
    def __init__(self, p12_path, p12_password):
        self.p12_path = p12_path
        self.p12_password = p12_password
        
    def sign(self, xml_bytes):
        # Load the certificate (Simplified for MVP - assuming we extract key/cert from P12)
        # In a real impl, we use OpenSSL or cryptography to load P12
        from cryptography.hazmat.primitives.serialization import pkcs12
        from cryptography.hazmat.primitives import serialization
        
        with open(self.p12_path, "rb") as f:
            p12_data = f.read()
            
        p12 = pkcs12.load_key_and_certificates(p12_data, self.p12_password.encode())
        key = p12[0]
        cert = p12[1]
        
        # Serialize key and cert for XMLSigner
        key_pem = key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        cert_pem = cert.public_bytes(serialization.Encoding.PEM)
        
        # Sign using XAdES-BES (Enveloped)
        # DIAN specific signature placement is usually in UBLExtensions
        # This generic signer signs the root. We might need to adjust XPath.
        
        signer = XMLSigner(
            method=XMLSigner.Method.ENVELOPED,
            signature_algorithm="rsa-sha256",
            digest_algorithm="sha256",
            c14n_algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
        )
        
        root = etree.fromstring(xml_bytes)
        signed_root = signer.sign(root, key=key_pem, cert=cert_pem)
        
        return etree.tostring(signed_root, encoding='UTF-8', xml_declaration=True)
