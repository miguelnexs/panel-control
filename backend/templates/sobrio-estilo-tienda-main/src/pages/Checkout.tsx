
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Shield, Truck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckoutForm from '@/components/CheckoutForm';
import CartDropdown from '@/components/CartDropdown';
import SocialLinks from '@/components/SocialLinks';
import { useCart } from '@/contexts/CartContext';

const Checkout = () => {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="relative mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-neutral-300" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-light text-neutral-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-neutral-600 text-lg">Agrega algunos productos antes de finalizar tu compra</p>
          </div>
          <Link to="/">
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
              Continuar comprando
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header mejorado */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-neutral-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="hover:bg-neutral-100 rounded-full transition-all duration-300 hover:scale-110">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/" className="group">
              <h1 className="text-2xl font-serif tracking-tighter text-neutral-900 transition-all duration-300 group-hover:text-neutral-700">
                <span className="font-light italic">cgcaro</span>
                <span className="font-bold">Gonzalez</span>
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <SocialLinks variant="header" />
            <CartDropdown />
          </div>
        </div>
      </div>

      {/* Breadcrumb mejorado */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-neutral-100 py-3 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-300 font-medium">
              Inicio
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-900 font-semibold">Checkout</span>
          </div>
        </div>
      </div>

      {/* Banner de seguridad */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100 py-3 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Compra 100% Segura</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Truck className="w-4 h-4" />
              <span className="font-medium">Envío Gratis +€300</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Múltiples Métodos de Pago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <CheckoutForm />
        </div>
      </div>

      {/* Footer mejorado */}
      <footer className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h4 className="text-neutral-200 font-medium mb-3 text-lg">cgcaroGonzalez</h4>
              <p className="text-sm leading-relaxed">Elegancia minimalista para el mundo moderno. Cada pieza está diseñada con atención al detalle y calidad excepcional.</p>
            </div>
            
            <div className="text-center">
              <h4 className="text-neutral-200 font-medium mb-3">Ubicación</h4>
              <p className="text-sm">Pereira, Colombia</p>
              <p className="text-sm">Carrera 7 #17-45</p>
            </div>
            
            <div className="text-center md:text-right">
              <h4 className="text-neutral-200 font-medium mb-3">Síguenos</h4>
              <div className="flex justify-center md:justify-end">
                <SocialLinks variant="footer" />
              </div>
            </div>
          </div>
          
          <div className="text-xs text-neutral-500 border-t border-neutral-700 pt-6 text-center">
            <p>© 2024 cgcaroGonzalez. Todos los derechos reservados.</p>
            <p className="mt-1">Diseñado con ❤️ en Pereira, Colombia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
