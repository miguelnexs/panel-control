import React, { useState } from 'react';
import { 
  User, 
  X, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: any) => void;
  token: string | null;
  apiBase: string;
  themeColor?: 'blue' | 'indigo';
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  token, 
  apiBase,
  themeColor = 'blue'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_type: 'person' as 'person' | 'company',
    full_name: '',
    cedula: '',
    phone: '',
    email: '',
    address: ''
  });

  if (!isOpen) return null;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-500',
      text: 'text-blue-600',
      ring: 'focus:ring-blue-500/10',
      border: 'focus:border-blue-500',
      light: 'bg-blue-100',
      shadow: 'shadow-blue-600/30'
    },
    indigo: {
      bg: 'bg-indigo-600',
      hover: 'hover:bg-indigo-500',
      text: 'text-indigo-400',
      ring: 'focus:ring-indigo-500/10',
      border: 'focus:border-indigo-500',
      light: 'bg-indigo-500/10',
      shadow: 'shadow-indigo-600/30'
    }
  };

  const colors = colorClasses[themeColor];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/clients/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMessage = 'Error al crear cliente';
        if (typeof data === 'object') {
          if (data.detail) {
            errorMessage = data.detail;
          } else {
            errorMessage = Object.entries(data)
              .map(([key, val]) => {
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
                const errors = Array.isArray(val) ? val.join(', ') : String(val);
                return `${fieldName}: ${errors}`;
              })
              .join('\n');
          }
        }
        throw new Error(errorMessage);
      }
      
      onSuccess(data);
      onClose();
      // Reset form
      setForm({
        client_type: 'person',
        full_name: '',
        cedula: '',
        phone: '',
        email: '',
        address: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${colors.bg} text-white shadow-lg ${colors.shadow}`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuevo Cliente</h2>
              <p className="text-xs text-gray-500 font-medium">Registra los datos básicos para continuar</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, client_type: 'person' }))}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${form.client_type === 'person' ? `${colors.bg} text-white shadow-sm` : 'text-gray-500'}`}
            >
              Persona
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, client_type: 'company' }))}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${form.client_type === 'company' ? `${colors.bg} text-white shadow-sm` : 'text-gray-500'}`}
            >
              Empresa
            </button>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">
                {form.client_type === 'person' ? 'Nombre Completo' : 'Razón Social'}
              </label>
              <div className="relative group">
                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:${colors.text} transition-colors`} />
                <input 
                  type="text" 
                  value={form.full_name}
                  onChange={(e) => setForm({...form, full_name: e.target.value})}
                  placeholder={form.client_type === 'person' ? "Nombre y apellidos" : "Nombre legal de la empresa"}
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 ${colors.ring} ${colors.border} focus:outline-none transition-all placeholder:text-gray-400`}
                  required
                />
              </div>
            </div>

            {/* Cedula / NIT */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">
                {form.client_type === 'person' ? 'Cédula / Documento' : 'NIT'}
              </label>
              <div className="relative group">
                <CreditCard className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:${colors.text} transition-colors`} />
                <input 
                  type="text" 
                  value={form.cedula}
                  onChange={(e) => setForm({...form, cedula: e.target.value})}
                  placeholder={form.client_type === 'person' ? "C.C / Pasaporte" : "NIT con dígito de verificación"}
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 ${colors.ring} ${colors.border} focus:outline-none transition-all placeholder:text-gray-400`}
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Teléfono</label>
                <div className="relative group">
                  <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:${colors.text} transition-colors`} />
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="Ej. +57 300..."
                    className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 ${colors.ring} ${colors.border} focus:outline-none transition-all placeholder:text-gray-400`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Email</label>
                <div className="relative group">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:${colors.text} transition-colors`} />
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="correo@ejemplo.com"
                    className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 ${colors.ring} ${colors.border} focus:outline-none transition-all placeholder:text-gray-400`}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Dirección</label>
              <div className="relative group">
                <MapPin className={`absolute left-3.5 top-3 w-4 h-4 text-gray-400 group-focus-within:${colors.text} transition-colors`} />
                <textarea 
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  placeholder="Dirección completa"
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 ${colors.ring} ${colors.border} focus:outline-none transition-all placeholder:text-gray-400 min-h-[80px] resize-none shadow-inner`}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`flex-[2] px-4 py-3 ${colors.bg} ${colors.hover} text-white rounded-xl text-sm font-black shadow-xl ${colors.shadow} transition-all active:scale-95 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Registrar Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;
