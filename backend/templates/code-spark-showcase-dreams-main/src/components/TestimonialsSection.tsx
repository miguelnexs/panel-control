
import React from 'react';

interface Testimonial {
  quote: string;
  name: string;
  company: string;
  image: string;
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "El desarrollo de mi tienda virtual superó todas mis expectativas. La atención personalizada y el resultado final son impecables.",
      name: "María García",
      company: "ModaShop Online",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop"
    },
    {
      quote: "Trabajar en el desarrollo de nuestra aplicación de gestión fue increíblemente fácil. Entendió exactamente lo que necesitábamos.",
      name: "Carlos Mendoza",
      company: "MendTech Solutions",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop"
    },
    {
      quote: "Nuestra presencia en línea ha mejorado considerablemente desde que implementamos el nuevo sitio web. Los resultados hablan por sí mismos.",
      name: "Laura Sánchez",
      company: "DentalCare Plus",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Lo que <span className="text-gradient">Dicen de Mí</span></h2>
          <p className="text-gray-300 animate-slide-up delay-100">
            La satisfacción de mis clientes es mi mayor recompensa. Aquí algunas opiniones sobre mi trabajo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="dark-card rounded-xl p-6 relative animate-slide-up hover:border-primary/30 transition-all hover:animate-glow"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-4 text-4xl text-primary/20 animate-float-slow">"</div>
              
              <div className="mb-6">
                <p className="text-gray-300 italic relative z-10">"{testimonial.quote}"</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 ring-2 ring-primary/30 animate-pulse-slow">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.company}</p>
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
