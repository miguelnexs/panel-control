
import React from 'react';
import TherapistCard from './TherapistCard';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTherapists } from '../hooks/useTherapists';

const Therapists = () => {
  const { data: therapists = [], isLoading } = useTherapists();

  if (isLoading) {
    return (
      <section id="terapeutas" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando terapeutas...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="terapeutas" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">Nuestro Equipo</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Conoce a Nuestros Terapeutas
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Profesionales certificados y especializados, comprometidos con tu bienestar y crecimiento personal
          </p>
        </div>

        {/* Therapists Grid */}
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ¿No sabes cuál terapeuta es el indicado para ti?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de coordinación te ayudará a encontrar al profesional ideal según tus necesidades específicas.
            </p>
            <Link 
              to="/contacto"
              className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Recibir Orientación Gratuita
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Therapists;
