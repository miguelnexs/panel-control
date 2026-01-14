from rest_framework import serializers
from .models import DianCompanyConfig, DianResolution, ElectronicInvoice, DianClientInfo, AlegraCompanyConfig

class DianCompanyConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DianCompanyConfig
        fields = ['id', 'environment', 'software_id', 'software_pin', 'test_set_id', 
                  'nit', 'dv', 'tax_regimen', 'fiscal_responsibilities', 'certificate_file']
        extra_kwargs = {
            'certificate_password': {'write_only': True},
            'software_pin': {'write_only': True}
        }

class DianResolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DianResolution
        fields = ['id', 'resolution_number', 'prefix', 'from_number', 'to_number', 
                  'current_number', 'date_from', 'date_to', 'active']

class DianClientInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DianClientInfo
        fields = ['document_type', 'person_type', 'tax_regimen', 'fiscal_responsibilities', 
                  'commercial_name', 'city_code', 'postal_code', 'address_line']

class ElectronicInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElectronicInvoice
        fields = ['id', 'cufe', 'status', 'provider', 'external_status_message', 'created_at', 'xml_file', 'pdf_file']

class AlegraCompanyConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlegraCompanyConfig
        fields = ['user_email', 'api_key']
        extra_kwargs = {
            'api_key': {'write_only': True} # Don't expose key
        }
