import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Search,
  ChevronDown,
  ChevronUp,
  Cpu,
  Wifi,
  Terminal,
  Activity
} from 'lucide-react';

interface AISupportPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AISupportPage: React.FC<AISupportPageProps> = ({ token, apiBase, role }) => {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('asenting_support_session_id'));

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Bienvenido al portal de soporte oficial de Asenting IA! Estoy listo para responder dudas sobre facturación, guiarte en la configuración de tu tienda o ayudarte con el inventario. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Search FAQ state
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cómo configuro la impresora térmica de tickets?',
      a: 'Ve a Configuración > Impresora. Selecciona el tipo de interfaz (USB, Red/Ethernet o Serial), introduce el nombre exacto de la impresora en el sistema operativo y pulsa "Guardar". También puedes configurar el ancho del papel (58mm u 80mm) y habilitar la apertura automática del cajón monedero.',
      tag: 'impresora'
    },
    {
      q: '¿Por qué mis productos no se sincronizan con la página web?',
      a: 'Verifica que la sincronización web esté habilitada en Configuración > Empresa > Tienda Web. Si está activa, asegúrate de que el producto tiene la opción "Mostrar en Web" marcada en el gestor de inventario y que la categoría no esté vacía.',
      tag: 'web'
    },
    {
      q: '¿Cómo configuro la API de Google / Gemini?',
      a: 'En la sección Configuración > Google API, puedes introducir tu clave API de Google Cloud y Gemini. Esto habilitará la generación de descripciones inteligentes, categorización automática de productos y el chat del asistente interactivo.',
      tag: 'ia'
    },
    {
      q: '¿Qué hago si el sistema se siente lento o tarda en cargar?',
      a: 'Puedes reiniciar el panel de control o borrar el caché local en la configuración de tu navegador. Esto purgará logs de sincronización antiguos y reconstruirá índices de búsqueda para acelerar el rendimiento general.',
      tag: 'sistema'
    }
  ];

  // Auto scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  // Load chat history if session exists
  useEffect(() => {
    const loadSessionHistory = async () => {
      if (!sessionId) return;
      try {
        const res = await fetch(`${apiBase}/webconfig/ai/chat/${sessionId}/messages/`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((m: any) => ({
              role: m.role === 'model' ? 'assistant' : m.role,
              content: m.content
            }));
            setMessages(formatted);
          }
        } else {
          localStorage.removeItem('asenting_support_session_id');
          setSessionId(null);
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    };
    loadSessionHistory();
  }, [sessionId, apiBase, token]);

  // Send message to Gemini chat endpoint
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || chatLoading) return;

    if (!customText) setInputMsg('');

    const newMsgs = [...messages, { role: 'user', content: textToSend } as Message];
    setMessages(newMsgs);
    setChatLoading(true);

    try {
      const res = await fetch(`${apiBase}/webconfig/ai/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: textToSend, session_id: sessionId })
      });
      const data = await res.json();
      if (res.ok) {
        if (!sessionId && data.session_id) {
          setSessionId(data.session_id.toString());
          localStorage.setItem('asenting_support_session_id', data.session_id.toString());
        }
        setMessages([...newMsgs, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error(data.detail || 'Error en el servidor de soporte');
      }
    } catch (err: any) {
      // Offline fallback
      setTimeout(() => {
        let fallbackResponse = 'Actualmente tengo problemas para contactar con el servidor. ';
        if (textToSend.toLowerCase().includes('impresora')) {
          fallbackResponse += 'Para problemas de impresión, comprueba que la impresora esté encendida, con papel y conectada al puerto correcto. Ve a "Configuración > Impresora" para validar los parámetros.';
        } else if (textToSend.toLowerCase().includes('sincro') || textToSend.toLowerCase().includes('web')) {
          fallbackResponse += 'Para problemas de sincronización, por favor revisa que la conexión a internet esté activa y que las credenciales del inquilino web sean correctas en Configuración > Empresa.';
        } else {
          fallbackResponse += 'Por favor, intenta de nuevo en unos momentos o revisa tu conexión a internet.';
        }
        setMessages([...newMsgs, { role: 'assistant', content: fallbackResponse }]);
        setChatLoading(false);
      }, 800);
      return;
    }
    setChatLoading(false);
  };

  const handleResetChat = () => {
    localStorage.removeItem('asenting_support_session_id');
    setSessionId(null);
    setMessages([{ role: 'assistant', content: 'Chat reiniciado. ¿En qué puedo guiarte ahora?' }]);
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.tag.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Quick stats ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#11131C] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Estado General</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Operativo
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#11131C] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Motor IA</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">Gemini 1.5 Flash</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#11131C] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sincronización Web</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">En Línea • Auto</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#11131C] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Licencia / Rol</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 mt-0.5 border border-purple-200 dark:border-purple-500/20">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat + FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Component */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#11131C] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[580px]">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Consultoría Inteligente Asenting</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gemini-assisted live support system</p>
                </div>
              </div>
              <button 
                onClick={handleResetChat}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl transition-colors"
                title="Limpiar Conversación"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-black/10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                  <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
                        : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white'
                    }`}>
                      {m.role === 'user' ? 'U' : <Sparkles className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`px-5 py-3.5 rounded-[20px] text-[13px] shadow-sm relative ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-[#181B26] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start items-end gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="px-5 py-3.5 bg-white dark:bg-[#181B26] rounded-[20px] rounded-tl-sm border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-1.5 h-[44px]">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Predefined prompt pills */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-white/5 flex gap-2 overflow-x-auto bg-gray-50/20 thin-scrollbar">
              <button 
                onClick={(e) => handleSendMessage(e, '¿Cómo configuro la API de Google Cloud y Gemini?')}
                className="px-4 py-1.5 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 shadow-sm"
              >
                Configurar API de Google
              </button>
              <button 
                onClick={(e) => handleSendMessage(e, 'Tengo problemas al imprimir tickets, ¿qué hago?')}
                className="px-4 py-1.5 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 shadow-sm"
              >
                Problema de impresora
              </button>
              <button 
                onClick={(e) => handleSendMessage(e, '¿Cómo sincronizo mis productos del inventario con la tienda web?')}
                className="px-4 py-1.5 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 shadow-sm"
              >
                Sincronización Web
              </button>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#11131C] border-t border-gray-100 dark:border-white/5 flex gap-3 items-end">
              <div className="flex-1 bg-gray-50 dark:bg-[#181B26] border border-gray-200 dark:border-white/5 rounded-2xl flex items-center px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500/50 transition-all shadow-inner">
                <input 
                  type="text" 
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  placeholder="Explícame cómo..."
                  className="w-full bg-transparent border-none py-2.5 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                  disabled={chatLoading}
                />
              </div>
              <button 
                type="submit"
                disabled={!inputMsg.trim() || chatLoading}
                className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-md shadow-blue-500/20"
                title="Enviar mensaje"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* FAQs Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#11131C] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                Base de Conocimiento IA
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Respuestas rápidas asistidas por inteligencia artificial.</p>
            </div>

            <div className="relative">
              <input 
                type="text"
                placeholder="Buscar solución rápida..."
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#181B26] border border-gray-200 dark:border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto thin-scrollbar">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full text-left px-4 py-3 flex justify-between items-center text-xs font-bold text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.02]"
                  >
                    <span className="pr-4">{faq.q}</span>
                    {expandedFaq === i ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-2 bg-white dark:bg-[#141620]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No se encontraron FAQs para esa búsqueda.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AISupportPage;
