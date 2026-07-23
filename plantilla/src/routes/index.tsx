import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart, Menu, Star, Zap, ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi Tienda Oficial — Tu Destino de Estilo y Tecnología" },
      { name: "description", content: "Descubre nuestra selección exclusiva de productos de alta calidad y tecnología de punta con envíos a todo el país." },
      { property: "og:title", content: "Mi Tienda Oficial" },
      { property: "og:description", content: "Encuentra la mejor calidad y servicio en nuestra tienda virtual." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Mock static products matching the premium style
  const mockProducts = [
    {
      id: 1,
      name: "Auriculares Inalámbricos Pro Noise-Cancelling",
      category: "Tecnología",
      price: 249000,
      sale_price: 189000,
      is_sale: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "Reloj Inteligente Fit V2 - Sensor Ritmo Cardíaco",
      category: "Accesorios",
      price: 199000,
      is_sale: false,
      rating: 4.9
    },
    {
      id: 3,
      name: "Cargador Rápido GaN 65W - Conexión USB-C Dual",
      category: "Accesorios",
      price: 89000,
      sale_price: 69000,
      is_sale: true,
      rating: 4.7
    },
    {
      id: 4,
      name: "Teclado Mecánico Retroiluminado RGB Switch Blue",
      category: "Tecnología",
      price: 320000,
      is_sale: false,
      rating: 5.0
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
      {/* ============ BARRA SUPERIOR / ANUNCIOS ============ */}
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
            <Link to="/" className="text-primary font-semibold">Inicio</Link>
            <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
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

      {/* ============ HERO PRINCIPAL ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col justify-center gap-6">
            <span className="inline-block w-fit px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-wider uppercase">
              Nueva Colección 2026
            </span>
            <h1 className="text-5xl font-extrabold leading-tight text-gray-900 dark:text-white md:text-6xl tracking-tight">
              Eleva tu estilo y tecnología hoy
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Descubre nuestra gama de productos seleccionados con los más altos estándares de calidad, diseño premium y soporte técnico garantizado.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/productos">
                <Button size="lg" className="rounded-xl font-semibold px-8 py-6 border-0 shadow-lg shadow-primary/20">
                  Comprar ahora
                </Button>
              </Link>
              <Link to="/productos">
                <Button size="lg" variant="outline" className="rounded-xl font-semibold px-8 py-6 border-border hover:bg-muted">
                  Ver catálogo
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Premium Graphic Container */}
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-gradient-to-tr from-primary/5 to-primary/20 border border-primary/10 shadow-2xl flex flex-col items-center justify-center p-8 text-center group">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <ShoppingBag className="h-28 w-28 text-primary/30 group-hover:scale-110 transition-transform duration-500 ease-out mb-6 stroke-[1]" />
            <span className="text-xl font-black text-primary/80 uppercase tracking-widest block">Colección Exclusiva</span>
            <span className="text-xs text-muted-foreground mt-2 block">Imágenes ilustrativas disponibles al cargar tu inventario</span>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS DESTACADAS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Categorías Destacadas</h2>
            <p className="mt-2 text-sm text-muted-foreground">Explora productos organizados por especialidad</p>
          </div>
          <Link to="/productos" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Tecnología", count: "12 Productos", label: "💻" },
            { name: "Accesorios", count: "25 Productos", label: "🎧" },
            { name: "Hogar", count: "8 Productos", label: "🏡" },
            { name: "Calzado", count: "15 Productos", label: "👟" },
          ].map((cat, i) => (
            <div key={i} className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.label}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wider">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRODUCTOS DESTACADOS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Productos Destacados</h2>
            <p className="mt-2 text-sm text-muted-foreground">Nuestra selección recomendada de la semana</p>
          </div>
          <Link to="/productos" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockProducts.map((product) => {
            const priceFormatted = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(product.price);
            const salePriceFormatted = product.sale_price ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(product.sale_price) : null;

            return (
              <article 
                key={product.id} 
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="space-y-3">
                  {/* Image Area */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-muted-foreground/30 p-6">
                    <ShoppingBag className="h-12 w-12 stroke-[1.2] group-hover:scale-110 transition-transform duration-500" />
                    
                    {product.is_sale && salePriceFormatted && (
                      <span className="absolute left-3 top-3 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-1 text-[9px] font-bold tracking-wider text-white shadow-sm">
                        OFERTA
                      </span>
                    )}
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
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
                      {product.category}
                    </span>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs leading-snug line-clamp-2 min-h-[36px]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-muted-foreground text-[10px] ml-0.5">({product.rating})</span>
                    </div>
                    <div className="pt-1">
                      {salePriceFormatted ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-primary">{salePriceFormatted}</span>
                          <span className="text-xs text-muted-foreground line-through font-medium">{priceFormatted}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {priceFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 px-1">
                  <Button className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground py-3.5 border-0 flex items-center justify-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Agregar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============ BANNER PROMOCIONAL ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 p-8 text-white flex flex-col justify-between min-h-[220px] shadow-lg">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 rounded-md px-2 py-0.5 w-fit">Tecnología</span>
              <h3 className="text-2xl font-black">Hasta 20% de descuento</h3>
              <p className="text-white/80 text-xs max-w-xs leading-relaxed">
                Encuentra dispositivos de audio profesional y periféricos de alta gama con precios rebajados.
              </p>
            </div>
            <Link to="/productos" className="w-fit">
              <Button variant="secondary" className="rounded-xl font-bold text-xs bg-white text-indigo-700 hover:bg-white/90 border-0">
                Ver Ofertas
              </Button>
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white flex flex-col justify-between min-h-[220px] shadow-lg">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 rounded-md px-2 py-0.5 w-fit">Accesorios</span>
              <h3 className="text-2xl font-black">Nuevos Ingresos 2026</h3>
              <p className="text-white/80 text-xs max-w-xs leading-relaxed">
                Relojes inteligentes, cargadores GaN y accesorios premium para tu día a día.
              </p>
            </div>
            <Link to="/productos" className="w-fit">
              <Button variant="secondary" className="rounded-xl font-bold text-xs bg-white text-emerald-700 hover:bg-white/90 border-0">
                Ver Novedades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ BENEFICIOS / VENTAJAS ============ */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Envío Asegurado", desc: "Entrega confiable en todo el país", icon: <Truck className="h-5 w-5 text-primary" /> },
            { title: "Garantía Absoluta", desc: "100% de devolución si no te gusta", icon: <RotateCcw className="h-5 w-5 text-primary" /> },
            { title: "Pago 100% Seguro", desc: "Pasarelas certificadas y encriptadas", icon: <ShieldCheck className="h-5 w-5 text-primary" /> },
            { title: "Atención Especializada", desc: "Soporte personalizado vía WhatsApp", icon: <Headphones className="h-5 w-5 text-primary" /> }
          ].map((item, i) => (
            <div key={i} className="space-y-3 text-center flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wider">{item.title}</h3>
              <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SOBRE NOSOTROS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-tr from-muted/5 to-muted/20 border border-border shadow-xl flex items-center justify-center text-muted-foreground/35">
            <ShoppingBag className="h-32 w-32 stroke-[1]" />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <span className="inline-block w-fit px-3 py-1 rounded-md bg-muted text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Sobre la marca
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Nuestra Historia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Comenzamos con la visión de llevar productos tecnológicos y accesorios premium de alta calidad a todos los hogares, eliminando intermediarios y garantizando la mejor atención posible.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cada producto en nuestro catálogo pasa por rigurosos controles de calidad para asegurar que tengas en tus manos solo lo mejor de la industria.
            </p>
            <Link to="/productos" className="w-fit">
              <Button variant="outline" className="rounded-xl font-bold text-xs px-6 py-5 border-border hover:bg-muted">
                Conocer más
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section className="bg-muted/10 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Lo que dicen nuestros clientes</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: "Carlos Mendoza", city: "Bogotá", comment: "Excelente atención y velocidad de entrega. El cargador de 65W carga mi laptop en tiempo récord." },
              { name: "Lucía Gómez", city: "Medellín", comment: "La calidad de los auriculares es de otro planeta por este precio. Definitivamente volveré a comprar." },
              { name: "Andrés Felipe", city: "Cali", comment: "El teclado mecánico se siente súper premium. Muy contento con el empaque y el soporte por WhatsApp." }
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 text-sm text-amber-500">★★★★★</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "{item.comment}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Suscríbete a nuestro boletín</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Recibe ofertas exclusivas, lanzamientos de nuevos productos y un cupón de 10% de descuento en tu primera compra.
        </p>
        <form className="mt-6 flex flex-col gap-2.5 sm:flex-row max-w-md mx-auto">
          <input
            type="email"
            placeholder="Introduce tu correo electrónico"
            className="flex-1 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
          <Button type="submit" className="rounded-xl font-semibold border-0 py-3.5">Suscribirme</Button>
        </form>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-md py-12 shadow-inner">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4 text-sm">
            <div className="space-y-3">
              <h4 className="font-bold text-primary tracking-wide text-sm uppercase">Mi Tienda</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Ofrecemos la mejor calidad y atención personalizada para garantizar la satisfacción de todos nuestros clientes.
              </p>
              <div className="flex gap-4 text-xs font-semibold text-muted-foreground/80">
                <a href="#" className="hover:text-primary transition-colors">IG</a>
                <a href="#" className="hover:text-primary transition-colors">FB</a>
                <a href="#" className="hover:text-primary transition-colors">WA</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-xs uppercase tracking-wider">Categorías</h4>
              <ul className="space-y-2 text-muted-foreground text-xs">
                <li><Link to="/productos" className="hover:text-primary transition-colors">Todos los productos</Link></li>
                <li><Link to="/productos" className="hover:text-primary transition-colors">Novedades</Link></li>
                <li><Link to="/productos" className="hover:text-primary transition-colors">Ofertas Especiales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-xs uppercase tracking-wider">Ayuda</h4>
              <ul className="space-y-2 text-muted-foreground text-xs">
                <li className="hover:text-primary cursor-pointer transition-colors">Envíos Nacionales</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Garantías & Devoluciones</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Métodos de Pago</li>
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

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Términos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
