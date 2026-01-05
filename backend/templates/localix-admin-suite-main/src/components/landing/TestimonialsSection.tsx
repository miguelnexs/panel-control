import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "CEO, TechStore MX",
    content: "Localix transformó completamente nuestra gestión de inventario. Las métricas en tiempo real nos ayudaron a tomar decisiones más rápidas y acertadas.",
    rating: 5,
    avatar: "CM"
  },
  {
    name: "María González",
    role: "Directora de Operaciones, RetailPro",
    content: "La integración con nuestro backend fue impecable. El equipo de soporte es excepcional y el dashboard es intuitivo desde el primer día.",
    rating: 5,
    avatar: "MG"
  },
  {
    name: "Roberto Sánchez",
    role: "Fundador, E-Shop Solutions",
    content: "Las notificaciones automáticas de pedidos cambiaron nuestro flujo de trabajo. Ahora respondemos a los clientes en minutos, no horas.",
    rating: 5,
    avatar: "RS"
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Lo que dicen nuestros{" "}
            <span className="gradient-text">clientes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Empresas que ya confían en Localix para gestionar sus operaciones.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="glass-card p-6 rounded-2xl relative group hover:border-primary/50 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
