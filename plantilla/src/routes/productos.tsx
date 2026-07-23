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
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wide">
          🎉 ¡Envío gratis a todo el país por compras superiores a $150.000 COP!
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex h-10 items-center justify-center text-sm font-bold tracking-widest text-primary uppercase">
              🛍️ MI TIENDA
            </Link>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <Link to="/productos" className="text-primary font-semibold">Productos</Link>
            <Link to="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
            <Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold shadow-sm">0</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ============ BREADCRUMB ============ */}
      <div className="border-b border-border bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Productos</span>
          </nav>
        </div>
      </div>

      {/* ============ HERO PRODUCTOS ============ */}
      <section className="bg-muted/10 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Catálogo de Productos
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explora toda nuestra selección de artículos exclusivos. Encuentra lo que necesitas con la mejor calidad y precio del mercado.
          </p>
        </div>
      </section>

      {/* ============ FILTROS + GRID ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <aside className="md:w-64 shrink-0">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-6 sticky top-24 shadow-sm">
              {/* Búsqueda */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Search className="h-4 w-4" /> Buscar
                </h3>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 border border-border rounded-xl text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Filtro Categorías */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Filter className="h-4 w-4" /> Filtrar por Categoría
                </h3>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs font-bold rounded-xl py-5 border-dashed border-border hover:border-primary/50 transition-colors" 
                onClick={() => { setSelectedCategory("Todos"); setSearchQuery(""); }}
              >
                Limpiar filtros
              </Button>
            </div>
          </aside>

          {/* Grid de Productos */}
          <div className="flex-1">
            {/* Barra de control */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-muted-foreground font-medium">
                {loading ? "Cargando..." : `Mostrando ${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-1.5 border border-border p-1 rounded-xl bg-card">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                  title="Vista cuadrícula"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                  title="Vista lista"
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
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-2xl p-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/45 mb-4" />
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">No hay productos disponibles</p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-md">
                  {products.length === 0
                    ? "Activa productos desde el Panel de Control → Página Web → Productos"
                    : "No se encontraron productos con los criterios de búsqueda actuales."}
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
                      <article 
                        key={product.id} 
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                      >
                        <div className="space-y-3">
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/30 border border-border/50">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ease-out"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground/35 bg-muted/20">
                                <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                              </div>
                            )}

                            {/* Badges */}
                            {product.is_sale && salePriceFormatted && (
                              <span className="absolute left-3 top-3 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-md">
                                OFERTA
                              </span>
                            )}

                            {/* Wishlist Button */}
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className="absolute right-3 top-3 h-8 w-8 rounded-lg bg-background/80 backdrop-blur-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-rose-500 hover:text-white border-0 shadow-sm"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Info Area */}
                          <div className="space-y-1.5 px-1">
                            {catName && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
                                {catName}
                              </span>
                            )}
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 text-amber-500 text-xs">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, idx) => (
                                  <Star key={idx} className="h-3 w-3 fill-current" />
                                ))}
                              </div>
                              <span className="text-muted-foreground text-[10px] ml-1">(5.0)</span>
                            </div>

                            {/* Price */}
                            <div className="pt-1">
                              {salePriceFormatted ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-primary">{salePriceFormatted}</span>
                                  <span className="text-xs text-muted-foreground line-through font-medium">{priceFormatted}</span>
                                </div>
                              ) : (
                                <span className="text-base font-bold text-gray-900 dark:text-white">
                                  {priceFormatted ?? "Consultar precio"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-3 px-1">
                          <Button 
                            className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/95 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 py-4 border-0"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Agregar al carrito
                          </Button>
                        </div>
                      </article>
                    );
                  }

                  // List view
                  return (
                    <article 
                      key={product.id} 
                      className="group flex flex-col sm:flex-row gap-4 border border-border/80 bg-card rounded-2xl p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="w-full sm:w-28 sm:h-28 aspect-square shrink-0 rounded-xl border border-border/50 overflow-hidden bg-muted/30 relative">
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/35 bg-muted/20">
                            <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                          </div>
                        )}
                        {product.is_sale && salePriceFormatted && (
                          <span className="absolute left-2 top-2 rounded-md bg-gradient-to-r from-rose-500 to-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                            OFERTA
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            {catName && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
                                {catName}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-amber-500 text-xs">
                              <Star className="h-3 w-3 fill-current text-amber-500" />
                              <span className="text-muted-foreground text-[10px]">(5.0)</span>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                          <div>
                            {salePriceFormatted ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-bold text-primary">{salePriceFormatted}</span>
                                <span className="text-xs text-muted-foreground line-through font-medium">{priceFormatted}</span>
                              </div>
                            ) : (
                              <span className="text-base font-bold text-gray-900 dark:text-white">
                                {priceFormatted ?? "Consultar precio"}
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="rounded-xl px-4 font-semibold flex items-center gap-1.5 border-0"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Agregar
                          </Button>
                        </div>
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
      <footer className="border-t border-border bg-card/60 backdrop-blur-md py-12 mt-16 shadow-inner">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div className="space-y-3">
              <h4 className="font-bold text-primary tracking-wide text-sm uppercase">Mi Tienda</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Ofrecemos la mejor calidad y atención personalizada para garantizar la satisfacción de todos nuestros clientes.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-xs uppercase tracking-wider">Navegación</h4>
              <ul className="space-y-2 text-muted-foreground text-xs">
                <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                <li><Link to="/productos" className="hover:text-primary transition-colors">Todos los productos</Link></li>
                <li><Link to="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link></li>
                <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-xs uppercase tracking-wider">Centro de Ayuda</h4>
              <ul className="space-y-2 text-muted-foreground text-xs">
                <li className="hover:text-primary cursor-pointer transition-colors">Preguntas Frecuentes</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Política de Envíos</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Devoluciones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-xs uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-2 text-muted-foreground text-xs">
                <li>soporte@mitienda.com</li>
                <li>+57 300 123 4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
