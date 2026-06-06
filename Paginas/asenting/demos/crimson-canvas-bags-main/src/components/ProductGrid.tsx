import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "Cangurera Urban Pro",
    category: "Cangurera",
    price: 899,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    isNew: true,
  },
  {
    id: 2,
    name: "Bolso Cruzado Stealth",
    category: "Cruzado",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80",
    isSale: true,
  },
  {
    id: 3,
    name: "Mochila Tactical X",
    category: "Mochila",
    price: 1899,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    isNew: true,
  },
  {
    id: 4,
    name: "Cangurera Compact",
    category: "Cangurera",
    price: 699,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Messenger Street",
    category: "Messenger",
    price: 1499,
    originalPrice: 1799,
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80",
    isSale: true,
  },
  {
    id: 6,
    name: "Riñonera Sport Elite",
    category: "Cangurera",
    price: 799,
    image: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&auto=format&fit=crop&q=80",
  },
];

const ProductGrid = () => {
  return (
    <section id="productos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm text-accent uppercase tracking-widest font-semibold">
            Nuestra Colección
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground">
            PRODUCTOS <span className="text-accent">DESTACADOS</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explora nuestra selección de bolsos y cangureras premium para el hombre urbano
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["Todos", "Cangureras", "Mochilas", "Cruzados", "Messenger"].map((cat, index) => (
            <button
              key={cat}
              className={`px-6 py-2 text-sm uppercase tracking-wider font-medium transition-all duration-300 ${
                index === 0
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-wider font-semibold">
            Ver Más Productos
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
