import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, ShieldCheck, Mail, Info } from 'lucide-react';

interface GoogleConfigProps {
  token: string;
  apiBase: string;
}

const GoogleConfig: React.FC<GoogleConfigProps> = ({ token, apiBase }) => {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.google_config) {
            if (data.google_config.api_key) {
                setApiKey('********');
            }
            if (data.google_config.app_password) {
                setAppPassword('********');
            }
            if (data.google_config.email) {
                setEmail(data.google_config.email);
            }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setMsg(null);
    try {
      // Prioritize SMTP test if email/appPassword are provided
      const payload: any = {};
      if (email) payload.email = email;
      if (appPassword) payload.app_password = appPassword;

      const res = await fetch(`${apiBase}/webconfig/google/test/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Error en la prueba de conexión');
      
      setMsg({ type: 'success', text: data.detail || 'Conexión exitosa' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const payload: any = { google_config: {} };
      
      // Handle SMTP Config
      if (email) payload.google_config.email = email;
      if (appPassword && appPassword !== '********') {
        payload.google_config.app_password = appPassword;
      }

      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.detail || 'Error guardando configuración');
      }
      
      setMsg({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl animate-fade-in shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
          <Mail size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuración de Correo Gmail</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona el envío de correos electrónicos mediante SMTP de Google</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-2">
            <Info size={16} />
            ¿Cómo obtener tu Contraseña de Aplicación?
          </h4>
          <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-1">
            <li>Ve a tu Cuenta de Google {'>'} Seguridad.</li>
            <li>Activa la <strong>Verificación en 2 pasos</strong> si no lo has hecho.</li>
            <li>Busca <strong>"Contraseñas de aplicaciones"</strong> en el buscador de configuración.</li>
            <li>Genera una nueva contraseña (selecciona "Correo" y dispositivo "Otro").</li>
            <li>Copia la contraseña de 16 caracteres y pégala abajo.</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-800">Credenciales SMTP (Recomendado)</h4>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Correo de Gmail</label>
                    <div className="relative">
                        <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="usuario@gmail.com"
                        />
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Contraseña de Aplicación</label>
                    <div className="relative">
                        <input 
                        type="password" 
                        value={appPassword}
                        onChange={e => setAppPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="xxxx xxxx xxxx xxxx"
                        />
                        <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Esta contraseña es diferente a la de tu cuenta de Google.
                    </p>
                </div>
            </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-medium">{msg.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
          <button 
            onClick={testConnection}
            disabled={testing || loading || !email}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> : <ShieldCheck size={18} />}
            Probar Conexión
          </button>

          <button 
            onClick={saveConfig}
            disabled={loading || testing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleConfig;