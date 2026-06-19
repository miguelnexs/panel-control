
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkillsAnimation from '@/components/SkillsAnimation';
import StatsSection from '@/components/StatsSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';

const About = () => {
  useEffect(() => {
    document.title = "Sobre Nosotros | App Web Soluciones";
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main>
        <div className="pt-24 pb-10 md:pt-28 bg-card">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Sobre Nosotros</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8">
              Somos un equipo especializado en desarrollo web y soluciones tecnológicas, comprometidos con crear experiencias digitales excepcionales.
            </p>
          </div>
        </div>
        
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Nuestra Historia</h2>
                <p className="text-gray-300 mb-4">
                  App Web Soluciones nació de la pasión compartida por la tecnología y el desarrollo web. Nuestro equipo está conformado por profesionales especializados en diferentes áreas del desarrollo tecnológico, unidos por el objetivo común de transformar ideas en soluciones digitales exitosas.
                </p>
                <p className="text-gray-300 mb-4">
                  Con más de 5 años de experiencia colectiva, hemos trabajado con empresas de diversos sectores, desde pequeñas startups hasta corporaciones establecidas. Nos enorgullece ayudar a nuestros clientes a destacar en el mundo digital mediante soluciones personalizadas y de alta calidad.
                </p>
                <p className="text-gray-300">
                  Nuestro enfoque se centra en la colaboración, la innovación constante y el compromiso con la excelencia. Cada proyecto es una oportunidad para demostrar nuestra dedicación al éxito de nuestros clientes.
                </p>
              </div>
              <div className="order-first md:order-last">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=500"
                    alt="Equipo de trabajo colaborando"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xl font-bold text-white">App Web Soluciones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-16 bg-primary/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Colaboración</h3>
                <p className="text-gray-300">
                  Trabajamos como un equipo unido, combinando nuestras especialidades para ofrecer soluciones integrales.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Innovación</h3>
                <p className="text-gray-300">
                  Nos mantenemos a la vanguardia de las tecnologías emergentes para ofrecer siempre lo mejor.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Excelencia</h3>
                <p className="text-gray-300">
                  Cada proyecto refleja nuestro compromiso con la calidad y la satisfacción del cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-96 md:h-[400px] bg-card relative overflow-hidden">
          <div className="absolute inset-0">
            <SkillsAnimation />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white z-10 text-center px-4">
              Nuestras Tecnologías y Especialidades
            </h2>
          </div>
        </div>
        
        <StatsSection />
        
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              ¿Listos para trabajar juntos?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Si están buscando un equipo comprometido con la calidad y enfocado en resultados, ¡conversemos sobre su proyecto!
            </p>
            <Button 
              onClick={() => window.location.href = '/contact'}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              Contáctanos
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default About;
