import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, Key } from 'lucide-react';

interface AlegraConfigProps {
  token: string;
  apiBase: string;
}

const AlegraConfig: React.FC<AlegraConfigProps> = ({ token, apiBase }) => {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${apiBase}/einvoicing/alegra/config/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmail(data.user_email || '');
        if (data.user_email) setApiKey('********'); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const payload: any = { user_email: email };
      if (apiKey && apiKey !== '********') {
        payload.api_key = apiKey;
      }

      const res = await fetch(`${apiBase}/einvoicing/alegra/config/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error guardando configuración');
      
      setMsg({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Key className="text-yellow-500" />
        Configuración Alegra (Facturación Electrónica)
      </h3>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Correo Electrónico (Alegra)</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded"
            placeholder="ejemplo@empresa.com"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Token API (API Key)</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded"
            placeholder="Introduce tu token de Alegra"
          />
          <p className="text-xs text-gray-500 mt-1">
            Puedes encontrar tu token en Configuración {'>'} API en Alegra.
          </p>
        </div>

        {msg && (
          <div className={`p-3 rounded flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {msg.text}
          </div>
        )}

        <button 
          onClick={saveConfig}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
          Guardar Conexión
        </button>
      </div>
    </div>
  );
};

export default AlegraConfig;
