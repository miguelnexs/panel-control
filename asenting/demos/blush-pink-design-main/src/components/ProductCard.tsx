
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
  category?: string;
  viewMode?: string;
}

const ProductCard = ({ id, name, price, originalPrice, image, isNew, isSale, viewMode = 'grid' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id, name, price, image });
    console.log("Producto agregado al carrito:", name);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="card-elegant group cursor-pointer flex flex-row"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Image container */}
        <div className="relative overflow-hidden w-48 h-48 flex-shrink-0">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {isNew && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                Nuevo
              </span>
            )}
            {isSale && (
              <span className="bg-pink-hover text-white text-xs px-2 py-1 rounded-full font-medium">
                Oferta
              </span>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors duration-200 text-xl">
              {name}
            </h3>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-semibold text-primary">
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 w-fit"
          >
            <ShoppingCart className="w-4 h-4" />
            Añadir al carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card-elegant group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image container */}
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              Nuevo
            </span>
          )}
          {isSale && (
            <span className="bg-pink-hover text-white text-xs px-2 py-1 rounded-full font-medium">
              Oferta
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button 
            onClick={handleAddToCart}
            className="bg-white text-foreground px-4 py-2 rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Añadir al carrito
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {name}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
