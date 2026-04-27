import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Globe2,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail
} from 'lucide-react';
import logo from '../assets/logo.png';
import { useAutoUpdater } from '../hooks/useAutoUpdater';
import { UpdateProgress } from './ui/UpdateProgress';

interface LoginProps {
  onLoginSuccess: (token: string, refresh: string | null, role: string | null, userId: string | number | null, remember: boolean) => void;
  apiBase: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, apiBase }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom hook for auto-updater
  const { status: updateStatus, progress: updateProgress, message: updateMessage } = useAutoUpdater();

  const extractFirstError = (data: any): string | null => {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) return data.non_field_errors[0];
    const keys = Object.keys(data);
    for (const k of keys) {
      const v = (data as any)[k];
      if (Array.isArray(v) && v[0]) return `${k}: ${v[0]}`;
      if (typeof v === 'string') return `${k}: ${v}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/users/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const rawText = await res.text();
      let data: any = {};
      if (rawText) {
        try { data = JSON.parse(rawText); } catch { data = rawText; }
      }

      if (!res.ok) {
        throw new Error(extractFirstError(data) || 'No se pudo iniciar sesión');
      }

      const meRes = await fetch(`${apiBase}/users/api/auth/me/`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.access}` },
      });
      const meRawText = await meRes.text();
      let meData: any = {};
      if (meRawText) {
        try { meData = JSON.parse(meRawText); } catch { meData = {}; }
      }
      
      if (!meRes.ok) {
        const detail = meData?.detail || meData?.message || `Error ${meRes.status}`;
        throw new Error(`No se pudo obtener el perfil: ${detail}`);
      }

      // Verificar si tiene plan pagado
      if (!meData.has_paid) {
        throw new Error('No tienes un plan activo. Por favor, adquiere uno en nuestra página web para acceder al panel.');
      }

      onLoginSuccess(data.access, data.refresh || null, meData.role, meData.id, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '300954010876-ogdevn009becbg6jodc33qcg1prjnq59.apps.googleusercontent.com';
      
      // Request Main Process to open System Browser and handle Auth
      // @ts-ignore
      const token = await window.electron.ipcRenderer.invoke('start-google-auth', GOOGLE_CLIENT_ID);

      if (!token) throw new Error('No se recibió token');

      const res = await fetch(`${apiBase}/users/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token,
          type: 'access_token'
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión con Google');

      const meRes = await fetch(`${apiBase}/users/api/auth/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const meData = await meRes.json();
      
      if (!meRes.ok) throw new Error('No se pudo obtener el perfil del usuario');

      // Verificar si tiene plan pagado
      if (!meData.has_paid) {
        throw new Error('No tienes un plan activo. Por favor, adquiere uno en nuestra página web para acceder al panel.');
      }

      onLoginSuccess(data.access, data.refresh || null, meData.role, meData.id, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Falló el inicio de sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Briefcase className="w-5 h-5 text-blue-400" />, text: "Inteligencia Artificial para optimización", badge: "NUEVO" },
    { icon: <TrendingUp className="w-5 h-5 text-green-400" />, text: "Análisis predictivo de tendencias" },
    { icon: <Globe2 className="w-5 h-5 text-cyan-400" />, text: "Sincronización multi-dispositivo Cloud" },
    { icon: <BarChart3 className="w-5 h-5 text-orange-400" />, text: "Dashboards en tiempo real con Big Data" },
    { icon: <ShieldCheck className="w-5 h-5 text-purple-400" />, text: "Seguridad de grado militar y encriptación" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white font-sans overflow-hidden">
      {/* Left Side - Enhanced Branding & Features */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-900 border-r border-white/5">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.12, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" 
        />
        
        {/* Content Container */}
        <div className="relative z-20 flex flex-col justify-between p-16 h-full w-full max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 text-white font-bold text-2xl mb-12">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img 
                  src={logo} 
                  alt="Asenting Logo" 
                  className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                />
              </motion.div>
              <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Asenting</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
              Innovación impulsada por <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                tecnología de punta
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-gray-400 text-xl leading-relaxed mb-12 max-w-lg">
              Experimenta el futuro de la gestión empresarial. Hemos integrado las herramientas tecnológicas más avanzadas para que tu negocio nunca se detenga.
            </motion.p>

            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-lg font-medium group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                      {feature.text}
                      {feature.badge && (
                        <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          {feature.badge}
                        </span>
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust/Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-6"
          >
            <div className="text-xs text-gray-500 font-medium tracking-widest uppercase">
              © {new Date().getFullYear()} Asenting Systems Inc. • v1.0.45
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Mobile Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-950 to-gray-950 lg:hidden" />
        
        {/* Decorative background for form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center lg:text-left space-y-3">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-white"
            >
              Bienvenido de nuevo
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-lg"
            >
              Ingresa tus credenciales para continuar
            </motion.p>
          </div>

          {/* Update Status UI */}
          <UpdateProgress 
            status={updateStatus} 
            progress={updateProgress} 
            message={updateMessage} 
          />

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3 overflow-hidden shadow-lg shadow-red-950/20"
              >
                <div className="p-1.5 bg-red-500/20 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 space-y-7">
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loginWithGoogle()}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all border border-gray-200 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-gray-800">Continuar con Google</span>
                </>
              )}
            </motion.button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-4 bg-gray-950 text-gray-500 font-bold tracking-[0.2em]">O utiliza tu correo</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label htmlFor="username" className="text-sm font-semibold text-gray-300 ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Usuario
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-900/40 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 text-white placeholder-gray-600 transition-all outline-none backdrop-blur-sm group-hover:bg-gray-900/60"
                    placeholder="Tu nombre de usuario"
                  />
                  <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Contraseña
                  </label>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-5 pr-14 py-4 bg-gray-900/40 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 text-white placeholder-gray-600 transition-all outline-none backdrop-blur-sm group-hover:bg-gray-900/60"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-3 text-sm text-gray-400 select-none cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="group-hover:text-gray-200 transition-colors">Recordar sesión</span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar al Panel</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
            
            <div className="pt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500">
                ¿Aún no tienes una cuenta? <a href="#" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">Regístrate gratis</a>
              </p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm shadow-inner"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">Seguridad de grado empresarial</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
