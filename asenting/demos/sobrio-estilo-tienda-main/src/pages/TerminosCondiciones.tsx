
const TerminosCondiciones = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-neutral-900 tracking-wide mb-4">
            Términos y Condiciones
          </h1>
          <div className="w-24 h-px bg-neutral-300 mx-auto"></div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
          <div className="prose prose-neutral max-w-none">
            <h2 className="text-2xl font-light text-neutral-900 mb-6">1. Información General</h2>
            <p className="text-neutral-600 mb-4">
              Estos términos y condiciones regulan el uso del sitio web cgcaroGonzalez y 
              la compra de productos a través del mismo. Al acceder y utilizar este sitio web, 
              usted acepta estar sujeto a estos términos.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">2. Productos y Precios</h2>
            <p className="text-neutral-600 mb-4">
              Todos los productos están sujetos a disponibilidad. Los precios pueden cambiar sin previo aviso. 
              Nos reservamos el derecho de modificar o descontinuar productos en cualquier momento.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">3. Pedidos y Pagos</h2>
            <p className="text-neutral-600 mb-4">
              Al realizar un pedido, usted confirma que toda la información proporcionada es precisa. 
              Nos reservamos el derecho de rechazar o cancelar pedidos por cualquier motivo.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">4. Envíos y Entregas</h2>
            <p className="text-neutral-600 mb-4">
              Ofrecemos envío gratuito para pedidos superiores a €300. Los tiempos de entrega estimados 
              son de 24-48 horas para la península ibérica. Los envíos internacionales pueden tomar más tiempo.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">5. Devoluciones y Reembolsos</h2>
            <p className="text-neutral-600 mb-4">
              Aceptamos devoluciones dentro de los 30 días posteriores a la entrega, siempre que 
              los productos estén en su estado original. Los gastos de devolución corren por cuenta del cliente, 
              excepto en caso de productos defectuosos.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">6. Garantía</h2>
            <p className="text-neutral-600 mb-4">
              Todos nuestros productos cuentan con una garantía de 2 años contra defectos de fabricación. 
              Esta garantía no cubre el desgaste normal del uso.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">7. Limitación de Responsabilidad</h2>
            <p className="text-neutral-600 mb-4">
              cgcaroGonzalez no será responsable de daños indirectos, incidentales o consecuentes 
              que puedan surgir del uso de nuestros productos o servicios.
            </p>
            
            <h2 className="text-2xl font-light text-neutral-900 mb-6 mt-8">8. Ley Aplicable</h2>
            <p className="text-neutral-600 mb-4">
              Estos términos se regirán por las leyes de España. Cualquier disputa será resuelta 
              en los tribunales competentes de Madrid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminosCondiciones;
