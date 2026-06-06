
const Ventas = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-neutral-900 tracking-wide mb-4">
            Ventas y Ofertas
          </h1>
          <div className="w-24 h-px bg-neutral-300 mx-auto"></div>
          <p className="text-neutral-600 mt-4">
            Descuentos especiales en productos seleccionados
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-light text-neutral-900 mb-6">Ofertas Especiales</h2>
          <div className="space-y-4">
            <div className="border-b border-neutral-200 pb-4">
              <h3 className="font-medium text-neutral-900">Descuento del 20% en Bolsos Grandes</h3>
              <p className="text-neutral-600 text-sm">Válido hasta el 31 de diciembre</p>
            </div>
            <div className="border-b border-neutral-200 pb-4">
              <h3 className="font-medium text-neutral-900">2x1 en Billeteras Seleccionadas</h3>
              <p className="text-neutral-600 text-sm">Promoción por tiempo limitado</p>
            </div>
            <div className="pb-4">
              <h3 className="font-medium text-neutral-900">Envío Gratuito en Compras Superiores a €300</h3>
              <p className="text-neutral-600 text-sm">Entrega en 24-48 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
