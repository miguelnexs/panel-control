import { useState } from "react";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import lotionRosa from "@/assets/lotion-rosa.jpg";
import lotionAlmendra from "@/assets/lotion-almendra.jpg";
import lotionCoco from "@/assets/lotion-coco.jpg";
import lotionLavanda from "@/assets/lotion-lavanda.jpg";

const products = [
  {
    id: 1,
    name: "Pétalo de Rosa",
    description: "Loción hidratante con extracto de rosa damascena para una piel luminosa y delicada.",
    price: 34.99,
    rating: 4.9,
    image: lotionRosa,
  },
  {
    id: 2,
    name: "Almendra & Miel",
    description: "Nutrición intensiva con aceite de almendras dulces y miel orgánica para pieles secas.",
    price: 38.99,
    rating: 4.8,
    image: lotionAlmendra,
  },
  {
    id: 3,
    name: "Agua de Coco",
    description: "Frescura tropical con extracto de coco que hidrata y revitaliza tu piel al instante.",
    price: 32.99,
    rating: 4.9,
    image: lotionCoco,
  },
  {
    id: 4,
    name: "Lavanda Nocturna",
    description: "Fórmula calmante con lavanda francesa para una rutina de noche relajante y reparadora.",
    price: 36.99,
    rating: 5.0,
    image: lotionLavanda,
  },
];

const Products = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="productos" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lovalbe-rose/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lovalbe-gold-light/10 rounded-full blur-3xl translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-accent font-medium tracking-widest text-sm uppercase">
            Nuestra Colección
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mt-4 mb-6">
            Lociones Premium
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Cada fórmula está cuidadosamente elaborada con ingredientes naturales de la más alta calidad.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`group relative bg-card rounded-3xl overflow-hidden border border-border/50 transition-all duration-500 hover:shadow-elevated hover:-translate-y-2 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Product Image Area */}
              <div className="relative h-56 bg-lovalbe-cream overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Wishlist Button */}
                <button className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                  <Heart className="w-5 h-5" />
                </button>

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {product.description}
                </p>
                
                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-heading font-semibold text-foreground">
                      €{product.price}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="btn-gold text-sm px-4 py-2 flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Añadir
                  </Button>
                </div>
              </div>

              {/* Hover Overlay Line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-lovalbe-gold-light to-lovalbe-gold transition-all duration-500 ${
                hoveredId === product.id ? "w-full" : "w-0"
              }`} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-8 py-3 transition-all duration-300">
            Ver toda la colección
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
