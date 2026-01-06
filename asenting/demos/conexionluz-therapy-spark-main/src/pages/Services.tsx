
import React from 'react';
import Header from '../components/Header';
import WhatsAppFloat from '../components/WhatsAppFloat';
import Footer from '../components/Footer';
import { Brain, Heart, Users, Shield, Zap, Smile, Clock, Award, CheckCircle, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useServices } from '../hooks/useServices';

const ServicesPage = () => {
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
    // Redirigir a la agenda con el servicio específico
    navigate(`/agenda?service=${service.id}&serviceName=${encodeURIComponent(service.title)}`);
  };

  const benefits = [
    {
      icon: CheckCircle,
      title: "Profesionales Certificados",
      description: "Todos nuestros terapeutas cuentan con certificaciones internacionales y años de experiencia."
    },
    {
      icon: Clock,
      title: "Horarios Flexibles",
      description: "Ofrecemos citas en horarios que se adapten a tu rutina, incluyendo fines de semana."
    },
    {
      icon: Shield,
      title: "Confidencialidad Total",
      description: "Garantizamos la privacidad y confidencialidad absoluta en todas nuestras sesiones."
    },
    {
      icon: Star,
      title: "Resultados Comprobados",
      description: "El 98% de nuestros pacientes reportan mejoras significativas en su bienestar."
    }
  ];

  const methodologies = [
    {
      name: "Terapia Cognitivo-Conductual (TCC)",
      description: "Enfoque basado en evidencia que identifica y modifica patrones de pensamiento negativos."
    },
    {
      name: "Terapia Gestalt",
      description: "Técnica que se centra en el presente y la toma de conciencia de emociones y comportamientos."
    },
    {
      name: "EMDR",
      description: "Terapia especializada para el tratamiento de traumas y trastorno de estrés postraumático."
    },
    {
      name: "Terapia Sistémica",
      description: "Abordaje familiar que examina los patrones de relación e interacción entre los miembros."
    },
    {
      name: "Mindfulness",
      description: "Técnicas de atención plena para reducir el estrés y aumentar la autoconciencia."
    },
    {
      name: "Terapia Humanista",
      description: "Enfoque centrado en la persona que promueve el crecimiento personal y la autorrealización."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
              Nuestros Servicios
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre nuestra amplia gama de servicios terapéuticos diseñados específicamente para tu bienestar mental y emocional
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            {services.map((service: any, index: number) => {
              const IconComponent = iconMap[service.title] || Brain;
              
              return (
                <div 
                  key={service.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 p-8 border border-gray-100 animate-fade-in"
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
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Price and Duration */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-primary font-semibold">
                      Desde ${service.price_from?.toLocaleString()}
                    </span>
                    <span className="text-gray-500">{service.duration} minutos</span>
                  </div>

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
                    className="w-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 py-3 rounded-xl font-medium hover:from-primary hover:to-accent hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    Agendar Consulta
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              ¿Por Qué Elegir ConexiónLuz?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nos comprometemos con tu bienestar ofreciendo la mejor atención profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodologies Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Metodologías Terapéuticas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Utilizamos enfoques terapéuticos basados en evidencia científica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            {methodologies.map((methodology, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-3">{methodology.name}</h3>
                <p className="text-gray-600">{methodology.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para Comenzar tu Viaje de Sanación?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Da el primer paso hacia una vida más plena y equilibrada. Nuestro equipo está aquí para acompañarte.
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
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
