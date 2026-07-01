import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, DollarSign, RefreshCw, Search, ShieldCheck, Users, Trophy, Medal, Award, Star, ChevronDown, ChevronUp, FileText, TrendingUp, Clock, X, ChevronRight } from 'lucide-react';

interface UsersActivitiesPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface ActivityRow {
  id: number;
  created_at: string;
  actor_id: number | null;
  actor_username: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  message: string;
  metadata: Record<string, any>;
  ip_address: string;
}

interface EmployeeRow {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  role?: string;
}

const UsersActivitiesPage: React.FC<UsersActivitiesPageProps> = ({ token, apiBase, role }) => {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [actorId, setActorId] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('');
  const [offset, setOffset] = useState(0);
  const [tenants, setTenants] = useState<Array<{ id: number; admin_username: string }>>([]);
  const [tenantId, setTenantId] = useState<string>('');

  const [selectedUserModal, setSelectedUserModal] = useState<string | null>(null);

  const authHeaders = (tkn: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
  });

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };
  
  const formatTimeOnly = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!token || role !== 'super_admin') return;
    fetch(`${apiBase}/users/api/admin/tenants/`, { headers: authHeaders(token) })
      .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (ok && Array.isArray(d)) setTenants(d.map((t: any) => ({ id: Number(t.id), admin_username: String(t.admin_username || '') })));
      })
      .catch(() => {});
  }, [token, role]);

  const loadEmployees = async () => {
    if (!token) return;
    if (role === 'super_admin' && !tenantId) return;
    setMsg(null);
    setLoading(true);
    try {
      const url =
        role === 'super_admin'
          ? `${apiBase}/users/api/users/?tenant_id=${encodeURIComponent(tenantId)}&role=employee`
          : `${apiBase}/users/api/users/?page_size=1000`;
      const res = await fetch(url, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar usuarios');
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setEmployees(list);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (opts?: { append?: boolean; nextOffset?: number }) => {
    if (!token) return;
    setMsg(null);
    if (role === 'super_admin' && !tenantId) {
      setMsg({ type: 'error', text: 'Selecciona un tenant para ver actividades.' });
      return;
    }
    const append = Boolean(opts?.append);
    const nextOffset = typeof opts?.nextOffset === 'number' ? opts.nextOffset : 0;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '500'); // Increased limit to gather more day data
      qs.set('offset', String(nextOffset));
      if (search.trim()) qs.set('q', search.trim());
      if (actorId) qs.set('actor_id', actorId);
      if (action) qs.set('action', action);
      if (resourceType) qs.set('resource_type', resourceType);
      if (role === 'super_admin' && tenantId) qs.set('tenant_id', tenantId);

      const res = await fetch(`${apiBase}/users/api/tenant/activities/?${qs.toString()}`, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar actividades');
      const list = Array.isArray(data?.results) ? data.results : [];
      setTotal(Number(data?.total || 0));
      setRows((prev) => (append ? [...prev, ...list] : list));
      setOffset(nextOffset);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (role === 'admin') {
      loadEmployees();
      loadActivities({ append: false, nextOffset: 0 });
    }
    if (role === 'super_admin' && tenantId) {
      loadEmployees();
      loadActivities({ append: false, nextOffset: 0 });
    }
  }, [token, role, tenantId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!token) return;
      loadActivities({ append: false, nextOffset: 0 });
    }, 250);
    return () => clearTimeout(t);
  }, [search, actorId, action, resourceType]);

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.action) set.add(r.action);
    return Array.from(set).sort();
  }, [rows]);

  const resourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.resource_type) set.add(r.resource_type);
    return Array.from(set).sort();
  }, [rows]);

  const actionLabel = (code: string) => {
    const map: Record<string, string> = {
      'sale.create': 'Venta exitosa',
      'product.create': 'Registró Producto',
      'product.update': 'Actualizó Producto',
      'product.delete': 'Eliminó Producto',
      'category.create': 'Creó Categoría',
      'category.update': 'Editó Categoría',
      'category.delete': 'Eliminó Categoría',
      'client.create': 'Registró Cliente',
      'client.update': 'Editó Cliente',
      'client.delete': 'Eliminó Cliente',
      'service.create': 'Servicio registrado',
      'service.update': 'Servicio editado',
      'service.delete': 'Servicio eliminado',
      'service_category.create': 'Creó Cat. Servicio',
      'service_definition.create': 'Creó Serv. Catálogo',
      'product.color.create': 'Añadió Color',
      'product.variant.create': 'Añadió Variante',
      'permissions.update': 'Actualizó Permisos',
    };
    if (map[code]) return map[code];
    const parts = String(code || '').split('.');
    if (parts.length >= 2) {
      const [res, act] = parts;
      const resMap: Record<string, string> = {
        sale: 'Venta',
        product: 'Producto',
        category: 'Categoría',
        client: 'Cliente',
        service: 'Servicio',
      };
      const actMap: Record<string, string> = {
        create: 'creado',
        update: 'actualizado',
        delete: 'eliminado',
      };
      const r = resMap[res] || res;
      const a = actMap[act] || act;
      return `${r} ${a}`;
    }
    return code || '—';
  };
  
  const openUserModal = (username: string) => {
    setSelectedUserModal(username);
  };

  const groupedData = useMemo(() => {
    const map = new Map<string, { username: string; totalScore: number; salesCount: number; events: ActivityRow[] }>();
    
    rows.forEach(r => {
      const username = r.actor_username || 'Sistema/Admin';
      if (!map.has(username)) {
        map.set(username, { username, totalScore: 0, salesCount: 0, events: [] });
      }
      const data = map.get(username)!;
      
      // GAMIFICATION LOGIC
      let points = 1; 
      if (r.action.startsWith('sale.')) points = 10; 
      if (r.action.startsWith('service.')) points = 8;
      if (r.action.startsWith('client.')) points = 3;
      
      data.totalScore += points;
      if (r.action === 'sale.create' || r.action === 'service.create') data.salesCount += 1;
      data.events.push(r);
    });
    
    return Array.from(map.values()).sort((a, b) => b.totalScore - a.totalScore);
  }, [rows]);

  const top3 = groupedData.slice(0, 3);
  const gold = top3[0];
  const silver = top3[1];
  const bronze = top3[2];

  if (role !== 'admin' && role !== 'super_admin') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER & TOP PERFORMERS */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-gray-900 dark:text-white">
              Pizarra de Competición
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
              Los líderes del día basados en puntos de actividad y ventas exitosas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-center">
            {/* 2nd Place (Silver) */}
            <div className={`order-2 md:order-1 transition-all duration-500 ${silver ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {silver && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 text-center relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-transform">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-100 to-slate-300 dark:from-slate-700 dark:to-slate-600 p-3 rounded-full shadow-lg border border-white dark:border-gray-700">
                    <Medal className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="mt-8 mb-2">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">2do Lugar</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate mb-4">{silver.username}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{silver.totalScore}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Puntos</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{silver.salesCount}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ventas</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 1st Place (Gold) */}
            <div className={`order-1 md:order-2 transition-all duration-500 ${gold ? 'opacity-100 translate-y-0 scale-100 md:scale-110' : 'opacity-0 translate-y-10 scale-95'} z-10`}>
              {gold ? (
                <div className="bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800/90 backdrop-blur-xl border-2 border-yellow-300 dark:border-yellow-500/50 rounded-3xl p-8 text-center relative shadow-[0_10px_40px_rgba(234,179,8,0.15)] dark:shadow-[0_10px_40px_rgba(234,179,8,0.1)] hover:-translate-y-2 transition-transform">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-300 to-yellow-500 p-4 rounded-full shadow-xl shadow-yellow-500/30 border-2 border-white dark:border-gray-800">
                    <Trophy className="w-10 h-10 text-yellow-900" />
                  </div>
                  <div className="absolute -top-4 -right-2 rotate-12 animate-pulse">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                  </div>
                  <div className="mt-8 mb-3">
                    <span className="text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-widest bg-yellow-100 dark:bg-yellow-900/30 px-4 py-1.5 rounded-full">1er Lugar</span>
                  </div>
                  <h3 className="font-black text-2xl text-gray-900 dark:text-white truncate mb-6">{gold.username}</h3>
                  <div className="flex items-center justify-center gap-6 bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl">
                    <div className="text-center">
                      <p className="text-3xl font-black text-yellow-600 dark:text-yellow-500">{gold.totalScore}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Puntos</p>
                    </div>
                    <div className="w-px h-10 bg-yellow-200 dark:bg-yellow-900/50"></div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{gold.salesCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Ventas</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[200px]">
                  <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Aún no hay competidores hoy</p>
                </div>
              )}
            </div>
            
            {/* 3rd Place (Bronze) */}
            <div className={`order-3 md:order-3 transition-all duration-500 ${bronze ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {bronze && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-orange-200 dark:border-orange-900/50 rounded-3xl p-6 text-center relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-transform">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-orange-200 to-orange-400 dark:from-orange-800 dark:to-orange-700 p-3 rounded-full shadow-lg border border-white dark:border-gray-700">
                    <Award className="w-8 h-8 text-orange-900 dark:text-orange-200" />
                  </div>
                  <div className="mt-8 mb-2">
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">3er Lugar</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate mb-4">{bronze.username}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{bronze.totalScore}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Puntos</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{bronze.salesCount}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ventas</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-theme">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pizarra de Clasificación</h2>
                <p className="text-sm text-gray-500 font-medium">{total} registros analizados</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {role === 'super_admin' && (
                <select
                  value={tenantId}
                  onChange={(e) => {
                    setTenantId(e.target.value);
                    setRows([]);
                    setEmployees([]);
                    setOffset(0);
                  }}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Selecciona Empresa</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={String(t.id)}>{t.admin_username || `Tenant ${t.id}`}</option>
                  ))}
                </select>
              )}

              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Todas las Acciones</option>
                {actionOptions.map((a) => (
                  <option key={a} value={a}>{actionLabel(a)}</option>
                ))}
              </select>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en reportes..."
                  className="pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all w-full lg:w-64"
                />
              </div>

              <button 
                onClick={() => loadActivities({ append: false, nextOffset: 0 })} 
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-bold bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Pizarra</span>
              </button>
            </div>
          </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-theme overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Empleado</th>
                <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Score de Actividad</th>
                <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Ventas Logradas</th>
                <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {groupedData.map((user, index) => {
                const rank = index + 1;
                return (
                    <tr 
                      key={user.username}
                      onClick={() => openUserModal(user.username)}
                      className={`group transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30`}
                    >
                      <td className="px-6 py-5 align-middle">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                            rank === 1 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 shadow-sm' :
                            rank === 2 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-sm' :
                            rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-700 shadow-sm' :
                            'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                            {rank === 1 ? <Trophy size={20} /> : rank === 2 ? <Medal size={20} /> : rank === 3 ? <Award size={20} /> : rank}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-200 dark:border-indigo-800">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white text-lg">{user.username}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.events.length} acciones registradas hoy</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle text-center">
                        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-500/20 shadow-sm">
                            <Activity className="w-4 h-4 mr-2" />
                            <span className="font-black text-lg">{user.totalScore} pts</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle text-center">
                        <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-xl border shadow-sm ${
                            user.salesCount > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                        }`}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span className="font-black text-lg">{user.salesCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle text-right">
                        <div className="inline-flex p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <ChevronRight size={20} />
                        </div>
                      </td>
                    </tr>
                );
              })}
              
              {groupedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no hay competición hoy</h3>
                    <p className="text-gray-500 dark:text-gray-400">Las actividades de los empleados aparecerán aquí a medida que trabajen.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {total > rows.length && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 text-center">
              <button
                onClick={() => loadActivities({ append: true, nextOffset: offset + 500 })}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Cargando más...' : 'Cargar más datos del día'}
              </button>
            </div>
        )}
      </div>
      
      {/* USER ACTIVITIES MODAL */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedUserModal(null)}>
          <div 
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
                  <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">Registro Cronológico</h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Actividades de <span className="text-indigo-600 dark:text-indigo-400">{selectedUserModal}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUserModal(null)}
                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-gray-900/30">
              <div className="space-y-4 relative">
                {/* Timeline vertical line */}
                <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-200 dark:bg-gray-700/50 z-0 hidden sm:block"></div>
                
                {groupedData.find(u => u.username === selectedUserModal)?.events.map((ev, i) => {
                    const isSale = ev.action.startsWith('sale.');
                    return (
                        <div key={ev.id} className="relative z-10 flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all hover:shadow-md">
                            <div className={`p-3 rounded-2xl shadow-sm shrink-0 border ${
                                isSale ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30' : 
                                'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30'
                            }`}>
                                {isSale ? <DollarSign className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <h5 className={`font-bold text-base ${isSale ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                        {actionLabel(ev.action)}
                                    </h5>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 shrink-0 w-fit">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeOnly(ev.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 mt-2">
                                  {ev.message || 'Sin detalles adicionales registrados en el sistema.'}
                                </p>
                            </div>
                        </div>
                    )
                })}
                
                {(groupedData.find(u => u.username === selectedUserModal)?.events.length || 0) === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No hay actividades registradas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersActivitiesPage;
