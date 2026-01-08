import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && type !== 'loading' && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'error': return <XCircle className="w-6 h-6 text-red-400" />;
      case 'loading': return <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />;
      default: return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-8 right-8 z-[9999] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] bg-[#1a1f2e]/95 border border-white/10 backdrop-blur-xl text-white min-w-[300px]"
        >
          <div className="p-2 bg-white/5 rounded-full">
            {getIcon()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-0.5">
              {type === 'loading' ? 'Procesando' : type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}
            </span>
            <span className="font-medium text-base">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
