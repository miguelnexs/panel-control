import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, ShieldCheck, Mail, Info } from 'lucide-react';

interface GoogleConfigProps {
  token: string;
  apiBase: string;
}

const GoogleConfig: React.FC<GoogleConfigProps> = ({ token, apiBase }) => {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [useTls, setUseTls] = useState(true);
  const [useSsl, setUseSsl] = useState(false);
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
            if (data.google_config.app_password) setAppPassword('********');
            if (data.google_config.email) setEmail(data.google_config.email);
            if (data.google_config.smtp_host) setSmtpHost(data.google_config.smtp_host);
            if (data.google_config.smtp_port) setSmtpPort(data.google_config.smtp_port);
            if (data.google_config.smtp_use_tls !== undefined) setUseTls(!!data.google_config.smtp_use_tls);
            if (data.google_config.smtp_use_ssl !== undefined) setUseSsl(!!data.google_config.smtp_use_ssl);
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
        app_password: appPassword,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_use_tls: useTls,
        smtp_use_ssl: useSsl
      };

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
      if (email) payload.google_config.email = email;
      if (appPassword && appPassword !== '********') payload.google_config.app_password = appPassword;
      payload.google_config.smtp_host = smtpHost;
      payload.google_config.smtp_port = smtpPort;
      payload.google_config.smtp_use_tls = useTls;
      payload.google_config.smtp_use_ssl = useSsl;

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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuración Global (Correo)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona el envío de correos electrónicos</p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
            <div className="space-y-4 max-w-lg">
                <h4 className="font-bold text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <Mail size={18} className="text-red-500" />
                    Correo (SMTP)
                </h4>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-3 text-xs">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-1">
                        <Info size={14} /> Gmail App Password
                    </h4>
                    <p className="text-blue-800 dark:text-blue-300 mb-1">Requiere Verificación en 2 pasos activa.</p>
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-indigo-600 font-bold hover:underline">Generar clave aquí</a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Servidor</label>
                        <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 focus:border-red-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Puerto</label>
                        <input type="number" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 focus:border-red-500 outline-none" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input type="checkbox" checked={useTls} onChange={e => { setUseTls(e.target.checked); if (e.target.checked) setUseSsl(false); }} className="rounded border-gray-300 text-red-600" />
                        <span className="text-gray-600 dark:text-gray-400">TLS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input type="checkbox" checked={useSsl} onChange={e => { setUseSsl(e.target.checked); if (e.target.checked) setUseTls(false); }} className="rounded border-gray-300 text-red-600" />
                        <span className="text-gray-600 dark:text-gray-400">SSL</span>
                    </label>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 outline-none" />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                    <input type="password" value={appPassword} onChange={e => setAppPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 outline-none" />
                </div>
            </div>

        {msg && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-medium">{msg.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
          <button 
            onClick={testConnection}
            disabled={testing || loading || !email}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> : <ShieldCheck size={18} />}
            Probar Correo
          </button>

          <button 
            onClick={saveConfig}
            disabled={loading || testing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
            Guardar Todo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleConfig;