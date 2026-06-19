import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart, Menu, Users, Award, Target, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "[NOMBRE DE TU TIENDA] — Nosotros" },
      { name: "description", content: "[Conoce la historia y valores de nuestra marca]" },
    ],
  }),
  component: NosotrosPage,
});

function NosotrosPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const valores = [
    { icon: <Award className="h-8 w-8" />, title: "[Calidad]", desc: "[Seleccionamos solo los mejores productos para garantizar tu satisfacción.]" },
    { icon: <Target className="h-8 w-8" />, title: "[Compromiso]", desc: "[Nos comprometemos con tu experiencia de compra de inicio a fin.]" },
    { icon: <Users className="h-8 w-8" />, title: "[Comunidad]", desc: "[Somos más que una tienda, somos una comunidad que crece contigo.]" },
    { icon: <Smile className="h-8 w-8" />, title: "[Satisfacción]", desc: "[Tu felicidad es nuestra prioridad. Trabajamos cada día por ello.]" },
  ];

  const stats = [
    { value: "[+5,000]", label: "[Clientes felices]" },
    { value: "[+200]", label: "[Productos disponibles]" },
    { value: "[5]", label: "[Años de experiencia]" },
    { value: "[98%]", label: "[Satisfacción del cliente]" },
  ];

  const team = [
    { name: "[Nombre 1]", role: "[CEO / Fundador]" },
    { name: "[Nombre 2]", role: "[Directora de Operaciones]" },
    { name: "[Nombre 3]", role: "[Jefe de Marketing]" },
    { name: "[Nombre 4]", role: "[Atención al Cliente]" },
  ];

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
            <Link to="/productos" className="hover:text-primary">[Productos]</Link>
            <Link to="/nosotros" className="text-primary font-semibold">[Nosotros]</Link>
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

      {/* ============ HERO NOSOTROS ============ */}
      <section className="relative overflow-hidden bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                [Nuestra Historia]
              </span>
              <h1 className="text-5xl font-bold leading-tight">
                [Quiénes somos y por qué hacemos lo que hacemos]
              </h1>
              <p className="text-lg text-muted-foreground">
                [Somos un equipo apasionado comprometido con llevar los mejores productos a tu puerta. Desde nuestros inicios, hemos trabajado para crear una experiencia de compra que sea cómoda, confiable y memorable.]
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/productos">
                  <Button size="lg">[Ver nuestros productos]</Button>
                </Link>
                <Link to="/contacto">
                  <Button size="lg" variant="outline">[Contáctanos]</Button>
                </Link>
              </div>
            </div>
            <div className="aspect-square bg-muted/40 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground">
              [ IMAGEN NOSOTROS — 800x800 ]
            </div>
          </div>
        </div>
      </section>

      {/* ============ ESTADÍSTICAS ============ */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HISTORIA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-16 md:grid-cols-2 items-center">
          <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground">
            [ IMAGEN HISTORIA — 800x600 ]
          </div>
          <div className="space-y-6">
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              [Nuestra Historia]
            </span>
            <h2 className="text-4xl font-bold">[Empezamos con una idea simple]</h2>
            <p className="text-muted-foreground leading-relaxed">
              [Párrafo 1: Cuenta el origen de tu negocio. ¿Cuándo empezaste? ¿Qué te motivó? ¿Cuál fue el momento que lo cambió todo?]
            </p>
            <p className="text-muted-foreground leading-relaxed">
              [Párrafo 2: Describe el crecimiento. ¿Cómo evolucionó tu marca? ¿Qué logros obtuviste? ¿Cuáles fueron los momentos clave?]
            </p>
            <p className="text-muted-foreground leading-relaxed">
              [Párrafo 3: Habla del presente. ¿Dónde estás hoy? ¿Qué ofreces? ¿Qué diferencia a tu marca de las demás?]
            </p>
          </div>
        </div>
      </section>

      {/* ============ VALORES ============ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold">[Nuestros Valores]</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              [Los valores que guían cada decisión que tomamos como empresa y equipo.]
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {valores.map((v, i) => (
              <div key={i} className="text-center space-y-4 p-6 rounded-xl bg-background border border-border">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {v.icon}
                </div>
                <h3 className="font-bold text-lg">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EQUIPO ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">[Nuestro Equipo]</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            [Las personas detrás de la marca que trabajan cada día para servirte mejor.]
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="mx-auto w-32 h-32 rounded-full bg-muted/40 border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                [Foto {i + 1}]
              </div>
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
              <div className="flex justify-center gap-3 text-sm text-muted-foreground">
                <a href="#">[IG]</a>
                <a href="#">[LK]</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-6">
          <h2 className="text-4xl font-bold">[¿Listo para ser parte de nuestra historia?]</h2>
          <p className="text-lg opacity-90">
            [Únete a miles de clientes satisfechos que ya confían en nosotros para sus compras.]
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/productos">
              <Button size="lg" variant="secondary">[Explorar productos]</Button>
            </Link>
            <Link to="/contacto">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                [Habla con nosotros]
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex h-10 w-32 items-center justify-center rounded border-2 border-dashed border-border text-xs uppercase text-muted-foreground">
                [ LOGO ]
              </div>
              <p className="text-sm text-muted-foreground">[Frase corta de la tienda.]</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase">[Tienda]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/productos">[Todos los productos]</Link></li>
                <li><a href="#">[Novedades]</a></li>
                <li><a href="#">[Ofertas]</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase">[Empresa]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/nosotros">[Nosotros]</Link></li>
                <li><Link to="/contacto">[Contacto]</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase">[Contacto]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>[Dirección física]</li>
                <li>[Teléfono / WhatsApp]</li>
                <li>[correo@tutienda.com]</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© [Año] [Nombre de tu tienda]. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
