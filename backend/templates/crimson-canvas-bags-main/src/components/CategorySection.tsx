import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Cangureras",
    description: "Estilo urbano y practicidad",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    count: "45+ productos",
  },
  {
    name: "Mochilas",
    description: "Para tu día a día",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    count: "32+ productos",
  },
  {
    name: "Bolsos Cruzados",
    description: "Elegancia urbana",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
    count: "28+ productos",
  },
];

const CategorySection = () => {
  return (
    <section id="cangureras" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-sm text-accent uppercase tracking-widest font-semibold">
              Explora
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-2 text-foreground">
              POR CATEGORÍA
            </h2>
          </div>
          <Button variant="outline" size="lg">
            Ver Todas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group relative h-[400px] overflow-hidden cursor-pointer hover-lift hover:shadow-2xl opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-accent text-sm font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                  {category.count}
                </span>
                <h3 className="font-display text-3xl text-background group-hover:text-accent mt-2 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-background/80 mt-1">
                  {category.description}
                </p>
                
                {/* Hover Arrow */}
                <div className="mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span className="inline-flex items-center gap-2 text-accent font-semibold uppercase tracking-wider text-sm">
                    Explorar
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
