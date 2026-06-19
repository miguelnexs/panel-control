
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectsSection from '@/components/ProjectsSection';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  
  useEffect(() => {
    document.title = "Proyectos | DevPortfolio";
  }, []);

  const filters = [
    { id: 'websites', label: 'Sitios Web' },
    { id: 'ecommerce', label: 'Tiendas Virtuales' },
    { id: 'apps', label: 'Aplicaciones' }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main>
        <div className="pt-24 pb-10 md:pt-28 bg-card">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Mis Proyectos</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8">
              Explora mi portafolio de proyectos destacados que demuestran mis habilidades y experiencia en desarrollo web y software.
            </p>
            
            {/* Desktop filters */}
            <div className="hidden md:flex gap-4">
              {filters.map((filter) => (
                <Button 
                  key={filter.id}
                  variant="outline" 
                  onClick={() => window.location.href = `#${filter.id}`}
                  className="border-white/20 hover:bg-primary/20"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            
            {/* Mobile filters sheet */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full border-white/20">
                    Filtrar proyectos
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-card rounded-t-xl">
                  <div className="flex flex-col gap-2 pt-4">
                    {filters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant="ghost"
                        onClick={() => {
                          window.location.href = `#${filter.id}`;
                          const sheet = document.querySelector('[data-state="open"]');
                          if (sheet) {
                            const closeButton = sheet.querySelector('[data-radix-collection-item]');
                            if (closeButton && closeButton instanceof HTMLElement) {
                              closeButton.click();
                            }
                          }
                        }}
                        className="justify-start text-lg py-4"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        <ProjectsSection fullDisplay={true} />
        
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 opacity-0 animate-fade-in">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="text-lg text-gray-300 mb-8 opacity-0 animate-fade-in delay-100">
              Estoy listo para ayudarte a convertir tus ideas en realidad digital.
            </p>
            <Button 
              onClick={() => window.location.href = '/contact'}
              className="bg-primary hover:bg-primary/80 text-white opacity-0 animate-fade-in delay-200 px-6 py-6 md:py-4"
            >
              Hablemos de tu proyecto
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
