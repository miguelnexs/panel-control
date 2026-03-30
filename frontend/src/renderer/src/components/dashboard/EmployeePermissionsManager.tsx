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

const GROUPS: Array<{ title: string; items: Array<{ key: string; label: string }> }> = [
  {
    title: 'Productos',
    items: [
      { key: 'view_products', label: 'Ver' },
      { key: 'create_products', label: 'Crear' },
      { key: 'edit_products', label: 'Editar' },
      { key: 'delete_products', label: 'Eliminar' },
    ],
  },
  {
    title: 'Categorías',
    items: [
      { key: 'view_categories', label: 'Ver' },
      { key: 'create_categories', label: 'Crear' },
      { key: 'edit_categories', label: 'Editar' },
      { key: 'delete_categories', label: 'Eliminar' },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { key: 'view_clients', label: 'Ver' },
      { key: 'create_clients', label: 'Crear' },
      { key: 'edit_clients', label: 'Editar' },
      { key: 'delete_clients', label: 'Eliminar' },
    ],
  },
  {
    title: 'Ventas',
    items: [
      { key: 'create_sales', label: 'Crear' },
      { key: 'edit_sales', label: 'Editar' },
      { key: 'delete_sales', label: 'Eliminar' },
    ],
  },
  {
    title: 'Pedidos',
    items: [
      { key: 'view_orders', label: 'Ver' },
      { key: 'edit_orders', label: 'Editar' },
      { key: 'delete_orders', label: 'Eliminar' },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { key: 'view_services', label: 'Ver' },
      { key: 'create_services', label: 'Crear' },
      { key: 'edit_services', label: 'Editar' },
      { key: 'delete_services', label: 'Eliminar' },
    ],
  },
  {
    title: 'Caja',
    items: [
      { key: 'view_cashbox', label: 'Ver' },
      { key: 'edit_cashbox', label: 'Editar' },
    ],
  },
  {
    title: 'Web',
    items: [
      { key: 'view_web', label: 'Ver' },
      { key: 'edit_web', label: 'Editar' },
    ],
  },
  {
    title: 'Reportes',
    items: [{ key: 'view_reports', label: 'Ver' }],
  },
  {
    title: 'Administración',
    items: [
      { key: 'manage_settings', label: 'Config' },
      { key: 'manage_users', label: 'Usuarios' },
    ],
  },
];

const PRESETS: Array<{ key: string; label: string; permissions: string[] }> = [
  {
    key: 'solo_ver',
    label: 'Solo ver',
    permissions: [
      'view_products',
      'view_categories',
      'view_clients',
      'view_orders',
      'view_services',
      'view_cashbox',
      'view_web',
      'view_reports',
    ],
  },
  {
    key: 'vendedor',
    label: 'Vendedor',
    permissions: [
      'view_products',
      'view_categories',
      'view_clients',
      'create_clients',
      'edit_clients',
      'create_sales',
      'view_orders',
      'view_reports',
    ],
  },
  {
    key: 'cajero',
    label: 'Cajero',
    permissions: ['view_cashbox', 'edit_cashbox', 'create_sales', 'view_reports'],
  },
  {
    key: 'inventario',
    label: 'Inventario',
    permissions: [
      'view_products',
      'create_products',
      'edit_products',
      'delete_products',
      'view_categories',
      'create_categories',
      'edit_categories',
      'delete_categories',
      'view_services',
      'create_services',
      'edit_services',
      'delete_services',
    ],
  },
  {
    key: 'web',
    label: 'Web',
    permissions: ['view_web', 'edit_web', 'view_products', 'edit_products'],
  },
];

