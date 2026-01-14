import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Heart, ArrowLeft, Minus, Plus, Truck, Shield, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const products = [
  {
    id: 1,
    name: "Cangurera Urban Pro",
    category: "Cangurera",
    price: 899,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80",
    ],
    description: "Cangurera premium diseñada para el hombre urbano. Fabricada con materiales de alta calidad y acabados impecables. Perfecta para llevar tus esenciales con estilo.",
    features: ["Tela resistente al agua", "Múltiples compartimentos", "Correa ajustable", "Cierre YKK premium"],
    colors: ["Negro", "Gris", "Rojo"],
    isNew: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Bolso Cruzado Stealth",
    category: "Cruzado",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    ],
    description: "Bolso cruzado con diseño minimalista y funcional. Ideal para el día a día, combina versatilidad y estilo en un solo accesorio.",
    features: ["Diseño ergonómico", "Bolsillo antirrobo", "Interior forrado", "Costuras reforzadas"],
    colors: ["Negro", "Café"],
    isSale: true,
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 3,
    name: "Mochila Tactical X",
    category: "Mochila",
    price: 1899,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80",
    ],
    description: "Mochila táctica de alta capacidad con sistema de organización inteligente. Diseñada para profesionales que exigen lo mejor.",
    features: ["Capacidad 25L", "Compartimento laptop 15\"", "Sistema de espalda ventilado", "Múltiples puntos de anclaje"],
    colors: ["Negro", "Verde militar"],
    isNew: true,
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 4,
    name: "Cangurera Compact",
    category: "Cangurera",
    price: 699,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    ],
    description: "Cangurera compacta perfecta para llevar lo esencial. Diseño minimalista con máxima funcionalidad.",
    features: ["Tamaño compacto", "Ligera", "Correa ajustable", "Bolsillo oculto"],
    colors: ["Negro", "Blanco"],
    rating: 4.6,
    reviews: 78,
  },
  {
    id: 5,
    name: "Messenger Street",
    category: "Messenger",
    price: 1499,
    originalPrice: 1799,
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    ],
    description: "Messenger bag con estilo urbano y espacio generoso. Perfecto para el trabajo o estudios.",
    features: ["Capacidad 15L", "Compartimento acolchado", "Cierre magnético", "Correa acolchada"],
    colors: ["Negro", "Gris oscuro"],
    isSale: true,
    rating: 4.8,
    reviews: 92,
  },
  {
    id: 6,
    name: "Riñonera Sport Elite",
    category: "Cangurera",
    price: 799,
    image: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    ],
    description: "Riñonera deportiva con diseño aerodinámico. Ideal para actividades físicas y uso diario.",
    features: ["Material transpirable", "Resistente al sudor", "Bolsillo para auriculares", "Reflectantes"],
    colors: ["Negro", "Rojo", "Azul"],
    rating: 4.5,
    reviews: 67,
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="font-display text-4xl text-foreground">Producto no encontrado</h1>
          <Link to="/" className="text-accent hover:underline mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a productos</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-secondary overflow-hidden relative">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-foreground text-background text-xs font-semibold uppercase tracking-wider">
                    Nuevo
                  </span>
                )}
                {product.isSale && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider">
                    Oferta
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 bg-secondary overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-accent" : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="text-sm text-accent uppercase tracking-widest font-semibold">
                  {product.category}
                </span>
                <h1 className="font-display text-4xl md:text-5xl text-foreground mt-2">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-accent fill-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-foreground font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reseñas)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="font-display text-4xl text-foreground">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Colors */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Color: <span className="text-accent">{product.colors[selectedColor]}</span>
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(index)}
                      className={`px-4 py-2 border-2 text-sm font-medium transition-colors ${
                        selectedColor === index
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border text-foreground hover:border-accent"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Cantidad
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button variant="accent" size="xl" className="flex-1">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al Carrito
                </Button>
                <Button variant="outline" size="xl">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Características
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Envío Gratis
                  </span>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Garantía 1 Año
                  </span>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    30 Días Devolución
                  </span>
                </div>
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
