
import React from 'react';
import { ArrowDown, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="inicio" className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 animate-gradient opacity-70"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-16 w-12 h-12 bg-amber-400/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto stagger-animation">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-gray-700">Terapia Profesional & Bienestar</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-amber-500 bg-clip-text text-transparent leading-tight">
            Iluminamos tu
            <br />
            Camino al Bienestar
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Conecta con terapeutas especializados que te guiarán hacia una vida más plena y equilibrada
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              to="/terapeutas"
              className="group bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center space-x-2">
                <Heart className="h-5 w-5 group-hover:animate-pulse" />
                <span>Conoce a Nuestros Terapeutas</span>
              </span>
            </Link>
            
            <Link 
              to="/agenda"
              className="group bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200"
            >
              Agenda tu Consulta
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center group">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-gray-600">Pacientes Atendidos</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">15+</div>
              <div className="text-gray-600">Terapeutas Certificados</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-amber-500 mb-2 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
