import { 
  BarChart3, 
  Bell, 
  ShoppingCart, 
  Shield, 
  Server, 
  Users,
  Zap,
  RefreshCw
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Métricas en tiempo real",
    description: "Visualiza usuarios, productos, ventas y más con datos actualizados al instante."
  },
  {
    icon: Bell,
    title: "Notificaciones automáticas",
    description: "Recibe alertas de nuevos pedidos con actualización cada 3 segundos."
  },
  {
    icon: ShoppingCart,
    title: "Gestión de ventas",
    description: "Controla ventas, clientes y productos desde un solo lugar centralizado."
  },
  {
    icon: Shield,
    title: "Seguridad JWT",
    description: "Autenticación segura con tokens JWT para proteger tu información."
  },
  {
    icon: Server,
    title: "Backend Django/DRF",
    description: "Integración profesional con Django REST Framework para máxima estabilidad."
  },
  {
    icon: RefreshCw,
    title: "Branding dinámico",
    description: "Personaliza el dashboard con tu marca cargada desde el backend."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Funcionalidades</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Todo lo que necesitas para{" "}
            <span className="gradient-text">gestionar tu negocio</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Herramientas poderosas diseñadas para maximizar tu productividad y control.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group glass-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
