import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  RefreshCw, 
  MapPin, 
  Mail, 
  CreditCard, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  User,
  ShoppingBag,
  TrendingUp,
  Globe
} from 'lucide-react';

interface Client {
  id: number;
  full_name: string;
  cedula: string;
  email: string;
  address: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: number | string;
  items: {
    product: string;
    color?: string;
    quantity: number;
  }[];
}

interface ClientForm {
  full_name: string;
  cedula: string;
  email: string;
  address: string;
}

interface CityStat {
  label: string;
  count: number;
}

interface ClientStats {
  total: number;
  new_this_month: number;
  top_cities: CityStat[];
  new_today?: number;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface ClientsPageProps {
  token: string;
  apiBase: string;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ token, apiBase }) => {
  const [items, setItems] = useState<Client[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [ordering, setOrdering] = useState('-created_at');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<ClientForm>({ full_name: '', cedula: '', email: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<ClientStats>({ total: 0, new_this_month: 0, top_cities: [], new_today: 0 });
  const [open, setOpen] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [viewOrders, setViewOrders] = useState<Order[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<ClientForm>({ full_name: '', cedula: '', email: '', address: '' });

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadClients = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (ordering) params.set('ordering', ordering);
      const res = await fetch(`${apiBase}/clients/?${params.toString()}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar clientes');
      setItems(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.count || 0));
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${apiBase}/clients/stats/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (_) {}
  };

  useEffect(() => { if (token) { loadClients(); loadStats(); } }, [token, page, pageSize, search, ordering]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.full_name || form.full_name.trim().length < 3) e.full_name = 'Nombre obligatorio';
    if (!/^[0-9]{6,12}$/.test(form.cedula || '')) e.cedula = 'Cédula 6-12 dígitos';
    if (!/^\S+@\S+\.\S+$/.test(form.email || '')) e.email = 'Correo inválido';
    if (!form.address || form.address.trim().length < 5) e.address = 'Dirección obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validateForm()) return;
    try {
      const fd = new FormData();
      fd.append('full_name', form.full_name);
      fd.append('cedula', form.cedula);
      fd.append('email', form.email);
      fd.append('address', form.address);
      const res = await fetch(`${apiBase}/clients/`, { method: 'POST', headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo registrar el cliente');
      setMsg({ type: 'success', text: 'Cliente registrado' });
      setForm({ full_name: '', cedula: '', email: '', address: '' });
      setOpen(false);
      loadClients();
      loadStats();
    } catch (e2: any) {
      setMsg({ type: 'error', text: e2.message });
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-700 transition-all group">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
          {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {loading && !items.length && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-white font-medium">Cargando clientes...</div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Clientes" 
          value={stats.total} 
          icon={Users} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          label="Nuevos (Mes)" 
          value={stats.new_this_month} 
          icon={TrendingUp} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
        />
        <StatCard 
          label="Nuevos (Hoy)" 
          value={stats.new_today || 0} 
          icon={Calendar} 
          color={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} 
        />
        <StatCard 
          label="Top Ciudad" 
          value={stats.top_cities[0]?.count || 0} 
          subValue={stats.top_cities[0]?.label || 'N/A'}
          icon={Globe} 
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} 
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Directorio de Clientes</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Buscar cliente..."
                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="full_name">Nombre A-Z</option>
                <option value="-full_name">Nombre Z-A</option>
                <option value="cedula">Cédula</option>
                <option value="email">Correo</option>
                <option value="-created_at">Más recientes</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-2 ml-2">
              <button onClick={() => { loadClients(); loadStats(); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setForm({ full_name: '', cedula: '', email: '', address: '' }); setErrors({}); setOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Cliente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{c.full_name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CreditCard className="w-3 h-3" />
                          {c.cedula}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      {c.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 text-gray-300 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
                      <span className="truncate max-w-[200px]">{c.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={async () => { try { setViewLoading(true); setViewClient(c); const res = await fetch(`${apiBase}/clients/orders/${c.id}/`, { headers: authHeaders(token) }); const data = await res.json(); if (res.ok) { setViewOrders(data.orders || []); } } catch(_){} finally { setViewLoading(false); } }}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setEditClient(c); setEditForm({ full_name: c.full_name || '', cedula: c.cedula || '', email: c.email || '', address: c.address || '' }); }}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => { if (!confirm('Eliminar cliente?')) return; try { const res = await fetch(`${apiBase}/clients/${c.id}/`, { method: 'DELETE', headers: authHeaders(token) }); if (res.ok) { loadClients(); loadStats(); } } catch(_){} }}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 mb-3 opacity-20" />
                      <p>No se encontraron clientes</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="text-sm text-gray-400">
            Mostrando {items.length} de {total} clientes
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-300 px-2">
              Página {page} de {totalPages}
            </span>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
              className="px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {[10,20,50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* New Client Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Nuevo Cliente</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={form.full_name} 
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} 
                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-800 border ${errors.full_name ? 'border-rose-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                {errors.full_name && <p className="mt-1 text-xs text-rose-400">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Cédula / Identificación</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={form.cedula} 
                    onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))} 
                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-800 border ${errors.cedula ? 'border-rose-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                    placeholder="Ej. 12345678"
                  />
                </div>
                {errors.cedula && <p className="mt-1 text-xs text-rose-400">{errors.cedula}</p>}
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-800 border ${errors.email ? 'border-rose-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <textarea 
                    value={form.address} 
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} 
                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-800 border ${errors.address ? 'border-rose-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px] resize-none`}
                    placeholder="Dirección completa"
                  />
                </div>
                {errors.address && <p className="mt-1 text-xs text-rose-400">{errors.address}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setOpen(false)} 
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Client Details Modal */}
      {viewClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <User className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Detalle del Cliente</h3>
              </div>
              <button onClick={() => { setViewClient(null); setViewOrders([]); }} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-1 bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-white mb-4 border-2 border-gray-600">
                    {viewClient.full_name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{viewClient.full_name}</h2>
                  <p className="text-sm text-gray-400 mb-4">{viewClient.email}</p>
                  
                  <div className="w-full space-y-3 text-left">
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>{viewClient.cedula}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span>{viewClient.address}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-medium text-white">Historial de Pedidos</h3>
                  </div>

                  {viewLoading ? (
                     <div className="flex items-center justify-center py-12 bg-gray-800/30 rounded-xl border border-gray-800">
                       <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                     </div>
                  ) : viewOrders.length > 0 ? (
                    <div className="space-y-3">
                      {viewOrders.map((o) => (
                        <div key={o.id} className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-indigo-400">#{o.order_number}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                                o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                o.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-gray-700 text-gray-300 border-gray-600'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-white">
                              {Number(o.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-2">
                            {new Date(o.created_at).toLocaleDateString()} at {new Date(o.created_at).toLocaleTimeString()}
                          </div>

                          <div className="space-y-1">
                            {o.items.map((it, i) => (
                              <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gray-500" />
                                <span>{it.quantity}x {it.product}</span>
                                {it.color && <span className="text-gray-500 text-xs">({it.color})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed text-gray-500">
                      <ShoppingBag className="w-10 h-10 mb-2 opacity-20" />
                      <p>No hay pedidos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => { setViewClient(null); setViewOrders([]); }} 
                className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Edit className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Editar Cliente</h3>
              </div>
              <button onClick={() => setEditClient(null)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={async (e) => { e.preventDefault(); try { const res = await fetch(`${apiBase}/clients/${editClient.id}/`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) }); if (res.ok) { setEditClient(null); loadClients(); } } catch(_){} }} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Nombre Completo</label>
                <input 
                  value={editForm.full_name} 
                  onChange={(e)=>setEditForm((f)=>({...f, full_name: e.target.value}))} 
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
                  placeholder="Nombre" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Cédula</label>
                <input 
                  value={editForm.cedula} 
                  onChange={(e)=>setEditForm((f)=>({...f, cedula: e.target.value}))} 
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
                  placeholder="Cédula" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Correo</label>
                <input 
                  type="email"
                  value={editForm.email} 
                  onChange={(e)=>setEditForm((f)=>({...f, email: e.target.value}))} 
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
                  placeholder="Correo" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Dirección</label>
                <textarea 
                  value={editForm.address} 
                  onChange={(e)=>setEditForm((f)=>({...f, address: e.target.value}))} 
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all min-h-[100px] resize-none" 
                  placeholder="Dirección" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditClient(null)} 
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all shadow-lg shadow-amber-900/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
