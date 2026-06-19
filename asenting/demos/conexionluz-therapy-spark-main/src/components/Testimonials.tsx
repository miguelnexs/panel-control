
import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "María Elena Campos",
      age: "34 años",
      therapy: "Terapia Individual",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b829?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Después de meses sintiéndome perdida, ConexiónLuz me ayudó a encontrar mi camino nuevamente. La Dra. González fue increíblemente empática y profesional.",
      highlight: "Recuperé mi confianza"
    },
    {
      name: "Roberto Martínez",
      age: "41 años",
      therapy: "Terapia de Pareja",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Mi esposa y yo estábamos al borde del divorcio. Gracias al Lic. Mendoza, aprendimos a comunicarnos mejor y salvamos nuestro matrimonio.",
      highlight: "Salvamos nuestro matrimonio"
    },
    {
      name: "Carmen Ruiz",
      age: "28 años",
      therapy: "Terapia Gestalt",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "La terapia con Patricia me ayudó a conectar conmigo misma de una forma que nunca había experimentado. Ahora vivo más auténticamente.",
      highlight: "Conecté conmigo misma"
    },
    {
      name: "Luis García",
      age: "52 años",
      therapy: "Adicciones",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Después de años luchando solo, el Mtro. Herrera me dio las herramientas para superar mi adicción. Llevo 18 meses sobrio y feliz.",
      highlight: "18 meses de sobriedad"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonios" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
            <Quote className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">Testimonios</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Historias de Transformación
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conoce las experiencias reales de personas que han encontrado su camino hacia el bienestar
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative p-12 md:p-16">
              {/* Quote Icon */}
              <Quote className="h-16 w-16 text-primary/20 mb-8" />

              {/* Testimonial Content */}
              <div className="mb-8">
                <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-6 font-light">
                  "{testimonials[currentIndex].quote}"
                </p>
                
                <div className="inline-block bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full text-sm font-medium">
                  {testimonials[currentIndex].highlight}
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <img 
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover shadow-lg"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-gray-600">{testimonials[currentIndex].age} • {testimonials[currentIndex].therapy}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-6">
                <button
                  onClick={prevTestimonial}
                  className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2 -right-6">
                <button
                  onClick={nextTestimonial}
                  className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
              98%
            </div>
            <div className="text-gray-600">Satisfacción</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">
              500+
            </div>
            <div className="text-gray-600">Vidas Transformadas</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-amber-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              5★
            </div>
            <div className="text-gray-600">Calificación Promedio</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
              24/7
            </div>
            <div className="text-gray-600">Apoyo Disponible</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
