
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicesSection from '@/components/ServicesSection';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const Services = () => {
  useEffect(() => {
    document.title = "Servicios | DevPortfolio";
  }, []);

  const servicePackages = [
    {
      title: "Sitio Web Básico",
      price: "desde $499",
      features: [
        "Diseño profesional y responsive",
        "Hasta 5 páginas",
        "Optimización SEO básica",
        "Formulario de contacto",
        "Enlaces a redes sociales",
        "Soporte por 1 mes"
      ]
    },
    {
      title: "Tienda Virtual",
      price: "desde $999",
      features: [
        "Todo lo del paquete básico",
        "Hasta 50 productos",
        "Panel de administración",
        "Procesamiento de pagos",
        "Gestión de inventario",
        "Soporte por 3 meses"
      ]
    },
    {
      title: "Aplicación Web Custom",
      price: "desde $1499",
      features: [
        "Análisis de requerimientos",
        "Diseño UX/UI personalizado",
        "Desarrollo a medida",
        "Integración API",
        "Pruebas y optimización",
        "Soporte por 6 meses"
      ]
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main>
        <div className="pt-24 pb-10 md:pt-28 bg-[#0c1220]">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient animate-slide-up">Mis Servicios</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8 animate-slide-up delay-100">
              Ofrezco soluciones digitales completas para potenciar tu presencia online y llevar tu negocio al siguiente nivel.
            </p>
          </div>
        </div>
        
        <ServicesSection fullDisplay={true} />
        
        <div className="py-20 bg-[#0c1220]">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center animate-slide-up">Paquetes de Servicios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {servicePackages.map((pkg, index) => (
                <div 
                  key={index}
                  className="dark-card rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:animate-glow animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-4 animate-float-medium" style={{ animationDelay: `${index * 200}ms` }}>{pkg.price}</p>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 animate-slide-right" style={{ animationDelay: `${(index * 100) + (idx * 50)}ms` }}>
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => window.location.href = '/contact'}
                    className="w-full bg-primary hover:bg-primary/80 animate-float-slow"
                    style={{ animationDelay: `${index * 300}ms` }}
                  >
                    Solicitar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;
