
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppFloat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = '573013317868';
    const message = '¡Hola! Me gustaría agendar una cita para terapia psicológica.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group animate-spin-slow"
          style={{
            animation: 'rotate 10s linear infinite'
          }}
        >
          <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          
          {/* Subtle pulse effect */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-10"></div>
        </button>

        {/* Tooltip */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap animate-fade-in">
            ¡Chatea con nosotros!
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>

      {/* Background notification bubble */}
      <div className="fixed bottom-24 right-6 z-40">
        <div className="bg-white rounded-2xl shadow-xl p-4 max-w-xs opacity-90 hover:opacity-100 transition-all duration-300 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">ConexiónLuz</p>
              <p className="text-xs text-gray-600 mt-1">¿Necesitas ayuda? ¡Estamos aquí para ti!</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppFloat;
