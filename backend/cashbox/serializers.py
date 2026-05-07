from rest_framework import serializers
from .models import CashSession, CashTransaction
from decimal import Decimal

class CashTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashTransaction
        fields = '__all__'

class CashSessionSerializer(serializers.ModelSerializer):
    transactions = CashTransactionSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CashSession
        fields = '__all__'

class CashSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashSession
        fields = ['initial_cash', 'initial_bank', 'notes']

class CashSessionCloseSerializer(serializers.Serializer):
    actual_cash = serializers.DecimalField(max_digits=12, decimal_places=2)
    actual_bank = serializers.DecimalField(max_digits=12, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)
