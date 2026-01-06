
import { Shield, Truck, Heart, Award, Users, Sparkles } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Heart,
      title: "Diseño con Amor",
      description: "Cada bolso es creado con pasión y dedicación para reflejar tu personalidad única.",
      color: "text-pink-medium"
    },
    {
      icon: Shield,
      title: "Calidad Garantizada",
      description: "Utilizamos solo los mejores materiales para asegurar durabilidad y elegancia.",
      color: "text-pink-dark"
    },
    {
      icon: Truck,
      title: "Envío Seguro",
      description: "Tu bolso llegará perfectamente empacado y en el tiempo prometido.",
      color: "text-pink-medium"
    },
    {
      icon: Award,
      title: "Exclusividad",
      description: "Diseños únicos que no encontrarás en ningún otro lugar.",
      color: "text-pink-dark"
    },
    {
      icon: Users,
      title: "Atención Personalizada",
      description: "Nuestro equipo está siempre disponible para ayudarte a encontrar tu bolso ideal.",
      color: "text-pink-medium"
    },
    {
      icon: Sparkles,
      title: "Estilo Atemporal",
      description: "Bolsos que nunca pasan de moda y te acompañarán por años.",
      color: "text-pink-dark"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-pink-light/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Más que bolsos, creamos experiencias únicas que reflejan tu estilo y personalidad.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-medium to-pink-dark mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-pink-pastel/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
