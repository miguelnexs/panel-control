import React from 'react';
import { Crown, X } from 'lucide-react';

interface LimitModalProps {
  onClose: () => void;
  type: string;
}

const LimitModal: React.FC<LimitModalProps> = ({ onClose, type }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <Crown size={32} className="text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            ¡Límite Alcanzado!
          </h3>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Has llegado al máximo de <strong>{type === 'products' ? 'productos' : 'categorías'}</strong> permitidos en tu plan actual. 
            <br/><br/>
            Para seguir agregando más ítems y desbloquear todo el potencial de tu negocio, actualiza tu plan hoy mismo.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={onClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/25"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitModal;
