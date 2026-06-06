
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  // En una aplicación real, esto vendría de una API
  const products = [
    {
      id: 1,
      name: "Bandolera Minimalista Rosa",
      price: 49.99,
      originalPrice: 69.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
      description: "Bolso bandolera con diseño minimalista en rosa pastel. Perfecto para el día a día con compartimentos organizados y correa ajustable.",
      features: ["Material: Cuero sintético premium", "Dimensiones: 25x18x8 cm", "Correa ajustable", "Compartimento principal + bolsillo interior"],
      isNew: true,
      isSale: true
    },
    {
      id: 2,
      name: "Bolso Elegante Nude",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
      description: "Bolso elegante en tono nude que combina con cualquier outfit. Diseño atemporal y funcional.",
      features: ["Material: Cuero genuino", "Dimensiones: 30x25x12 cm", "Asas dobles", "Cierre con cremallera"],
      isNew: false,
      isSale: false
    },
    {
      id: 3,
      name: "Clutch Dorado Premium",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
      description: "Clutch dorado para ocasiones especiales. Acabado metalizado con cierre elegante.",
      features: ["Material: Metalizado premium", "Dimensiones: 25x15x3 cm", "Cadena removible", "Forro interior suave"],
      isNew: false,
      isSale: true
    },
    {
      id: 4,
      name: "Tote Bag Minimalista",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
      description: "Tote bag espacioso con diseño minimalista. Ideal para trabajo y viajes.",
      features: ["Material: Lona resistente", "Dimensiones: 40x35x10 cm", "Asas largas", "Bolsillo interior con cierre"],
      isNew: true,
      isSale: false
    },
    {
      id: 5,
      name: "Bolso Estructurado Rosa",
      price: 94.99,
      originalPrice: 129.99,
      image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop",
      description: "Bolso estructurado que mantiene su forma. Perfecto para looks profesionales.",
      features: ["Material: Cuero estructurado", "Dimensiones: 28x22x15 cm", "Asa superior + bandolera", "Múltiples compartimentos"],
      isNew: false,
      isSale: true
    },
    {
      id: 6,
      name: "Mini Bag Tendencia",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1544966503-7addf1a1b14e?w=600&h=600&fit=crop",
      description: "Mini bolso de tendencia para ocasiones casuales. Compacto pero funcional.",
      features: ["Material: Cuero sintético", "Dimensiones: 15x12x6 cm", "Correa larga ajustable", "Cierre magnético"],
      isNew: true,
      isSale: false
    }
  ];

  const product = products.find(p => p.id === parseInt(id || ""));

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Producto no encontrado</h2>
          <button
            onClick={() => navigate("/catalog")}
            className="btn-primary"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    console.log("Producto agregado al carrito:", product.name);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del producto */}
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover rounded-lg"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
                    Nuevo
                  </span>
                )}
                {product.isSale && (
                  <span className="bg-pink-hover text-white text-sm px-3 py-1 rounded-full font-medium">
                    Oferta
                  </span>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Características</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Añadir al carrito
                </button>
                
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:border-primary'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
