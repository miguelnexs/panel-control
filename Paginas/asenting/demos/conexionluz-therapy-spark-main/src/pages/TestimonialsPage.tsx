
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import WhatsAppFloat from '../components/WhatsAppFloat';
import Footer from '../components/Footer';
import { Quote, Star, ChevronLeft, ChevronRight, Heart, Users, Award, TrendingUp } from 'lucide-react';

const TestimonialsPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "María Elena Campos",
      age: "34 años",
      therapy: "Terapia Individual",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b829?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Después de meses sintiéndome perdida, ConexiónLuz me ayudó a encontrar mi camino nuevamente. La Dra. González fue increíblemente empática y profesional. Cada sesión me daba nuevas herramientas para enfrentar mis desafíos.",
      highlight: "Recuperé mi confianza",
      beforeAfter: "Antes vivía con ansiedad constante, ahora tengo paz mental y claridad en mis decisiones."
    },
    {
      name: "Roberto Martínez",
      age: "41 años",
      therapy: "Terapia de Pareja",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Mi esposa y yo estábamos al borde del divorcio. Gracias al Lic. Mendoza, aprendimos a comunicarnos mejor y salvamos nuestro matrimonio. Ahora somos más unidos que nunca.",
      highlight: "Salvamos nuestro matrimonio",
      beforeAfter: "De estar separados y sin comunicación, ahora tenemos una relación más fuerte y amorosa."
    },
    {
      name: "Carmen Ruiz",
      age: "28 años",
      therapy: "Terapia Gestalt",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "La terapia con Patricia me ayudó a conectar conmigo misma de una forma que nunca había experimentado. Ahora vivo más auténticamente y tomo decisiones desde mi verdadero ser.",
      highlight: "Conecté conmigo misma",
      beforeAfter: "Pasé de vivir complaciendo a otros a vivir desde mi autenticidad y valores personales."
    },
    {
      name: "Luis García",
      age: "52 años",
      therapy: "Adicciones",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Después de años luchando solo, el Mtro. Herrera me dio las herramientas para superar mi adicción. Llevo 18 meses sobrio y feliz. Mi familia está orgullosa de mí.",
      highlight: "18 meses de sobriedad",
      beforeAfter: "De una vida destructiva y aislamiento, ahora tengo relaciones saludables y propósito de vida."
    },
    {
      name: "Ana Sofía Torres",
      age: "19 años",
      therapy: "Psicología Infantil",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Cuando era adolescente, la Dra. Rodríguez me ayudó a superar mis problemas de autoestima y ansiedad social. Ahora estoy en la universidad y tengo una vida social plena.",
      highlight: "Superé la ansiedad social",
      beforeAfter: "De ser una adolescente introvertida y ansiosa, ahora soy una joven segura y sociable."
    },
    {
      name: "Miguel Ángel Pérez",
      age: "45 años",
      therapy: "Neuropsicología",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      quote: "Después de mi accidente, el Dr. Silva me ayudó en mi rehabilitación cognitiva. Su paciencia y profesionalismo fueron fundamentales en mi recuperación.",
      highlight: "Recuperé mis funciones cognitivas",
      beforeAfter: "De tener dificultades de memoria y concentración, ahora he retomado mi vida laboral y personal."
    }
  ];

  const stats = [
    {
      icon: Heart,
      number: "98%",
      label: "Satisfacción General",
      description: "De nuestros pacientes recomiendan nuestros servicios"
    },
    {
      icon: Users,
      number: "500+",
      label: "Vidas Transformadas",
      description: "Personas que han encontrado bienestar con nosotros"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Calificación Promedio",
      description: "Basada en más de 300 evaluaciones"
    },
    {
      icon: TrendingUp,
      number: "95%",
      label: "Mejora Reportada",
      description: "De pacientes reportan mejoras significativas"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <WhatsAppFloat />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/10 via-white to-accent/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-16 w-24 h-24 bg-accent/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Testimonios
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conoce las historias reales de transformación de personas que han encontrado su camino hacia el bienestar
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</div>
                <div className="text-gray-600 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Testimonial Carousel */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Historias de Transformación
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada historia es única, pero todas comparten algo en común: el poder de la terapia para transformar vidas
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
              <div className="relative p-12 md:p-16">
                {/* Quote Icon */}
                <Quote className="h-16 w-16 text-primary/20 mb-8" />

                {/* Testimonial Content */}
                <div className="mb-8">
                  <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-6 font-light">
                    "{testimonials[currentIndex].quote}"
                  </p>
                  
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Transformación:</h4>
                    <p className="text-gray-700">{testimonials[currentIndex].beforeAfter}</p>
                  </div>
                  
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
        </div>
      </section>

      {/* All Testimonials Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Más Historias de Éxito
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada testimonio representa una vida transformada y un futuro más brillante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.therapy}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {testimonial.quote.substring(0, 150)}...
                </p>
                
                <div className="inline-block bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full text-xs font-medium">
                  {testimonial.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-6">
            Tu Historia de Transformación Comienza Aquí
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a las cientos de personas que han encontrado su camino hacia el bienestar con ConexiónLuz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/agenda"
              className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Comenzar mi Proceso
            </a>
            <a 
              href="/contacto"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-primary transition-all duration-300"
            >
              Consulta Gratuita
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestimonialsPage;
