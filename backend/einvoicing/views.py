from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import DianCompanyConfig, DianResolution, ElectronicInvoice
from sales.models import Sale
from .serializers import DianCompanyConfigSerializer, DianResolutionSerializer, ElectronicInvoiceSerializer
from .utils.xml_generator import InvoiceBuilder
from .utils.signature import InvoiceSigner
from .utils.dian_service import DianService
from django.core.files.base import ContentFile
import uuid

class DianConfigView(generics.RetrieveUpdateAPIView):
    serializer_class = DianCompanyConfigSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant
        if not tenant:
            return None
        obj, created = DianCompanyConfig.objects.get_or_create(tenant=tenant)
        return obj

    def perform_update(self, serializer):
        serializer.save()

class DianResolutionViewSet(viewsets.ModelViewSet):
    serializer_class = DianResolutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant
        if not tenant:
            return DianResolution.objects.none()
        return DianResolution.objects.filter(tenant=tenant)

    def perform_create(self, serializer):
        tenant = self.request.user.profile.tenant
        serializer.save(tenant=tenant)

class ElectronicInvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ElectronicInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant
        if not tenant:
            return ElectronicInvoice.objects.none()
        return ElectronicInvoice.objects.filter(sale__tenant=tenant)

class EmitInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, sale_id):
        sale = get_object_or_404(Sale, id=sale_id)
        tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant
        
        if sale.tenant != tenant:
            return Response({'detail': 'No tiene permiso para facturar esta venta'}, status=403)
            
        config = DianCompanyConfig.objects.filter(tenant=tenant).first()
        if not config or not config.certificate_file:
            return Response({'detail': 'Falta configuración DIAN o certificado digital'}, status=400)
            
        resolution = DianResolution.objects.filter(tenant=tenant, active=True).first()
        if not resolution:
            return Response({'detail': 'No hay resolución de facturación activa'}, status=400)

        # Check existing
        einvoice, created = ElectronicInvoice.objects.get_or_create(sale=sale)
        if einvoice.status == 'accepted':
            return Response({'detail': 'Factura ya emitida y aceptada'}, status=400)

        # Generate CUFE (Simplified for now - usually requires logic with key)
        einvoice.cufe = str(uuid.uuid4()) # Placeholder
        einvoice.resolution = resolution
        einvoice.save()

        try:
            # 1. Build XML
            builder = InvoiceBuilder(sale, config, resolution, einvoice)
            xml_bytes = builder.build()
            
            # 2. Sign XML
            # Note: We need the password. For security, it might be stored encrypted or prompted.
            # Assuming stored in config (not secure for prod but ok for MVP/User request)
            # Or config.certificate_password
            if not config.certificate_password:
                return Response({'detail': 'Contraseña de certificado no configurada'}, status=400)
                
            signer = InvoiceSigner(config.certificate_file.path, config.certificate_password)
            signed_xml = signer.sign(xml_bytes)
            
            # Save Signed XML
            file_name = f"fv{resolution.prefix}{sale.order_number}.xml"
            einvoice.xml_file.save(file_name, ContentFile(signed_xml))
            einvoice.status = 'signed'
            einvoice.save()
            
            # 3. Send to DIAN
            service = DianService(environment=config.environment)
            result = service.send_bill(file_name, signed_xml)
            
            einvoice.dian_response = result
            if result.get('status_code') == 200:
                einvoice.status = 'sent' # Check content for Accepted/Rejected in real implementation
            else:
                einvoice.status = 'error'
                
            einvoice.save()
            
            return Response(ElectronicInvoiceSerializer(einvoice).data)
            
        except Exception as e:
            einvoice.status = 'error'
            einvoice.dian_errors = {'error': str(e)}
            einvoice.save()
            return Response({'detail': str(e)}, status=500)
