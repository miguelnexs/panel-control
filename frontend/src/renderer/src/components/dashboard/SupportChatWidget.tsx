import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, MessageCircle, RefreshCw, Send, X } from 'lucide-react';

interface SupportChatWidgetProps {
  token: string | null;
  apiBase: string;
  role: string;
  userId: number;
}

interface SupportMessage {
  id: number;
  created_at: string;
  sender_id: number | null;
  sender_username: string;
  sender_role: string;
  type: 'audio' | 'text';
  text: string;
  duration_ms: number;
  mime_type: string;
  audio_url: string;
}

interface SupportChatItem {
  tenant_id: number;
  tenant_name: string;
  admin_username: string;
  last_message_id: number;
  last_message_at: string | null;
  last_message_text: string;
  last_message_sender: string;
  last_message_sender_role: string;
  unread: number;
  last_seen_id: number;
}

const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({ token, apiBase: rawApiBase, role, userId }) => {
  const apiBase = rawApiBase.replace(/\/$/, '');
  const canUse = role === 'admin' || role === 'super_admin';
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [chats, setChats] = useState<SupportChatItem[]>([]);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [unread, setUnread] = useState(0);

  const listRef = useRef<HTMLDivElement | null>(null);

  const authHeaders = (tkn: string | null): Record<string, string> => ({
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-CO', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const newestId = useMemo(() => messages.reduce((acc, m) => Math.max(acc, m.id), 0), [messages]);

  const loadChats = async (silent?: boolean) => {
    if (!token || !canUse) return;
    try {
      const res = await fetch(`${apiBase}/users/api/support/chats/`, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar chats');
      const items: SupportChatItem[] = Array.isArray(data?.results) ? data.results.map((c: any) => ({
        tenant_id: Number(c.tenant_id),
        tenant_name: String(c.tenant_name || ''),
        admin_username: String(c.admin_username || ''),
        last_message_id: Number(c.last_message_id || 0),
        last_message_at: c.last_message_at ? String(c.last_message_at) : null,
        last_message_text: String(c.last_message_text || ''),
        last_message_sender: String(c.last_message_sender || ''),
        last_message_sender_role: String(c.last_message_sender_role || ''),
        unread: Number(c.unread || 0),
        last_seen_id: Number(c.last_seen_id || 0),
      })) : [];
      setChats(items);
      setUnread(Number(data?.total_unread || 0));
    } catch (e: any) {
      if (!silent) setErr(e.message);
    }
  };

  useEffect(() => {
    if (!token || !canUse) return;
    loadChats(true);
    const t = setInterval(() => loadChats(true), open ? 2500 : 3500);
    return () => clearInterval(t);
  }, [token, canUse, open, role]);

  useEffect(() => {
    if (role === 'admin') {
      if (chats.length > 0) setTenantId(chats[0].tenant_id);
      else setTenantId(null);
    } else {
      if (tenantId == null && chats.length > 0) setTenantId(chats[0].tenant_id);
    }
  }, [role, chats, tenantId]);

  const load = async (opts?: { sinceId?: number; replace?: boolean; silent?: boolean }) => {
    if (!token || !canUse) return;
    if (role === 'super_admin' && !tenantId) return;
    if (!opts?.silent) {
      setErr(null);
      setLoading(true);
    }
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '50');
      if (role === 'super_admin' && tenantId) qs.set('tenant_id', String(tenantId));
      if (opts?.sinceId) qs.set('since_id', String(opts.sinceId));
      const res = await fetch(`${apiBase}/users/api/support/messages/?${qs.toString()}`, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar mensajes');
      const list = Array.isArray(data?.results) ? data.results : [];
      const normalized: SupportMessage[] = list.map((m: any) => ({
        id: Number(m.id),
        created_at: String(m.created_at),
        sender_id: m.sender_id != null ? Number(m.sender_id) : null,
        sender_username: String(m.sender_username || ''),
        sender_role: String(m.sender_role || ''),
        type: (m.type === 'audio' ? 'audio' : 'text') as any,
        text: String(m.text || ''),
        duration_ms: Number(m.duration_ms || 0),
        mime_type: String(m.mime_type || ''),
        audio_url: String(m.audio_url || ''),
      }));
      setMessages((prev) => {
        const base = opts?.replace ? [] : prev;
        const merged = [...base];
        const seen = new Set(merged.map((x) => x.id));
        for (const m of normalized) {
          if (!seen.has(m.id)) merged.push(m);
        }
        merged.sort((a, b) => a.id - b.id);
        return merged;
      });
    } catch (e: any) {
      if (!opts?.silent) setErr(e.message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !canUse) return;
    if (role === 'super_admin' && !tenantId) return;
    load({ replace: true });
  }, [token, canUse, role, tenantId]);

  useEffect(() => {
    if (!token || !canUse) return;
    if (role === 'super_admin' && !tenantId) return;
    const t = setInterval(() => {
      if (newestId) load({ sinceId: newestId, silent: true });
      else load({ replace: true, silent: true });
    }, open ? 1800 : 5000);
    return () => clearInterval(t);
  }, [token, canUse, open, role, tenantId, newestId]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) return;
    if (!newestId) return;
    const mark = async () => {
      if (!token) return;
      const body: any = { last_seen_id: newestId };
      if (role === 'super_admin' && tenantId) body.tenant_id = tenantId;
      await fetch(`${apiBase}/users/api/support/mark_read/`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => {});
    };
    mark();
  }, [open, newestId]);

  const sendText = async () => {
    if (!token || !canUse) return;
    const t = text.trim();
    if (!t) return;
    if (role === 'super_admin' && !tenantId) return;
    setSending(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('text', t);
      if (role === 'super_admin' && tenantId) fd.append('tenant_id', String(tenantId));
      const res = await fetch(`${apiBase}/users/api/support/messages/`, { method: 'POST', headers: authHeaders(token), body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudo enviar');
      setText('');
      await load({ sinceId: newestId });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  };

  if (!canUse) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[120]">
      {open && (
        <div className="w-[860px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-6rem)] mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex">
          {role === 'super_admin' && (
            <div className="w-[320px] border-r border-gray-200 dark:border-gray-800 flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Chats</div>
                <button
                  onClick={() => loadChats(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  title="Actualizar"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chats.map((c) => {
                  const active = tenantId === c.tenant_id;
                  const preview = (c.last_message_text || '').trim() || '—';
                  return (
                    <button
                      key={c.tenant_id}
                      onClick={() => { setTenantId(c.tenant_id); setMessages([]); }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${active ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.admin_username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{preview}</div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">{c.last_message_at ? formatTime(c.last_message_at) : ''}</div>
                          {c.unread > 0 && (
                            <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {c.unread > 99 ? '99+' : c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {chats.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-500">No hay chats</div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Soporte en vivo</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {role === 'super_admin' ? 'Super Admin → Administrador' : 'Administrador → Super Admin'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => load({ replace: true })}
                disabled={loading || (role === 'super_admin' && !tenantId)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                title="Recargar"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" title="Cerrar">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-black/20">
            {err && (
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="min-w-0 truncate">{err}</span>
              </div>
            )}

            {role === 'super_admin' && tenantId == null && !err && (
              <div className="text-center text-sm text-gray-500 py-10">Selecciona un chat</div>
            )}

            {tenantId != null && messages.length === 0 && !err && (
              <div className="text-center text-sm text-gray-500 py-10">Escribe un mensaje</div>
            )}

            {messages.filter((m) => m.type === 'text').map((m) => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl border px-3 py-2 ${mine ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800'}`}>
                    <div className={`text-[11px] ${mine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} flex items-center justify-between gap-3`}>
                      <span className="truncate">{mine ? 'Tú' : (m.sender_username || '—')}</span>
                      <span className="shrink-0">{formatTime(m.created_at)}</span>
                    </div>
                    <div className={`mt-1 text-sm whitespace-pre-wrap ${mine ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
                disabled={sending || (role === 'super_admin' && !tenantId)}
                placeholder="Escribe aquí..."
                className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60"
              />

              <button
                onClick={sendText}
                disabled={sending || !text.trim() || (role === 'super_admin' && !tenantId)}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl flex items-center justify-center transition-colors"
        title={open ? 'Ocultar chat' : 'Abrir chat'}
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {unread > 0 && !open && (
            <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default SupportChatWidget;
