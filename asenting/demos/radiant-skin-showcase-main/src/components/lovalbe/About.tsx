import { Leaf, Recycle, Award, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import aboutImage from "@/assets/about-lovalbe.jpg";

const values = [
  {
    icon: Leaf,
    title: "Sostenibilidad",
    description: "Ingredientes de origen sostenible",
  },
  {
    icon: Recycle,
    title: "Eco-Packaging",
    description: "Envases 100% reciclables",
  },
  {
    icon: Award,
    title: "Calidad Premium",
    description: "Fórmulas certificadas",
  },
  {
    icon: Heart,
    title: "Cruelty Free",
    description: "Sin tests en animales",
  },
];

const About = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="sobre"
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(350 60% 85% / 0.1) 0%, hsl(43 50% 75% / 0.15) 100%)",
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-lovalbe-gold-light/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lovalbe-rose/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={isVisible ? "animate-fade-in-left" : "opacity-0"}>
            <span className="text-accent font-medium tracking-widest text-sm uppercase">
              Nuestra Historia
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mt-4 mb-6">
              Sobre LOVALBE
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                LOVALBE nació en 2020 con una misión clara: crear productos de cuidado corporal que combinaran 
                la sabiduría de la naturaleza con la innovación científica más avanzada.
              </p>
              <p>
                Nuestra fundadora, tras años de investigación en cosmética natural, desarrolló fórmulas únicas 
                que respetan tanto tu piel como el medio ambiente. Cada ingrediente es cuidadosamente seleccionado 
                de fuentes éticas y sostenibles.
              </p>
              <p>
                Hoy, LOVALBE es sinónimo de belleza consciente. Nuestro compromiso va más allá de ofrecer productos 
                excepcionales: trabajamos activamente para reducir nuestra huella ambiental y apoyar a comunidades 
                locales productoras de ingredientes naturales.
              </p>
            </div>

            {/* Mission Statement */}
            <div className="mt-8 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
              <p className="text-foreground font-heading text-xl italic">
                "Creemos que la verdadera belleza es aquella que cuida de ti y del planeta. Cada producto LOVALBE 
                es una promesa de calidad, ética y amor por la naturaleza."
              </p>
              <p className="text-accent font-medium mt-3">— Equipo LOVALBE</p>
            </div>
          </div>

          {/* Right Visual */}
          <div className={`relative ${isVisible ? "animate-fade-in-right" : "opacity-0"}`}>
            {/* Main Visual Container */}
            <div className="relative max-w-md mx-auto">
              {/* Background decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-lovalbe-rose/30 to-lovalbe-gold-light/30 rounded-3xl blur-2xl animate-float" />
              
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                <img 
                  src={aboutImage} 
                  alt="LOVALBE - Creación artesanal de lociones premium"
                  className="w-full h-auto object-cover"
                />
                {/* Overlay badge */}
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
                  <p className="font-heading text-xl text-foreground">Belleza Natural</p>
                  <p className="text-muted-foreground text-sm">Desde 2020</p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-lovalbe-gold/30 rounded-full flex items-center justify-center animate-float delay-200">
                <span className="text-2xl">🍃</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-lovalbe-rose/40 rounded-full flex items-center justify-center animate-float delay-500">
                <span className="text-xl">✨</span>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className={`flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl transition-all duration-300 hover:shadow-soft ${
                    isVisible ? "animate-scale-in" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <value.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{value.title}</p>
                    <p className="text-muted-foreground text-xs">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
