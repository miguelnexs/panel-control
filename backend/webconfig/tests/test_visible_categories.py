from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from users.models import Tenant, UserProfile
from products.models import Category
from webconfig.api import VisibleCategoryStatusListView, VisibleCategoryUpdateView


class VisibleCategoriesStatusTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        # admin without tenant
        self.admin_user = User.objects.create_user(username='admin1', password='pass123')
        UserProfile.objects.create(user=self.admin_user, role='admin', tenant=None)
        # super admin
        self.super_user = User.objects.create_user(username='super1', password='pass123')
        UserProfile.objects.create(user=self.super_user, role='super_admin', tenant=None)
        # tenant with categories
        admin2 = User.objects.create_user(username='admint2', password='pass123')
        self.tenant2 = Tenant.objects.create(admin=admin2, db_alias='t2', db_path='/tmp/t2.db')
        self.public_cat = Category.objects.create(name='PublicCat', description='', active=True, tenant=None)
        self.tenanted_cat = Category.objects.create(name='TenantedCat', description='', active=True, tenant=self.tenant2)

    def test_status_admin_without_tenant_sees_public_only(self):
        request = self.factory.get('/webconfig/visible-categories/status/')
        force_authenticate(request, user=self.admin_user)
        response = VisibleCategoryStatusListView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.public_cat.id, ids)
        self.assertNotIn(self.tenanted_cat.id, ids)

    def test_status_super_admin_sees_all(self):
        request = self.factory.get('/webconfig/visible-categories/status/')
        force_authenticate(request, user=self.super_user)
        response = VisibleCategoryStatusListView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        ids = [item['id'] for item in response.data]
        self.assertIn(self.public_cat.id, ids)
        self.assertIn(self.tenanted_cat.id, ids)
