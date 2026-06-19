
import React, { useEffect } from 'react';
import { Truck, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/contexts/CartContext';
import confetti from 'canvas-confetti';

const FreeShippingBar = () => {
  const { getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();
  const freeShippingThreshold = 300;
  const progress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
  const remaining = Math.max(freeShippingThreshold - totalPrice, 0);

  useEffect(() => {
    if (progress >= 100) {
      // Lanzar confeti cuando se complete la barra
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);
    }
  }, [progress]);

  if (totalPrice >= freeShippingThreshold) {
    return (
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200 rounded-lg p-4 mb-6 relative overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        <div className="flex items-center gap-3 text-green-700 relative z-10">
          <div className="relative">
            <Truck className="w-6 h-6 animate-bounce" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500 animate-spin" />
          </div>
          <span className="font-semibold text-lg animate-pulse">
            ¡Felicidades! Tienes envío gratuito 🎉
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Truck className="w-5 h-5 text-blue-600" />
          {progress > 70 && (
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
          )}
        </div>
        <span className="text-blue-700 font-medium">
          Añade €{remaining.toFixed(2)} más para obtener envío gratuito
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-3 bg-blue-100 transition-all duration-500 ease-out" 
        />
        {progress > 0 && (
          <div 
            className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 rounded-full transition-all duration-500 ease-out animate-pulse"
            style={{ width: `${progress}%` }}
          ></div>
        )}
        
        {progress > 50 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-blue-600">
          Progreso: €{totalPrice.toFixed(2)} / €{freeShippingThreshold.toFixed(2)}
        </p>
        <span className="text-xs font-semibold text-blue-700">
          {progress.toFixed(0)}%
        </span>
      </div>
      
      {progress > 80 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-green-600 font-medium animate-bounce">
            ¡Casi lo logras! 🚀
          </span>
        </div>
      )}
    </div>
  );
};

export default FreeShippingBar;
