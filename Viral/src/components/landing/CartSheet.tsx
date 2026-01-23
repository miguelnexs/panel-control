import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { buildMediaUrl } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

export const CartSheet = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, isCartOpen, closeCart, openCart } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Tu Carrito ({totalItems})</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Tu carrito está vacío</h3>
              <p className="text-muted-foreground mb-6">Parece que aún no has agregado productos.</p>
              <Button onClick={closeCart}>Seguir comprando</Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.variant}`} className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg border bg-muted overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image ? buildMediaUrl(item.image) : "/placeholder.svg"} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* 
                        <Link 
                          to={`/product/${item.id}/${slugify(item.name)}`} 
                          className="hover:underline"
                          onClick={closeCart}
                        >
                          <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                        </Link>
                        */}
                        <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {item.colorName && <p>Color: {item.colorName}</p>}
                          {item.variantName && <p>Opción: {item.variantName}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md h-8">
                          <button 
                            className="w-8 h-full flex items-center justify-center hover:bg-muted"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.variant)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            className="w-8 h-full flex items-center justify-center hover:bg-muted"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.variant)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</span>
                          <button 
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => removeFromCart(item.id, item.color, item.variant)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <SheetFooter>
              <Button className="w-full h-12 text-base" onClick={() => {
                closeCart();
                navigate('/checkout');
              }}>
                Proceder al Pago
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
