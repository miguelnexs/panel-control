import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "globetrek_backend.settings")
import django
django.setup()

from webconfig.models import WebSettings, VisibleProduct, VisibleCategory
from products.models import Product, Category

def site_variants(site: str):
    base = site[:-1] if site.endswith("/") else site
    out = {base, base + "/"}
    if base.startswith("http://localhost"):
        out.add("http://127.0.0.1" + base[len("http://localhost"):])
        out.add("http://127.0.0.1" + (base + "/")[len("http://localhost"):])
    if base.startswith("http://127.0.0.1"):
        out.add("http://localhost" + base[len("http://127.0.0.1"):])
        out.add("http://localhost" + (base + "/")[len("http://127.0.0.1"):])
    return sorted(out)

def main(site="http://localhost:8080/"):
    print(f"=== Checking public visibility for site: {site}")
    variants = site_variants(site)
    print("Site variants:", variants)
    ws = WebSettings.objects.filter(site_url__in=variants)
    print(f"WebSettings matched: {ws.count()}")
    tenants = [w.tenant_id for w in ws if getattr(w, "tenant_id", None)]
    print("Tenants from WebSettings:", tenants)
    vis_prod_ids = list(VisibleProduct.objects.filter(active=True).values_list("product_id", flat=True))
    vis_cat_ids = list(VisibleCategory.objects.filter(active=True).values_list("category_id", flat=True))
    print(f"VisibleProduct count: {len(vis_prod_ids)} ids={vis_prod_ids}")
    print(f"VisibleCategory count: {len(vis_cat_ids)} ids={vis_cat_ids}")
    prods = Product.objects.filter(id__in=vis_prod_ids)
    cats = Category.objects.filter(id__in=vis_cat_ids)
    print("Products tenants:", sorted({(p.id, p.tenant_id) for p in prods}))
    print("Categories tenants:", sorted({(c.id, c.tenant_id) for c in cats}))
    prods_for_site = prods.filter(tenant_id__in=tenants) if tenants else Product.objects.none()
    cats_for_site = cats.filter(tenant_id__in=tenants) if tenants else Category.objects.none()
    print("Products for site:", [p.id for p in prods_for_site])
    print("Categories for site:", [c.id for c in cats_for_site])
    if not tenants:
        print("WARNING: No tenants matched for this site. Ensure WebSettings.site_url is set for the desired tenant.")
    if prods_for_site.count() == 0 and len(vis_prod_ids) > 0:
        print("WARNING: There are visible products but none belong to the site's tenant. Assign tenant on toggle or via admin.")
    if cats_for_site.count() == 0 and len(vis_cat_ids) > 0:
        print("WARNING: There are visible categories but none belong to the site's tenant.")

if __name__ == "__main__":
    site = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/"
    main(site)
