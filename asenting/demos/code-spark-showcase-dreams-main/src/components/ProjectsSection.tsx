
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Definimos el tipo de las props para ProjectsSection
interface ProjectsSectionProps {
  fullDisplay?: boolean;
}

// Componente para mostrar proyectos
const ProjectsSection: React.FC<ProjectsSectionProps> = ({ fullDisplay = false }) => {
  // Estado local para controlar el filtro de proyectos
  const [filter, setFilter] = useState('todos');

  // Datos de los proyectos (puedes reemplazarlos con tus propios datos)
  const projects = [
    {
      title: 'Diseño Web Moderno',
      description: 'Creación de un sitio web atractivo y funcional para una empresa local.',
      image: 'https://images.unsplash.com/photo-1607798720378-6303a5b0d4eb?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['Web', 'Diseño', 'React'],
    },
    {
      title: 'E-commerce de Moda',
      description: 'Desarrollo de una tienda online para una marca de ropa con sistema de pago integrado.',
      image: 'https://images.unsplash.com/photo-1523381294911-8cdfc3fe172b?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['E-commerce', 'Diseño', 'Shopify'],
    },
    {
      title: 'Aplicación Móvil para Salud',
      description: 'Creación de una app para iOS y Android para seguimiento de la salud personal.',
      image: 'https://images.unsplash.com/photo-1555059739-40252c136925?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['App', 'Desarrollo', 'React Native'],
    },
    {
      title: 'Plataforma de Cursos Online',
      description: 'Desarrollo de una plataforma web para la venta y gestión de cursos en línea.',
      image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['Web', 'Desarrollo', 'Node.js'],
    },
    {
      title: 'Sitio Web para Restaurante',
      description: 'Diseño y desarrollo de un sitio web para un restaurante con sistema de reservas online.',
      image: 'https://images.unsplash.com/photo-1517248135464-62a08892551f?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['Web', 'Diseño', 'Marketing'],
    },
    {
      title: 'Software de Gestión de Proyectos',
      description: 'Desarrollo de un software para la gestión de proyectos con funcionalidades de colaboración.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46662?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['Software', 'Desarrollo', 'Electron'],
    },
    {
      title: 'Blog de Viajes',
      description: 'Diseño y desarrollo de un blog de viajes con contenido multimedia y redes sociales.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8c00?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['Web', 'Diseño', 'Marketing'],
    },
    {
      title: 'Aplicación para Fitness',
      description: 'Desarrollo de una aplicación móvil para seguimiento de rutinas de ejercicio y nutrición.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['App', 'Desarrollo', 'React Native'],
    },
    {
      title: 'Tienda Online de Artesanía',
      description: 'Desarrollo de una tienda online para la venta de productos de artesanía local.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['E-commerce', 'Diseño', 'WooCommerce'],
    },
  ];

  // Utilizamos la prop fullDisplay para mostrar todos los proyectos o solo algunos
  const displayedProjects = fullDisplay ? projects : projects.slice(0, 6);

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        {!fullDisplay && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proyectos Destacados
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Explora algunos de mis trabajos más recientes y descubre cómo he ayudado a mis clientes a alcanzar sus objetivos.
            </p>
          </div>
        )}
        
        {fullDisplay && (
          <div className="mb-12 animate-slide-up" id="websites">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Sitios Web
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              Diseño y desarrollo de sitios web modernos, optimizados y responsive que impresionan a los visitantes.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg border dark-card",
                fullDisplay 
                  ? "group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:animate-glow animate-slide-up" 
                  : "overflow-hidden"
              )}
              style={fullDisplay ? { animationDelay: `${index * 100}ms` } : {}}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className={cn(
                    "w-full h-full object-cover",
                    fullDisplay ? "transition-transform duration-500 group-hover:scale-105" : ""
                  )}
                />
                {fullDisplay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{project.title}</h3>
                      <p className="text-sm text-gray-300">{project.description}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{project.description}</p>
                <a 
                  href={project.link} 
                  className={cn(
                    "inline-block text-primary",
                    fullDisplay ? "hover:text-primary/80 font-medium transition-all hover:translate-x-1" : "font-medium"
                  )}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Ver proyecto →
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {fullDisplay && (
          <>
            <div className="mt-20 mb-12 animate-slide-up delay-200" id="ecommerce">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Tiendas Virtuales
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mb-8">
                Plataformas e-commerce optimizadas para aumentar ventas y ofrecer una experiencia de compra excepcional.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {/* Aquí irían los proyectos de ecommerce con una estructura similar */}
                <div className="group relative overflow-hidden rounded-lg dark-card transition-all hover:border-primary/50 hover:shadow-lg hover:animate-glow animate-slide-up delay-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=800"
                      alt="Tienda de moda online"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">E-commerce</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">WooCommerce</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">FashionStyle Shop</h3>
                    <p className="text-sm text-gray-300 mb-4">Tienda virtual de moda con pasarela de pago integrada y gestión de inventario.</p>
                    <a 
                      href="#" 
                      className="inline-block text-primary hover:text-primary/80 font-medium transition-all hover:translate-x-1"
                    >
                      Ver proyecto →
                    </a>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-lg dark-card transition-all hover:border-primary/50 hover:shadow-lg hover:animate-glow animate-slide-up delay-400">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"
                      alt="Tienda de electrónica"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">E-commerce</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Shopify</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">TechGadget Store</h3>
                    <p className="text-sm text-gray-300 mb-4">Tienda de dispositivos electrónicos con filtros avanzados y múltiples métodos de pago.</p>
                    <a 
                      href="#" 
                      className="inline-block text-primary hover:text-primary/80 font-medium transition-all hover:translate-x-1"
                    >
                      Ver proyecto →
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-20 mb-12 animate-slide-up delay-500" id="apps">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Aplicaciones
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mb-8">
                Desarrollo de aplicaciones web y de escritorio personalizadas para necesidades específicas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="group relative overflow-hidden rounded-lg dark-card transition-all hover:border-primary/50 hover:shadow-lg hover:animate-glow animate-slide-up delay-600">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1481487196290-c152efe083f5?auto=format&fit=crop&q=80&w=800"
                      alt="App de gestión"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">App</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">React</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">TaskFlow Manager</h3>
                    <p className="text-sm text-gray-300 mb-4">Aplicación de gestión de proyectos y tareas para equipos distribuidos.</p>
                    <a 
                      href="#" 
                      className="inline-block text-primary hover:text-primary/80 font-medium transition-all hover:translate-x-1"
                    >
                      Ver proyecto →
                    </a>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-lg dark-card transition-all hover:border-primary/50 hover:shadow-lg hover:animate-glow animate-slide-up delay-700">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800"
                      alt="Software de gestión"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Software</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Electron</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">InvoicePro</h3>
                    <p className="text-sm text-gray-300 mb-4">Software de facturación y gestión financiera para pequeñas empresas.</p>
                    <a 
                      href="#" 
                      className="inline-block text-primary hover:text-primary/80 font-medium transition-all hover:translate-x-1"
                    >
                      Ver proyecto →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
