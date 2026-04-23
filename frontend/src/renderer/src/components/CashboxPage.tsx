import React, { useEffect, useState, useMemo } from 'react';
import { 
  Wallet, 
  DollarSign, 
  Clock, 
  User as UserIcon, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  History, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Repeat, 
  Plus, 
  X, 
  FileText,
  Calendar,
  ChevronRight,
  Building,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  type: 'sale' | 'service' | 'income' | 'expense' | 'transfer_in' | 'transfer_out';
  amount: string | number;
  description: string;
  created_at: string;
}

interface CashSession {
  id: number;
  start_time: string;
  end_time: string | null;
  initial_cash: string | number;
  expected_cash: string | number;
  actual_cash: string | number;
  initial_bank: string | number;
  expected_bank: string | number;
  actual_bank: string | number;
  status: 'open' | 'closed';
  user_username: string;
  notes?: string;
  transactions?: Transaction[];
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface CashboxPageProps {
  token: string;
  apiBase: string;
}

const CashboxPage: React.FC<CashboxPageProps> = ({ token, apiBase }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [history, setHistory] = useState<CashSession[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  
  const [moveForm, setMoveForm] = useState({
    type: 'income',
    amount: '',
    description: ''
  });
  
  const [closeForm, setCloseForm] = useState({
    actual_cash: '',
    actual_bank: '',
    notes: ''
  });

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-dismiss success messages after 4 seconds
  useEffect(() => {
    if (msg?.type === 'success') {
      const id = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(id);
    }
  }, [msg]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const openSessionDetail = async (s: CashSession) => {
    setLoadingDetail(true);
    setSelectedSession(s);
    try {
      // Re-fetch the session to get full transaction list
      const res = await fetch(`${apiBase}/api/cashbox/sessions/`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const all: CashSession[] = Array.isArray(data.results) ? data.results : data;
        const full = all.find(x => x.id === s.id);
        if (full) setSelectedSession(full);
      }
    } catch {}
    setLoadingDetail(false);
  };

  const fetchCurrentSession = async () => {
    try {
      const res = await fetch(`${apiBase}/api/cashbox/sessions/current/`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCurrentSession(data);
      } else {
        // 404 = no active session, clear state
        setCurrentSession(null);
      }
    } catch (e) {
      console.error("Error fetching current session", e);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/cashbox/sessions/`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data.results) ? data.results : data);
      }
    } catch (e) {
      console.error("Error fetching history", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentSession();
      fetchHistory();
    }
  }, [token]);

  const handleOpenBox = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const initial_cash = formData.get('initial_cash');
    const initial_bank = formData.get('initial_bank');
    
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/cashbox/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ 
            initial_cash: initial_cash || 0, 
            initial_bank: initial_bank || 0,
            notes: 'Apertura de caja' 
        })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Caja abierta exitosamente' });
        fetchCurrentSession();
        fetchHistory();
        setShowOpenModal(false);
      } else {
        let errMsg = 'Error al abrir caja';
        try { const data = await res.json(); errMsg = data.detail || JSON.stringify(data); } catch {}
        setMsg({ type: 'error', text: errMsg });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMove = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/cashbox/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(moveForm)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Movimiento registrado' });
        fetchCurrentSession();
        setShowMoveModal(false);
        setMoveForm({ type: 'income', amount: '', description: '' });
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.detail || 'Error al registrar movimiento' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/cashbox/transactions/${id}/`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Movimiento eliminado correctamente' });
        fetchCurrentSession();
        setDeletingTransaction(null);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.detail || 'Error al eliminar' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/cashbox/transactions/${editingTransaction.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(moveForm)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Movimiento actualizado' });
        fetchCurrentSession();
        setShowEditModal(false);
        setEditingTransaction(null);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.detail || 'Error al actualizar' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setMoveForm({
      type: t.type as any,
      amount: String(t.amount),
      description: t.description
    });
    setShowEditModal(true);
  };

  const handleCloseBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/cashbox/sessions/${currentSession.id}/close/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(closeForm)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Caja cerrada exitosamente' });
        setCurrentSession(null);
        fetchHistory();
        setShowCloseModal(false);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.detail || 'Error al cerrar caja' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (v: any) => {
    const n = Number(v || 0);
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <TrendingUp className="text-emerald-500" />;
      case 'income': return <ArrowUpCircle className="text-blue-500" />;
      case 'expense': return <TrendingDown className="text-rose-500" />;
      case 'transfer_in': return <Repeat className="text-indigo-500" />;
      case 'transfer_out': return <Repeat className="text-amber-500" />;
      default: return <FileText className="text-gray-500" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: 'Venta',
      income: 'Ingreso',
      expense: 'Egreso',
      transfer_in: 'Trans. Recibida',
      transfer_out: 'Trans. Enviada',
      service: 'Servicio'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            Gestión de Caja Profesional
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 dark:text-gray-400">Control preciso de flujos de efectivo y cierres de turno.</p>
            <span className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span className="mx-1 opacity-40">•</span>
              <Clock className="w-3.5 h-3.5" />
              {now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!currentSession ? (
            <Button 
                onClick={() => setShowOpenModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-6 rounded-2xl font-bold shadow-lg shadow-emerald-900/20"
            >
                <Plus className="mr-2 h-5 w-5" /> Abrir Nueva Caja
            </Button>
          ) : (
            <Button 
                onClick={() => setShowCloseModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-6 rounded-2xl font-bold shadow-lg shadow-rose-900/20"
            >
                <X className="mr-2 h-5 w-5" /> Cerrar Turno
            </Button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 border shadow-2xl animate-in slide-in-from-right duration-300 ${
            msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
            'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-2 hover:opacity-70 transition-opacity"><X size={16} /></button>
        </div>
      )}

      {currentSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Summary Dashboard */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-full">Abierta</span>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Saldo Esperado Efectivo
                        </p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(currentSession.expected_cash)}
                        </h2>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Building className="w-3 h-3" /> Saldo Esperado Banco
                        </p>
                        <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
                            {formatCurrency(currentSession.expected_bank)}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6 mt-8">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Apertura</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {new Date(currentSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Usuario</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{currentSession.user_username}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Acciones Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => { setMoveForm({ ...moveForm, type: 'income' }); setShowMoveModal(true); }}
                        className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border border-white/5"
                    >
                        <ArrowUpCircle className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Ingreso</span>
                    </button>
                    <button 
                        onClick={() => { setMoveForm({ ...moveForm, type: 'expense' }); setShowMoveModal(true); }}
                        className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border border-white/5"
                    >
                        <ArrowDownCircle className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Egreso</span>
                    </button>
                    <button 
                        onClick={() => { setMoveForm({ ...moveForm, type: 'transfer_out' }); setShowMoveModal(true); }}
                        className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border border-white/5 col-span-2"
                    >
                        <Repeat className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Mov. a Banco / Consignación</span>
                    </button>
                </div>
            </div>
          </div>

          {/* Movements List */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" /> Movimientos del Turno
                    </h3>
                    <div className="text-xs text-gray-500 font-medium">
                        {currentSession.transactions?.length || 0} operaciones registradas
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar max-h-[600px]">
                    {currentSession.transactions && currentSession.transactions.length > 0 ? (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {currentSession.transactions.map((t) => (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform">
                                            {getTransactionIcon(t.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{t.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{getTransactionLabel(t.type)}</span>
                                                <span className="text-[10px] text-gray-400">•</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-sm font-black tabular-nums ${
                                            ['expense', 'transfer_out'].includes(t.type) ? 'text-rose-600' : 'text-emerald-600'
                                        }`}>
                                            {['expense', 'transfer_out'].includes(t.type) ? '-' : '+'}{formatCurrency(t.amount)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <button 
                                                onClick={() => openEditModal(t)}
                                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => setDeletingTransaction(t)}
                                                className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                            <ArrowUpCircle className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-sm font-medium">Aún no hay movimientos registrados</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-400 mx-auto mb-6">
                    <Wallet className="w-10 h-10 opacity-20" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Caja Cerrada</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Debes iniciar una nueva sesión de caja para registrar ventas y movimientos hoy.</p>
                <Button 
                    onClick={() => setShowOpenModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 rounded-2xl font-bold shadow-xl shadow-blue-900/20"
                >
                    Iniciar Turno de Caja
                </Button>
            </div>
        </div>
      )}

      {/* History Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" /> Historial de Turnos
              </h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Sesión / Fecha</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Usuario</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Efectivo Final</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Banco Final</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Estado</th>
                          <th className="px-6 py-4"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {history.map((s) => (
                          <tr key={s.id} onClick={() => openSessionDetail(s)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer group">
                              <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">ID #{s.id}</p>
                                  <p className="text-[10px] text-gray-500">{new Date(s.start_time).toLocaleDateString()} {new Date(s.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{s.user_username}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <span className="text-xs font-bold text-gray-500">{formatCurrency(s.actual_cash)}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <span className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(s.actual_bank)}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  {s.status === 'closed' ? (
                                      <span className="text-[10px] font-black px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase tracking-widest">Cerrada</span>
                                  ) : (
                                      <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-600 rounded uppercase tracking-widest animate-pulse">Abierta</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors ml-auto" />
                              </td>
                          </tr>
                      ))}
                      {history.length === 0 && !loading && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No hay turnos registrados aún.</p>
                          </td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
          <div
            className="bg-white dark:bg-gray-900 w-full md:max-w-2xl max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom md:zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Detalle de Turno #{selectedSession.id}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(selectedSession.start_time).toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedSession.status === 'open' ? (
                  <span className="text-[10px] font-black px-2.5 py-1.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-widest animate-pulse">Abierta</span>
                ) : (
                  <span className="text-[10px] font-black px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full uppercase tracking-widest">Cerrada</span>
                )}
                <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Info Row */}
              <div className="grid grid-cols-3 gap-0 border-b border-gray-100 dark:border-gray-800">
                <div className="p-5 border-r border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Usuario</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedSession.user_username}</p>
                </div>
                <div className="p-5 border-r border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Apertura</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {new Date(selectedSession.start_time).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cierre</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedSession.end_time
                      ? new Date(selectedSession.end_time).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})
                      : <span className="text-emerald-500">En curso</span>}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumen Financiero</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cash */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">Efectivo</span>
                    </div>
                    {[
                      { label: 'Inicial', value: selectedSession.initial_cash },
                      { label: 'Esperado', value: selectedSession.expected_cash },
                      { label: 'Contado Real', value: selectedSession.actual_cash, highlight: true },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{row.label}</span>
                        <span className={`text-sm font-bold tabular-nums ${row.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {formatCurrency(row.value)}
                        </span>
                      </div>
                    ))}
                    {selectedSession.status === 'closed' && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-500">Diferencia</span>
                        <span className={`text-sm font-black tabular-nums ${
                          Number(selectedSession.actual_cash) >= Number(selectedSession.expected_cash)
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {Number(selectedSession.actual_cash) >= Number(selectedSession.expected_cash) ? '+' : ''}
                          {formatCurrency(Number(selectedSession.actual_cash) - Number(selectedSession.expected_cash))}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Bank */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">Banco / Transferencia</span>
                    </div>
                    {[
                      { label: 'Inicial', value: selectedSession.initial_bank },
                      { label: 'Esperado', value: selectedSession.expected_bank },
                      { label: 'Contado Real', value: selectedSession.actual_bank, highlight: true },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{row.label}</span>
                        <span className={`text-sm font-bold tabular-nums ${row.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {formatCurrency(row.value)}
                        </span>
                      </div>
                    ))}
                    {selectedSession.status === 'closed' && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-500">Diferencia</span>
                        <span className={`text-sm font-black tabular-nums ${
                          Number(selectedSession.actual_bank) >= Number(selectedSession.expected_bank)
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {Number(selectedSession.actual_bank) >= Number(selectedSession.expected_bank) ? '+' : ''}
                          {formatCurrency(Number(selectedSession.actual_bank) - Number(selectedSession.expected_bank))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedSession.notes && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      <span className="font-bold">Notas: </span>{selectedSession.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Movimientos del Turno ({selectedSession.transactions?.length || 0})
                </p>
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : selectedSession.transactions && selectedSession.transactions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSession.transactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                            {getTransactionIcon(t.type)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{t.description}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{getTransactionLabel(t.type)}</span>
                              <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(t.created_at).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm font-black tabular-nums ${
                          ['expense','transfer_out'].includes(t.type) ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {['expense','transfer_out'].includes(t.type) ? '-' : '+'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin movimientos en este turno.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Box Modal */}
      {showOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Abrir Turno</h3>
                      <button onClick={() => setShowOpenModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleOpenBox} className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Saldo Inicial en Efectivo</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    name="initial_cash" 
                                    type="number" 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold" 
                                    placeholder="0" 
                                    defaultValue="0"
                                    required 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Saldo Inicial en Banco</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    name="initial_bank" 
                                    type="number" 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold" 
                                    placeholder="0" 
                                    defaultValue="0"
                                    required 
                                />
                            </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={saving} className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-900/20">
                          {saving ? 'Abriendo...' : 'Iniciar Turno de Caja'}
                      </Button>
                  </form>
              </div>
          </div>
      )}

      {showMoveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Registrar Movimiento</h3>
                      <button onClick={() => setShowMoveModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleAddMove} className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tipo de Movimiento</label>
                          <select 
                            value={moveForm.type}
                            onChange={(e) => setMoveForm({...moveForm, type: e.target.value as any})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold"
                          >
                              <option value="income">Ingreso Extra (Efectivo)</option>
                              <option value="expense">Egreso / Gasto (Efectivo)</option>
                              <option value="transfer_in">Ingreso a Banco (Transferencia)</option>
                              <option value="transfer_out">Movimiento de Efectivo a Banco</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Monto</label>
                          <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input 
                                value={moveForm.amount}
                                onChange={(e) => setMoveForm({...moveForm, amount: e.target.value})}
                                type="number" 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-emerald-600 dark:text-emerald-400" 
                                placeholder="0" 
                                required 
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                          <textarea 
                            value={moveForm.description}
                            onChange={(e) => setMoveForm({...moveForm, description: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-medium min-h-[100px] placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                            placeholder="Ej: Pago de papelería, Venta externa, etc." 
                            required 
                          />
                      </div>
                      <Button type="submit" disabled={saving} className="w-full py-6 rounded-2xl bg-blue-600 font-bold shadow-lg">
                          {saving ? 'Guardando...' : 'Confirmar Movimiento'}
                      </Button>
                  </form>
              </div>
          </div>
      )}

      {/* Edit Movement Modal */}
      {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Editar Movimiento</h3>
                      <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleUpdateTransaction} className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tipo de Movimiento</label>
                          <select 
                            value={moveForm.type}
                            onChange={(e) => setMoveForm({...moveForm, type: e.target.value as any})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold"
                          >
                              <option value="income">Ingreso Extra (Efectivo)</option>
                              <option value="expense">Egreso / Gasto (Efectivo)</option>
                              <option value="transfer_out">Consignación / Transferencia (Efectivo a Banco)</option>
                          </select>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Monto</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                              <input 
                                value={moveForm.amount}
                                onChange={(e) => setMoveForm({...moveForm, amount: e.target.value})}
                                type="number" 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-emerald-600 dark:text-emerald-400" 
                                placeholder="0" 
                                required 
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                          <textarea 
                            value={moveForm.description}
                            onChange={(e) => setMoveForm({...moveForm, description: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-medium min-h-[100px] placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                            placeholder="Ej: Pago de papelería, Venta externa, etc." 
                            required 
                          />
                      </div>

                      <div className="pt-4 flex gap-3">
                          <Button 
                              type="button"
                              onClick={() => {
                                  if (editingTransaction) {
                                      setDeletingTransaction(editingTransaction);
                                      setShowEditModal(false);
                                  }
                              }}
                              disabled={saving}
                              className="w-1/3 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border border-gray-200 dark:border-gray-800"
                          >
                              {saving ? '...' : <Trash2 size={20} />}
                          </Button>
                          <Button 
                              type="submit"
                              disabled={saving}
                              className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                          >
                              {saving ? 'Guardando...' : 'Guardar Cambios'}
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar movimiento?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Estás a punto de eliminar el movimiento <span className="font-bold text-gray-900 dark:text-white">"{deletingTransaction.description}"</span> por valor de <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(deletingTransaction.amount)}</span>. 
                Esta acción recalculará automáticamente los saldos esperados de la caja.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingTransaction(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDeleteTransaction(deletingTransaction.id)}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? 'Eliminando...' : 'Eliminar ahora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Cerrar Turno</h3>
                      <button onClick={() => setShowCloseModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-4 border-b border-blue-100 dark:border-blue-500/20 space-y-1">
                      <p className="text-[10px] text-blue-700 dark:text-blue-300 font-black uppercase tracking-widest">Resumen de Saldos Esperados</p>
                      <div className="flex justify-between">
                        <span className="text-xs text-blue-600">Efectivo: <span className="font-bold">{formatCurrency(currentSession?.expected_cash)}</span></span>
                        <span className="text-xs text-blue-600">Banco: <span className="font-bold">{formatCurrency(currentSession?.expected_bank)}</span></span>
                      </div>
                  </div>
                  <form onSubmit={handleCloseBox} className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Efectivo Físico Contado</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={closeForm.actual_cash}
                                    onChange={(e) => setCloseForm({...closeForm, actual_cash: e.target.value})}
                                    type="number" 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold" 
                                    placeholder="0" 
                                    required 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Saldo Total en Banco / Extracto</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={closeForm.actual_bank}
                                    onChange={(e) => setCloseForm({...closeForm, actual_bank: e.target.value})}
                                    type="number" 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold" 
                                    placeholder="0" 
                                    required 
                                />
                            </div>
                        </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Notas de Cierre</label>
                          <textarea 
                            value={closeForm.notes}
                            onChange={(e) => setCloseForm({...closeForm, notes: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-medium min-h-[80px] placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                            placeholder="Cualquier observación..." 
                          />
                      </div>
                      <Button type="submit" disabled={saving} className="w-full py-6 rounded-2xl bg-rose-600 font-bold shadow-lg shadow-rose-900/20 text-white transition-all">
                          {saving ? 'Cerrando...' : 'Finalizar Turno y Bloquear Caja'}
                      </Button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default CashboxPage;
