import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2, MinusCircle, History, Plus, ChevronLeft, Layout } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  updated_at: string;
}

interface AIChatAssistantProps {
  token: string;
  apiBase: string;
  openExternal?: boolean;
  setOpenExternal?: (open: boolean) => void;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ token, apiBase, openExternal, setOpenExternal }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('Nuevo Chat');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external if provided
  const isOpen = setOpenExternal ? !!openExternal : internalOpen;
  const toggleOpen = (val: boolean) => {
    if (setOpenExternal) setOpenExternal(val);
    else setInternalOpen(val);
  };

  const welcomeMessage: Message = { 
    role: 'assistant', 
    content: '¡Hola! Soy tu asistente inteligente. Puedo ayudarte con tu inventario, ventas y dashboard. ¿Qué deseas hacer hoy?' 
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
      if (!currentSessionId && messages.length === 0) {
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized, showHistory]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/ai/chat/sessions/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) { console.error(error); }
  };

  const loadSession = async (session: ChatSession) => {
    setLoading(true);
    setShowHistory(false);
    setCurrentSessionId(session.id);
    setCurrentSessionTitle(session.title);
    try {
      const res = await fetch(`${apiBase}/webconfig/ai/chat/${session.id}/messages/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.length > 0 ? data : [welcomeMessage]);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setCurrentSessionTitle('Nuevo Chat');
    setMessages([welcomeMessage]);
    setShowHistory(false);
    setInput('');
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`${apiBase}/webconfig/ai/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg, session_id: currentSessionId }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');

      if (!currentSessionId && data.session_id) {
        setCurrentSessionId(data.session_id);
        setCurrentSessionTitle(data.session_title || userMsg.substring(0, 20));
        fetchSessions();
      }

      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally { setLoading(false); }
  };

  if (!isOpen) {
    return (
      <button onClick={() => toggleOpen(true)} className="fixed bottom-6 right-24 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-[9999] group">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-24 w-full max-w-[400px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[9999] transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            {showHistory ? <ChevronLeft className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
          </button>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{showHistory ? 'Mis Conversaciones' : currentSessionTitle}</h3>
            {!showHistory && <span className="text-[10px] text-indigo-100 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Online</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={startNewChat} className="p-1.5 hover:bg-white/10 rounded-lg" title="Nuevo Chat"><Plus className="w-4 h-4" /></button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg"><MinusCircle className="w-4 h-4" /></button>
          <button onClick={() => toggleOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* History Sidebar/Panel */}
          <div className={`absolute inset-0 z-20 bg-gray-50 dark:bg-gray-950 transition-transform duration-300 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-2 space-y-1 overflow-y-auto h-full">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50"><MessageSquare className="w-12 h-12 mb-2" /><p>Sin historial</p></div>
              ) : (
                sessions.map(s => (
                  <button key={s.id} onClick={() => loadSession(s)} className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-colors ${currentSessionId === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className={`text-[10px] ${currentSessionId === s.id ? 'text-indigo-100' : 'text-gray-400'}`}>{new Date(s.updated_at).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'assistant' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700' : 'bg-indigo-600 text-white'}`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div className="flex justify-start animate-pulse"><div className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-[10px] text-gray-400 italic">Procesando...</div></div>}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe aquí..." className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none" disabled={loading} />
                <button type="submit" disabled={!input.trim() || loading} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-2 italic">Gemini Flash Lite • Inteligencia de Negocio</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatAssistant;
