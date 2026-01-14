import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  color?: number; // Color ID
  variant?: number; // Variant ID
  colorName?: string;
  variantName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, color?: number, variant?: number) => void;
  updateQuantity: (id: number, quantity: number, color?: number, variant?: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  openCart: () => void;
  closeCart: () => void;
  isCartOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => 
          item.id === newItem.id && 
          item.color === newItem.color && 
          item.variant === newItem.variant
      );

      if (existing) {
        toast.success("Cantidad actualizada en el carrito");
        return prev.map((item) =>
          item.id === newItem.id && 
          item.color === newItem.color && 
          item.variant === newItem.variant
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      
      toast.success("Producto agregado al carrito");
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, color?: number, variant?: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => 
          !(item.id === id && item.color === color && item.variant === variant)
      )
    );
    toast.info("Producto eliminado del carrito");
  };

  const updateQuantity = (id: number, quantity: number, color?: number, variant?: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.color === color && item.variant === variant
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Carrito vaciado");
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        openCart,
        closeCart,
        isCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
