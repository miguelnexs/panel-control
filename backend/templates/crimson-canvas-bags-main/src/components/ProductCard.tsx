import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="group relative hover-lift">
      {/* Image Container */}
      <Link to={`/producto/${product.id}`} className="block relative aspect-square bg-secondary overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-foreground text-background text-xs font-semibold uppercase tracking-wider">
              Nuevo
            </span>
          )}
          {product.isSale && (
            <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider">
              Oferta
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => e.preventDefault()}
            className="w-10 h-10 bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button 
            variant="accent" 
            className="w-full" 
            size="lg"
            onClick={(e) => e.preventDefault()}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </Link>

      {/* Content */}
      <Link to={`/producto/${product.id}`} className="block pt-4 space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </span>
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="font-display text-xl text-foreground">
            ${product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
