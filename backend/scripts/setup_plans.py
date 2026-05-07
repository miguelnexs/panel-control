import os
import sys
import django

# Añadir el directorio raíz del backend al path de Python
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "globetrek_backend.settings")
django.setup()

from users.models_subscription import SubscriptionPlan

def setup_commercial_plans():
    plans = [
        {
            'code': 'basic',
            'name': 'Plan Individual',
            'description': 'Ideal para emprendedores y pequeños negocios.',
            'price': 19.99,
            'max_users': 1,
            'max_products': 100,
            'max_categories': 10,
            'max_transactions_per_month': 50,
            'enable_basic_dashboard': True,
            'enable_basic_sales': True,
            'enable_basic_stats': True,
            'enable_user_management': False,
            'enable_advanced_sales_analysis': False,
            'enable_inventory_management': False,
            'enable_detailed_reports': False,
            'enable_third_party_integrations': False,
            'enable_web_store': False,
            'enable_custom_domain': False,
            'enable_marketing_tools': False,
            'enable_api_access': False,
            'enable_priority_support': False,
            'enable_daily_backups': False,
            'enable_electronic_invoicing': False,
            'enable_supplier_management': False,
            'enable_whatsapp_notifications': False,
        },
        {
            'code': 'medium',
            'name': 'Plan Intermedio',
            'description': 'Para negocios en crecimiento que necesitan gestión avanzada.',
            'price': 49.99,
            'max_users': 5,
            'max_products': 1000,
            'max_categories': 50,
            'max_transactions_per_month': 1000,
            'enable_basic_dashboard': True,
            'enable_basic_sales': True,
            'enable_basic_stats': True,
            'enable_user_management': True,
            'enable_advanced_sales_analysis': True,
            'enable_inventory_management': True,
            'enable_detailed_reports': True,
            'enable_third_party_integrations': True,
            'enable_web_store': True,
            'enable_custom_domain': True,
            'enable_marketing_tools': False,
            'enable_api_access': False,
            'enable_priority_support': True,
            'enable_daily_backups': True,
            'enable_electronic_invoicing': False,
            'enable_supplier_management': True,
            'enable_whatsapp_notifications': True,
        },
        {
            'code': 'advanced',
            'name': 'Plan Avanzado',
            'description': 'La solución completa para empresas establecidas.',
            'price': 99.99,
            'max_users': -1,
            'max_products': -1,
            'max_categories': -1,
            'max_transactions_per_month': -1,
            'enable_basic_dashboard': True,
            'enable_basic_sales': True,
            'enable_basic_stats': True,
            'enable_user_management': True,
            'enable_advanced_sales_analysis': True,
            'enable_inventory_management': True,
            'enable_detailed_reports': True,
            'enable_third_party_integrations': True,
            'enable_web_store': True,
            'enable_custom_domain': True,
            'enable_marketing_tools': True,
            'enable_api_access': True,
            'enable_priority_support': True,
            'enable_daily_backups': True,
            'enable_electronic_invoicing': True,
            'enable_supplier_management': True,
            'enable_whatsapp_notifications': True,
        }
    ]

    for plan_data in plans:
        plan, created = SubscriptionPlan.objects.update_or_create(
            code=plan_data['code'],
            defaults=plan_data
        )
        if created:
            print(f"Plan creado: {plan.name}")
        else:
            print(f"Plan actualizado: {plan.name}")

if __name__ == "__main__":
    setup_commercial_plans()
