import React, { useEffect, useState } from 'react';
import { Wallet, DollarSign, Clock, User as UserIcon, CheckCircle, AlertTriangle, AlertCircle, TrendingUp, History } from 'lucide-react';

interface CashSession {
  started_at: string;
  initial_amount: number;
  user: string;
}

interface CashHistoryEntry {
  started_at: string;
  closed_at: string;
  initial_amount: number;
  sales_amount: number;
  expected_amount: number;
  counted_amount: number;
  difference: number;
  user: string;
}

interface User {
  username: string;
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
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [cashHistory, setCashHistory] = useState<CashHistoryEntry[]>([]);
  const [me, setMe] = useState<User>({ username: '' });

  useEffect(() => {
    try {
      const s = localStorage.getItem('cashbox_session');
      const h = localStorage.getItem('cashbox_history');
      setCashSession(s ? JSON.parse(s) : null);
      setCashHistory(h ? JSON.parse(h) : []);
    } catch {}
  }, []);

  const loadMe = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${apiBase}/users/api/auth/me/`, { headers });
      const data = await res.json();
      if (res.ok) {
        setMe({ username: data.username || '' });
      }
    } catch {}
  };

  useEffect(() => {
    if (token) loadMe();
  }, [token]);

  const openCashbox = (initial_amount: string | number) => {
    const sess: CashSession = { started_at: new Date().toISOString(), initial_amount: Number(initial_amount || 0), user: me.username || '' };
    setCashSession(sess);
    try { localStorage.setItem('cashbox_session', JSON.stringify(sess)); } catch {}
    setMsg({ type: 'success', text: 'Caja abierta correctamente' });
    setTimeout(() => setMsg(null), 3000);
  };

  const closeCashbox = async (counted_amount: string | number) => {
    if (!cashSession) return;
    setSaving(true);
    setMsg(null);
    try {
      const headersAuth = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${apiBase}/sales/list/?page_size=1000`, { headers: headersAuth });
      const data = await res.json();
      const list = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      const start = new Date(cashSession.started_at);
      const end = new Date();
      
      const inRange = list.filter((o: any) => {
        const d = new Date(o.created_at);
        return d >= start && d <= end;
      });
      
      const salesAmount = inRange.reduce((acc: number, o: any) => acc + Number(o.total_amount || 0), 0);
      const expected = Number(cashSession.initial_amount || 0) + salesAmount;
      const counted = Number(counted_amount || 0);
      const diff = counted - expected;
      
      const entry: CashHistoryEntry = {
        started_at: cashSession.started_at,
        closed_at: end.toISOString(),
        initial_amount: cashSession.initial_amount,
        sales_amount: salesAmount,
        expected_amount: expected,
        counted_amount: counted,
        difference: diff,
        user: cashSession.user || (me.username || '')
      };
      
      const hist = [entry, ...cashHistory].slice(0, 100);
      setCashHistory(hist);
      try {
        localStorage.setItem('cashbox_history', JSON.stringify(hist));
        localStorage.removeItem('cashbox_session');
      } catch {}
      setCashSession(null);
      setMsg({ type: 'success', text: 'Caja cerrada correctamente' });
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ type: 'error', text: 'No se pudo cerrar la caja. Intente nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-700 transition-all group">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Estado de Caja" 
          value={cashSession ? 'ABIERTA' : 'CERRADA'} 
          icon={Wallet} 
          color={cashSession ? { bg: 'bg-emerald-500', text: 'text-emerald-500' } : { bg: 'bg-rose-500', text: 'text-rose-500' }} 
        />
        <StatCard 
          label="Base Inicial" 
          value={cashSession ? formatCurrency(cashSession.initial_amount) : '$0'} 
          icon={DollarSign} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          label="Hora Apertura" 
          value={cashSession ? new Date(cashSession.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} 
          icon={Clock} 
          color={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} 
        />
        <StatCard 
          label="Usuario" 
          value={cashSession?.user || me.username || '...'} 
          icon={UserIcon} 
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} 
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content - Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm h-full">
            <div className="p-5 border-b border-gray-800 flex items-center gap-3 bg-gray-900/50">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-white">Control de Caja</h2>
            </div>
            
            <div className="p-6">
              {!cashSession ? (
                <form onSubmit={(e) => { e.preventDefault(); const amt = (e.currentTarget.elements.namedItem('initial') as HTMLInputElement).value; openCashbox(amt); e.currentTarget.reset(); }} className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                      <p className="text-sm text-blue-200">La caja se encuentra cerrada. Ingrese el monto base para iniciar el turno.</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Monto Base Inicial</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        name="initial" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                        required 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? 'Procesando...' : 'Abrir Turno'}
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); const amt = (e.currentTarget.elements.namedItem('counted') as HTMLInputElement).value; closeCashbox(amt); e.currentTarget.reset(); }} className="space-y-6">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <p className="text-sm text-amber-200">Para cerrar, cuente el dinero físico. El sistema calculará diferencias.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Inicio:</span>
                        <span className="text-white font-mono">{new Date(cashSession.started_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Base:</span>
                        <span className="text-emerald-400 font-mono">{formatCurrency(cashSession.initial_amount)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Total Efectivo Contado</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-rose-500 transition-colors" />
                        <input 
                          name="counted" 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all" 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? 'Cerrando...' : 'Cerrar Turno y Caja'}
                    <Wallet className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm h-full">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <History className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Historial de Cierres</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/30">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Base</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ventas</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Contado</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {cashHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="w-8 h-8 opacity-20" />
                          <p>No hay registros de cierres aún</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cashHistory.map((h, i) => (
                      <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-medium">{new Date(h.closed_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(h.closed_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">{h.user}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-mono text-gray-400">{formatCurrency(h.initial_amount)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-mono text-blue-400">{formatCurrency(h.sales_amount)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-mono text-white">{formatCurrency(h.counted_amount)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`text-sm font-mono font-bold px-2 py-1 rounded-md inline-block ${
                            h.difference === 0 ? 'bg-gray-800 text-gray-400' :
                            h.difference > 0 ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {h.difference > 0 ? '+' : ''}{formatCurrency(h.difference)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashboxPage;
