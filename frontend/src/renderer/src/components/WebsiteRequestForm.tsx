import React, { useState, useEffect } from 'react';
import { 
  Send, Globe, CheckCircle2, Building2, Palette, MessageSquare, Loader2, FileText, 
  HelpCircle, Clock, ChevronLeft, ChevronRight, Layout, CreditCard, Shield, Heart,
  Instagram, Facebook, Sparkles, Laptop, Eye, ShoppingCart, Info, List, Smartphone
} from 'lucide-react';

interface WebsiteRequestFormProps {
  apiBase: string;
  token: string | null;
  onSuccess?: () => void;
}

interface Template {
  id: number;
  name: string;
  description: string;
  image: string;
  demo_url: string;
}

const WebsiteRequestForm: React.FC<WebsiteRequestFormProps> = ({ apiBase, token, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    primary_colors: '',
    preferred_subdomain: '',
    site_type: 'e-commerce',
    design_style: 'minimalist',
    sections: ['home', 'catalog', 'contact'],
    payment_methods: ['whatsapp', 'bank_transfer'],
    social_whatsapp: '',
    social_instagram: '',
    social_facebook: '',
    has_logo: 'no',
    inspiration_urls: '',
    additional_notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExisting();
  }, []);

  const checkExisting = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/website-request/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setExistingRequest(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (name: 'sections' | 'payment_methods', value: string) => {
    setFormData(prev => {
      const current = prev[name];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [name]: next };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/webconfig/website-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        if (onSuccess) setTimeout(onSuccess, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (question: string, answer: string) => {
    try {
      const res = await fetch(`${apiBase}/webconfig/website-request/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          id: existingRequest.id, 
          answers: { [question]: answer } 
        })
      });
      if (res.ok) {
        checkExisting();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const colorPills = [
    { name: 'Azul & Blanco', value: 'Azul Oscuro, Azul Claro y Blanco' },
    { name: 'Negro & Dorado', value: 'Negro Profundo, Dorado y Blanco' },
    { name: 'Verde & Blanco', value: 'Verde Esmeralda, Verde Menta y Blanco' },
    { name: 'Rosa & Pastel', value: 'Rosa Pastel, Gris Claro y Blanco' },
    { name: 'Cálidos / Tierra', value: 'Terracota, Beige y Arena' },
  ];

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Verificando estado de tu solicitud...</p>
      </div>
    );
  }

  if (submitted || existingRequest) {
    const status = existingRequest?.status || 'pending';
    const isWorking = status === 'in_progress';
    const isCompleted = status === 'completed';
    const proposals = existingRequest?.proposals || [];
    const files = existingRequest?.files || [];
    const questions = existingRequest?.questions || [];
    const answers = existingRequest?.answers || {};
    
    return (
      <div className="flex flex-col items-center p-4 md:p-8 animate-in fade-in zoom-in duration-500 max-w-6xl mx-auto w-full">
        <div className={`w-20 h-20 ${isCompleted ? 'bg-emerald-500/10' : isWorking ? 'bg-blue-500/10' : 'bg-gray-500/10'} rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white/10`}>
          {isCompleted ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
          ) : isWorking ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          ) : (
            <Clock className="w-10 h-10 text-gray-500" />
          )}
        </div>
        
        {!existingRequest?.enable_web_sync && (
          <div className="w-full max-w-2xl bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-tight">Sincronización Pausada</h4>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/60 leading-tight">El Súper Administrador ha pausado temporalmente la sincronización automática. Puedes seguir revisando los avances y responder preguntas.</p>
            </div>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {isCompleted ? '¡Tu Web está Lista!' : isWorking ? '¡Estamos trabajando en tu web!' : 'Solicitud Recibida'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isCompleted 
              ? 'El proceso de creación ha finalizado con éxito. Ya puedes gestionar tu tienda virtual desde el menú lateral.' 
              : isWorking 
              ? 'Nuestro equipo está desplegando tu página web. Revisa los avances y responde a nuestras preguntas abajo.' 
              : 'Tu solicitud ya ha sido recibida. Pronto iniciaremos el proceso de diseño y despliegue.'
            }
          </p>

          {existingRequest?.live_url && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <a 
                href={existingRequest.live_url} 
                target="_blank" 
                rel="noreferrer"
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black shadow-xl shadow-blue-500/30 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Globe className="w-5 h-5 animate-pulse" />
                <span>VER PREVISTA DE MI WEB</span>
              </a>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Abre tu sitio en una nueva pestaña</p>
            </div>
          )}
          
          {isCompleted && (
            <button 
              onClick={() => onSuccess && onSuccess()}
              className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 mx-auto"
            >
              Ir al Panel de Gestión Web <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`grid grid-cols-1 ${existingRequest?.enable_web_sync === false ? '' : 'md:grid-cols-2'} gap-6 w-full`}>
           {/* Propuestas y Archivos */}
           <div className="space-y-6 text-left">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Avances y Propuestas
                </h3>
                <div className="space-y-3 mb-6">
                  {proposals.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Esperando primeras propuestas...</p>
                  ) : (
                    proposals.map((prop: string, idx: number) => (
                      <div key={idx} className="bg-blue-50 dark:bg-blue-500/5 p-3 rounded-2xl border border-blue-100 dark:border-blue-500/10 text-sm text-gray-700 dark:text-gray-300">
                        {prop}
                      </div>
                    ))
                  )}
                </div>

                {files.length > 0 && (
                  <>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Archivos Compartidos</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {files.map((file: any, idx: number) => (
                        <a 
                          key={idx} href={file.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-all group"
                        >
                          <FileText className="w-4 h-4 text-blue-500 group-hover:text-white" />
                          <span className="truncate">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
           </div>

           {/* Preguntas - Hidden if paused */}
           {existingRequest?.enable_web_sync !== false && (
             <div className="space-y-6 text-left">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl h-full">
                  <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Preguntas del Desarrollador
                  </h3>
                  <div className="space-y-6">
                    {questions.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-8">No hay preguntas adicionales por ahora.</p>
                    ) : (
                      questions.map((q: string, idx: number) => (
                        <div key={idx} className="space-y-3">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {q}
                          </div>
                          {answers[q] ? (
                            <div className="bg-green-500/5 p-3 rounded-2xl border border-green-500/10 text-sm text-green-600 dark:text-green-400 flex items-start gap-2">
                               <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                               <span>{answers[q]}</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <input 
                                type="text" 
                                placeholder="Escribe tu respuesta..."
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    submitAnswer(q, (e.target as HTMLInputElement).value);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </div>
           )}
        </div>

        <div className="mt-12 px-6 py-2.5 bg-gray-100 dark:bg-white/5 rounded-full text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/10">
          Estado Actual: {status === 'in_progress' ? '🎨 En Proceso de Diseño' : '🕒 Pendiente de Revisión'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
          <Globe className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Crea tu Identidad Web</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
          Personaliza detalladamente la experiencia, estructura y diseño que deseas para tu nuevo sitio web.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => s < step && setStep(s)}
                  disabled={s >= step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step === s 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' 
                      : step > s 
                        ? 'bg-emerald-500 text-white cursor-pointer hover:scale-105' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </button>
              </div>
              {s < 4 && (
                <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                  step > s ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between max-w-md mx-auto text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 px-1">
          <span>Identidad</span>
          <span>Estructura</span>
          <span>Estilo Visual</span>
          <span>Canales & Enlaces</span>
        </div>
      </div>

      {/* Forms steps content */}
      <div className="space-y-6">
        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl animate-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paso 1: Identidad del Negocio</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Nombre Comercial del Negocio</label>
                <input 
                  type="text" name="business_name" value={formData.business_name} onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white font-medium"
                  placeholder="Ej: Taller de Tecnología Miguel"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Sector o Categoría</label>
                <input 
                  type="text" name="business_type" value={formData.business_type} onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white font-medium"
                  placeholder="Ej: Accesorios de Moda, Cafetería, Servicio Técnico"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Subdominio deseado (Identificador web)</label>
                <div className="relative">
                  <input 
                    type="text" name="preferred_subdomain" value={formData.preferred_subdomain} onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white font-medium pr-32"
                    placeholder="tallertech"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">.asenting.com</div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                  Esta será la dirección temporal o permanente de tu sitio web (Ej: <b>tallertech.asenting.com</b>). Usa solo letras y números, sin espacios.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.business_name || !formData.business_type}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="flex items-center gap-3 mb-6">
              <Layout className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paso 2: Tipo de Página y Estructura</h2>
            </div>
            
            {/* Website Type Visual Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">¿Qué tipo de sitio web deseas?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelect('site_type', 'e-commerce')}
                  className={`flex flex-col p-5 rounded-2xl border text-left transition-all ${
                    formData.site_type === 'e-commerce' 
                      ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20' 
                      : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3">
                    <ShoppingCart className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h4 className="text-sm font-black text-gray-950 dark:text-white">Tienda Virtual</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">Venta directa en línea, carrito de compras y pasarela de pago (MercadoPago/Wompi).</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('site_type', 'catalog')}
                  className={`flex flex-col p-5 rounded-2xl border text-left transition-all ${
                    formData.site_type === 'catalog' 
                      ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20' 
                      : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3">
                    <List className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h4 className="text-sm font-black text-gray-950 dark:text-white">Catálogo Digital</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">Muestra tus productos o servicios de forma estructurada. Pedidos coordinados por WhatsApp.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('site_type', 'landing')}
                  className={`flex flex-col p-5 rounded-2xl border text-left transition-all ${
                    formData.site_type === 'landing' 
                      ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20' 
                      : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3">
                    <Info className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h4 className="text-sm font-black text-gray-950 dark:text-white">Página Corporativa</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">Página de aterrizaje, quiénes somos, portafolio de servicios y formulario de contacto.</p>
                </button>
              </div>
            </div>

            {/* Sections Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Secciones o páginas necesarias</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'home', label: 'Inicio / Portada' },
                  { id: 'about', label: 'Quiénes Somos' },
                  { id: 'catalog', label: 'Tienda / Catálogo' },
                  { id: 'services', label: 'Servicios' },
                  { id: 'contact', label: 'Contacto' },
                  { id: 'faq', label: 'Preguntas (FAQ)' },
                  { id: 'reviews', label: 'Testimonios/Reseñas' }
                ].map((sec) => {
                  const active = formData.sections.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleCheckboxChange('sections', sec.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                        active 
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' 
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${active ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-gray-700'}`}>
                        {active && <span className="text-[8px]">✓</span>}
                      </div>
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-4 rounded-xl transition-all"
              >
                Volver
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paso 3: Identidad Visual y Estilo</h2>
            </div>
            
            <div className="space-y-6">
              {/* Visual Style Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Estilo Estético Deseado</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'minimalist', label: 'Minimalista & Moderno', desc: 'Mucho espacio en blanco, limpio, ordenado, tipografía moderna.' },
                    { id: 'premium', label: 'Elegante & Premium', desc: 'Lujoso, colores oscuros o metalizados, tipografías finas y elegantes.' },
                    { id: 'colorful', label: 'Divertido & Colorido', desc: 'Estilo dinámico, colores llamativos, formas redondeadas.' },
                    { id: 'rustic', label: 'Rústico / Natural / Eco', desc: 'Tonos beige, verdes o tierra, tipografías serif o artesanales.' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleSelect('design_style', style.id)}
                      className={`flex flex-col p-4 rounded-2xl border text-left transition-all ${
                        formData.design_style === style.id 
                          ? 'border-purple-500 bg-purple-500/5 ring-2 ring-purple-500/20' 
                          : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <h4 className="text-xs font-extrabold text-gray-950 dark:text-white uppercase tracking-wider mb-1">{style.label}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors preferences */}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Colores de Preferencia</label>
                <input 
                  type="text" name="primary_colors" value={formData.primary_colors} onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm text-gray-900 dark:text-white font-medium"
                  placeholder="Ej: Azul noche y detalles dorados"
                />
                
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorPills.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, primary_colors: pill.value })}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 hover:bg-purple-500/10 hover:text-purple-500 rounded-lg text-[10px] font-bold text-gray-500 transition-all border border-gray-200 dark:border-white/5"
                    >
                      {pill.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Logotipo Comercial</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'yes', label: 'Sí, ya tengo logo', desc: 'Compartiré el logo en los archivos para implementarlo.' },
                    { id: 'no_text_only', label: 'No, usar texto elegante', desc: 'No tengo logo, prefiero un diseño de texto minimalista.' },
                    { id: 'no_need_ai', label: 'No, generar con IA', desc: 'Me gustaría que se genere un isotipo usando IA.' }
                  ].map((logo) => (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => handleSelect('has_logo', logo.id)}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                        formData.has_logo === logo.id 
                          ? 'border-purple-500 bg-purple-500/5 ring-2 ring-purple-500/20' 
                          : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <h4 className="text-xs font-black text-gray-950 dark:text-white">{logo.label}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">{logo.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-4 rounded-xl transition-all"
              >
                Volver
              </button>
              <button 
                onClick={() => setStep(4)}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paso 4: Canales de Venta & Referencias</h2>
            </div>
            
            <div className="space-y-5">
              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Métodos de cobro / pago que usarás</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'whatsapp', label: 'Pedidos directos a WhatsApp', desc: 'Los clientes cierran el pedido contigo chateando.' },
                    { id: 'bank_transfer', label: 'Transferencia Bancaria', desc: 'Transferencias Nequi, Daviplata o Bancolombia.' },
                    { id: 'gateway', label: 'Pasarela Online', desc: 'Tarjetas de crédito o PSE (Wompi, MercadoPago, Bold).' }
                  ].map((p) => {
                    const active = formData.payment_methods.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleCheckboxChange('payment_methods', p.id)}
                        className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                          active 
                            ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20' 
                            : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <h4 className="text-xs font-black text-gray-950 dark:text-white flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${active ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-700'}`}>
                            {active && <span className="text-[8px]">✓</span>}
                          </div>
                          {p.label}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social Channels */}
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-150 dark:border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tus Redes & Contactos comerciales</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">WhatsApp del Negocio</label>
                    <div className="relative">
                      <input 
                        type="text" name="social_whatsapp" value={formData.social_whatsapp} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs font-semibold text-gray-900 dark:text-white"
                        placeholder="Ej: +57 300 123 4567"
                      />
                      <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Instagram (@usuario)</label>
                    <div className="relative">
                      <input 
                        type="text" name="social_instagram" value={formData.social_instagram} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-xs font-semibold text-gray-900 dark:text-white"
                        placeholder="Ej: @taller_tech"
                      />
                      <Instagram className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Página de Facebook (Enlace)</label>
                  <div className="relative">
                    <input 
                      type="text" name="social_facebook" value={formData.social_facebook} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-600 outline-none transition-all text-xs font-semibold text-gray-900 dark:text-white"
                      placeholder="Ej: facebook.com/tallertech"
                    />
                    <Facebook className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Inspiration references */}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Páginas Web de Referencia / Ejemplo</label>
                <input 
                  type="text" name="inspiration_urls" value={formData.inspiration_urls} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs text-gray-900 dark:text-white font-medium"
                  placeholder="Ej: https://tienda-ejemplo.com, me gusta la distribución de..."
                />
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Comentarios o Notas Adicionales</label>
                <textarea 
                  name="additional_notes" value={formData.additional_notes} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs text-gray-900 dark:text-white font-medium min-h-[80px]"
                  placeholder="Escribe aquí cualquier otra especificación..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-4 rounded-xl transition-all"
              >
                Volver
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'} <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteRequestForm;
