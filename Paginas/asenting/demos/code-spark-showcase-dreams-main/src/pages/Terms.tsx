
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  useEffect(() => {
    document.title = "Términos y Condiciones | DevPortfolio";
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Términos y Condiciones</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">1. Introducción</h2>
            <p className="text-gray-300 mb-4">
              Bienvenido a DevPortfolio. Estos términos y condiciones rigen el uso de nuestro sitio web y los servicios que ofrecemos. Al acceder a nuestro sitio web o utilizar nuestros servicios, acepta cumplir y estar sujeto a estos términos.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. Servicios</h2>
            <p className="text-gray-300 mb-4">
              DevPortfolio ofrece servicios de desarrollo web, creación de tiendas virtuales y desarrollo de software a medida. Los detalles específicos de cada servicio se acordarán mediante un contrato separado.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. Propiedad Intelectual</h2>
            <p className="text-gray-300 mb-4">
              Todo el contenido publicado en este sitio web, incluidos textos, gráficos, logotipos, iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de DevPortfolio o de los proveedores de contenido y está protegido por las leyes de propiedad intelectual.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. Limitación de Responsabilidad</h2>
            <p className="text-gray-300 mb-4">
              DevPortfolio no será responsable de ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de usar nuestros servicios o por cualquier otro reclamo relacionado de alguna manera con nuestros servicios.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Cambios a los Términos</h2>
            <p className="text-gray-300 mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. Es su responsabilidad revisar periódicamente estos términos.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Contacto</h2>
            <p className="text-gray-300 mb-4">
              Si tiene alguna pregunta sobre estos términos, por favor contáctenos en contacto@devportfolio.com.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
