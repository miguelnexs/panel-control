import { Star, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    id: 1,
    name: "María García",
    role: "Cliente desde 2023",
    content: "La loción Pétalo de Rosa transformó completamente mi piel. Nunca había sentido una hidratación tan profunda y duradera. ¡Es mi favorita!",
    rating: 5,
    avatar: "MG",
  },
  {
    id: 2,
    name: "Carmen López",
    role: "Blogger de belleza",
    content: "Como experta en skincare, puedo decir que LOVALBE supera a muchas marcas de lujo. La calidad de los ingredientes se nota desde la primera aplicación.",
    rating: 5,
    avatar: "CL",
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Esteticista profesional",
    content: "Recomiendo LOVALBE a todas mis clientas. Los resultados son visibles desde la primera semana y el aroma de lavanda es simplemente divino.",
    rating: 4.5,
    avatar: "AM",
  },
  {
    id: 4,
    name: "Laura Fernández",
    role: "Cliente verificada",
    content: "Tengo piel muy sensible y por fin encontré productos que no me irritan. Almendra & Miel es mi salvación en invierno. ¡Gracias LOVALBE!",
    rating: 5,
    avatar: "LF",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? "fill-accent text-accent"
              : i < rating
              ? "fill-accent/50 text-accent"
              : "text-muted"
          }`}
        />
      ))}
    </div>
  );
};

const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="testimonios" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-lovalbe-rose/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-lovalbe-gold-light/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-accent font-medium tracking-widest text-sm uppercase">
            Lo que dicen nuestras clientas
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mt-4 mb-6">
            Opiniones Reales
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Miles de mujeres ya han descubierto el poder de LOVALBE para transformar su piel.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 transition-all duration-500 hover:shadow-elevated hover:bg-card ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-lovalbe-rose/30">
                <Quote className="w-12 h-12" />
              </div>

              {/* Content */}
              <div className="relative">
                <StarRating rating={testimonial.rating} />
                
                <p className="text-foreground/90 mt-4 mb-6 leading-relaxed text-lg italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-lovalbe-rose to-lovalbe-rose-dark rounded-full flex items-center justify-center text-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lovalbe-rose/5 to-lovalbe-gold-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className={`flex flex-wrap justify-center gap-8 mt-16 ${isVisible ? "animate-fade-in-up delay-700" : "opacity-0"}`}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-accent fill-accent" />
            </div>
            <span className="font-medium">4.9/5 Valoración media</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-lg">❤️</span>
            </div>
            <span className="font-medium">+50,000 clientas felices</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-10 h-10 bg-lovalbe-gold/20 rounded-full flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <span className="font-medium">98% recomendaría LOVALBE</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
