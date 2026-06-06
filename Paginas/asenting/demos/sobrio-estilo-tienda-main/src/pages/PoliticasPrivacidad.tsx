
const PoliticasPrivacidad = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-neutral-900 tracking-wide mb-4">
            Políticas de Privacidad
          </h1>
          <div className="w-24 h-px bg-neutral-300 mx-auto"></div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
          <div className="prose prose-neutral max-w-none">
            <h2 className="text-2xl font-light text-neutral-900 mb-6">1. Información que Recopilamos</h2>
            <p className="text-neutral-600 mb-4">
              En cgcaroGonzalez recopilamos información personal que usted nos proporciona directamente, 
              como nombre, dirección de correo electrónico, dirección postal y información de pago cuando 
              realiza una compra o se registra en nuestro sitio web.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">2. Uso de la Información</h2>
            <p className="text-neutral-600 mb-4">
              Utilizamos su información personal para procesar pedidos, proporcionar servicio al cliente, 
              enviar comunicaciones promocionales (con su consentimiento) y mejorar nuestros productos y servicios.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">3. Protección de Datos</h2>
            <p className="text-neutral-600 mb-4">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
              su información personal contra el acceso no autorizado, alteración, divulgación o destrucción.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">4. Cookies</h2>
            <p className="text-neutral-600 mb-4">
              Nuestro sitio web utiliza cookies para mejorar su experiencia de navegación y 
              analizar el tráfico del sitio. Puede configurar su navegador para rechazar cookies, 
              aunque esto puede afectar la funcionalidad del sitio.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">5. Sus Derechos</h2>
            <p className="text-neutral-600 mb-4">
              Bajo el RGPD, usted tiene derecho a acceder, rectificar, suprimir y portar sus datos personales. 
              También puede oponerse al procesamiento y solicitar la limitación del mismo. 
              Para ejercer estos derechos, contáctenos en privacy@cgcarogonzalez.com.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">6. Contacto</h2>
            <p className="text-neutral-600 mb-4">
              Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos en:
              <br />
              Email: info@cgcarogonzalez.com
              <br />
              Teléfono: +34 xxx xxx xxx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticasPrivacidad;
