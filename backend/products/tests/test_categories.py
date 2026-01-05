from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from users.models import Tenant, UserProfile
from products.models import Category
from products.api import CategoryListCreateView


class CategoryVisibilityTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin_user = User.objects.create_user(username='admin1', password='pass123')
        UserProfile.objects.create(user=self.admin_user, role='admin', tenant=None)
        self.super_user = User.objects.create_user(username='super1', password='pass123')
        UserProfile.objects.create(user=self.super_user, role='super_admin', tenant=None)
        admin2 = User.objects.create_user(username='admin2', password='pass123')
        tenant2 = Tenant.objects.create(admin=admin2, db_alias='t2', db_path='/tmp/t2.db')
        self.public_cat = Category.objects.create(name='PublicCat', description='', active=True, tenant=None)
        self.tenanted_cat = Category.objects.create(name='TenantedCat', description='', active=True, tenant=tenant2)

    def test_admin_without_tenant_sees_only_public_categories(self):
        request = self.factory.get('/products/categories/')
        force_authenticate(request, user=self.admin_user)
        view = CategoryListCreateView.as_view()
        response = view(request)
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertIn('results', data)
        ids = [item['id'] for item in data['results']]
        self.assertIn(self.public_cat.id, ids)
        self.assertNotIn(self.tenanted_cat.id, ids)

    def test_super_admin_sees_all_categories(self):
        request = self.factory.get('/products/categories/')
        force_authenticate(request, user=self.super_user)
        view = CategoryListCreateView.as_view()
        response = view(request)
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertIn('results', data)
        ids = [item['id'] for item in data['results']]
        self.assertIn(self.public_cat.id, ids)
        self.assertIn(self.tenanted_cat.id, ids)
