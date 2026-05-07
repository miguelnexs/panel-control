from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from .models import CashSession, CashTransaction
from .serializers import (
    CashSessionSerializer, 
    CashSessionCreateSerializer, 
    CashSessionCloseSerializer,
    CashTransactionSerializer
)
from users.models import UserProfile, Tenant
from decimal import Decimal

def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()

class CurrentSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = _get_user_tenant(request.user)
        session = CashSession.objects.filter(tenant=tenant, status='open').first()
        if not session:
            return Response(None, status=status.HTTP_200_OK)
        return Response(CashSessionSerializer(session).data)

class SessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CashSessionCreateSerializer
        return CashSessionSerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        return CashSession.objects.filter(tenant=tenant).order_by('-start_time')

    def perform_create(self, serializer):
        tenant = _get_user_tenant(self.request.user)
        # Check if there is already an open session
        if CashSession.objects.filter(tenant=tenant, status='open').exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Ya existe una sesión de caja abierta.")
        
        serializer.save(
            tenant=tenant,
            user=self.request.user,
            expected_cash=serializer.validated_data.get('initial_cash', Decimal('0.00')),
            expected_bank=serializer.validated_data.get('initial_bank', Decimal('0.00'))
        )

class SessionCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        tenant = _get_user_tenant(request.user)
        session = CashSession.objects.filter(id=pk, tenant=tenant, status='open').first()
        if not session:
            return Response({"detail": "Sesión no encontrada o ya cerrada."}, status=status.HTTP_404_NOT_FOUND)
        
        ser = CashSessionCloseSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        
        session.status = 'closed'
        session.end_time = timezone.now()
        session.actual_cash = ser.validated_data['actual_cash']
        session.actual_bank = ser.validated_data['actual_bank']
        session.notes = ser.validated_data.get('notes', session.notes)
        session.save()
        
        return Response(CashSessionSerializer(session).data)

class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CashTransactionSerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        session_id = self.request.query_params.get('session_id')
        qs = CashTransaction.objects.filter(session__tenant=tenant)
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        tenant = _get_user_tenant(self.request.user)
        session = CashSession.objects.filter(tenant=tenant, status='open').first()
        if not session:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("No hay una sesión de caja abierta para registrar movimientos.")
        
        transaction = serializer.save(session=session)
        
        # Update expected balance based on transaction type
        amount = transaction.amount
        if transaction.type == 'expense':
            session.expected_cash -= amount
        elif transaction.type == 'income':
            session.expected_cash += amount
        elif transaction.type == 'transfer_in':
            session.expected_bank += amount
        elif transaction.type == 'transfer_out':
            session.expected_cash -= amount
            session.expected_bank += amount # Assuming transfer out of cash into bank
        elif transaction.type == 'sale':
            # This is handled in sale API, but if created here:
            session.expected_cash += amount
        
        session.save()

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CashTransactionSerializer

    def get_queryset(self):
        tenant = _get_user_tenant(self.request.user)
        return CashTransaction.objects.filter(session__tenant=tenant)

    def perform_destroy(self, instance):
        session = instance.session
        amount = instance.amount
        
        # Revert balance update
        if instance.type == 'expense':
            session.expected_cash += amount
        elif instance.type == 'income':
            session.expected_cash -= amount
        elif instance.type == 'transfer_in':
            session.expected_bank -= amount
        elif instance.type == 'transfer_out':
            session.expected_cash += amount
            session.expected_bank -= amount
        elif instance.type == 'sale':
            session.expected_cash -= amount
            # Also delete the associated sale if requested
            if instance.sale:
                instance.sale.delete()
        
        session.save()
        instance.delete()

