
import React, { useState } from 'react';
import { ShoppingBag, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-neutral-100 rounded-full transition-all duration-200 group"
      >
        <ShoppingBag className="w-6 h-6 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-96 max-h-[32rem] z-50 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b bg-neutral-50/80">
                <h3 className="font-semibold text-neutral-900">
                  Carrito ({totalItems})
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-neutral-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-600 mb-4">Tu carrito está vacío</p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    className="text-sm"
                  >
                    Continuar comprando
                  </Button>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.color}`}
                        className="group flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                          <div className="absolute -top-1 -right-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeItem(item.id, item.color)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-neutral-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-neutral-500 mb-1">{item.color}</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {item.price}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 bg-neutral-50 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-neutral-200"
                            onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-neutral-200"
                            onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t bg-neutral-50/50 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-neutral-900">Total:</span>
                      <span className="font-bold text-xl text-neutral-900">
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {totalPrice >= 300 && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg mb-3 text-center">
                        🎉 ¡Envío gratuito incluido!
                      </div>
                    )}

                    <Link to="/checkout" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white group">
                        Finalizar compra
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    <p className="text-xs text-neutral-500 text-center mt-3">
                      Envío gratuito a partir de €300
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CartDropdown;
