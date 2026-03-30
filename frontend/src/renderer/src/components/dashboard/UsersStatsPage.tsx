import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle, RefreshCw, Users } from 'lucide-react';

interface UsersStatsPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface EmployeeRow {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
  last_login?: string | null;
  date_joined?: string | null;
}

const UsersStatsPage: React.FC<UsersStatsPageProps> = ({ token, apiBase, role }) => {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
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

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const daysBack = (n: number) => {
    const out: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = n - 1; i >= 0; i--) out.push(new Date(today.getTime() - i * 24 * 60 * 60 * 1000));
    return out;
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

  const load = async () => {
    setMsg(null);
    if (role === 'super_admin' && !tenantId) {
      setMsg({ type: 'error', text: 'Selecciona un tenant para ver estadísticas.' });
      return;
    }
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
      setRows(list);

    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (role === 'admin') load();
    if (role === 'super_admin' && tenantId) load();
  }, [token, role, tenantId]);

  const stats = useMemo(() => {
    const total = rows.length;
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const byRole: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    let active7 = 0;
    let active30 = 0;
    let neverLogin = 0;
    let joined7 = 0;
    let joined30 = 0;
    for (const r of rows) {
      const rr = r.role || 'employee';
      byRole[rr] = (byRole[rr] || 0) + 1;
      const dep = r.department || 'Sin departamento';
      byDept[dep] = (byDept[dep] || 0) + 1;
      if (r.last_login) {
        const t = new Date(r.last_login);
        if (!Number.isNaN(t.getTime())) {
          if (t >= d7) active7 += 1;
          if (t >= d30) active30 += 1;
        }
      } else {
        neverLogin += 1;
      }
      if (r.date_joined) {
        const t = new Date(r.date_joined);
        if (!Number.isNaN(t.getTime())) {
          if (t >= d7) joined7 += 1;
          if (t >= d30) joined30 += 1;
        }
      }
    }
    const deptSorted = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
    const topDepts = deptSorted.slice(0, 10);
    const roleSorted = Object.entries(byRole).sort((a, b) => b[1] - a[1]);
    const recentLogins = [...rows]
      .map((r) => ({ ...r, _t: r.last_login ? new Date(r.last_login).getTime() : 0 }))
      .sort((a: any, b: any) => b._t - a._t)
      .slice(0, 10);
    const newest = [...rows]
      .map((r) => ({ ...r, _t: r.date_joined ? new Date(r.date_joined).getTime() : 0 }))
      .sort((a: any, b: any) => b._t - a._t)
      .slice(0, 10);

    const seriesDays = daysBack(14);
    const joinSeries = seriesDays.map((d) => {
      const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const c = rows.filter((r) => {
        if (!r.date_joined) return false;
        const t = new Date(r.date_joined);
        return !Number.isNaN(t.getTime()) && t >= d && t < next;
      }).length;
      return { d, c };
    });
    const loginSeries = seriesDays.map((d) => {
      const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const c = rows.filter((r) => {
        if (!r.last_login) return false;
        const t = new Date(r.last_login);
        return !Number.isNaN(t.getTime()) && t >= d && t < next;
      }).length;
      return { d, c };
    });
    const maxJoin = Math.max(1, ...joinSeries.map((x) => x.c));
    const maxLogin = Math.max(1, ...loginSeries.map((x) => x.c));

    return { total, byRole, roleSorted, topDepts, deptSorted, active7, active30, neverLogin, joined7, joined30, recentLogins, newest, joinSeries, loginSeries, maxJoin, maxLogin };
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

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50/80 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {role === 'super_admin' && (
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="">Selecciona tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.admin_username || `Tenant ${t.id}`}
                  </option>
                ))}
              </select>
            )}
            <button onClick={load} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2" title="Recargar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Recargar</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Usuarios</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Total (empleados del tenant)</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Activos</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.active7}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Últimos 7 días (por login)</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Nuevos</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.joined30}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Últimos 30 días</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Sin login</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.neverLogin}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Nunca han iniciado sesión</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Roles</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Distribución</div>
                </div>
              </div>
              <div className="space-y-2">
                {stats.roleSorted.map(([k, v]) => {
                  const pct = stats.total ? Math.round((v / stats.total) * 100) : 0;
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span className="capitalize">{k}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{v} · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {stats.roleSorted.length === 0 && <div className="text-sm text-gray-500">—</div>}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Departamentos</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Top</div>
                </div>
              </div>
              <div className="space-y-2">
                {stats.topDepts.map(([dep, v]) => {
                  const pct = stats.total ? Math.round((v / stats.total) * 100) : 0;
                  return (
                    <div key={dep} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span className="truncate">{dep}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{v} · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {stats.topDepts.length === 0 && <div className="text-sm text-gray-500">—</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Altas (14 días)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Usuarios creados por día</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">7d: {stats.joined7} · 30d: {stats.joined30}</div>
              </div>
              <div className="flex items-end gap-1 h-16">
                {stats.joinSeries.map((x) => (
                  <div key={x.d.toISOString()} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden" title={`${x.d.toLocaleDateString('es-CO')}: ${x.c}`}>
                    <div className="w-full bg-indigo-500" style={{ height: `${Math.round((x.c / stats.maxJoin) * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Últimos creados</th>
                      <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {stats.newest.map((u: any) => (
                      <tr key={u.id}>
                        <td className="py-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium text-gray-900 dark:text-white">{u.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</div>
                        </td>
                        <td className="py-2 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(u.date_joined)}</td>
                      </tr>
                    ))}
                    {stats.newest.length === 0 && (
                      <tr><td colSpan={2} className="py-6 text-center text-gray-500">—</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Actividad (14 días)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Últimos logins por día</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">7d: {stats.active7} · 30d: {stats.active30} · nunca: {stats.neverLogin}</div>
              </div>
              <div className="flex items-end gap-1 h-16">
                {stats.loginSeries.map((x) => (
                  <div key={x.d.toISOString()} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden" title={`${x.d.toLocaleDateString('es-CO')}: ${x.c}`}>
                    <div className="w-full bg-emerald-500" style={{ height: `${Math.round((x.c / stats.maxLogin) * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Últimos logins</th>
                      <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {stats.recentLogins.map((u: any) => (
                      <tr key={u.id}>
                        <td className="py-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium text-gray-900 dark:text-white">{u.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</div>
                        </td>
                        <td className="py-2 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(u.last_login)}</td>
                      </tr>
                    ))}
                    {stats.recentLogins.length === 0 && (
                      <tr><td colSpan={2} className="py-6 text-center text-gray-500">—</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Users className="w-5 h-5 text-indigo-500" />
            Estadísticas calculadas con la lista de usuarios del tenant.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersStatsPage;
