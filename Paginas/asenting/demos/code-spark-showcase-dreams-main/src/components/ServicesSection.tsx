
import React from 'react';
import { cn } from '@/lib/utils';

// Definimos el tipo de las props para ServicesSection
interface ServicesSectionProps {
  fullDisplay?: boolean;
}

// Componente para mostrar servicios
const ServicesSection: React.FC<ServicesSectionProps> = ({ fullDisplay = false }) => {
  const services = [
    {
      title: 'Desarrollo Web Empresarial',
      description: 'Creamos sitios web corporativos modernos, optimizados para SEO y diseñados para convertir visitantes en clientes.',
      icon: '🌐',
    },
    {
      title: 'Tiendas Online Rentables',
      description: 'Desarrollamos e-commerce completos con pasarelas de pago seguras, gestión de inventario y estrategias de conversión.',
      icon: '🛒',
    },
    {
      title: 'Posicionamiento SEO',
      description: 'Optimizamos su presencia digital para mejorar su visibilidad en buscadores y atraer más clientes potenciales.',
      icon: '📈',
    },
    {
      title: 'Aplicaciones Personalizadas',
      description: 'Desarrollamos software a medida para automatizar procesos y optimizar la gestión de su empresa.',
      icon: '⚙️',
    },
    {
      title: 'Mantenimiento Tecnológico',
      description: 'Ofrecemos soporte continuo, actualizaciones de seguridad y optimización del rendimiento de sus sistemas.',
      icon: '🔧',
    },
    {
      title: 'Consultoría Digital',
      description: 'Asesoramos a su empresa en la transformación digital y estrategias tecnológicas para el crecimiento.',
      icon: '💡',
    },
  ];

  const displayedServices = fullDisplay ? services : services.slice(0, 3);

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        {!fullDisplay && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
              Nuestros Servicios Especializados
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto animate-slide-up delay-100">
              Ofrecemos soluciones tecnológicas integrales diseñadas para impulsar el crecimiento y la competitividad de su empresa
            </p>
          </div>
        )}
        
        {fullDisplay && (
          <div className="mb-12 animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Servicios Profesionales para Empresas
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              Nuestro equipo especializado diseña y desarrolla soluciones digitales personalizadas para ayudar a su empresa a alcanzar sus objetivos de negocio y mantener una ventaja competitiva.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedServices.map((service, index) => (
            <div
              key={index}
              className={cn(
                "dark-card rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:animate-glow",
                fullDisplay ? "animate-slide-up" : "animate-slide-up",
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-5xl mb-6 animate-float-medium" style={{ animationDelay: `${index * 300}ms` }}>{service.icon}</div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>
        
        {fullDisplay && (
          <div className="mt-16 animate-slide-up delay-300">
            <h3 className="text-xl md:text-2xl font-bold mb-6">Nuestro Proceso de Trabajo</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="dark-card rounded-lg p-6 hover:border-primary/50 transition-all hover:animate-glow animate-slide-right" style={{ animationDelay: '100ms' }}>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-bold mb-2">Análisis</h4>
                <p className="text-gray-300 text-sm">Estudiamos las necesidades específicas de su empresa y objetivos del proyecto.</p>
              </div>
              
              <div className="dark-card rounded-lg p-6 hover:border-primary/50 transition-all hover:animate-glow animate-slide-right" style={{ animationDelay: '200ms' }}>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-bold mb-2">Estrategia</h4>
                <p className="text-gray-300 text-sm">Diseñamos la arquitectura y definimos las tecnologías más adecuadas.</p>
              </div>
              
              <div className="dark-card rounded-lg p-6 hover:border-primary/50 transition-all hover:animate-glow animate-slide-right" style={{ animationDelay: '300ms' }}>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-bold mb-2">Desarrollo</h4>
                <p className="text-gray-300 text-sm">Implementamos la solución con revisiones continuas y comunicación constante.</p>
              </div>
              
              <div className="dark-card rounded-lg p-6 hover:border-primary/50 transition-all hover:animate-glow animate-slide-right" style={{ animationDelay: '400ms' }}>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-bold mb-2">Soporte</h4>
                <p className="text-gray-300 text-sm">Lanzamiento exitoso y mantenimiento continuo para garantizar el éxito.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
