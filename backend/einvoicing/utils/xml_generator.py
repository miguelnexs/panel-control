from lxml import etree
import uuid
from datetime import datetime
from django.utils import timezone
from einvoicing.models import DianClientInfo

# Namespaces UBL 2.1
NSMAP = {
    'cac': "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    'cbc': "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    'ds': "http://www.w3.org/2000/09/xmldsig#",
    'ext': "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
    'sts': "dian:gov:co:facturaelectronica:Structures-2-1",
    'xades': "http://uri.etsi.org/01903/v1.3.2#",
    'xades141': "http://uri.etsi.org/01903/v1.4.1#",
    'xsi': "http://www.w3.org/2001/XMLSchema-instance",
}

class InvoiceBuilder:
    def __init__(self, sale, dian_config, resolution, electronic_invoice):
        self.sale = sale
        self.config = dian_config
        self.resolution = resolution
        self.invoice = electronic_invoice
        self.root = None
        
    def build(self):
        # Create root element
        self.root = etree.Element("{urn:oasis:names:specification:ubl:schema:xsd:Invoice-2}Invoice", nsmap=NSMAP)
        
        # 1. Extensions (Signature placeholder)
        self._add_extensions()
        
        # 2. UBL Version
        self._add_text('cbc:UBLVersionID', 'UBL 2.1')
        self._add_text('cbc:CustomizationID', '10') # 10 = Estándar
        self._add_text('cbc:ProfileID', 'DIAN 2.1: Factura Electrónica de Venta')
        self._add_text('cbc:ProfileExecutionID', self.config.environment) # 1=Prod, 2=Test
        
        # 3. Invoice ID
        invoice_id = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}ID")
        invoice_id.text = self.sale.order_number
        
        # 4. CUFE
        cufe_elem = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}UUID", schemeName="CUFE-SHA384")
        cufe_elem.text = self.invoice.cufe
        
        # 5. Issue Date/Time
        # DIAN requires local time usually, but UTC is safer. Let's use local tenant time or UTC-5
        now_col = timezone.localtime(timezone.now())
        self._add_text('cbc:IssueDate', now_col.strftime('%Y-%m-%d'))
        self._add_text('cbc:IssueTime', now_col.strftime('%H:%M:%S') + '-05:00')
        
        # 6. Type Code
        self._add_text('cbc:InvoiceTypeCode', '01') # 01 = Factura de Venta
        
        # 7. Note
        self._add_text('cbc:Note', f"Factura generada por software propio - {self.sale.tenant.admin.username}")
        
        # 8. Currency
        self._add_text('cbc:DocumentCurrencyCode', 'COP')
        
        # 9. Line Count
        self._add_text('cbc:LineCountNumeric', str(self.sale.items.count()))
        
        # 10. Billing Period (Optional but good)
        period = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}InvoicePeriod")
        etree.SubElement(period, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}StartDate").text = now_col.strftime('%Y-%m-%d')
        etree.SubElement(period, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}EndDate").text = now_col.strftime('%Y-%m-%d')
        
        # 11. AccountingSupplierParty (Emisor)
        self._add_supplier()
        
        # 12. AccountingCustomerParty (Adquirente)
        self._add_customer()
        
        # 13. PaymentMeans
        self._add_payment_means()
        
        # 14. TaxTotal
        self._add_tax_totals()
        
        # 15. LegalMonetaryTotal
        self._add_legal_monetary_total()
        
        # 16. InvoiceLine
        self._add_invoice_lines()
        
        return etree.tostring(self.root, pretty_print=True, xml_declaration=True, encoding='UTF-8')

    def _add_text(self, tag, text):
        prefix, name = tag.split(':')
        ns = NSMAP[prefix]
        elem = etree.SubElement(self.root, f"{{{ns}}}{name}")
        elem.text = text
        return elem

    def _add_extensions(self):
        exts = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2}UBLExtensions")
        # Extension for Signature
        ext_sig = etree.SubElement(exts, "{urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2}UBLExtension")
        etree.SubElement(ext_sig, "{urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2}ExtensionContent")
        # Placeholder for DIAN extensions (QR, etc) if needed
        
    def _add_supplier(self):
        supplier = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}AccountingSupplierParty")
        etree.SubElement(supplier, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}AdditionalAccountID").text = "1" # 1 = Juridica usually
        party = etree.SubElement(supplier, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}Party")
        
        # PartyTaxScheme (NIT)
        tax_scheme = etree.SubElement(party, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}PartyTaxScheme")
        etree.SubElement(tax_scheme, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}RegistrationName").text = self.config.tenant.admin.first_name or "Company Name"
        co_id = etree.SubElement(tax_scheme, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}CompanyID", schemeAgencyID="195", schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)", schemeName="31")
        co_id.text = self.config.nit
        co_id.set("schemeID", self.config.dv)
        
        ts = etree.SubElement(tax_scheme, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}TaxScheme")
        etree.SubElement(ts, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}ID").text = "01"
        etree.SubElement(ts, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}Name").text = "IVA"
        
    def _add_customer(self):
        customer = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}AccountingCustomerParty")
        etree.SubElement(customer, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}AdditionalAccountID").text = "2" # 2 = Natural usually
        party = etree.SubElement(customer, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}Party")
        
        dian_info = getattr(self.sale.client, 'dian_info', None)
        
        # PartyTaxScheme
        tax_scheme = etree.SubElement(party, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}PartyTaxScheme")
        etree.SubElement(tax_scheme, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}RegistrationName").text = self.sale.client.full_name
        
        # Default to consumer final (222222222222) if no info
        client_nit = dian_info.client.cedula if dian_info else "222222222222"
        scheme_id = dian_info.document_type if dian_info else "13"
        
        co_id = etree.SubElement(tax_scheme, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}CompanyID", schemeAgencyID="195", schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)", schemeName=scheme_id)
        co_id.text = client_nit
        
        ts = etree.SubElement(tax_scheme, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}TaxScheme")
        etree.SubElement(ts, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}ID").text = "01"
        etree.SubElement(ts, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}Name").text = "IVA"

    def _add_payment_means(self):
        pm = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}PaymentMeans")
        etree.SubElement(pm, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}ID").text = "1"
        etree.SubElement(pm, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}PaymentMeansCode").text = "10" # 10 = Efectivo
        
    def _add_tax_totals(self):
        # Calculate totals
        total_tax = 0
        for item in self.sale.items.all():
            price = float(item.line_total)
            # Assuming IVA 19% included or excluded? Let's assume price is total and back-calculate or use product tax
            # Simple version: price is base, add tax. 
            # Or price is total.
            # Let's assume for this MVP that tax is 0 or 19% of base.
            pass
            
        tt = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}TaxTotal")
        etree.SubElement(tt, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}TaxAmount", currencyID="COP").text = "0.00"
        
    def _add_legal_monetary_total(self):
        lmt = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}LegalMonetaryTotal")
        etree.SubElement(lmt, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}LineExtensionAmount", currencyID="COP").text = str(self.sale.total_amount)
        etree.SubElement(lmt, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}TaxExclusiveAmount", currencyID="COP").text = str(self.sale.total_amount)
        etree.SubElement(lmt, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}TaxInclusiveAmount", currencyID="COP").text = str(self.sale.total_amount)
        etree.SubElement(lmt, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}PayableAmount", currencyID="COP").text = str(self.sale.total_amount)
        
    def _add_invoice_lines(self):
        for idx, item in enumerate(self.sale.items.all(), 1):
            line = etree.SubElement(self.root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}InvoiceLine")
            etree.SubElement(line, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}ID").text = str(idx)
            etree.SubElement(line, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}InvoicedQuantity", unitCode="94").text = str(item.quantity)
            etree.SubElement(line, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}LineExtensionAmount", currencyID="COP").text = str(item.line_total)
            
            # Item
            ubl_item = etree.SubElement(line, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}Item")
            etree.SubElement(ubl_item, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}Description").text = item.product_name
            
            # Price
            price = etree.SubElement(line, "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}Price")
            etree.SubElement(price, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}PriceAmount", currencyID="COP").text = str(item.unit_price)
