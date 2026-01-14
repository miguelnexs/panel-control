from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import AlegraCompanyConfig, ElectronicInvoice
from sales.models import Sale
from .serializers import AlegraCompanyConfigSerializer, ElectronicInvoiceSerializer
from .utils.alegra_service import AlegraService

class AlegraConfigView(generics.RetrieveUpdateAPIView):
    serializer_class = AlegraCompanyConfigSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        tenant = getattr(self.request.user, 'profile', None) and self.request.user.profile.tenant
        if not tenant:
            return None
        obj, created = AlegraCompanyConfig.objects.get_or_create(tenant=tenant)
        return obj

class EmitAlegraInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, sale_id):
        sale = get_object_or_404(Sale, id=sale_id)
        tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant
        
        if sale.tenant != tenant:
            return Response({'detail': 'No tiene permiso'}, status=403)

        # Check existing invoice
        einvoice, created = ElectronicInvoice.objects.get_or_create(sale=sale)
        
        # If it was already accepted, stop
        if einvoice.status == 'accepted':
            return Response({'detail': 'Factura ya emitida y aceptada'}, status=400)
            
        # If it failed or is draft, we can retry
        
        einvoice.provider = 'alegra'
        einvoice.save()

        try:
            service = AlegraService(tenant)
            result = service.emit_invoice(sale, einvoice)
            
            return Response({
                'status': 'success',
                'data': result,
                'invoice': ElectronicInvoiceSerializer(einvoice, context={'request': request}).data
            })
        except Exception as e:
            # Return error but also the invoice state
            return Response({
                'status': 'error',
                'detail': str(e),
                'invoice': ElectronicInvoiceSerializer(einvoice, context={'request': request}).data
            }, status=400)
