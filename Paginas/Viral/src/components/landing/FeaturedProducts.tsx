import { ShoppingCart, Heart, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, buildMediaUrl, getPublicParams } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { slugify } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image?: string;
  category?: { name: string };
  rating?: number;
  is_new?: boolean;
  is_sale?: boolean;
  features?: string[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('webconfig/public/products/') + getPublicParams());
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      return response.json();
    }
  });

  const productList: Product[] = Array.isArray(products) ? products : (products?.results || []);

  if (isLoading) {
    return (
      <section className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p>Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-destructive">Error cargando productos. Por favor intente más tarde.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">
            Lo Mejor
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            PRODUCTOS DESTACADOS
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Los favoritos de nuestra comunidad. Calidad premium, diseño único.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {productList.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image ? buildMediaUrl(product.image) : "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge */}
                {(product.is_sale || product.is_new) && (
                  <Badge
                    className={`absolute top-4 left-4 ${
                      product.is_sale
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {product.is_sale ? (
                      <>
                        <Zap className="w-3 h-3 inline mr-1" />
                        Oferta
                      </>
                    ) : "Nuevo"}
                  </Badge>
                )}

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-card/90 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <Button 
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10 mt-2"
                    asChild
                  >
                    <Link to={`/product/${product.id}/${slugify(product.name)}`}>
                      Ver Detalles
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  {product.is_sale && product.sale_price ? (
                    <>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold uppercase tracking-wide"
          >
            Ver Todos los Productos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
