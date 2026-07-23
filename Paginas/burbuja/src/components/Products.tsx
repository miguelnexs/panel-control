import { ShoppingCart, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { buildApiUrl, buildMediaUrl, getPublicParams } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

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

const Products = () => {
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

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p>Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Error cargando productos. Por favor intente más tarde.</p>
        </div>
      </section>
    );
  }

  // Si no hay productos, usar un array vacío para evitar errores
  const productList: Product[] = Array.isArray(products) ? products : (products?.results || []);

  return (
    <section id="tienda" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            Tienda Online
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
            Productos <span className="text-gradient">Destacados</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Encuentra los mejores equipos y accesorios tecnológicos con garantía y soporte técnico incluido.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {productList.map((product, index) => (
            <div
              key={product.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 border border-border hover:border-accent/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Area */}
              <div className="relative aspect-square overflow-hidden bg-navy/5">
                {(product.is_sale || product.is_new) && (
                  <span className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold ${
                    product.is_sale
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-accent-gradient text-navy"
                  }`}>
                    {product.is_sale ? (
                      <>
                        <Zap className="w-3 h-3 inline mr-1" />
                        Oferta
                      </>
                    ) : "Nuevo"}
                  </span>
                )}
                <img 
                  src={product.image ? buildMediaUrl(product.image) : "/placeholder.svg"} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  {product.category?.name || "General"}
                </p>
                <h3 className="font-heading font-bold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                {/* Specs - Si vienen del backend como features o specs */}
                {product.features && product.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.slice(0, 3).map((spec, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rating - Mockeado si no viene */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-highlight text-highlight" />
                  <span className="text-sm font-medium text-card-foreground">{product.rating || 4.5}</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {product.is_sale && product.sale_price ? (
                      <>
                        <p className="font-heading font-bold text-xl text-primary">
                          {formatPrice(product.sale_price)}
                        </p>
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </p>
                      </>
                    ) : (
                      <p className="font-heading font-bold text-xl text-primary">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="cta" 
                    className="flex-1"
                    onClick={() => addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.is_sale && product.sale_price ? product.sale_price : product.price,
                      image: product.image,
                      quantity: 1
                    })}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                  <Button variant="outline" className="border-primary/30 hover:bg-primary/10" asChild>
                    <Link to={`/product/${product.id}/${slugify(product.name)}`}>
                      Ver
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link to="/shop">
              Ver Todos los Productos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
