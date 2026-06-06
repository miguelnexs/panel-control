import { Check, Rocket, Database, Lock, Palette } from "lucide-react";

const benefits = [
  {
    icon: Rocket,
    title: "Productividad Máxima",
    description: "Reduce el tiempo de gestión un 70% con todas las herramientas en un solo lugar.",
    stats: "70%",
    statsLabel: "más eficiente"
  },
  {
    icon: Database,
    title: "Centralización Total",
    description: "Usuarios, productos, categorías, clientes y ventas unificados en una vista.",
    stats: "1",
    statsLabel: "plataforma"
  },
  {
    icon: Lock,
    title: "Seguro y Estable",
    description: "Arquitectura robusta con Django y autenticación JWT de grado empresarial.",
    stats: "99.9%",
    statsLabel: "uptime"
  },
  {
    icon: Palette,
    title: "Diseño Moderno",
    description: "Interfaz construida con React y Tailwind CSS para una experiencia fluida.",
    stats: "2024",
    statsLabel: "tecnología"
  }
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-24 relative">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container relative px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Por qué elegir{" "}
            <span className="gradient-text">Localix Dashboard</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Beneficios que transformarán la forma en que administras tu negocio.
          </p>
        </div>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className="relative glass-card p-8 rounded-2xl overflow-hidden group hover:border-primary/50 transition-all duration-300"
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <benefit.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold gradient-text">{benefit.stats}</div>
                    <div className="text-sm text-muted-foreground">{benefit.statsLabel}</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground mb-4">{benefit.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Check className="w-4 h-4" />
                  <span>Incluido en todos los planes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
