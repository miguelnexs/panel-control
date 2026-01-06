from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from decimal import Decimal
from products.models import Product, Category
from webconfig.models import VisibleProduct, VisibleCategory
from webconfig.api import PublicProductsView, PublicCategoriesView


class PublicVisibilityTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.cat1 = Category.objects.create(name='Cat Visible')
        self.cat2 = Category.objects.create(name='Cat Oculta')
        self.prod1 = Product.objects.create(name='P1', price=Decimal('10.00'), description='', sku='p1', active=True, category=self.cat1)
        self.prod2 = Product.objects.create(name='P2', price=Decimal('20.00'), description='', sku='p2', active=True, category=self.cat2)
        VisibleProduct.objects.create(product=self.prod1, active=True, position=1)
        VisibleProduct.objects.create(product=self.prod2, active=False, position=2)
        VisibleCategory.objects.create(category=self.cat1, active=True, position=1)
        VisibleCategory.objects.create(category=self.cat2, active=False, position=2)

    def test_public_products_only_visible(self):
        request = self.factory.get('/webconfig/public/products/')
        response = PublicProductsView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        names = [p['name'] for p in response.data]
        self.assertIn('P1', names)
        self.assertNotIn('P2', names)

    def test_public_categories_only_visible(self):
        request = self.factory.get('/webconfig/public/categories/')
        response = PublicCategoriesView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        names = [c['name'] for c in response.data]
        self.assertIn('Cat Visible', names)
        self.assertNotIn('Cat Oculta', names)
