import { ShoppingCart, Star, Zap, Timer, ArrowRight, Percent } from "lucide-react";
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
  active?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

const OfferSection = () => {
  const { addToCart } = useCart();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('webconfig/public/products/') + getPublicParams());
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      return response.json();
    }
  });

  const offerProducts = Array.isArray(products) 
    ? products.filter((p: Product) => p.is_sale && p.sale_price) 
    : (products?.results || []).filter((p: Product) => p.is_sale && p.sale_price);

  if (isLoading || offerProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 mb-4 animate-pulse">
              <Timer className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Ofertas por tiempo limitado</span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              Descuentos <span className="text-primary">Imperdibles</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Aprovecha estos precios especiales en productos seleccionados. ¡No te quedes sin el tuyo!
            </p>
          </div>
          
          <Button variant="outline" className="hidden md:flex gap-2" asChild>
            <Link to="/shop">
              Ver Todas las Ofertas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerProducts.slice(0, 4).map((product: Product, index: number) => {
             const discount = Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100);
             
             return (
              <div 
                key={product.id}
                className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                    <Percent className="w-3 h-3" />
                    {discount}% OFF
                  </div>
                </div>

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img 
                    src={product.image ? buildMediaUrl(product.image) : "/placeholder.svg"} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="secondary" className="rounded-full scale-90 group-hover:scale-100 transition-transform duration-300" asChild>
                      <Link to={`/product/${product.id}/${slugify(product.name)}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {product.category?.name || "Oferta"}
                    </p>
                    <Link to={`/product/${product.id}/${slugify(product.name)}`}>
                      <h3 className="font-bold text-lg text-foreground leading-tight hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 mb-4 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 4 ? "fill-current" : "text-muted"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.sale_price || 0)}
                      </span>
                    </div>
                    <Button 
                      size="icon" 
                      className="rounded-xl shadow-lg shadow-primary/20 shrink-0"
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.sale_price || product.price,
                        image: product.image,
                        quantity: 1
                      })}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/shop">Ver Todas las Ofertas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
