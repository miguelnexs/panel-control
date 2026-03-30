import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, DollarSign, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react';

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

  useEffect(() => {
    if (!token || role !== 'super_admin') return;
    fetch(`${apiBase}/api/admin/tenants/`, { headers: authHeaders(token) })
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
          ? `${apiBase}/api/users/?tenant_id=${encodeURIComponent(tenantId)}&role=employee`
          : `${apiBase}/api/users/?page_size=1000`;
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
      qs.set('limit', '200');
      qs.set('offset', String(nextOffset));
      if (search.trim()) qs.set('q', search.trim());
      if (actorId) qs.set('actor_id', actorId);
      if (action) qs.set('action', action);
      if (resourceType) qs.set('resource_type', resourceType);
      if (role === 'super_admin' && tenantId) qs.set('tenant_id', tenantId);

      const res = await fetch(`${apiBase}/api/tenant/activities/?${qs.toString()}`, { headers: authHeaders(token) });
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
      'sale.create': 'Venta creada',
      'product.create': 'Producto creado',
      'product.update': 'Producto actualizado',
      'product.delete': 'Producto eliminado',
      'category.create': 'Categoría creada',
      'category.update': 'Categoría actualizada',
      'category.delete': 'Categoría eliminada',
      'client.create': 'Cliente creado',
      'client.update': 'Cliente actualizado',
      'client.delete': 'Cliente eliminado',
      'service.create': 'Servicio creado',
      'service.update': 'Servicio actualizado',
      'service.delete': 'Servicio eliminado',
      'service_category.create': 'Categoría de servicio creada',
      'service_category.update': 'Categoría de servicio actualizada',
      'service_category.delete': 'Categoría de servicio eliminada',
      'service_definition.create': 'Servicio de catálogo creado',
      'service_definition.update': 'Servicio de catálogo actualizado',
      'service_definition.delete': 'Servicio de catálogo eliminado',
      'product.color.create': 'Color agregado a producto',
      'product.variant.create': 'Variante agregada a producto',
      'permissions.update': 'Permisos actualizados',
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
        service_category: 'Categoría de servicio',
        service_definition: 'Servicio de catálogo',
        permissions: 'Permisos',
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

  const summary = useMemo(() => {
    const activityByActor: Record<string, number> = {};
    const salesByActor: Record<string, number> = {};
    let topActivityActor = '—';
    let topActivityCount = 0;
    let topSalesActor = '—';
    let topSalesCount = 0;
    for (const r of rows) {
      const who = r.actor_username || '—';
      activityByActor[who] = (activityByActor[who] || 0) + 1;
      if (r.action === 'sale.create') salesByActor[who] = (salesByActor[who] || 0) + 1;
    }
    for (const [k, v] of Object.entries(activityByActor)) {
      if (v > topActivityCount) {
        topActivityActor = k;
        topActivityCount = v;
      }
    }
    for (const [k, v] of Object.entries(salesByActor)) {
      if (v > topSalesCount) {
        topSalesActor = k;
        topSalesCount = v;
      }
    }
    return { topActivityActor, topActivityCount, topSalesActor, topSalesCount };
  }, [rows]);

  if (role !== 'admin' && role !== 'super_admin') return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Eventos</div>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">En Pantalla</div>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{rows.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Más actividades</div>
            <div className="flex items-center gap-2">
              {summary.topActivityCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                  {summary.topActivityCount}
                </span>
              )}
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white truncate" title={summary.topActivityActor}>
            {summary.topActivityActor}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Más ventas</div>
            <div className="flex items-center gap-2">
              {summary.topSalesCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {summary.topSalesCount}
                </span>
              )}
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white truncate" title={summary.topSalesActor}>
            {summary.topSalesActor}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50/80 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Actividades</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {role === 'super_admin' && (
              <select
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  setRows([]);
                  setEmployees([]);
                  setOffset(0);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="">Selecciona tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.admin_username || `Tenant ${t.id}`}
                  </option>
                ))}
              </select>
            )}

            <select
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              <option value="">Todos</option>
              {employees.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.username}
                </option>
              ))}
            </select>

            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              <option value="">Acción</option>
              {actionOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              <option value="">Recurso</option>
              {resourceOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            <button onClick={() => loadActivities({ append: false, nextOffset: 0 })} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2" title="Recargar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Recargar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50/60 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(a.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{a.actor_username || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-gray-900 dark:text-white">{actionLabel(a.action)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>{a.message || '—'}</div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No hay actividad para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/50">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Mostrando {rows.length} de {total}
          </div>
          <button
            onClick={() => loadActivities({ append: true, nextOffset: offset + 200 })}
            disabled={loading || rows.length >= total}
            className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cargar más
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersActivitiesPage;
