import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Globe2,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  ShieldAlert
} from 'lucide-react';
import logo from '../assets/logo.png';
import { useAutoUpdater } from '../hooks/useAutoUpdater';
import { UpdateProgress } from './ui/UpdateProgress';
import { ModeToggle } from './ModeToggle';

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
  const [showNoPlanModal, setShowNoPlanModal] = useState(false);
  
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
        setShowNoPlanModal(true);
        setLoading(false);
        return;
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
        setShowNoPlanModal(true);
        setLoading(false);
        return;
      }

      onLoginSuccess(data.access, data.refresh || null, meData.role, meData.id, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Falló el inicio de sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />, text: "Inteligencia Artificial para optimización", badge: "NUEVO" },
    { icon: <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Análisis predictivo de tendencias" },
    { icon: <Globe2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />, text: "Sincronización multi-dispositivo Cloud" },
    { icon: <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />, text: "Dashboards en tiempo real con Big Data" },
    { icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />, text: "Seguridad de grado militar y encriptación" },
  ];

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-100 via-slate-50 to-cyan-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300 relative">
      
      {/* Floating Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle 
          className="border border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 hover:bg-slate-50 dark:hover:bg-gray-800 shadow-lg backdrop-blur-sm px-4 py-2 w-auto transition-all duration-300 rounded-xl" 
          collapsed={true} 
        />
      </div>

      {/* Left Side - Enhanced Branding & Features */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-white/20 dark:bg-gray-900 border-r-2 border-indigo-200/60 dark:border-white/5 transition-colors duration-300 backdrop-blur-sm">
        {/* Animated Background Gradients & Blobs for Parallax Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300/40 dark:from-blue-900/20 via-cyan-200/30 dark:via-gray-900 to-indigo-200/40 dark:to-gray-900 transition-colors duration-300" />
        
        {/* Floating Blob Left 1 */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-blue-500/40 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-blob" />
        
        {/* Floating Blob Left 2 */}
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-sky-400/50 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000" />

        {/* Floating Blob Left 3 (Emerald/Teal) */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 bg-teal-400/30 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-4000" />
        
        {/* Content Container */}
        <div className="relative z-20 flex flex-col justify-between p-16 h-full w-full max-w-2xl mx-auto animate-in fade-in duration-500">
          {/* Header */}
          <div className="space-y-12">
            <div className="flex items-center gap-4 text-slate-900 dark:text-white font-bold text-2xl mb-12">
              <div className="hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer">
                <img 
                  src={logo} 
                  alt="Asenting Logo" 
                  className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                />
              </div>
              <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 dark:from-white to-slate-600 dark:to-gray-400">Asenting</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-8">
              Innovación impulsada por <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">
                tecnología de punta
              </span>
            </h1>
            
            <p className="text-slate-500 dark:text-gray-400 text-lg leading-relaxed mb-12 max-w-lg">
              Experimenta el futuro de la gestión empresarial. Hemos integrado las herramientas tecnológicas más avanzadas para que tu negocio nunca se detenga.
            </p>

            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 group cursor-default transition-all duration-300 hover:translate-x-2"
                >
                  <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/10 group-hover:border-blue-200 dark:group-hover:border-blue-500/30 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-600 dark:text-gray-300 text-lg font-medium group-hover:text-slate-900 group-hover:dark:text-white transition-colors duration-300 flex items-center gap-2">
                      {feature.text}
                      {feature.badge && (
                        <span className="text-[10px] bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          {feature.badge}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust/Footer */}
          <div className="space-y-6">
            <div className="text-xs text-slate-400 dark:text-gray-500 font-medium tracking-widest uppercase">
              © {new Date().getFullYear()} Asenting Systems Inc. • v1.0.45
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form Wrapper */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden transition-colors duration-300">
        {/* Parallax Blobs behind the form card */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-200/40 dark:from-blue-900/10 via-blue-100/50 dark:via-gray-950 to-white/50 dark:to-gray-950 lg:hidden" />
        
        {/* Floating Blob Right 1 */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-400/40 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-blob" />
        
        {/* Floating Blob Right 2 */}
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-500/40 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000" />
        
        {/* Glassmorphic Form Card */}
        <div className="w-full max-w-xl p-8 sm:p-14 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl border-2 border-indigo-200/80 dark:border-white/10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(99,102,241,0.2)] dark:shadow-black/30 space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center lg:text-left space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-lg">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Update Status UI */}
          <UpdateProgress 
            status={updateStatus} 
            progress={updateProgress} 
            message={updateMessage} 
          />

          {error && (
            <div 
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-200 text-sm flex items-center gap-3 overflow-hidden shadow-lg shadow-red-950/5 dark:shadow-red-950/20 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="p-1.5 bg-red-500/20 rounded-full shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={() => loginWithGoogle()}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-50/80 to-white hover:from-indigo-100 hover:to-indigo-50 dark:from-gray-900 dark:to-gray-900 dark:hover:from-gray-800 dark:hover:to-gray-800 text-slate-700 dark:text-white font-bold py-4 px-6 rounded-2xl transition-all border-2 border-indigo-200 dark:border-gray-800 shadow-lg shadow-indigo-200/40 dark:shadow-black/10 hover:shadow-xl hover:shadow-indigo-300/50 dark:hover:shadow-black/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden duration-200"
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
                  <span>Continuar con Google</span>
                </>
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-slate-200 dark:border-gray-800/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-4 bg-transparent text-slate-500 dark:text-gray-500 font-bold tracking-[0.2em] transition-colors duration-300">O utiliza tu correo</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500" />
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
                    className="w-full px-5 py-4 bg-indigo-50/40 dark:bg-gray-950/20 border-2 border-indigo-200/60 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-blue-500/40 focus:border-indigo-500/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-all duration-300 outline-none backdrop-blur-sm group-hover:bg-indigo-50/70 dark:group-hover:bg-gray-900/60"
                    placeholder="Tu nombre de usuario"
                  />
                  <div className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-[0.5px]" />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-gray-500" />
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
                    className="w-full pl-5 pr-14 py-4 bg-indigo-50/40 dark:bg-gray-950/20 border-2 border-indigo-200/60 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-blue-500/40 focus:border-indigo-500/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-all duration-300 outline-none backdrop-blur-sm group-hover:bg-indigo-50/70 dark:group-hover:bg-gray-900/60"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-[0.5px]" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400 select-none cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-2 border-indigo-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-indigo-600 focus:ring-indigo-500/30 dark:focus:ring-blue-500/50 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="group-hover:text-slate-700 group-hover:dark:text-gray-200 transition-colors">Recordar sesión</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-[right_center] text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 transition-all duration-500 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar al Panel</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
            
            <div className="pt-6 flex flex-col items-center gap-4">
              <p className="text-sm text-slate-500 dark:text-gray-500">
                ¿Aún no tienes una cuenta? <a href="#" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors">Regístrate gratis</a>
              </p>
              
              <div 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100/70 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm shadow-inner"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold tracking-wider uppercase">Seguridad de grado empresarial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showNoPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0B0D14] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/20 w-full max-w-md overflow-hidden relative animate-scale-up">
            {/* Decorative top red glow line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 to-pink-500"></div>
            
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="p-4 rounded-full bg-red-500/10 text-red-500 mb-4 animate-pulse">
                  <ShieldAlert size={36} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Acceso Restringido</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  No tienes un plan activo en tu cuenta. Para poder acceder al panel de control de Asenting, por favor realiza tu pago.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    const url = apiBase.includes('localhost') 
                      ? 'http://localhost:5173/precios' 
                      : 'https://asenting.com/precios';
                    if (window.electron && window.electron.ipcRenderer) {
                      await window.electron.ipcRenderer.invoke('open-external-url', url);
                    } else {
                      window.open(url, '_blank');
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold text-sm shadow-lg shadow-red-950/30 transition-all transform active:scale-[0.98]"
                >
                  Pagar ahora
                </button>
                <button
                  onClick={() => setShowNoPlanModal(false)}
                  className="w-full py-3 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 text-gray-300 font-medium text-sm transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
