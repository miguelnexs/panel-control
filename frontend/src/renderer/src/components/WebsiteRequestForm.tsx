import React, { useState, useEffect } from 'react';
import { Send, Globe, CheckCircle2, Building2, Palette, MessageSquare, Loader2, FileText, HelpCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

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
    additional_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    checkExisting();
    fetchTemplates();
    const interval = setInterval(checkExisting, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/templates/`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.results || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          // No auto-redirect here to avoid infinite loops if dashboard hasn't updated its state yet
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

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Verificando estado de tu solicitud...</p>
      </div>
    );
  }

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

        {templates.length > 0 && (
          <div className="w-full mt-16 text-left">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Propuestas de Diseño Sugeridas
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Selecciona el estilo que mejor se adapte a tu marca</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {templates.map((tpl) => {
                // Failsafe: Clean up legacy /dist/ paths that might cause 404s
                const cleanedPath = (tpl.demo_url || '').replace('/dist/', '/');
                
                const demoUrl = cleanedPath.startsWith('http') 
                  ? cleanedPath 
                  : `${apiBase.replace(/\/$/, '')}${cleanedPath.startsWith('/') ? '' : '/'}${cleanedPath}`;
                
                return (
                  <div key={tpl.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-orange-500/10 transition-all">
                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 dark:bg-black/20">
                      {tpl.image ? (
                        <img 
                          src={tpl.image.startsWith('http') ? tpl.image : `${apiBase}${tpl.image}`} 
                          alt={tpl.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Palette className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                         <a 
                           href={demoUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="w-full py-3 bg-white text-black text-center rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                         >
                           Ver Demo en Vivo
                         </a>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                         <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{tpl.name}</h4>
                         <span className="shrink-0 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase rounded-full tracking-widest">Premium</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight h-8 mb-4">{tpl.description || 'Diseño optimizado para una experiencia fluida y profesional.'}</p>
                      
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Lista</span>
                         </div>
                         <a 
                           href={demoUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-1 group/link"
                         >
                           Previa <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                         </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 px-6 py-2.5 bg-gray-100 dark:bg-white/5 rounded-full text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/10">
          Estado Actual: {status === 'in_progress' ? '🎨 En Proceso de Diseño' : '🕒 Pendiente de Revisión'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
          <Globe className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Potencia tu Negocio Online</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Aún no tienes una página web activa. Cuéntanos qué necesitas y nosotros nos encargamos.</p>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Información Básica</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Negocio</label>
                <input 
                  type="text" name="business_name" value={formData.business_name} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej: Taller de Tech"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Negocio / Categoría</label>
                <input 
                  type="text" name="business_type" value={formData.business_type} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej: Servicio Técnico de PCs"
                />
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.business_name || !formData.business_type}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              Siguiente Paso <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Diseño y Preferencias</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colores Preferidos</label>
                <input 
                  type="text" name="primary_colors" value={formData.primary_colors} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Ej: Azul oscuro y Blanco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdominio deseado (opcional)</label>
                <div className="relative">
                  <input 
                    type="text" name="preferred_subdomain" value={formData.preferred_subdomain} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all pr-32"
                    placeholder="mitaller"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">.softwarebycg.shop</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas adicionales (funcionalidades extras, etc.)</label>
                <textarea 
                  name="additional_notes" value={formData.additional_notes} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all min-h-[100px]"
                  placeholder="Quiero que los clientes puedan agendar citas..."
                />
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
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
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
