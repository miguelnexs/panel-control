
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  useEffect(() => {
    document.title = "Política de Privacidad | DevPortfolio";
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Política de Privacidad</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">1. Información que Recopilamos</h2>
            <p className="text-gray-300 mb-4">
              Recopilamos información personal que usted nos proporciona directamente, como su nombre, dirección de correo electrónico, número de teléfono y cualquier otra información que decida compartir con nosotros a través de nuestros formularios de contacto o comunicaciones.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. Uso de la Información</h2>
            <p className="text-gray-300 mb-4">
              Utilizamos la información que recopilamos para:
            </p>
            <ul className="list-disc pl-5 text-gray-300 mb-4">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Comunicarnos con usted sobre su interés en nuestros servicios</li>
              <li>Personalizar su experiencia con nosotros</li>
              <li>Cumplir con nuestras obligaciones legales</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. Compartir Información</h2>
            <p className="text-gray-300 mb-4">
              No vendemos, comerciamos ni transferimos su información personal a terceros sin su consentimiento, excepto cuando sea necesario para proporcionarle nuestros servicios o cuando estemos legalmente obligados a hacerlo.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. Seguridad de los Datos</h2>
            <p className="text-gray-300 mb-4">
              Implementamos medidas de seguridad para proteger su información personal, incluido el cifrado de datos y el acceso restringido a la información personal.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Cookies</h2>
            <p className="text-gray-300 mb-4">
              Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Cambios a esta Política</h2>
            <p className="text-gray-300 mb-4">
              Podemos actualizar nuestra política de privacidad ocasionalmente. Le notificaremos cualquier cambio publicando la nueva política de privacidad en esta página.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">7. Contacto</h2>
            <p className="text-gray-300 mb-4">
              Si tiene preguntas sobre esta política de privacidad, por favor contáctenos en privacidad@devportfolio.com.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
