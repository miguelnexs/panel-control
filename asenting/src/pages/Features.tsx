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
    description: "Visualiza estadísticas de ventas diarias, ganancias, stock crítico y rendimiento comercial actualizadas al instante. Toma decisiones basadas en datos precisos.",
    details: ["Gráficos interactivos", "Exportación de reportes", "Filtros personalizables"]
  },
  {
    icon: Bell,
    title: "Notificaciones Automáticas",
    description: "Recibe alertas de nuevos pedidos web e inventario bajo al instante. Nunca pierdas una venta importante con nuestro sistema inteligente.",
    details: ["Alertas en tiempo real", "Personalización de sonidos", "Historial de notificaciones"]
  },
  {
    icon: ShoppingCart,
    title: "Punto de Venta (POS) y Caja",
    description: "Interfaz rápida para registrar ventas, controlar la apertura/cierre de turnos de caja, registrar movimientos manuales de efectivo y realizar arqueos de caja precisos.",
    details: ["Facturación rápida", "Control de arqueos de caja", "Turnos de cajeros"]
  },
  {
    icon: Shield,
    title: "Seguridad y Control de Acceso",
    description: "Protección multinivel con autenticación robusta y control estricto de roles y permisos para tus empleados. Protege la información crítica del negocio.",
    details: ["Sesiones seguras", "Roles definibles", "Cifrado de datos sensibles"]
  },
  {
    icon: Server,
    title: "Arquitectura Multi-Inquilino",
    description: "Aislamiento de bases de datos por cada cliente (tenant). Garantía de independencia, privacidad de datos y alta disponibilidad.",
    details: ["Aislamiento de datos", "Escalabilidad ilimitada", "Independencia total"]
  },
  {
    icon: Palette,
    title: "Constructor Web Auto-Gestionable",
    description: "Editor visual integrado para configurar la tienda virtual del cliente. Filtra categorías, destaca productos y personaliza plantillas premium.",
    details: ["Plantillas auto-generables", "Pasarelas Stripe y MercadoPago", "Configuración de envíos y dominios"]
  },
  {
    icon: Zap,
    title: "Rendimiento Optimizado",
    description: "Carga instantánea y navegación ultra fluida de la plataforma, diseñada para el trabajo diario sin retrasos.",
    details: ["Carga ultra rápida", "Caché inteligente", "Optimización de recursos"]
  },
  {
    icon: Users,
    title: "CRM y Cuentas de Clientes",
    description: "Gestión completa de cartera de clientes. Historial de compras detallado y seguimiento de saldos y créditos pendientes (cuentas corrientes).",
    details: ["Fidelización de clientes", "Límites de crédito", "Estado de cuenta detallado"]
  },
  {
    icon: Clock,
    title: "Gestión de Servicios y Reservas",
    description: "Catálogo de servicios profesionales con duraciones estimadas, asignación de personal y agendamiento de turnos para optimizar las horas de trabajo.",
    details: ["Catálogo de servicios", "Asignación de personal", "Control de agenda"]
  },
  {
    icon: Database,
    title: "Resguardo Automático",
    description: "Almacenamiento y copias de seguridad continuas de toda tu información operativa para prevenir pérdidas accidentales.",
    details: ["Respaldos continuos", "Redundancia de datos", "Recuperación rápida"]
  },
  {
    icon: Lock,
    title: "Configuraciones Locales y Globales",
    description: "Conecta impresoras térmicas locales, integra APIs de Google para Drive o correos, y parametrisa impuestos de facturación legal.",
    details: ["Impresión térmica", "Integración de Google Drive", "Ajustes de impuestos"]
  },
  {
    icon: RefreshCw,
    title: "Actualizaciones Continuas",
    description: "Mejoras constantes sin interrupciones de servicio. Nuevas herramientas de negocio agregadas regularmente sin costo adicional.",
    details: ["Updates automáticos", "Cero tiempo de inactividad", "Soporte incluido"]
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
              Descubre todas las herramientas que Asenting pone a tu disposición para 
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
