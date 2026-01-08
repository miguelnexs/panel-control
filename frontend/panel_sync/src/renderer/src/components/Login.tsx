import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../config/api.config';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2,
  Globe2
} from 'lucide-react';
import logo from '../assets/logo.png';

interface LoginProps {
  onLoginSuccess: (token: string, refresh: string | null, role: string | null, userId: string | number | null) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/users/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Credenciales inválidas');
      }

      const meRes = await fetch(`${API_BASE_URL}/users/api/auth/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const meData = await meRes.json();
      
      if (!meRes.ok) throw new Error('No se pudo obtener el perfil del usuario');

      onLoginSuccess(data.access, data.refresh || null, meData.role, meData.id);
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

      const res = await fetch(`${API_BASE_URL}/users/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token,
          type: 'access_token'
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión con Google');

      const meRes = await fetch(`${API_BASE_URL}/users/api/auth/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const meData = await meRes.json();
      
      if (!meRes.ok) throw new Error('No se pudo obtener el perfil del usuario');

      onLoginSuccess(data.access, data.refresh || null, meData.role, meData.id);
    } catch (err: any) {
      setError(err.message || 'Falló el inicio de sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Briefcase className="w-5 h-5 text-blue-400" />, text: "Gestión integral de inventarios" },
    { icon: <TrendingUp className="w-5 h-5 text-green-400" />, text: "Control de ventas en tiempo real" },
    { icon: <Users className="w-5 h-5 text-purple-400" />, text: "Administración de clientes y CRM" },
    { icon: <BarChart3 className="w-5 h-5 text-orange-400" />, text: "Reportes y analíticas avanzadas" },
    { icon: <Globe2 className="w-5 h-5 text-cyan-400" />, text: "Tu propia página web integrada" },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white font-sans overflow-hidden">
      {/* Left Side - Enhanced Branding & Features */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-900 border-r border-white/5">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        
        {/* Content Container */}
        <div className="relative z-20 flex flex-col justify-between p-16 h-full w-full max-w-2xl mx-auto">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 text-white font-bold text-2xl mb-8">
              <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <img 
                  src={logo} 
                  alt="Asenting Logo" 
                  className="h-6 w-6 rounded object-contain bg-white/10" 
                />
              </div>
              <span className="tracking-tight">Asenting</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Potencia tu negocio con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">inteligencia</span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              La plataforma todo en uno para emprendedores modernos. Controla cada aspecto de tu operación desde un solo lugar.
            </p>

            {/* Feature List */}
            <div className="space-y-5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                    {feature.icon}
                  </div>
                  <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust/Footer */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5 w-fit">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-400">Datos encriptados y seguros</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              © {new Date().getFullYear()} Asenting Systems Inc. v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-gray-950 to-gray-950 lg:hidden" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Bienvenido</h2>
            <p className="text-gray-400">Ingresa a tu panel de control</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="p-1 bg-red-500/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              {error}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <button
              onClick={() => loginWithGoogle()}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-xl transition-all border border-gray-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-gray-950 text-gray-500 font-medium tracking-wider">O con correo</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-300 ml-1">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-600 transition-all outline-none"
                    placeholder="Ingresa tu usuario"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-600 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
