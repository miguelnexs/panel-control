
import React, { useState, useEffect } from 'react';
import { Menu, X, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Terapeutas', href: '/terapeutas' },
    { name: 'Servicios', href: '/servicios' },
    { name: 'Testimonios', href: '/testimonios' },
    { name: 'Contacto', href: '/contacto' }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Sun className="h-8 w-8 text-amber-400 animate-pulse-slow group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ConexiónLuz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative transition-colors duration-300 group ${
                  isActiveRoute(item.href) 
                    ? 'text-primary font-semibold' 
                    : 'text-gray-700 hover:text-primary'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                  isActiveRoute(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/agenda"
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Agendar Cita
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 glass-effect rounded-lg p-4 animate-fadeInUp">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-3 transition-colors duration-300 ${
                  isActiveRoute(item.href) 
                    ? 'text-primary font-semibold' 
                    : 'text-gray-700 hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/agenda"
              className="block mt-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full font-semibold text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Agendar Cita
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
