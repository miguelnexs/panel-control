
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <ShoppingCart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                Tu carrito está vacío
              </h1>
              <p className="text-muted-foreground mb-8">
                ¡Agrega algunos productos increíbles a tu carrito!
              </p>
              <Link to="/catalog" className="btn-primary">
                Explorar productos
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              Carrito de Compras
            </h1>
            <p className="text-muted-foreground">
              {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card-elegant p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                      <p className="text-primary font-bold text-lg">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="card-elegant p-6 h-fit">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Resumen del Pedido
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({getTotalItems()} productos)</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full mb-4">
                Proceder al Pago
              </button>
              
              <button
                onClick={clearCart}
                className="w-full px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors duration-200"
              >
                Vaciar carrito
              </button>
              
              <Link
                to="/catalog"
                className="block text-center text-primary hover:text-primary/80 mt-4 transition-colors duration-200"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
