import React, { useState, useEffect } from "react";
import {Search, ShoppingBag, User, Heart, Menu, Phone, Mail, MapPin, Shield, Truck, RefreshCw, Star, Trash2 } from "lucide-react";

interface AppSettings {
  company_name: string;
  company_description: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  logo?: string | null;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>({
    company_name: "Mi Tienda Virtual",
    company_description: "La mejor selección de productos de alta calidad para ti.",
    primary_color: "#1e3a8a",
    secondary_color: "#f3f4f6",
    font_family: "Inter"
  });

  const applySettings = (data: any) => {
    if (!data) return;
    setSettings(prev => ({
      ...prev,
      company_name: data.company_name || prev.company_name,
      company_description: data.company_description || prev.company_description,
      primary_color: data.primary_color || prev.primary_color,
      secondary_color: data.secondary_color || prev.secondary_color,
      font_family: data.font_family || prev.font_family,
      logo: data.logo || prev.logo
    }));
  };

  useEffect(() => {
    // Fetch initial settings from Django API
    const apiBase = window.location.hostname === "localhost" ? "http://localhost:8000" : "";
    fetch(`${apiBase}/webconfig/settings/`)
      .then(res => res.json())
      .then(data => applySettings(data))
      .catch(err => console.error("Error loading settings:", err));

    // Listen for real-time changes from SiteEditor
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SETTINGS_CHANGED") {
        applySettings(event.data.payload);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Inline CSS variables override
  const customStyles = {
    "--primary": settings.primary_color,
    "--secondary": settings.secondary_color,
    fontFamily: settings.font_family || "Inter"
  } as React.CSSProperties;

  return (
    <div style={customStyles} className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Dynamic Style injection for Tailwind CSS primary/secondary overrides */}
      <style>{`
        :root {
          --primary: ${settings.primary_color} !important;
          --secondary: ${settings.secondary_color} !important;
        }
        .bg-custom-primary { background-color: var(--primary) !important; }
        .text-custom-primary { color: var(--primary) !important; }
        .border-custom-primary { border-color: var(--primary) !important; }
        .bg-custom-secondary { background-color: var(--secondary) !important; }
        .text-custom-secondary { color: var(--secondary) !important; }
      `}</style>

      {/* ============ ANNOUNCEMENT BAR ============ */}
      <div className="bg-custom-primary text-white text-xs py-2 text-center font-medium px-4">
        ¡Envío gratis en compras superiores a $150,000 COP! | 3 cuotas sin interés
      </div>

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.company_name} className="h-10 object-contain" />
              ) : (
                <span className="text-xl font-black tracking-tight text-custom-primary">{settings.company_name}</span>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#" className="hover:text-custom-primary transition-colors">Inicio</a>
            <a href="#" className="hover:text-custom-primary transition-colors">Productos</a>
            <a href="#" className="hover:text-custom-primary transition-colors">Categorías</a>
            <a href="#" className="hover:text-custom-primary transition-colors">Nosotros</a>
            <a href="#" className="hover:text-custom-primary transition-colors">Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Search className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><User className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Heart className="h-5 w-5" /></button>
            <button className="p-2 bg-custom-primary text-white rounded-full flex items-center justify-center relative shadow-md">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative bg-gray-50 py-20 px-4 overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-12">
          <div className="space-y-6">
            <span className="inline-block bg-custom-primary/10 text-custom-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nueva Colección 2026
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-gray-900">
              Eleva tu estilo con {settings.company_name}
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              {settings.company_description} Descubre nuestra última selección exclusiva de productos premium creados para ti.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="px-8 py-3.5 bg-custom-primary text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-xl hover:scale-[1.02] transition-all">
                Ver Catálogo
              </a>
              <a href="#" className="px-8 py-3.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                Conocer Más
              </a>
            </div>
          </div>
          <div className="relative aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-mono text-sm shadow-xl">
            [ IMAGEN HERO PRINCIPAL ]
          </div>
        </div>
      </section>

      {/* ============ FEATURED ADVANTAGES ============ */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "Envío Express", desc: "Entrega segura y rápida en todo el país" },
            { icon: Shield, title: "Garantía Total", desc: "Protección en todas tus compras y pagos" },
            { icon: RefreshCw, title: "Cambios Libres", desc: "Devoluciones sencillas durante 15 días" },
            { icon: Phone, title: "Soporte 24/7", desc: "Atención personalizada vía WhatsApp" },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-custom-primary/10 rounded-xl text-custom-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-black text-gray-900">Productos Destacados</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Explora nuestros artículos más vendidos y mejor valorados por los usuarios.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs border-b border-gray-200">
                  [ PRODUCTO {idx} ]
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Categoría</span>
                    <h3 className="font-bold text-gray-900 text-sm">Producto de Muestra {idx}</h3>
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-[10px] text-gray-400 font-medium ml-1">(12)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-custom-primary text-base">$99.900</span>
                      <span className="text-xs text-gray-400 line-through">$129.900</span>
                    </div>
                    <button className="w-full py-2.5 bg-custom-primary/5 hover:bg-custom-primary text-custom-primary hover:text-white border border-custom-primary/20 hover:border-transparent rounded-xl text-xs font-bold transition-all">
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROMOTIONAL BANNER ============ */}
      <section className="py-16 bg-white px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto rounded-3xl bg-custom-primary p-8 md:p-16 text-white grid md:grid-cols-2 items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white_20%,transparent)]" />
          <div className="space-y-5 relative z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">Oferta Especial de Temporada</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Únete hoy y obtén un 15% de descuento</h2>
            <p className="text-white/80 text-sm md:text-base">Registra tu correo electrónico en nuestro boletín informativo y recibe ofertas exclusivas.</p>
            <form className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-md">
              <input type="email" placeholder="tu@correo.com" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
              <button type="submit" className="px-6 py-3 bg-white text-custom-primary hover:bg-gray-100 font-bold rounded-xl text-sm transition-all shadow-lg shadow-black/10">
                Suscribirme
              </button>
            </form>
          </div>
          <div className="relative aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 font-mono text-sm">
            [ IMAGEN PROMOCIONAL ]
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg tracking-tight">{settings.company_name}</h3>
            <p className="text-xs leading-relaxed">{settings.company_description}</p>
            <div className="flex gap-3 text-xs text-white">
              <a href="#" className="hover:underline">Instagram</a>
              <a href="#" className="hover:underline">Facebook</a>
              <a href="#" className="hover:underline">WhatsApp</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Categorías</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Tecnología</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Moda & Calzado</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hogar & Decoración</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Deportes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Soporte</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Envío</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos del Servicio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Contacto</h4>
            <div className="flex items-center gap-2 text-xs"><MapPin className="h-4 w-4 shrink-0 text-custom-primary" /> <span>Bogotá, Colombia</span></div>
            <div className="flex items-center gap-2 text-xs"><Phone className="h-4 w-4 shrink-0 text-custom-primary" /> <span>+57 300 123 4567</span></div>
            <div className="flex items-center gap-2 text-xs"><Mail className="h-4 w-4 shrink-0 text-custom-primary" /> <span className="truncate">contacto@tutienda.com</span></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <p>© {new Date().getFullYear()} {settings.company_name}. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
