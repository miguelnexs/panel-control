import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Save, Search, ShieldCheck, Users } from 'lucide-react';

interface EmployeePermissionsManagerProps {
  token: string | null;
  apiBase: string;
  role: string;
}

interface Row {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string | null;
  position?: string | null;
  enforced: boolean;
  permissions: string[];
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface Tenant {
  id: number;
  admin_username: string;
}

const PERMISSIONS = [
  { key: 'view_products', label: 'Prod Ver' },
  { key: 'create_products', label: 'Prod Crear' },
  { key: 'edit_products', label: 'Prod Editar' },
  { key: 'delete_products', label: 'Prod Eliminar' },
  { key: 'view_categories', label: 'Cat Ver' },
  { key: 'create_categories', label: 'Cat Crear' },
  { key: 'edit_categories', label: 'Cat Editar' },
  { key: 'delete_categories', label: 'Cat Eliminar' },
  { key: 'view_clients', label: 'Cli Ver' },
  { key: 'create_clients', label: 'Cli Crear' },
  { key: 'edit_clients', label: 'Cli Editar' },
  { key: 'delete_clients', label: 'Cli Eliminar' },
  { key: 'create_sales', label: 'Venta Crear' },
  { key: 'edit_sales', label: 'Venta Editar' },
  { key: 'delete_sales', label: 'Venta Eliminar' },
  { key: 'view_orders', label: 'Ped Ver' },
  { key: 'edit_orders', label: 'Ped Editar' },
  { key: 'delete_orders', label: 'Ped Eliminar' },
  { key: 'view_services', label: 'Serv Ver' },
  { key: 'create_services', label: 'Serv Crear' },
  { key: 'edit_services', label: 'Serv Editar' },
  { key: 'delete_services', label: 'Serv Eliminar' },
  { key: 'view_cashbox', label: 'Caja Ver' },
  { key: 'edit_cashbox', label: 'Caja Editar' },
  { key: 'view_web', label: 'Web Ver' },
  { key: 'edit_web', label: 'Web Editar' },
  { key: 'view_reports', label: 'Reportes Ver' },
  { key: 'manage_settings', label: 'Config' },
];

const DEFAULT_PERMISSIONS = [
  'view_products',
  'view_categories',
  'view_clients',
  'view_orders',
  'view_services',
  'view_cashbox',
  'view_web',
  'view_reports',
];

const EmployeePermissionsManager: React.FC<EmployeePermissionsManagerProps> = ({ token, apiBase, role }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState('');
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState<string>('');

  const authHeaders = (tkn: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
  });

  useEffect(() => {
    if (!token || role !== 'super_admin') return;
    fetch(`${apiBase}/users/api/admin/tenants/`, { headers: authHeaders(token) })
      .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (ok && Array.isArray(d)) {
          setTenants(d.map((t: any) => ({ id: Number(t.id), admin_username: String(t.admin_username || '') })));
        }
      })
      .catch(() => {});
  }, [token, role]);

  const load = async () => {
    setMsg(null);
    if (role === 'super_admin' && !tenantId) {
      setMsg({ type: 'error', text: 'Selecciona un tenant para gestionar permisos.' });
      return;
    }
    setLoading(true);
    try {
      const url = role === 'super_admin' && tenantId ? `${apiBase}/users/api/tenant/permissions/matrix/?tenant_id=${encodeURIComponent(tenantId)}` : `${apiBase}/users/api/tenant/permissions/matrix/`;
      const res = await fetch(url, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar los permisos.');
      const list = Array.isArray(data) ? data : [];
      setRows(
        list.map((r: any) => ({
          id: Number(r.id),
          username: String(r.username || ''),
          first_name: String(r.first_name || ''),
          last_name: String(r.last_name || ''),
          email: String(r.email || ''),
          department: r.department ?? null,
          position: r.position ?? null,
          enforced: Boolean(r.enforced),
          permissions: Array.isArray(r.permissions) ? r.permissions.filter((p: any) => typeof p === 'string') : [],
        }))
      );
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const full = `${r.username} ${r.first_name} ${r.last_name} ${r.email}`.toLowerCase();
      return full.includes(q);
    });
  }, [rows, search]);

  const updateRow = (id: number, updater: (r: Row) => Row) => {
    setRows((prev) => prev.map((r) => (r.id === id ? updater(r) : r)));
  };

  const toggleEnforced = (id: number) => {
    updateRow(id, (r) => {
      if (r.enforced) return { ...r, enforced: false, permissions: [] };
      return { ...r, enforced: true, permissions: r.permissions.length > 0 ? r.permissions : DEFAULT_PERMISSIONS };
    });
  };

  const togglePermission = (id: number, perm: string) => {
    updateRow(id, (r) => {
      if (!r.enforced) return r;
      const set = new Set(r.permissions);
      if (set.has(perm)) set.delete(perm);
      else set.add(perm);
      return { ...r, permissions: Array.from(set) };
    });
  };

  const saveRow = async (row: Row) => {
    setMsg(null);
    setSavingIds((s) => new Set(s).add(row.id));
    try {
      const res = await fetch(`${apiBase}/users/api/tenant/permissions/matrix/`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ user_id: row.id, tenant_id: role === 'super_admin' && tenantId ? tenantId : undefined, enforced: row.enforced, permissions: row.permissions }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudo guardar.');
      updateRow(row.id, (r) => ({ ...r, enforced: Boolean(data.enforced), permissions: Array.isArray(data.permissions) ? data.permissions : r.permissions }));
      setMsg({ type: 'success', text: `Permisos guardados para ${row.username}` });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(row.id);
        return n;
      });
    }
  };

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
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permisos de empleados</h2>
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
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuario..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-72"
              />
            </div>

            <button
              onClick={load}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Controlar</th>
                {PERMISSIONS.map((p) => (
                  <th key={p.key} className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                    {p.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Guardar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((r) => {
                const saving = savingIds.has(r.id);
                return (
                  <tr key={r.id} className="hover:bg-blue-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Users className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{r.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}
                            {r.department ? ` · ${r.department}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={r.enforced}
                          onChange={() => toggleEnforced(r.id)}
                          className="rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{r.enforced ? 'Sí' : 'No'}</span>
                      </label>
                    </td>
                    {PERMISSIONS.map((p) => {
                      const checked = r.permissions.includes(p.key);
                      return (
                        <td key={p.key} className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(r.id, p.key)}
                            disabled={!r.enforced}
                            className="rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => saveRow(r)}
                        disabled={saving || loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                        <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3 + PERMISSIONS.length} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron empleados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePermissionsManager;
