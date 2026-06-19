
import { Clock, Gift, Star, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PromotionsSection = () => {
  const navigate = useNavigate();

  const promotions = [
    {
      icon: Gift,
      title: "30% OFF",
      subtitle: "En tu primer bolso",
      description: "Descuento especial para nuevas clientas",
      code: "PRIMERA30",
      bgColor: "bg-gradient-to-br from-pink-medium to-pink-dark",
      textColor: "text-white"
    },
    {
      icon: Star,
      title: "2x1",
      subtitle: "En bolsos seleccionados",
      description: "Compra uno y llévate otro gratis",
      code: "2X1BOLSOS",
      bgColor: "bg-gradient-to-br from-pink-pastel to-pink-medium",
      textColor: "text-white"
    },
    {
      icon: Tag,
      title: "15% OFF",
      subtitle: "En compras mayores a $150",
      description: "Descuento automático en el carrito",
      code: "AHORRA15",
      bgColor: "bg-gradient-to-br from-pink-light to-pink-pastel",
      textColor: "text-foreground"
    },
    {
      icon: Clock,
      title: "Flash Sale",
      subtitle: "50% OFF por tiempo limitado",
      description: "Solo por hoy en modelos seleccionados",
      code: "FLASH50",
      bgColor: "bg-gradient-to-br from-pink-dark to-pink-medium",
      textColor: "text-white"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-pink-light/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            🎉 <span className="text-gradient">Promociones Especiales</span> 🎉
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            ¡No te pierdas estas increíbles ofertas! Aprovecha nuestros descuentos exclusivos 
            y llévate los bolsos de tus sueños a precios únicos.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-medium to-pink-dark mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {promotions.map((promo, index) => (
            <div 
              key={index}
              className={`${promo.bgColor} ${promo.textColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in group`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <promo.icon className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-2xl mb-2">
                  {promo.title}
                </h3>
                <h4 className="font-semibold text-lg mb-3 opacity-90">
                  {promo.subtitle}
                </h4>
                <p className="text-sm mb-4 opacity-80 leading-relaxed">
                  {promo.description}
                </p>
                <div className="bg-white/20 rounded-lg px-3 py-2 text-xs font-mono font-bold tracking-wider">
                  Código: {promo.code}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate("/catalog")}
            className="btn-primary text-lg px-10 py-4 group"
          >
            <span className="mr-2">Ver Productos en Oferta</span>
            <Gift className="w-5 h-5 inline group-hover:animate-bounce transition-transform" />
          </button>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
            * Las promociones no son acumulables. Válidas hasta agotar stock. 
            Aplican términos y condiciones.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;
