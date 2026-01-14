import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
USERNAME = "valencia"
PASSWORD = "Valencia#2025!"
SITE_PUBLIC = "https://puralocion.online/"
SITE_DEV = "http://localhost:5173/"


def req(method, path, data=None, headers=None):
    url = BASE + path
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    d = None
    if data is not None:
        d = json.dumps(data).encode("utf-8")
    r = urllib.request.Request(url, data=d, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            b = resp.read()
            ctype = resp.headers.get("Content-Type", "")
            if "application/json" in ctype:
                return json.loads(b.decode("utf-8"))
            return {"raw": b.decode("utf-8", "ignore")}
    except urllib.error.HTTPError as e:
        try:
            return {"status": e.code, "error": json.loads(e.read().decode("utf-8"))}
        except Exception:
            return {"status": e.code, "error": e.read().decode("utf-8", "ignore")}
    except Exception as e:
        return {"error": str(e)}


def main():
    login = req("POST", "/users/api/auth/login/", {"username": USERNAME, "password": PASSWORD})
    access = (login or {}).get("access")
    print("Login:", json.dumps(login, ensure_ascii=False))
    if not access:
        print("No access token; abort")
        return
    auth = {"Authorization": f"Bearer {access}"}

    # User URLs
    urls = req("GET", "/webconfig/user-urls/", headers=auth)
    print("User URLs:", json.dumps(urls, ensure_ascii=False))
    create_url = req("POST", "/webconfig/user-urls/", {"url": SITE_PUBLIC}, headers=auth)
    print("Create URL:", json.dumps(create_url, ensure_ascii=False))
    urls2 = req("GET", "/webconfig/user-urls/", headers=auth)
    print("User URLs after:", json.dumps(urls2, ensure_ascii=False))

    # Site URL status
    status = req("GET", "/webconfig/site-url/status/", headers=auth)
    print("Site URL status:", json.dumps(status, ensure_ascii=False))

    # Settings (auth)
    settings_auth = req("GET", "/webconfig/settings/", headers=auth)
    print("Settings (auth):", json.dumps(settings_auth, ensure_ascii=False))
    upd = req("PUT", "/webconfig/settings/", {"company_name": "Valencia"}, headers=auth)
    print("Settings update:", json.dumps(upd, ensure_ascii=False))

    # Public resolution by site
    public_settings = req("GET", f"/webconfig/public/settings/?site={urllib.parse.quote(SITE_PUBLIC)}")
    print("Public settings (puralocion):", json.dumps(public_settings, ensure_ascii=False))
    public_products = req("GET", f"/webconfig/public/products/?site={urllib.parse.quote(SITE_PUBLIC)}")
    print("Public products (puralocion):", json.dumps(public_products, ensure_ascii=False))
    public_categories = req("GET", f"/webconfig/public/categories/?site={urllib.parse.quote(SITE_PUBLIC)}")
    print("Public categories (puralocion):", json.dumps(public_categories, ensure_ascii=False))
    public_payments = req("GET", f"/webconfig/public/payments/?site={urllib.parse.quote(SITE_PUBLIC)}")
    print("Public payments (puralocion):", json.dumps(public_payments, ensure_ascii=False))

    # Public resolution for dev origin
    dev_settings = req("GET", f"/webconfig/public/settings/?site={urllib.parse.quote(SITE_DEV)}")
    print("Public settings (dev):", json.dumps(dev_settings, ensure_ascii=False))
    dev_products = req("GET", f"/webconfig/public/products/?site={urllib.parse.quote(SITE_DEV)}")
    print("Public products (dev):", json.dumps(dev_products, ensure_ascii=False))
    dev_categories = req("GET", f"/webconfig/public/categories/?site={urllib.parse.quote(SITE_DEV)}")
    print("Public categories (dev):", json.dumps(dev_categories, ensure_ascii=False))
    dev_payments = req("GET", f"/webconfig/public/payments/?site={urllib.parse.quote(SITE_DEV)}")
    print("Public payments (dev):", json.dumps(dev_payments, ensure_ascii=False))


if __name__ == "__main__":
    main()