const EmployeePermissionsManager: React.FC<EmployeePermissionsManagerProps> = ({ token, apiBase, role }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState('');
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
        const permUrl =
          role === 'super_admin'
            ? `${apiBase}/users/api/tenant/permissions/matrix/?tenant_id=${encodeURIComponent(tenantId)}`
            : `${apiBase}/users/api/tenant/permissions/matrix/`;
      const res = await fetch(url, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar los permisos.');
      const list = Array.isArray(data) ? data : [];
      const mapped: Row[] = list.map((r: any) => ({
        id: Number(r.id),
        username: String(r.username || ''),
        first_name: String(r.first_name || ''),
        last_name: String(r.last_name || ''),
        email: String(r.email || ''),
        department: r.department ?? null,
        position: r.position ?? null,
        enforced: Boolean(r.enforced),
        permissions: Array.isArray(r.permissions) ? r.permissions.filter((p: any) => typeof p === 'string') : [],
      }));
      setRows(mapped);
      if (mapped.length > 0 && selectedId == null) setSelectedId(mapped[0].id);
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
      const full = `${r.username} ${r.first_name} ${r.last_name} ${r.email} ${r.department || ''} ${r.position || ''}`.toLowerCase();
      return full.includes(q);
    });
  }, [rows, search]);

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
    if (selectedId && filtered.length > 0 && !filtered.some((r) => r.id === selectedId)) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) || null, [rows, selectedId]);

  const setSelectedRow = (updater: (r: Row) => Row) => {
    if (!selectedId) return;
    setRows((prev) => prev.map((r) => (r.id === selectedId ? updater(r) : r)));
  };

  const has = (perm: string) => {
    if (!selected) return false;
    return selected.permissions.includes(perm);
  };

  const togglePerm = (perm: string) => {
    if (!selected) return;
    if (!selected.enforced) return;
    setSelectedRow((r) => {
      const set = new Set(r.permissions);
      if (set.has(perm)) set.delete(perm);
      else set.add(perm);
      return { ...r, permissions: Array.from(set) };
    });
  };

  const setEnforced = (next: boolean) => {
    if (!selected) return;
    setSelectedRow((r) => {
      if (!next) return { ...r, enforced: false, permissions: [] };
      return { ...r, enforced: true, permissions: r.permissions.length > 0 ? r.permissions : PRESETS[0].permissions };
    });
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setSelectedRow((r) => ({ ...r, enforced: true, permissions: [...preset.permissions] }));
  };

  const selectAllInGroup = (keys: string[]) => {
    if (!selected) return;
    if (!selected.enforced) return;
    setSelectedRow((r) => {
      const set = new Set(r.permissions);
      keys.forEach((k) => set.add(k));
      return { ...r, permissions: Array.from(set) };
    });
  };

  const clearGroup = (keys: string[]) => {
    if (!selected) return;
    if (!selected.enforced) return;
    setSelectedRow((r) => {
      const set = new Set(r.permissions);
      keys.forEach((k) => set.delete(k));
      return { ...r, permissions: Array.from(set) };
    });
  };

  const saveSelected = async () => {
    if (!selected) return;
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/users/api/tenant/permissions/matrix/`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({
          user_id: selected.id,
          tenant_id: role === 'super_admin' && tenantId ? tenantId : undefined,
          enforced: selected.enforced,
          permissions: selected.permissions,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudo guardar.');
      setRows((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? { ...r, enforced: Boolean(data.enforced), permissions: Array.isArray(data.permissions) ? data.permissions : r.permissions }
            : r
        )
      );
      setMsg({ type: 'success', text: `Permisos guardados para ${selected.username}` });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const saveAndNext = async () => {
    if (!selectedId) return;
    await saveSelected();
    const idx = filtered.findIndex((r) => r.id === selectedId);
    if (idx >= 0 && idx < filtered.length - 1) setSelectedId(filtered[idx + 1].id);
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
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permisos</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400">Gestiona qué puede ver y hacer cada empleado</div>
            </div>
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
                placeholder="Buscar empleado..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-72"
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

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-[560px]">
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
            <div className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">Empleados</div>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filtered.map((r) => {
                  const active = r.id === selectedId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${active ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">{r.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}
                            {r.department ? ` · ${r.department}` : ''}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${r.enforced ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                            {r.enforced ? 'Control' : 'Libre'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No se encontraron empleados
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-5">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-gray-500">Selecciona un empleado</div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Users className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{selected.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {[selected.first_name, selected.last_name].filter(Boolean).join(' ') || '—'}
                        {selected.position ? ` · ${selected.position}` : ''}
                        {selected.department ? ` · ${selected.department}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveSelected}
                      disabled={saving || loading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                      <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={saveAndNext}
                      disabled={saving || loading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>Guardar y siguiente</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/30">
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selected.enforced}
                        onChange={(e) => setEnforced(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">Controlar permisos</span>
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) applyPreset(e.target.value);
                      }}
                      className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                    >
                      <option value="">Aplicar perfil</option>
                      {PRESETS.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {selected.enforced ? 'Si está activo, el empleado solo verá lo permitido.' : 'Si está desactivado, el empleado verá todo como antes.'}
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!selected.enforced ? 'opacity-50 pointer-events-none' : ''}`}>
                  {GROUPS.map((g) => {
                    const keys = g.items.map((i) => i.key);
                    const selectedCount = keys.filter((k) => has(k)).length;
                    return (
                      <div key={g.title} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{g.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{selectedCount}/{keys.length} activos</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => selectAllInGroup(keys)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              Todo
                            </button>
                            <button
                              type="button"
                              onClick={() => clearGroup(keys)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                            >
                              Nada
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {g.items.map((it) => (
                            <label key={it.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={has(it.key)}
                                onChange={() => togglePerm(it.key)}
                                className="rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{it.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePermissionsManager;
