
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0c1220] border-t border-white/5 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0 text-center md:text-left animate-slide-up">
            <Link to="/" className="font-bold text-xl md:text-2xl text-gradient">Dev<span className="text-white">Portfolio</span></Link>
            <p className="text-gray-400 mt-2 text-sm">
              Creando experiencias digitales sorprendentes desde 2023
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center animate-slide-up delay-100">
            <Link to="/" className="text-gray-300 hover:text-primary px-2 py-1 transition-all hover:translate-y-[-2px]">Inicio</Link>
            <Link to="/services" className="text-gray-300 hover:text-primary px-2 py-1 transition-all hover:translate-y-[-2px]">Servicios</Link>
            <Link to="/projects" className="text-gray-300 hover:text-primary px-2 py-1 transition-all hover:translate-y-[-2px]">Proyectos</Link>
            <Link to="/about" className="text-gray-300 hover:text-primary px-2 py-1 transition-all hover:translate-y-[-2px]">Sobre Mí</Link>
            <Link to="/contact" className="text-gray-300 hover:text-primary px-2 py-1 transition-all hover:translate-y-[-2px]">Contacto</Link>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-4 md:mb-0 text-center md:text-left animate-slide-up delay-200">© {new Date().getFullYear()} DevPortfolio. Todos los derechos reservados.</p>
          <div className="flex gap-4 animate-slide-up delay-300">
            <Link to="/terms" className="hover:text-primary transition-colors">Términos</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
