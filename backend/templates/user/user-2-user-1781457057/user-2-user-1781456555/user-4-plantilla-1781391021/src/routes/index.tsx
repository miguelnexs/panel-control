import { createFileRoute } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "[NOMBRE DE TU TIENDA] — Plantilla" },
      { name: "description", content: "[Escribe aquí una descripción breve de tu tienda para SEO]" },
      { property: "og:title", content: "[NOMBRE DE TU TIENDA]" },
      { property: "og:description", content: "[Descripción para redes sociales]" },
    ],
  }),
  component: Index,
});

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/30 text-center text-xs uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {label}
    </div>
  );
}

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
      {/* ============ BARRA SUPERIOR / ANUNCIOS ============ */}
      <div className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs">
          [ Barra de anuncios — ej: "Envío gratis en compras mayores a $XX" ]
        </div>
      </div>

      {/* ============ HEADER / NAVEGACIÓN ============ */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex h-10 min-w-32 items-center justify-center rounded border-2 border-dashed border-border px-3 text-xs uppercase tracking-wider text-muted-foreground">
              [ LOGO ]
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#" className="hover:text-primary">[Categoría 1]</a>
            <a href="#" className="hover:text-primary">[Categoría 2]</a>
            <a href="#" className="hover:text-primary">[Categoría 3]</a>
            <a href="#" className="hover:text-primary">[Ofertas]</a>
            <a href="#" className="hover:text-primary">[Contacto]</a>
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

      {/* ============ HERO PRINCIPAL ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col justify-center gap-6">
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              [Etiqueta / Colección]
            </span>
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              [Título principal de tu tienda]
            </h1>
            <p className="text-lg text-muted-foreground">
              [Subtítulo o frase de valor — qué vendes y por qué te eligen.]
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg">[Comprar ahora]</Button>
              <Button size="lg" variant="outline">[Ver catálogo]</Button>
            </div>
          </div>
          <Placeholder label="[ IMAGEN HERO — 1200x800 ]" className="aspect-[4/3] w-full" />
        </div>
      </section>

      {/* ============ CATEGORÍAS DESTACADAS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold">[Categorías]</h2>
          <a href="#" className="text-sm font-medium hover:underline">[Ver todas →]</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group cursor-pointer space-y-3">
              <Placeholder label={`[ IMG CATEGORÍA ${i} ]`} className="aspect-square" />
              <h3 className="text-center font-medium">[Nombre categoría {i}]</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRODUCTOS DESTACADOS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">[Productos destacados]</h2>
            <p className="mt-2 text-muted-foreground">[Subtítulo de la sección]</p>
          </div>
          <a href="#" className="text-sm font-medium hover:underline">[Ver todo →]</a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <article key={i} className="group space-y-3">
              <div className="relative">
                <Placeholder label={`[ IMG PRODUCTO ${i} ]`} className="aspect-square" />
                <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                  [Etiqueta]
                </span>
                <Button size="icon" variant="secondary" className="absolute right-3 top-3 h-8 w-8">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">[Categoría]</p>
                <h3 className="font-medium">[Nombre del producto {i}]</h3>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">[$ Precio]</span>
                  <span className="text-sm text-muted-foreground line-through">[$ Antes]</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">[Agregar al carrito]</Button>
            </article>
          ))}
        </div>
      </section>

      {/* ============ BANNER PROMOCIONAL ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-lg">
            <Placeholder label="[ BANNER PROMO 1 — 800x500 ]" className="aspect-[16/10]" />
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <Placeholder label="[ BANNER PROMO 2 — 800x500 ]" className="aspect-[16/10]" />
          </div>
        </div>
      </section>

      {/* ============ BENEFICIOS / VENTAJAS ============ */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "[Envío gratis]",
            "[Pago seguro]",
            "[Devoluciones]",
            "[Atención 24/7]",
          ].map((title, i) => (
            <div key={i} className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-border text-xs text-muted-foreground">
                [Ico]
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">[Descripción breve del beneficio]</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SOBRE NOSOTROS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <Placeholder label="[ IMAGEN SOBRE NOSOTROS ]" className="aspect-square" />
          <div className="flex flex-col justify-center space-y-4">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">[Sobre la marca]</span>
            <h2 className="text-4xl font-bold">[Nuestra historia]</h2>
            <p className="text-muted-foreground">
              [Cuenta brevemente quién eres, qué te diferencia y por qué empezaste esta tienda.]
            </p>
            <p className="text-muted-foreground">
              [Segundo párrafo opcional con valores o misión.]
            </p>
            <Button variant="outline" className="w-fit">[Conocer más]</Button>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-10 text-center text-3xl font-bold">[Lo que dicen nuestros clientes]</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-6">
                <div className="mb-3 text-sm">★★★★★</div>
                <p className="text-sm text-muted-foreground">
                  "[Texto del testimonio del cliente {i}. Habla de la experiencia de compra y el producto.]"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-border" />
                  <div>
                    <p className="text-sm font-medium">[Nombre cliente]</p>
                    <p className="text-xs text-muted-foreground">[Ciudad]</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold">[Suscríbete al newsletter]</h2>
        <p className="mt-3 text-muted-foreground">
          [Recibe ofertas, novedades y un descuento de bienvenida.]
        </p>
        <form className="mt-6 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="[tu@email.com]"
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <Button type="submit">[Suscribirme]</Button>
        </form>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex h-10 w-32 items-center justify-center rounded border-2 border-dashed border-border text-xs uppercase text-muted-foreground">
                [ LOGO ]
              </div>
              <p className="text-sm text-muted-foreground">
                [Frase corta describiendo la tienda.]
              </p>
              <div className="flex gap-3 text-sm">
                <a href="#">[IG]</a><a href="#">[FB]</a><a href="#">[TT]</a><a href="#">[WA]</a>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase">[Tienda]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">[Todos los productos]</a></li>
                <li><a href="#">[Novedades]</a></li>
                <li><a href="#">[Ofertas]</a></li>
                <li><a href="#">[Más vendidos]</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase">[Ayuda]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">[Envíos]</a></li>
                <li><a href="#">[Devoluciones]</a></li>
                <li><a href="#">[Métodos de pago]</a></li>
                <li><a href="#">[Preguntas frecuentes]</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase">[Contacto]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>[Dirección física]</li>
                <li>[Teléfono / WhatsApp]</li>
                <li>[correo@tutienda.com]</li>
                <li>[Horario de atención]</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© [Año] [Nombre de tu tienda]. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#">[Términos]</a>
              <a href="#">[Privacidad]</a>
              <a href="#">[Cookies]</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
