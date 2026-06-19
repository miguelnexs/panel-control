import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart, Menu, Phone, Mail, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "[NOMBRE DE TU TIENDA] — Contacto" },
      { name: "description", content: "[Ponte en contacto con nosotros. Estamos aquí para ayudarte.]" },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "[Dirección]",
      lines: ["[Calle Principal #123]", "[Ciudad, País]"],
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "[Teléfono]",
      lines: ["[+57 300 123 4567]", "[+57 310 765 4321]"],
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "[Email]",
      lines: ["[contacto@tutienda.com]", "[ventas@tutienda.com]"],
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "[Horario]",
      lines: ["[Lun – Vie: 8:00 AM – 6:00 PM]", "[Sáb: 9:00 AM – 2:00 PM]"],
    },
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
            <Link to="/nosotros" className="hover:text-primary">[Nosotros]</Link>
            <Link to="/contacto" className="text-primary font-semibold">[Contacto]</Link>
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

      {/* ============ HERO CONTACTO ============ */}
      <section className="bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-5xl font-bold">[Contáctanos]</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            [Estamos aquí para ayudarte. Cuéntanos en qué podemos asistirte y nos pondremos en contacto contigo lo antes posible.]
          </p>
        </div>
      </section>

      {/* ============ TARJETAS DE CONTACTO ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-6 text-center space-y-4 hover:border-primary/50 transition-colors group">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {item.icon}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <div className="space-y-1">
                {item.lines.map((line, j) => (
                  <p key={j} className="text-sm text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FORMULARIO + MAPA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Formulario */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">[Envíanos un Mensaje]</h2>
              <p className="mt-2 text-muted-foreground">
                [Completa el formulario y te responderemos en menos de 24 horas.]
              </p>
            </div>

            {sent ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-green-800">[¡Mensaje enviado con éxito!]</h3>
                <p className="text-sm text-green-600">[Gracias por contactarnos. Te responderemos muy pronto.]</p>
                <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                  [Enviar otro mensaje]
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">[Nombre completo] <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="[Tu nombre]"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">[Correo electrónico] <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="[tu@email.com]"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">[Asunto]</label>
                  <select
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  >
                    <option value="">[Selecciona un tema]</option>
                    <option>[Consulta sobre productos]</option>
                    <option>[Estado de mi pedido]</option>
                    <option>[Devoluciones y cambios]</option>
                    <option>[Facturación y pagos]</option>
                    <option>[Otro]</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">[Mensaje] <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={5}
                    placeholder="[Escribe tu mensaje aquí...]"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  [Enviar mensaje]
                </Button>
              </form>
            )}
          </div>

          {/* Mapa / Info adicional */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">[Encuéntranos]</h2>
              <p className="mt-2 text-muted-foreground">
                [Visítanos en nuestra tienda física o contáctanos por nuestros canales digitales.]
              </p>
            </div>

            {/* Mapa placeholder */}
            <div className="aspect-[4/3] rounded-xl bg-muted/40 flex items-center justify-center border-2 border-dashed border-border text-sm text-muted-foreground">
              [ MAPA DE UBICACIÓN — Google Maps embed aquí ]
            </div>

            {/* Redes Sociales */}
            <div className="rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-semibold">[Síguenos en redes sociales]</h3>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Instagram className="h-4 w-4" />
                  </div>
                  [Instagram] — <span className="font-medium">[@tutienda]</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Facebook className="h-4 w-4" />
                  </div>
                  [Facebook] — <span className="font-medium">[Tu Tienda Oficial]</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Twitter className="h-4 w-4" />
                  </div>
                  [Twitter / X] — <span className="font-medium">[@tutienda]</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  [WhatsApp] — <span className="font-medium">[+57 300 123 4567]</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-10">[Preguntas Frecuentes]</h2>
          <div className="space-y-4">
            {[
              { q: "[¿Cuánto tarda el envío?]", a: "[Los envíos normalmente tardan entre 2 y 5 días hábiles dependiendo de tu ubicación.]" },
              { q: "[¿Puedo devolver un producto?]", a: "[Sí, tienes 15 días hábiles desde la recepción del producto para solicitar una devolución.]" },
              { q: "[¿Qué métodos de pago aceptan?]", a: "[Aceptamos tarjetas de crédito/débito, transferencias bancarias, PSE y pago contra entrega.]" },
              { q: "[¿Hacen envíos internacionales?]", a: "[Actualmente solo realizamos envíos dentro del territorio nacional. Pronto expandiremos nuestro servicio.]" },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-5 space-y-2">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
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
