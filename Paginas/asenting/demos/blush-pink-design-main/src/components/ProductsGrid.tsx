
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  searchTerm?: string;
  selectedCategory?: string;
  selectedPriceRange?: string;
  viewMode?: string;
}

const ProductsGrid = ({ 
  searchTerm = '', 
  selectedCategory = 'Todos los Bolsos', 
  selectedPriceRange = 'Todos los Precios',
  viewMode = 'grid'
}: ProductsGridProps) => {
  const navigate = useNavigate();

  const allProducts = [
    {
      id: 1,
      name: "Bandolera Elegante Rosa",
      price: 49.99,
      originalPrice: 69.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      isNew: true,
      isSale: true,
      category: "Bandoleras"
    },
    {
      id: 2,
      name: "Bolso de Mano Nude",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
      isNew: false,
      isSale: false,
      category: "Bolsos de Mano"
    },
    {
      id: 3,
      name: "Clutch Dorado Premium",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
      isNew: false,
      isSale: true,
      category: "Clutches"
    },
    {
      id: 4,
      name: "Tote Bag Minimalista",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
      isNew: true,
      isSale: false,
      category: "Tote Bags"
    },
    {
      id: 5,
      name: "Bolso Estructurado Elegante",
      price: 94.99,
      originalPrice: 129.99,
      image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop",
      isNew: false,
      isSale: true,
      category: "Bolsos de Mano"
    },
    {
      id: 6,
      name: "Mini Bag de Tendencia",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1544966503-7addf1a1b14e?w=400&h=400&fit=crop",
      isNew: true,
      isSale: false,
      category: "Mini Bags"
    },
    {
      id: 7,
      name: "Bandolera Cuero Negro",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      isNew: false,
      isSale: false,
      category: "Bandoleras"
    },
    {
      id: 8,
      name: "Clutch Elegante Noche",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
      isNew: true,
      isSale: false,
      category: "Clutches"
    }
  ];

  // Filter products based on search term, category, and price range
  const filteredProducts = allProducts.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'Todos los Bolsos' || product.category === selectedCategory;
    
    // Price filter
    let matchesPrice = true;
    if (selectedPriceRange !== 'Todos los Precios') {
      switch (selectedPriceRange) {
        case '$0 - $50':
          matchesPrice = product.price <= 50;
          break;
        case '$50 - $100':
          matchesPrice = product.price > 50 && product.price <= 100;
          break;
        case '$100 - $150':
          matchesPrice = product.price > 100 && product.price <= 150;
          break;
        case '$150+':
          matchesPrice = product.price > 150;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <section id="catalogo" className="py-20 bg-gradient-to-b from-background to-pink-light/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Nuestra <span className="text-gradient">Colección Exclusiva</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            Cada bolso está diseñado con atención al detalle y materiales de la más alta calidad. 
            Encuentra el complemento perfecto para tu estilo único y sofisticado.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-medium to-pink-dark mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            Mostrando {filteredProducts.length} de {allProducts.length} productos
          </p>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-8 mb-16 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard {...product} viewMode={viewMode} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No se encontraron productos que coincidan con los filtros seleccionados
              </p>
              <p className="text-sm text-muted-foreground">
                Intenta ajustar los filtros o realizar una nueva búsqueda
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate("/catalog")}
            className="btn-primary text-lg px-10 py-4 group"
          >
            <span className="mr-2">Ver Toda la Colección</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
