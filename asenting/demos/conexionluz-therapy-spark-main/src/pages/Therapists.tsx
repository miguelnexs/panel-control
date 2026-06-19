
import React from 'react';
import Header from '../components/Header';
import WhatsAppFloat from '../components/WhatsAppFloat';
import Footer from '../components/Footer';
import TherapistCard from '../components/TherapistCard';
import { Users, Award, Heart, Brain, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTherapists } from '../hooks/useTherapists';

const TherapistsPage = () => {
  const { data: therapists = [], isLoading, error } = useTherapists();

  const teamStats = [
    {
      icon: Users,
      number: "15+",
      label: "Terapeutas Certificados",
      description: "Profesionales con amplia experiencia"
    },
    {
      icon: Award,
      number: "50+",
      label: "Certificaciones",
      description: "En diferentes metodologías terapéuticas"
    },
    {
      icon: Heart,
      number: "500+",
      label: "Vidas Transformadas",
      description: "Pacientes que han encontrado bienestar"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Calificación Promedio",
      description: "Basada en evaluaciones de pacientes"
    }
  ];

  const qualifications = [
    {
      title: "Formación Académica",
      description: "Todos nuestros terapeutas cuentan con títulos universitarios en Psicología y especializaciones en sus áreas de expertise."
    },
    {
      title: "Certificaciones Internacionales",
      description: "Contamos con certificaciones de instituciones reconocidas mundialmente en diferentes enfoques terapéuticos."
    },
    {
      title: "Formación Continua",
      description: "Nuestro equipo se mantiene actualizado participando regularmente en conferencias, talleres y cursos especializados."
    },
    {
      title: "Supervisión Clínica",
      description: "Todos los casos son supervisados por psicólogos senior para garantizar la mejor atención profesional."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 pb-16 bg-gradient-to-br from-primary/10 via-white to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Cargando terapeutas...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 pb-16 bg-gradient-to-br from-primary/10 via-white to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-red-600">Error al cargar los terapeutas</p>
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
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-amber-400/5 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nuestros Terapeutas
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conoce a nuestro equipo de profesionales certificados, comprometidos con tu bienestar y crecimiento personal
            </p>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation">
            {teamStats.map((stat, index) => (
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

      {/* Therapists Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Conoce a Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada uno de nuestros terapeutas está especializado en diferentes áreas para brindarte la mejor atención
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            {therapists.map((therapist: any, index: number) => (
              <div key={therapist.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <TherapistCard 
                  id={therapist.id}
                  name={therapist.name}
                  specialty={therapist.specialty}
                  image={therapist.image_url}
                  rating={therapist.rating}
                  experience={`${therapist.years_experience} años de experiencia`}
                  description={therapist.description}
                  certifications={therapist.certifications || []}
                  priceFrom={therapist.price_from}
                  sessionDuration={therapist.session_duration}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Calificaciones Profesionales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestro compromiso con la excelencia se refleja en las calificaciones y formación continua de nuestro equipo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-animation">
            {qualifications.map((qualification, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{qualification.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{qualification.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl font-bold mb-8 text-gray-800">
              Nuestra Filosofía de Trabajo
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <Brain className="h-16 w-16 text-primary mx-auto mb-6" />
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                "Creemos en el poder transformador de la terapia psicológica. Cada persona tiene dentro de sí los recursos necesarios para sanar y crecer. Nuestro rol es acompañar, guiar y proporcionar las herramientas adecuadas para que cada individuo pueda descubrir su potencial y vivir una vida plena y auténtica."
              </p>
              <div className="text-primary font-semibold">
                - Equipo ConexiónLuz
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿No sabes cuál terapeuta es el indicado para ti?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Nuestro equipo de coordinación te ayudará a encontrar al profesional ideal según tus necesidades específicas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contacto"
              className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Recibir Orientación Gratuita
            </Link>
            <Link 
              to="/agenda"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-primary transition-all duration-300"
            >
              Agendar Consulta
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TherapistsPage;
