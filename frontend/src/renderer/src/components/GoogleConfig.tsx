import React, { useState, useEffect } from 'react';
import { 
  Save, CheckCircle, AlertTriangle, ShieldCheck, Mail, Info, 
  ExternalLink, Lock, Server, Check, Copy, Eye, EyeOff, Sparkles,
  ArrowRight, Key, HelpCircle, CheckCircle2
} from 'lucide-react';

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
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'gmail' | 'outlook' | 'yahoo' | 'custom'>('gmail');
  const [activeStep, setActiveStep] = useState(1);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

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

  // Detect and set active preset based on current SMTP settings
  useEffect(() => {
    if (smtpHost === 'smtp.gmail.com' && smtpPort === 587 && useTls && !useSsl) {
      setSelectedPreset('gmail');
    } else if (smtpHost === 'smtp.office365.com' && smtpPort === 587 && useTls && !useSsl) {
      setSelectedPreset('outlook');
    } else if (smtpHost === 'smtp.mail.yahoo.com' && smtpPort === 465 && !useTls && useSsl) {
      setSelectedPreset('yahoo');
    } else {
      setSelectedPreset('custom');
    }
  }, [smtpHost, smtpPort, useTls, useSsl]);

  const applyPreset = (preset: 'gmail' | 'outlook' | 'yahoo' | 'custom') => {
    if (preset === 'gmail') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort(587);
      setUseTls(true);
      setUseSsl(false);
    } else if (preset === 'outlook') {
      setSmtpHost('smtp.office365.com');
      setSmtpPort(587);
      setUseTls(true);
      setUseSsl(false);
    } else if (preset === 'yahoo') {
      setSmtpHost('smtp.mail.yahoo.com');
      setSmtpPort(465);
      setUseTls(false);
      setUseSsl(true);
    }
    setSelectedPreset(preset);
  };

  const copyToClipboard = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
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
      setMsg({ type: 'success', text: data.detail || 'Conexión exitosa. Correo de prueba enviado.' });
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
      setMsg({ type: 'success', text: 'Configuración de correo electrónico guardada correctamente.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = email && appPassword;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Columna Izquierda: Formulario de Configuración (6/12) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-6 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-none backdrop-blur-md transition-all duration-300">
          
          {/* Header del Formulario */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Ajustes del Servidor SMTP</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Parámetros del correo electrónico remitente</p>
              </div>
            </div>
            
            {/* Badge de Estado */}
            <div className="flex items-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                isConfigured 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isConfigured ? 'Configurado' : 'Sin configurar'}
              </span>
            </div>
          </div>

          {/* Selector de Proveedores Rápidos */}
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Proveedor de Correo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'gmail', label: 'Gmail', icon: 'Google' },
                { key: 'outlook', label: 'Outlook', icon: 'Microsoft' },
                { key: 'yahoo', label: 'Yahoo!', icon: 'Yahoo' },
                { key: 'custom', label: 'Personalizado', icon: 'Servidor' }
              ].map((prov) => (
                <button
                  key={prov.key}
                  type="button"
                  onClick={() => applyPreset(prov.key as any)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    selectedPreset === prov.key
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-900/10'
                      : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-mono uppercase">{prov.icon}</span>
                  <span>{prov.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario Principal */}
          <div className="space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Dirección de Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            {/* Contraseña / App Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contraseña de Aplicación
                </label>
                {selectedPreset === 'gmail' && (
                  <button 
                    onClick={() => setActiveStep(2)} 
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    ¿Cómo obtenerla? <ArrowRight size={10} />
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={appPassword} 
                  onChange={e => setAppPassword(e.target.value)} 
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="Introduce la contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Host & Port Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Host */}
              <div className="sm:col-span-8 space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Servidor SMTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Server size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={smtpHost} 
                    onChange={e => setSmtpHost(e.target.value)} 
                    disabled={selectedPreset !== 'custom'}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 ${
                      selectedPreset !== 'custom'
                        ? 'bg-gray-100 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800/40 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                    placeholder="smtp.proveedor.com"
                  />
                </div>
              </div>

              {/* Port */}
              <div className="sm:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Puerto
                </label>
                <input 
                  type="number" 
                  value={smtpPort} 
                  onChange={e => setSmtpPort(Number(e.target.value))} 
                  disabled={selectedPreset !== 'custom'}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                    selectedPreset !== 'custom'
                      ? 'bg-gray-100 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800/40 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                  placeholder="587"
                />
              </div>
            </div>

            {/* TLS & SSL Cards Toggle */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Protocolo de Cifrado
              </label>
              <div className="grid grid-cols-2 gap-3">
                
                {/* TLS Box */}
                <label className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  selectedPreset !== 'custom' ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  useTls 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400' 
                    : 'border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                }`}>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold">STARTTLS</span>
                    <span className="text-[10px] opacity-75">Puerto común 587</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={useTls} 
                    disabled={selectedPreset !== 'custom'}
                    onChange={e => { 
                      if (selectedPreset === 'custom') {
                        setUseTls(e.target.checked); 
                        if (e.target.checked) setUseSsl(false); 
                      }
                    }} 
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                  />
                </label>

                {/* SSL Box */}
                <label className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  selectedPreset !== 'custom' ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  useSsl 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400' 
                    : 'border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                }`}>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold">SSL / TLS</span>
                    <span className="text-[10px] opacity-75">Puerto común 465</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={useSsl} 
                    disabled={selectedPreset !== 'custom'}
                    onChange={e => { 
                      if (selectedPreset === 'custom') {
                        setUseSsl(e.target.checked); 
                        if (e.target.checked) setUseTls(false); 
                      }
                    }} 
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                  />
                </label>

              </div>
            </div>

          </div>

          {/* Mensajes de feedback */}
          {msg && (
            <div className={`mt-5 p-4 rounded-xl flex items-start gap-3 border ${
              msg.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/10' 
                : 'bg-red-50 dark:bg-red-500/5 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/10'
            }`}>
              <div className="mt-0.5">
                {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="text-xs font-medium leading-relaxed">{msg.text}</div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button 
              onClick={testConnection}
              disabled={testing || loading || !email}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {testing ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck size={18} className="text-gray-500 dark:text-gray-400" />
              )}
              Probar Conexión
            </button>

            <button 
              onClick={saveConfig}
              disabled={loading || testing}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-indigo-900/10 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Guardar Configuración
            </button>
          </div>

        </div>
      </div>

      {/* Columna Derecha: Guía Completa de Configuración (6/12) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-6 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-none backdrop-blur-md transition-all duration-300">
          
          {/* Header de la Guía */}
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5 mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              Guía de Configuración Completa
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Sigue estos sencillos pasos para que tu sistema envíe correos electrónicos automáticamente.
            </p>
          </div>

          {/* Lista de Pasos */}
          <div className="space-y-4">
            
            {/* Paso 1 */}
            <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              activeStep === 1 
                ? 'border-indigo-500/40 bg-indigo-50/10 dark:bg-indigo-950/5' 
                : 'border-gray-100 dark:border-gray-800 bg-transparent hover:border-gray-200 dark:hover:border-gray-800'
            }`}>
              <button
                onClick={() => setActiveStep(1)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeStep === 1 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Seguridad de la Cuenta</h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Verificación en 2 pasos</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeStep === 1 ? 'Activo' : 'Ver'}
                </span>
              </button>

              {activeStep === 1 && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/40 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Las cuentas modernas de <strong>Gmail</strong> y <strong>Outlook</strong> no permiten que aplicaciones externas accedan usando tu contraseña habitual por razones de seguridad.
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-xl flex items-start gap-2.5">
                    <Info size={16} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-900 dark:text-amber-400">Requisito Obligatorio</h5>
                      <p className="text-[11px] text-amber-800 dark:text-amber-400/80 leading-relaxed mt-0.5">
                        Debes tener activada la <strong>Verificación en dos pasos</strong> en tu cuenta de correo antes de intentar configurar o solicitar una contraseña de aplicación.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveStep(2)}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    Entendido, ir al Paso 2 <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Paso 2 */}
            <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              activeStep === 2 
                ? 'border-indigo-500/40 bg-indigo-50/10 dark:bg-indigo-950/5' 
                : 'border-gray-100 dark:border-gray-800 bg-transparent hover:border-gray-200 dark:hover:border-gray-800'
            }`}>
              <button
                onClick={() => setActiveStep(2)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeStep === 2 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Generar Contraseña de Aplicación</h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Crear clave de acceso SMTP de 16 dígitos</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeStep === 2 ? 'Activo' : 'Ver'}
                </span>
              </button>

              {activeStep === 2 && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/40 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Una contraseña de aplicación permite que este panel envíe correos desde tu cuenta SMTP de manera segura.
                  </p>
                  
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">Cómo obtenerla en Google (Gmail):</h5>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                      <li>Haz clic en el botón de abajo para ir a la sección de Google.</li>
                      <li>Inicia sesión y dirígete a <strong>Contraseñas de aplicación</strong>.</li>
                      <li>Escribe un nombre identificativo (ej: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-[11px]">Panel Asenting</code>).</li>
                      <li>Haz clic en <strong>Crear</strong> y copia el código amarillo de 16 caracteres.</li>
                    </ol>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      Generar en Google <ExternalLink size={14} />
                    </a>
                    
                    <button 
                      type="button"
                      onClick={() => copyToClipboard('Panel Asenting', 2)}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      {copiedStep === 2 ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      {copiedStep === 2 ? 'Copiado' : 'Copiar nombre sugerido'}
                    </button>
                  </div>

                  <div className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/10 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-indigo-500 tracking-wider mb-1">Ejemplo del código obtenido</span>
                    <div className="font-mono text-center font-bold text-sm tracking-widest text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-950/40 py-1 px-3 rounded-lg border border-indigo-100 dark:border-indigo-950">
                      xxxx xxxx xxxx xxxx
                    </div>
                    <span className="block text-[9px] text-gray-500 dark:text-gray-400 mt-1">Inserta estos 16 dígitos sin espacios en el campo de contraseña.</span>
                  </div>

                  <button 
                    onClick={() => setActiveStep(3)}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    Ir al Paso 3 <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Paso 3 */}
            <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              activeStep === 3 
                ? 'border-indigo-500/40 bg-indigo-50/10 dark:bg-indigo-950/5' 
                : 'border-gray-100 dark:border-gray-800 bg-transparent hover:border-gray-200 dark:hover:border-gray-800'
            }`}>
              <button
                onClick={() => setActiveStep(3)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeStep === 3 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Rellenar Servidor SMTP</h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Direcciones SMTP preconfiguradas</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeStep === 3 ? 'Activo' : 'Ver'}
                </span>
              </button>

              {activeStep === 3 && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/40 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Para facilitarte la configuración, puedes usar los botones rápidos del formulario. Rellenarán de forma automática los puertos y protocolos recomendados.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                          <th className="py-2 font-bold uppercase">Proveedor</th>
                          <th className="py-2 font-bold uppercase">Servidor</th>
                          <th className="py-2 font-bold uppercase">Puerto</th>
                          <th className="py-2 font-bold uppercase">Cifrado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        <tr>
                          <td className="py-2 font-semibold">Gmail</td>
                          <td className="py-2 font-mono">smtp.gmail.com</td>
                          <td className="py-2">587</td>
                          <td className="py-2">STARTTLS</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-semibold">Outlook / Hotmail</td>
                          <td className="py-2 font-mono">smtp.office365.com</td>
                          <td className="py-2">587</td>
                          <td className="py-2">STARTTLS</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-semibold">Yahoo! Mail</td>
                          <td className="py-2 font-mono">smtp.mail.yahoo.com</td>
                          <td className="py-2">465</td>
                          <td className="py-2">SSL/TLS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                    * Si utilizas un correo corporativo personalizado, selecciona la opción "Personalizado" y rellena los datos según las especificaciones de tu hosting.
                  </p>

                  <button 
                    onClick={() => setActiveStep(4)}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    Ir al Paso final <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Paso 4 */}
            <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              activeStep === 4 
                ? 'border-indigo-500/40 bg-indigo-50/10 dark:bg-indigo-950/5' 
                : 'border-gray-100 dark:border-gray-800 bg-transparent hover:border-gray-200 dark:hover:border-gray-800'
            }`}>
              <button
                onClick={() => setActiveStep(4)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeStep === 4 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Probar y Guardar</h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Verificar que el correo funcione</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeStep === 4 ? 'Activo' : 'Ver'}
                </span>
              </button>

              {activeStep === 4 && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/40 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Antes de terminar, es fundamental verificar que el servidor de correo se conecte correctamente.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/60 text-[11px] leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold">
                      <CheckCircle2 size={15} /> Proceso Recomendado:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Haz clic en el botón <strong>Probar Conexión</strong>.</li>
                      <li>El sistema intentará iniciar sesión y enviar un correo de prueba a tu dirección.</li>
                      <li>Si la respuesta es exitosa, haz clic en <strong>Guardar Configuración</strong>.</li>
                    </ol>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    ¡Listo! Con esto el sistema enviará correos de forma automática a tus clientes y notificaciones de ventas.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Card de ayuda al pie de la guía */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-100/30 dark:border-indigo-900/10 flex items-start gap-3">
            <HelpCircle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white">¿Tienes dudas o problemas?</h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Asegúrate de que no estás copiando espacios al inicio o al final del correo/contraseña. Si usas Outlook o Yahoo, verifica la configuración de SMTP habilitada en los ajustes de tu proveedor.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GoogleConfig;