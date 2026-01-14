from webconfig.models import WebSettings, VisibleProduct, VisibleCategory
from products.models import Product, Category

def _variants(site: str):
    base = site[:-1] if site.endswith('/') else site
    out = {base, base + '/'}
    if base.startswith('http://localhost'):
        out.add('http://127.0.0.1' + base[len('http://localhost'):])
        out.add('http://127.0.0.1' + (base + '/')[len('http://localhost'):])
    if base.startswith('http://127.0.0.1'):
        out.add('http://localhost' + base[len('http://127.0.0.1'):])
        out.add('http://localhost' + (base + '/')[len('http://127.0.0.1'):])
    return sorted(out)

site = 'http://localhost:8080/'
print('=== Django shell check for site:', site)
variants = _variants(site)
print('Variants:', variants)
ws = WebSettings.objects.filter(site_url__in=variants)
print('WebSettings matched:', ws.count(), [w.site_url for w in ws])
tenants = [w.tenant_id for w in ws if getattr(w, 'tenant_id', None)]
print('Tenants IDs:', tenants)
vis_prod_ids = list(VisibleProduct.objects.filter(active=True).values_list('product_id', flat=True))
vis_cat_ids = list(VisibleCategory.objects.filter(active=True).values_list('category_id', flat=True))
print('Visible products:', vis_prod_ids)
print('Visible categories:', vis_cat_ids)
prods = Product.objects.filter(id__in=vis_prod_ids)
cats = Category.objects.filter(id__in=vis_cat_ids)
print('Products tenants:', sorted({(p.id, p.tenant_id) for p in prods}))
print('Categories tenants:', sorted({(c.id, c.tenant_id) for c in cats}))
prods_for_site = prods.filter(tenant_id__in=tenants) if tenants else Product.objects.none()
cats_for_site = cats.filter(tenant_id__in=tenants) if tenants else Category.objects.none()
print('Products for site:', [p.id for p in prods_for_site])
print('Categories for site:', [c.id for c in cats_for_site])
