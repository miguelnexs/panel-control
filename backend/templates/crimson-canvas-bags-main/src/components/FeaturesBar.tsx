import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Envío Gratis",
    description: "En compras mayores a $1,500",
  },
  {
    icon: Shield,
    title: "Garantía 2 Años",
    description: "Calidad garantizada",
  },
  {
    icon: RefreshCw,
    title: "Devolución Fácil",
    description: "30 días para cambios",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Atención personalizada",
  },
];

const FeaturesBar = () => {
  return (
    <section className="bg-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 justify-center md:justify-start"
            >
              <div className="w-12 h-12 bg-accent flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="hidden sm:block">
                <h3 className="font-semibold text-background text-sm uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-background/70 text-xs">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
