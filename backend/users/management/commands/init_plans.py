from django.core.management.base import BaseCommand
from users.models_subscription import SubscriptionPlan

class Command(BaseCommand):
    help = 'Initialize subscription plans with commercial values'

    def handle(self, *args, **options):
        plans = [
            {
                'code': 'basic',
                'name': 'Starter',
                'description': 'Perfecto para comenzar y probar el dashboard',
                'price': 50000.00,
                'max_users': 1,
                'max_products': 100,
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
                'name': 'Professional',
                'description': 'Para negocios en crecimiento que necesitan más',
                'price': 119000.00,
                'max_users': 5,
                'max_products': -1,
                'max_transactions_per_month': -1,
                'enable_basic_dashboard': True,
                'enable_basic_sales': True,
                'enable_basic_stats': True,
                'enable_advanced_sales_analysis': True,
                'enable_inventory_management': True,
                'enable_detailed_reports': True,
                'enable_third_party_integrations': True,
                'enable_web_store': False,
                'enable_custom_domain': False,
                'enable_marketing_tools': True,
                'enable_api_access': True,
                'enable_priority_support': True,
            },
            {
                'code': 'advanced',
                'name': 'Enterprise',
                'description': 'Solución completa para grandes operaciones',
                'price': 399000.00,
                'max_users': -1,
                'max_products': -1,
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
                self.stdout.write(self.style.SUCCESS(f"Created plan: {plan.name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated plan: {plan.name}"))
