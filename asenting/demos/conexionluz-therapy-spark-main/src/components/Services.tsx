
import React from 'react';
import { Brain, Heart, Users, Shield, Zap, Smile } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useServices } from '../hooks/useServices';

const Services = () => {
  const navigate = useNavigate();
  const { data: services = [], isLoading } = useServices();

  const iconMap: { [key: string]: any } = {
    'Terapia Individual': Brain,
    'Terapia de Pareja': Heart,
    'Terapia Familiar': Users,
    'Trauma y PTSD': Shield,
    'Coaching de Vida': Zap,
    'Bienestar Mental': Smile
  };

  const handleServiceClick = (service: any) => {
    navigate(`/agenda?service=${service.id}&serviceName=${encodeURIComponent(service.title)}`);
  };

  if (isLoading) {
    return (
      <section id="servicios" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando servicios...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-6">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">Nuestros Servicios</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Servicios Especializados
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ofrecemos una amplia gama de servicios terapéuticos diseñados para atender tus necesidades específicas
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
          {services.map((service: any, index: number) => {
            const IconComponent = iconMap[service.title] || Brain;
            
            return (
              <div 
                key={service.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 p-8 border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features?.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button 
                  onClick={() => handleServiceClick(service)}
                  className="block w-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 py-3 rounded-xl font-medium hover:from-primary hover:to-accent hover:text-white transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Agendar Consulta
                </button>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              ¿Listo para Comenzar tu Viaje de Sanación?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Da el primer paso hacia una vida más plena y equilibrada
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/agenda"
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Agenda tu Primera Consulta
              </Link>
              <Link 
                to="/contacto"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-primary transition-all duration-300"
              >
                Consulta Gratuita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
