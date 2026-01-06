from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Sale
from webconfig.models import PaymentMethod
from .payment_service import PaymentProcessor

class PaymentInitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sale_id = request.data.get('sale_id')
        method_id = request.data.get('payment_method_id')
        return_url = request.data.get('return_url')
        cancel_url = request.data.get('cancel_url')

        if not all([sale_id, method_id, return_url, cancel_url]):
            return Response({'detail': 'Missing parameters (sale_id, payment_method_id, return_url, cancel_url)'}, status=status.HTTP_400_BAD_REQUEST)

        sale = get_object_or_404(Sale, id=sale_id)
        
        # Check tenant permission if applicable
        # Assuming request.user has profile with tenant
        try:
            user_tenant = getattr(request.user, 'profile', None) and request.user.profile.tenant
            if user_tenant and sale.tenant != user_tenant:
                return Response({'detail': 'Not found'}, status=404)
        except Exception:
            pass

        method = get_object_or_404(PaymentMethod, id=method_id)
        
        # Verify method belongs to same tenant or is public/global (if logic allows)
        # For now, strict tenant check if method has tenant
        if method.tenant and method.tenant != sale.tenant:
             return Response({'detail': 'Invalid payment method for this tenant'}, status=400)

        if not method.active:
             return Response({'detail': 'Payment method inactive'}, status=400)

        try:
            processor = PaymentProcessor(method)
            result = processor.create_payment_intent(sale, return_url, cancel_url)
            return Response(result)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)
