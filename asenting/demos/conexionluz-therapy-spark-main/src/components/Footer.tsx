
import React from 'react';
import { Sun, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-900 text-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Sun className="h-10 w-10 text-amber-400 animate-pulse-slow" />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md animate-pulse"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                ConexiónLuz
              </span>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Iluminamos tu camino hacia el bienestar mental y emocional con terapeutas profesionales comprometidos con tu crecimiento personal.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="bg-gray-800 hover:bg-gradient-to-r hover:from-primary hover:to-accent p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-amber-400">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-gray-300">+57 301 331 7868</p>
                  <p className="text-gray-300">WhatsApp disponible</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-300">info@conexionluz.com</p>
                  <p className="text-gray-300">citas@conexionluz.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-gray-300">Centro de Pereira</p>
                  <p className="text-gray-300">Pereira, Risaralda, Colombia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours & Services */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-amber-400">Horarios</h3>
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Lunes - Viernes</p>
                  <p className="text-sm text-gray-300">8:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Sábados</p>
                  <p className="text-sm text-gray-300">9:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">Emergencias 24/7</p>
                  <p className="text-sm text-gray-300">Línea de crisis</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <h4 className="font-bold mb-4 text-amber-400">Enlaces Rápidos</h4>
            <div className="space-y-2">
              {['Sobre Nosotros', 'Servicios', 'Terapeutas', 'Blog', 'FAQ'].map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="block text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 mb-12 text-center">
          <h3 className="text-xl font-bold mb-2">Línea de Crisis 24/7</h3>
          <p className="mb-4">Si estás en crisis, no estás solo. Estamos aquí para ayudarte.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="tel:+573013317868" className="bg-white text-red-600 px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
              Llamar Ahora: +57 301 331 7868
            </a>
            <a href="https://wa.me/573013317868" className="border-2 border-white text-white px-6 py-2 rounded-full font-semibold hover:bg-white hover:text-red-600 transition-all duration-300">
              WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 ConexiónLuz. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                Términos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                Código de Ética
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
