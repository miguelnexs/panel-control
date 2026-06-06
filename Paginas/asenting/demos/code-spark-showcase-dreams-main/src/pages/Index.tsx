
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import ProjectsSection from '@/components/ProjectsSection';
import SkillsAnimation from '@/components/SkillsAnimation';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  // Update document title
  useEffect(() => {
    document.title = "App Web Soluciones | Expertos en Desarrollo y Diseño Web";
  }, []);
  
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main>
        <HeroSection />
        
        <div className="h-96 md:h-[500px] bg-card relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 animate-fade-in delay-200">
            <SkillsAnimation />
          </div>
        </div>
        
        <ServicesSection />
        
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 opacity-0 animate-fade-in">
              Soluciones tecnológicas integrales para su empresa
            </h2>
            <p className="text-lg text-gray-300 mb-8 opacity-0 animate-fade-in delay-100">
              Descubra todos nuestros servicios especializados diseñados para impulsar el crecimiento digital de su negocio.
            </p>
            <Button 
              onClick={() => navigate('/services')}
              className="bg-primary hover:bg-primary/80 text-white opacity-0 animate-fade-in delay-200"
            >
              Conocer nuestros servicios
            </Button>
          </div>
        </div>
        
        <StatsSection />
        
        <ProjectsSection />
        
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 opacity-0 animate-fade-in">
              Casos de éxito de nuestro equipo
            </h2>
            <p className="text-lg text-gray-300 mb-8 opacity-0 animate-fade-in delay-100">
              Explore nuestro portafolio completo con proyectos realizados para empresas de diversos sectores.
            </p>
            <Button 
              onClick={() => navigate('/projects')}
              className="bg-primary hover:bg-primary/80 text-white opacity-0 animate-fade-in delay-200"
            >
              Ver portafolio completo
            </Button>
          </div>
        </div>
        
        <TestimonialsSection />
        
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 opacity-0 animate-fade-in">
              ¿Listo para transformar su presencia digital?
            </h2>
            <p className="text-lg text-gray-300 mb-8 opacity-0 animate-fade-in delay-100">
              Nuestro equipo está preparado para convertir sus ideas en soluciones digitales que impulsen su negocio y superen las expectativas de sus clientes.
            </p>
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-primary hover:bg-primary/80 text-white opacity-0 animate-fade-in delay-200"
            >
              ¡Hablemos de su proyecto!
            </Button>
          </div>
        </div>
        
        <ContactSection />
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
