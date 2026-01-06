import { Droplets, Leaf, Shield, Sparkles, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const benefits = [
  {
    icon: Droplets,
    title: "Hidratación 24h",
    description: "Fórmula de liberación prolongada que mantiene tu piel hidratada durante todo el día y la noche.",
  },
  {
    icon: Leaf,
    title: "Ingredientes Naturales",
    description: "Extractos botánicos puros y aceites esenciales cuidadosamente seleccionados de fuentes sostenibles.",
  },
  {
    icon: Shield,
    title: "Dermatológicamente Probado",
    description: "Clínicamente testado y aprobado por dermatólogos para todo tipo de pieles, incluso las más sensibles.",
  },
  {
    icon: Sparkles,
    title: "Aromas Exclusivos",
    description: "Fragancias únicas creadas por perfumistas expertos que elevan tu experiencia de cuidado personal.",
  },
  {
    icon: Heart,
    title: "Libre de Crueldad",
    description: "Comprometidos con el bienestar animal. Ningún producto LOVALBE es testado en animales.",
  },
];

const Benefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="beneficios"
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(40 30% 96%) 0%, hsl(350 60% 85% / 0.15) 100%)",
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-lovalbe-gold-light/20 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-lovalbe-rose/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-accent font-medium tracking-widest text-sm uppercase">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mt-4 mb-6">
            Beneficios LOVALBE
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Cada producto está diseñado pensando en tu bienestar y el del planeta.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`group relative bg-card/70 backdrop-blur-sm border border-border/50 rounded-3xl p-8 transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-lovalbe-gold-light to-lovalbe-gold rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-gold">
                <benefit.icon className="w-8 h-8 text-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-lovalbe-rose/10 to-transparent rounded-bl-[60px] rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom Decoration */}
        <div className="flex justify-center mt-16 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-accent/50 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${800 + i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
