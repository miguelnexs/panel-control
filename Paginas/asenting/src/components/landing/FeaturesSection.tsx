import { 
  BarChart3, 
  Bell, 
  ShoppingCart, 
  Shield, 
  Server, 
  Users,
  Zap,
  RefreshCw,
  Cpu,
  Globe,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Métricas en tiempo real",
    description: "Visualiza usuarios, productos, ventas y más con datos actualizados al instante.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500"
  },
  {
    icon: Bell,
    title: "Notificaciones Pro",
    description: "Recibe alertas críticas de ventas y stock bajo con actualización inteligente en milisegundos.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500"
  },
  {
    icon: ShoppingCart,
    title: "Gestión Inteligente",
    description: "Control total sobre inventario, clientes y transacciones desde una interfaz intuitiva.",
    color: "from-orange-500/20 to-yellow-500/20",
    iconColor: "text-orange-500"
  },
  {
    icon: Shield,
    title: "Seguridad Bancaria",
    description: "Protección multinivel con cifrado de grado militar y autenticación JWT avanzada.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500"
  },
  {
    icon: Cpu,
    title: "Motor de Alto Rendimiento",
    description: "Optimizado con Django y React para ofrecer una velocidad de carga inigualable.",
    color: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-500"
  },
  {
    icon: Globe,
    title: "Branding Dinámico",
    description: "Adapta la identidad visual de tu plataforma globalmente con un solo clic.",
    color: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-500"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -ml-64 -mb-64" />

      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border border-white/10"
          >
            <Zap className="w-4 h-4 text-accent fill-current" />
            <span className="text-sm font-semibold tracking-wide uppercase">Capacidades Elite</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 tracking-tight"
          >
            Potencia sin <span className="gradient-text">compromisos</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            Nuestra arquitectura de vanguardia combina velocidad, seguridad y diseño 
            para llevar tu administración al siguiente nivel.
          </motion.p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative glass-card p-8 rounded-[2rem] border border-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden"
            >
              {/* Card Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {feature.description}
                </p>
                
                {/* Decoration */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <feature.icon className="w-12 h-12" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
