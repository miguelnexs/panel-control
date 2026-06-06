
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Settings, Users, Phone, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Solo cambiar el estado si el menú móvil no está abierto
      if (!isOpen && window.scrollY > 10) {
        setIsScrolled(true);
      } else if (!isOpen && window.scrollY <= 10) {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // Cierra el menú móvil cuando se cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Servicios', href: '/services', icon: Settings },
    { name: 'Proyectos', href: '/projects', icon: Briefcase },
    { name: 'Sobre Nosotros', href: '/about', icon: Users },
    { name: 'Contacto', href: '/contact', icon: Phone },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav 
      className={cn(
        "fixed w-full top-0 z-50 transition-all duration-300",
        // Si el menú está abierto, mantener fondo sólido sin transparencia
        isOpen 
          ? "bg-background shadow-md" 
          : isScrolled 
            ? "bg-background/90 backdrop-blur-md shadow-md" 
            : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 z-50 relative">
          <span className="font-bold text-xl md:text-2xl text-gradient">App Web <span className="text-white">Soluciones</span></span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              className={cn(
                "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300",
                isActive(link.href) 
                  ? "text-white after:w-full" 
                  : "text-gray-300 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/contact">
            <Button className="bg-primary hover:bg-primary/80 text-white">
              Contáctanos
            </Button>
          </Link>
        </div>

        {/* Mobile menu button - Decorative hamburger */}
        <button 
          className={cn(
            "md:hidden relative w-8 h-8 flex flex-col justify-center items-center z-50 transition-all duration-300 transform",
            isOpen && "rotate-180"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <div className={cn(
            "w-6 h-0.5 bg-white rounded-full transition-all duration-300 transform origin-center",
            isOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"
          )} />
          <div className={cn(
            "w-6 h-0.5 bg-white rounded-full transition-all duration-300",
            isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
          )} />
          <div className={cn(
            "w-6 h-0.5 bg-white rounded-full transition-all duration-300 transform origin-center",
            isOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"
          )} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 z-40",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile menu */}
      <div 
        className={cn(
          "md:hidden fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-2xl transition-all duration-500 ease-out z-40 border-l border-white/10",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-6">
          {/* Menu header */}
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Menú</h3>
            <div className="w-12 h-0.5 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Navigation links */}
          <div className="flex-1 space-y-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  to={link.href}
                  className={cn(
                    "flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 group",
                    "hover:bg-primary/10 hover:shadow-lg border border-transparent hover:border-primary/20",
                    isActive(link.href) 
                      ? "bg-primary/20 text-primary border-primary/30 shadow-lg" 
                      : "text-gray-300 hover:text-white",
                    `animate-slide-right delay-${(index + 1) * 100}`
                  )}
                  style={{
                    animationDelay: isOpen ? `${(index + 1) * 100}ms` : '0ms',
                    animationFillMode: 'both'
                  }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive(link.href) 
                      ? "bg-primary text-white shadow-lg" 
                      : "bg-white/5 group-hover:bg-primary/20"
                  )}>
                    <Icon size={20} />
                  </div>
                  <span className="font-medium text-lg">{link.name}</span>
                  <div className={cn(
                    "ml-auto w-2 h-2 rounded-full transition-all duration-300",
                    isActive(link.href) ? "bg-primary" : "bg-transparent"
                  )} />
                </Link>
              );
            })}
          </div>

          {/* Contact button */}
          <div className="mt-8 animate-slide-right delay-700" style={{
            animationDelay: isOpen ? '700ms' : '0ms',
            animationFillMode: 'both'
          }}>
            <Link to="/contact" className="block">
              <Button className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Phone className="mr-2" size={20} />
                Contáctanos
              </Button>
            </Link>
          </div>

          {/* Footer info */}
          <div className="mt-6 text-center animate-slide-right delay-800" style={{
            animationDelay: isOpen ? '800ms' : '0ms',
            animationFillMode: 'both'
          }}>
            <p className="text-sm text-gray-400">
              App Web Soluciones
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Expertos en desarrollo web
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
