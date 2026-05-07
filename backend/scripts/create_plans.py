import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "globetrek_backend.settings")
django.setup()

from users.models_subscription import SubscriptionPlan

def create_plans():
    plans = [
        {
            'code': 'basic',
            'name': 'Plan Básico',
            'description': 'Funciones esenciales del dashboard',
            'price': 0.00,
            'max_users': 1,
            'max_transactions_per_month': 50,
            'enable_basic_dashboard': True,
            'enable_basic_sales': True,
            'enable_basic_stats': True,
            'enable_advanced_sales_analysis': False,
            'enable_inventory_management': False,
            'enable_detailed_reports': False,
            'enable_third_party_integrations': False,
            'enable_web_store': False,
            'enable_custom_domain': False,
            'enable_marketing_tools': False,
            'enable_api_access': False,
            'enable_priority_support': False,
        },
        {
            'code': 'medium',
            'name': 'Plan Medio',
            'description': 'Herramientas avanzadas de análisis y gestión',
            'price': 29.99,
            'max_users': 5,
            'max_transactions_per_month': 500,
            'enable_basic_dashboard': True,
            'enable_basic_sales': True,
            'enable_basic_stats': True,
            'enable_advanced_sales_analysis': True,
            'enable_inventory_management': True,
            'enable_detailed_reports': True,
            'enable_third_party_integrations': True,
            'enable_web_store': False,
            'enable_custom_domain': False,
            'enable_marketing_tools': False,
            'enable_api_access': False,
            'enable_priority_support': False,
        },
        {
            'code': 'advanced',
            'name': 'Plan Avanzado',
            'description': 'Tienda virtual completa y soporte prioritario',
            'price': 99.99,
            'max_users': -1,
            'max_transactions_per_month': -1,
            'enable_basic_dashboard': True,
            'enable_basic_sales': True,
            'enable_basic_stats': True,
            'enable_advanced_sales_analysis': True,
            'enable_inventory_management': True,
            'enable_detailed_reports': True,
            'enable_third_party_integrations': True,
            'enable_web_store': True,
            'enable_custom_domain': True,
            'enable_marketing_tools': True,
            'enable_api_access': True,
            'enable_priority_support': True,
        }
    ]

    for plan_data in plans:
        plan, created = SubscriptionPlan.objects.update_or_create(
            code=plan_data['code'],
            defaults=plan_data
        )
        if created:
            print(f"Created plan: {plan.name}")
        else:
            print(f"Updated plan: {plan.name}")

if __name__ == '__main__':
    create_plans()
