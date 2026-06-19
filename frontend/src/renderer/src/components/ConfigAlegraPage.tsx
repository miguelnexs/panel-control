import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, FileText, BookOpen, Lightbulb, ExternalLink } from 'lucide-react';

interface ConfigAlegraPageProps {
  token: string | null;
  apiBase: string;
}

const ConfigAlegraPage: React.FC<ConfigAlegraPageProps> = ({ token, apiBase }) => {
  const [email, setEmail] = useState('');
  const [alegraToken, setAlegraToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (token) loadConfig();
  }, [token]);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.alegra_config) {
            if (data.alegra_config.email) setEmail(data.alegra_config.email);
            if (data.alegra_config.token) setAlegraToken('********');
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
      const payload: any = {
        email,
        token: alegraToken
      };

      const res = await fetch(`${apiBase}/webconfig/alegra/test/`, {
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
      const payload: any = { alegra_config: {} };
      if (email) payload.alegra_config.email = email;
      if (alegraToken && alegraToken !== '********') payload.alegra_config.token = alegraToken;

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

  if (!token) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Configuración / Facturación Alegra
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Configura tus credenciales para la facturación electrónica DIAN a través de Alegra
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-none h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">API Keys de Alegra</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Introduce el correo y el token de tu cuenta de Alegra</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Correo de cuenta Alegra</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Token de Alegra</label>
              <input 
                type="password" 
                value={alegraToken} 
                onChange={e => setAlegraToken(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                placeholder="Pega tu token aquí"
              />
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
                {testing ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> : <CheckCircle size={18} />}
                Probar Conexión
              </button>

              <button 
                onClick={saveConfig}
                disabled={loading || testing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                Guardar Credenciales
              </button>
            </div>
          </div>
        </div>

        {/* Guía y Recomendaciones */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Guía de Configuración</h3>
            </div>
            
            <ol className="space-y-5">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Accede a Alegra</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Inicia sesión en tu cuenta de Alegra. Si no tienes una, deberás crearla en su sitio web.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Genera el Token</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    En Alegra, dirígete a <strong className="text-gray-800 dark:text-gray-200">Configuración {'>'} Integraciones {'>'} API</strong> y genera un nuevo Token o usa uno existente.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Copia los datos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Pega el <strong className="text-gray-800 dark:text-gray-200">Correo Electrónico</strong> registrado en Alegra y el <strong className="text-gray-800 dark:text-gray-200">Token</strong> en el formulario de la izquierda.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Verifica y Guarda</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Haz clic en <strong>Probar Conexión</strong>. Si todo está correcto, guarda las credenciales para comenzar a facturar.
                  </p>
                </div>
              </li>
            </ol>
            
            <a href="https://app.alegra.com/configuration/api/" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Ir a la configuración de API de Alegra
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recomendaciones Importantes</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                <p><strong className="text-gray-900 dark:text-white">Habilita la Facturación DIAN:</strong> Asegúrate de haber completado el proceso de habilitación como facturador electrónico ante la DIAN dentro de tu cuenta de Alegra.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                <p><strong className="text-gray-900 dark:text-white">Seguridad del Token:</strong> Trata tu Token de Alegra como una contraseña. Nunca lo compartas con personas no autorizadas.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                <p><strong className="text-gray-900 dark:text-white">Numeraciones:</strong> Verifica que en Alegra tengas creadas y activas las numeraciones (resoluciones de facturación) que vas a utilizar.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigAlegraPage;
