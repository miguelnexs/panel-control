import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2, BarChart3, Bell, ShoppingCart, Shield } from "lucide-react";
import { toast } from "sonner";
import { useGoogleLogin } from '@react-oauth/google';
import { buildApiUrl } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleCompletion, setIsGoogleCompletion] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    companyName: ""
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register") setIsLogin(false);
    else if (mode === "login") setIsLogin(true);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const checkSubscriptionAndRedirect = async (token: string) => {
      try {
          const res = await fetch(buildApiUrl('users/api/me/'), {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              if (data.has_paid) {
                  navigate('/download');
              } else {
                  toast.info("Por favor, selecciona y compra un plan para activar tu cuenta.");
                  navigate('/precios');
              }
          } else {
              navigate('/');
          }
      } catch (e) {
          console.error(e);
          navigate('/');
      }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
        setLoading(true);
        try {
            const res = await fetch(buildApiUrl('users/api/auth/google/'), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token: tokenResponse.access_token,
                    type: 'access_token' 
                })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al iniciar sesión con Google");
            
            localStorage.setItem("token", data.access);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            toast.success("Bienvenido " + data.user.first_name);
            
            // Verificar estado de pago
            await checkSubscriptionAndRedirect(data.access);
            
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    },
    onError: () => {
        toast.error("Error al conectar con Google");
        setLoading(false);
    }
  });

  const handleGoogleCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken) return;
    
    if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(buildApiUrl('users/api/auth/google/'), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                token: googleToken,
                type: 'access_token',
                username: formData.username,
                password: formData.password
            })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al completar registro con Google");
        
        localStorage.setItem("token", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast.success("Registro completado exitosamente");
        
        // Verificar estado de pago
        await checkSubscriptionAndRedirect(data.access);
        
    } catch (error: any) {
        console.error(error);
        toast.error(error.message);
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch(buildApiUrl('users/api/auth/login/'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.email,
            password: formData.password
          })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Error al iniciar sesión");
        
        // Guardar token y usuario
        localStorage.setItem("token", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Bienvenido de nuevo");
        
        // Verificar estado de pago
        await checkSubscriptionAndRedirect(data.access);
        
      } else {
        // Validación básica
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        if (!formData.companyName) {
           throw new Error("El nombre de la empresa es requerido");
        }
        
        // Registro de Tenant
        const planParam = searchParams.get("plan");
        
        // Map legacy slugs to backend codes if necessary, otherwise use param directly
        const planMap: Record<string, string> = {
          "starter": "basic",
          "professional": "medium",
          "enterprise": "advanced"
        };
        
        let planCode = "basic";
        if (planParam) {
            if (planMap[planParam]) {
                planCode = planMap[planParam];
            } else {
                planCode = planParam;
            }
        }

        const generatedUsername = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
        const res = await fetch(buildApiUrl('users/api/auth/register-tenant/'), {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             username: generatedUsername,
             email: formData.email,
             password: formData.password,
             tenant_name: formData.companyName,
             plan_code: planCode
           })
         });

        const data = await res.json();
        if (!res.ok) {
            // Manejar errores específicos de validación
            if (data.username) throw new Error(data.username[0]);
            if (data.email) throw new Error(data.email[0]);
            if (data.plan_code) throw new Error(data.plan_code[0]);
            if (data.detail) throw new Error(data.detail);
            throw new Error(JSON.stringify(data));
        }
        
        toast.success("¡Registro exitoso! Tienes 15 días de prueba del Plan Intermedio.");
        
        // Auto Login para proceder al área de descarga o dashboard
        const loginRes = await fetch(buildApiUrl('users/api/auth/login/'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.username,
            password: formData.password
          })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            // Si falla el login automático, redirigir al login manual
            setIsLogin(true);
            return;
        }

        // Guardar sesión
        localStorage.setItem("token", loginData.access);
        localStorage.setItem("user", JSON.stringify(loginData.user));

        // En lugar de iniciar flujo de Mercado Pago, redirigir directo al área de descarga
        // ya que el usuario tiene 15 días de prueba activados automáticamente
        toast.info("Redirigiendo a descargas...");
        setTimeout(() => {
            navigate('/download');
        }, 1500);
        
        // El flujo de pago se comenta para permitir el trial inmediato
        /*
        const createPreference = async () => {
             try {
                 toast.info("Generando enlace de pago...");
                 const checkoutRes = await fetch(buildApiUrl('users/api/payments/create-preference/'), {
                     method: "POST",
                     headers: { 
                         "Content-Type": "application/json",
                         "Authorization": `Bearer ${loginData.access}`
                     },
                     body: JSON.stringify({ plan_code: planCode })
                 });
                 
                 const checkoutData = await checkoutRes.json();
                 
                 if (!checkoutRes.ok) throw new Error(checkoutData.error || "Error al crear sesión de pago");
                 
                 if (checkoutData.url) {
                     window.location.href = checkoutData.url;
                     return;
                 }
             } catch (paymentError: any) {
                console.error("Payment error:", paymentError);
                let message = paymentError.message;
                if (message && (message.includes("Invalid API Key") || message.includes("Mercado Pago is not configured"))) {
                    message = "Faltan las claves de Mercado Pago en el backend (.env).";
                }
                toast.error("Error iniciando el pago: " + message);
                // Si falla el pago, redirigir a precios para que intenten de nuevo
                 setTimeout(() => {
                     navigate('/precios');
                 }, 2000);
             }
        };

        await createPreference();
        */
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#07080d]">
        {/* Background gradient & decorative blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/15" />
        <div className="absolute top-1/6 left-1/6 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/6 right-1/6 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/10">
              <img 
                src="/logo.png" 
                alt="Asenting Logo" 
                className="h-11 w-11 rounded object-contain bg-white/5" 
              />
            </div>
            <span className="text-4xl font-extrabold text-white tracking-tight">Asenting</span>
          </Link>
          
          {/* Tagline */}
          <h1 className="text-4xl font-black text-center mb-5 text-white leading-tight max-w-lg">
            Dashboard Administrativo <br/>
            <span className="gradient-text">Todo-En-Uno</span>
          </h1>
          <p className="text-md text-muted-foreground text-center max-w-md mb-14 leading-relaxed">
            Centraliza métricas, transacciones de caja, catálogos de inventario y clientes en un solo lugar.
          </p>
          
          {/* Features list with icons */}
          <div className="space-y-4 w-full max-w-md">
            {[
              { text: "Métricas en tiempo real", icon: BarChart3, color: "text-blue-400", border: "hover:border-blue-500/30" },
              { text: "Notificaciones automáticas", icon: Bell, color: "text-purple-400", border: "hover:border-purple-500/30" },
              { text: "Gestión completa de ventas y POS", icon: ShoppingCart, color: "text-amber-400", border: "hover:border-amber-500/30" },
              { text: "Seguridad de acceso robusta", icon: Shield, color: "text-emerald-400", border: "hover:border-emerald-500/30" }
            ].map((feature, index) => {
              const IconComp = feature.icon;
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 glass-card p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all duration-300 ${feature.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${feature.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white/90">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0B0D14] relative">
        {/* Glow effect on background */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10 glass-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <img 
                src="/logo.png" 
                alt="Asenting Logo" 
                className="h-7 w-7 rounded object-contain bg-white/10" 
              />
            </div>
            <span className="text-2xl font-bold text-white">Asenting</span>
          </Link>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-2 text-white tracking-tight">
              {isLogin ? "Bienvenido de nuevo" : "Crear tu cuenta"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin 
                ? "Ingresa tus credenciales para acceder al panel de control" 
                : "Regístrate gratis y comienza a gestionar tu negocio hoy mismo"
              }
            </p>
          </div>

          {/* Social Login at the Top */}
          {!isGoogleCompletion && (
            <div className="space-y-3 mb-6">
              <Button 
                variant="outline" 
                className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white flex items-center justify-center gap-3 font-semibold rounded-xl text-white transition-all duration-300"
                onClick={() => handleGoogleLogin()}
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white flex items-center justify-center gap-3 font-semibold rounded-xl text-white transition-all duration-300" 
                type="button"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continuar con GitHub
              </Button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">o usa tu correo</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>
          )}

          {/* Auth Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Business name field - only for register */}
            {!isLogin && (
              <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre de tu Negocio</Label>
                  <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                      id="companyName"
                      type="text"
                      placeholder="Ej. Tienda de Ropa, Restaurante"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary text-white rounded-xl placeholder:text-muted-foreground/50"
                      required
                  />
                  </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{isLogin ? "Usuario o Correo" : "Correo electrónico"}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type={isLogin ? "text" : "email"}
                  placeholder={isLogin ? "usuario o tu@correo.com" : "tu@correo.com"}
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary text-white rounded-xl placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña</Label>
                {isLogin && (
                  <a href="#" className="text-xs text-primary hover:underline font-semibold">
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-primary text-white rounded-xl placeholder:text-muted-foreground/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password - only for register */}
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary text-white rounded-xl placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>
            )}

            {/* Terms checkbox - only for register */}
            {!isLogin && (
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-white/10 bg-white/5 text-primary focus:ring-primary h-4 w-4"
                  required
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal">
                  Acepto los{" "}
                  <Link to="/terminos" className="text-primary hover:underline font-semibold">
                    Términos de Servicio
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacidad" className="text-primary hover:underline font-semibold">
                    Política de Privacidad
                  </Link>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <Button variant="hero" size="xl" className="w-full mt-4 h-12 rounded-xl text-md font-bold tracking-wide" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : (
                isGoogleCompletion ? "Completar Registro" : (isLogin ? "Iniciar sesión" : "Crear cuenta gratis")
              )}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            {/* Switch Mode Link */}
            {!isGoogleCompletion && (
                <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                        {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
                        <button 
                            type="button"
                            onClick={() => setIsLogin(!isLogin)} 
                            className="text-primary font-bold hover:underline focus:outline-none"
                        >
                            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                        </button>
                    </p>
                </div>
            )}
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link to="/" className="text-primary hover:underline font-semibold inline-flex items-center gap-2 transition-all hover:translate-x-[-2px]">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
