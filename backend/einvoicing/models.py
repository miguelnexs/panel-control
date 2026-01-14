from django.db import models
from users.models import Tenant
from sales.models import Sale
from clients.models import Client

class DianCompanyConfig(models.Model):
    ENV_CHOICES = (
        ('1', 'Producción'),
        ('2', 'Pruebas'),
    )
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='dian_config')
    environment = models.CharField(max_length=1, choices=ENV_CHOICES, default='2')
    software_id = models.CharField(max_length=100, blank=True, help_text="ID del software proporcionado por la DIAN")
    software_pin = models.CharField(max_length=100, blank=True, help_text="PIN del software")
    test_set_id = models.CharField(max_length=100, blank=True, help_text="Test Set ID para habilitación")
    
    certificate_file = models.FileField(upload_to='dian/certs/', blank=True, null=True)
    certificate_password = models.CharField(max_length=100, blank=True)
    
    # Datos tributarios del emisor
    nit = models.CharField(max_length=20, blank=True)
    dv = models.CharField(max_length=1, blank=True, help_text="Dígito de verificación")
    tax_regimen = models.CharField(max_length=10, default='48', help_text="48: Impuesto sobre las ventas - IVA, 49: No responsable de IVA")
    fiscal_responsibilities = models.CharField(max_length=100, default='R-99-PN', help_text="Códigos separados por ;")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DIAN Config for {self.tenant}"

class DianResolution(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='dian_resolutions')
    resolution_number = models.CharField(max_length=50)
    prefix = models.CharField(max_length=10, blank=True)
    from_number = models.BigIntegerField()
    to_number = models.BigIntegerField()
    current_number = models.BigIntegerField(default=0)
    date_from = models.DateField()
    date_to = models.DateField()
    technical_key = models.CharField(max_length=255, help_text="Clave técnica de la resolución")
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prefix} {self.resolution_number} ({self.from_number}-{self.to_number})"

class DianClientInfo(models.Model):
    DOC_TYPE_CHOICES = (
        ('13', 'Cédula de ciudadanía'),
        ('31', 'NIT'),
        ('11', 'Registro civil'),
        ('12', 'Tarjeta de identidad'),
        ('21', 'Tarjeta de extranjería'),
        ('22', 'Cédula de extranjería'),
        ('41', 'Pasaporte'),
        ('42', 'Documento de identificación extranjero'),
    )
    PERSON_TYPE_CHOICES = (
        ('1', 'Persona Jurídica'),
        ('2', 'Persona Natural'),
    )
    
    client = models.OneToOneField(Client, on_delete=models.CASCADE, related_name='dian_info')
    document_type = models.CharField(max_length=2, choices=DOC_TYPE_CHOICES, default='13')
    person_type = models.CharField(max_length=1, choices=PERSON_TYPE_CHOICES, default='2')
    tax_regimen = models.CharField(max_length=10, default='49', help_text="48: IVA, 49: No IVA")
    fiscal_responsibilities = models.CharField(max_length=100, default='R-99-PN')
    commercial_name = models.CharField(max_length=200, blank=True)
    
    # Ubicación
    city_code = models.CharField(max_length=10, help_text="Código DANE municipio")
    postal_code = models.CharField(max_length=10, blank=True)
    address_line = models.CharField(max_length=255, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DIAN Info: {self.client.full_name}"

class ElectronicInvoice(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Borrador'),
        ('signed', 'Firmada'),
        ('sent', 'Enviada DIAN'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
        ('error', 'Error Técnico'),
    )
    
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, related_name='electronic_invoice')
    resolution = models.ForeignKey(DianResolution, on_delete=models.PROTECT, null=True, blank=True)
    
    cufe = models.CharField(max_length=255, blank=True, null=True, unique=True)
    qrcode_data = models.TextField(blank=True, null=True)
    
    xml_file = models.FileField(upload_to='dian/xmls/', blank=True, null=True)
    pdf_file = models.FileField(upload_to='dian/pdfs/', blank=True, null=True)
    
    # Fields for Provider Integration (Alegra, etc)
    provider = models.CharField(max_length=20, default='dian', help_text="dian or alegra")
    external_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID en el sistema externo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    external_status_message = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# --- ALEGRA MODELS ---

class AlegraCompanyConfig(models.Model):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='alegra_config')
    user_email = models.EmailField(help_text="Correo de acceso a Alegra")
    api_key = models.CharField(max_length=255, help_text="Token de API de Alegra")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Alegra Config for {self.tenant}"

class AlegraMapping(models.Model):
    TYPE_CHOICES = (
        ('client', 'Cliente'),
        ('product', 'Producto'),
    )
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    internal_id = models.PositiveIntegerField()
    alegra_id = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('tenant', 'type', 'internal_id')
        indexes = [
            models.Index(fields=['tenant', 'type', 'internal_id']),
        ]

    def __str__(self):
        return f"{self.type} {self.internal_id} -> {self.alegra_id}"
