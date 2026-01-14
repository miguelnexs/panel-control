import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  BarChart3, 
  Bell, 
  ShoppingCart, 
  Shield, 
  Server, 
  Palette,
  Zap,
  Users,
  Clock,
  Database,
  Lock,
  RefreshCw
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Métricas en Tiempo Real",
    description: "Visualiza estadísticas de usuarios, productos, categorías, clientes y ventas actualizadas al instante. Toma decisiones basadas en datos precisos.",
    details: ["Gráficos interactivos", "Exportación de reportes", "Filtros personalizables"]
  },
  {
    icon: Bell,
    title: "Notificaciones Automáticas",
    description: "Recibe alertas de nuevos pedidos cada 3 segundos. Nunca pierdas una venta importante con nuestro sistema de notificaciones inteligente.",
    details: ["Alertas en tiempo real", "Personalización de sonidos", "Historial de notificaciones"]
  },
  {
    icon: ShoppingCart,
    title: "Gestión de Ventas",
    description: "Administra ventas, clientes y productos desde una interfaz unificada. Resumen de ventas recientes y totales siempre visible.",
    details: ["Panel de ventas", "Gestión de inventario", "Seguimiento de pedidos"]
  },
  {
    icon: Shield,
    title: "Seguridad JWT",
    description: "Autenticación robusta con tokens JWT. Tu información y la de tus clientes siempre protegida con los más altos estándares.",
    details: ["Encriptación avanzada", "Sesiones seguras", "Control de acceso"]
  },
  {
    icon: Server,
    title: "Backend Django/DRF",
    description: "Integración completa con Django Rest Framework. Una arquitectura sólida y escalable para tu negocio en crecimiento.",
    details: ["API RESTful", "Escalabilidad", "Alto rendimiento"]
  },
  {
    icon: Palette,
    title: "Branding Dinámico",
    description: "Personaliza colores, logo y elementos visuales desde el backend. Tu marca siempre presente en cada interacción.",
    details: ["Temas personalizados", "Logo dinámico", "Colores de marca"]
  },
  {
    icon: Zap,
    title: "Rendimiento Optimizado",
    description: "Carga instantánea y navegación fluida gracias a React y optimizaciones avanzadas de rendimiento.",
    details: ["Carga lazy", "Caché inteligente", "Compresión de datos"]
  },
  {
    icon: Users,
    title: "Multi-usuario",
    description: "Gestiona múltiples usuarios con diferentes roles y permisos. Control total sobre quién accede a qué.",
    details: ["Roles de usuario", "Permisos granulares", "Auditoría de acceso"]
  },
  {
    icon: Clock,
    title: "Historial Completo",
    description: "Accede al historial de todas las operaciones. Rastrea cambios y mantén un registro detallado de actividades.",
    details: ["Logs de actividad", "Trazabilidad", "Recuperación de datos"]
  },
  {
    icon: Database,
    title: "Base de Datos Robusta",
    description: "Almacenamiento seguro y eficiente de todos tus datos. Backups automáticos y recuperación ante desastres.",
    details: ["Backups automáticos", "Redundancia", "Migración sencilla"]
  },
  {
    icon: Lock,
    title: "Cumplimiento GDPR",
    description: "Diseñado con privacidad en mente. Cumple con las regulaciones de protección de datos más estrictas.",
    details: ["Privacidad por diseño", "Consentimiento", "Derecho al olvido"]
  },
  {
    icon: RefreshCw,
    title: "Actualizaciones Continuas",
    description: "Mejoras constantes sin interrupciones. Nuevas funcionalidades agregadas regularmente sin costo adicional.",
    details: ["Updates automáticos", "Sin downtime", "Soporte incluido"]
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Todas las <span className="text-gradient">Funcionalidades</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Descubre todas las herramientas que Localix pone a tu disposición para 
              gestionar tu negocio de forma eficiente.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
