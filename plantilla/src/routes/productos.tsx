import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart, Menu, Star, Filter, Grid3X3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/productos")({
  head: () => ({
    meta: [
      { title: "[NOMBRE DE TU TIENDA] — Productos" },
      { name: "description", content: "[Explora todos nuestros productos disponibles]" },
    ],
  }),
  component: ProductosPage,
});

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number | string;
  sale_price?: number | string;
  is_sale?: boolean;
  image?: string;
  category?: { id: number; name: string } | string | null;
  total_stock?: number;
  sku?: string;
}

function getApiBase() {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost" ? "http://localhost:8000" : "";
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (window as any).__plantillaAuthToken || null;
}

function formatPrice(val?: number | string) {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${getApiBase()}${path}`;
}

function ProductosPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams({ site: window.location.hostname, page_size: "100" });
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "Todos") {
        // find category id from fetched categories if possible
      }

      const url = `${apiBase}/webconfig/public/products/?${params.toString()}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const list = data.results ?? data;
        if (Array.isArray(list)) {
          setProducts(list);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Listen for auth token arrival (in case this route renders before token is set)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "AUTH_TOKEN") {
        // Re-fetch after receiving token
        setTimeout(() => fetchProducts(), 50);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [fetchProducts]);

  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted, fetchProducts]);

  if (!mounted) return null;

  // Build category list from loaded products
  const categoryNames: string[] = ["Todos"];
  for (const p of products) {
    const catName = typeof p.category === "object" && p.category ? p.category.name : String(p.category ?? "");
    if (catName && !categoryNames.includes(catName)) categoryNames.push(catName);
  }

  const filtered = products.filter((p) => {
    const matchCat =
      selectedCategory === "Todos" ||
      (typeof p.category === "object" && p.category ? p.category.name === selectedCategory : String(p.category ?? "") === selectedCategory);
    const q = searchQuery.trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
      {/* ============ BARRA SUPERIOR ============ */}
      <div className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs">
          [ Barra de anuncios — ej: "Envío gratis en compras mayores a $XX" ]
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex h-10 min-w-32 items-center justify-center rounded border-2 border-dashed border-border px-3 text-xs uppercase tracking-wider text-muted-foreground">
              [ LOGO ]
            </Link>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link to="/" className="hover:text-primary">[Inicio]</Link>
            <Link to="/productos" className="text-primary font-semibold">[Productos]</Link>
            <Link to="/nosotros" className="hover:text-primary">[Nosotros]</Link>
            <Link to="/contacto" className="hover:text-primary">[Contacto]</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">0</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ============ BREADCRUMB ============ */}
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">[Inicio]</Link>
            <span>/</span>
            <span className="text-foreground font-medium">[Productos]</span>
          </nav>
        </div>
      </div>

      {/* ============ HERO PRODUCTOS ============ */}
      <section className="bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">[Catálogo de Productos]</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            [Explora toda nuestra selección. Encuentra lo que necesitas con la mejor calidad y precio.]
          </p>
        </div>
      </section>

      {/* ============ FILTROS + GRID ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <aside className="md:w-64 shrink-0">
            <div className="rounded-lg border border-border p-5 space-y-6 sticky top-24">
              {/* Búsqueda */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" /> [Buscar]
                </h3>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Filtro Categorías */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" /> [Filtrar por Categoría]
                </h3>
                <div className="space-y-2">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full text-sm" onClick={() => { setSelectedCategory("Todos"); setSearchQuery(""); }}>
                [Limpiar filtros]
              </Button>
            </div>
          </aside>

          {/* Grid de Productos */}
          <div className="flex-1">
            {/* Barra de control */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {loading ? "Cargando..." : `Mostrando ${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Estado de carga */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Sin productos */}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No hay productos disponibles</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {products.length === 0
                    ? "Activa productos desde el Dashboard → Página Web → Productos"
                    : "No se encontraron productos con los filtros seleccionados"}
                </p>
              </div>
            )}

            {/* Productos */}
            {!loading && filtered.length > 0 && (
              <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
                {filtered.map((product) => {
                  const imgUrl = mediaUrl(product.image);
                  const catName = typeof product.category === "object" && product.category ? product.category.name : String(product.category ?? "");
                  const priceFormatted = formatPrice(product.price);
                  const salePriceFormatted = product.is_sale ? formatPrice(product.sale_price) : null;

                  if (viewMode === "grid") {
                    return (
                      <article key={product.id} className="group space-y-3">
                        <div className="relative overflow-hidden rounded-lg">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="aspect-square bg-muted/40 flex items-center justify-center border border-border text-xs text-muted-foreground">
                              <ShoppingBag className="h-10 w-10 opacity-30" />
                            </div>
                          )}
                          {product.is_sale && salePriceFormatted && (
                            <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                              OFERTA
                            </span>
                          )}
                          <Button size="icon" variant="secondary" className="absolute right-3 top-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {catName && <p className="text-xs uppercase text-muted-foreground">{catName}</p>}
                          <h3 className="font-medium text-sm leading-snug">{product.name}</h3>
                          <div className="flex items-center gap-1 text-amber-500 text-xs">
                            <Star className="h-3 w-3 fill-current" />
                            <span>5.0</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {salePriceFormatted ? (
                              <>
                                <span className="font-semibold text-sm text-primary">{salePriceFormatted}</span>
                                <span className="text-xs text-muted-foreground line-through">{priceFormatted}</span>
                              </>
                            ) : (
                              <span className="font-semibold text-sm">{priceFormatted ?? "Consultar precio"}</span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" className="w-full text-sm" size="sm">
                          [Agregar al carrito]
                        </Button>
                      </article>
                    );
                  }

                  // List view
                  return (
                    <article key={product.id} className="flex gap-4 border border-border rounded-lg p-4 group">
                      <div className="w-24 h-24 shrink-0 rounded-md border border-border overflow-hidden bg-muted/40 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-6 w-6 opacity-30 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        {catName && <p className="text-xs uppercase text-muted-foreground">{catName}</p>}
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          <Star className="h-3 w-3 fill-current" />
                          <span>5.0</span>
                        </div>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <div className="text-right">
                          {salePriceFormatted ? (
                            <>
                              <p className="font-semibold text-primary">{salePriceFormatted}</p>
                              <p className="text-xs text-muted-foreground line-through">{priceFormatted}</p>
                            </>
                          ) : (
                            <p className="font-semibold">{priceFormatted ?? "Consultar"}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">[Agregar]</Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-muted/30 py-10 mt-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-3">[Tu Tienda]</h4>
              <p className="text-muted-foreground text-xs">[Descripción breve de tu tienda y misión.]</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">[Navegación]</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li><Link to="/">[Inicio]</Link></li>
                <li><Link to="/productos">[Todos los productos]</Link></li>
                <li><Link to="/nosotros">[Nosotros]</Link></li>
                <li><Link to="/contacto">[Contacto]</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">[Ayuda]</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>[Preguntas Frecuentes]</li>
                <li>[Política de Envíos]</li>
                <li>[Devoluciones]</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">[Contacto]</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>[tu@email.com]</li>
                <li>[+57 300 000 0000]</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} [Tu Tienda]. [Todos los derechos reservados.]
          </div>
        </div>
      </footer>
    </div>
  );
}
