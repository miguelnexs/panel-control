import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Save, Search, ShieldCheck, Users, Box, Tags, Users as UsersIcon, DollarSign, ShoppingCart, Wrench, Wallet, Globe, BarChart3, Settings, ShieldAlert, Check, UserPlus } from 'lucide-react';

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

const GROUPS: Array<{ title: string; icon: any; color: string; items: Array<{ key: string; label: string }> }> = [
  {
    title: 'Productos',
    icon: Box,
    color: 'blue',
    items: [
      { key: 'view_products', label: 'Ver' },
      { key: 'create_products', label: 'Crear' },
      { key: 'edit_products', label: 'Editar' },
      { key: 'delete_products', label: 'Eliminar' },
    ],
  },
  {
    title: 'Categorías',
    icon: Tags,
    color: 'emerald',
    items: [
      { key: 'view_categories', label: 'Ver' },
      { key: 'create_categories', label: 'Crear' },
      { key: 'edit_categories', label: 'Editar' },
      { key: 'delete_categories', label: 'Eliminar' },
    ],
  },
  {
    title: 'Clientes',
    icon: UsersIcon,
    color: 'purple',
    items: [
      { key: 'view_clients', label: 'Ver' },
      { key: 'create_clients', label: 'Crear' },
      { key: 'edit_clients', label: 'Editar' },
      { key: 'delete_clients', label: 'Eliminar' },
    ],
  },
  {
    title: 'Ventas',
    icon: DollarSign,
    color: 'emerald',
    items: [
      { key: 'create_sales', label: 'Crear' },
      { key: 'edit_sales', label: 'Editar' },
      { key: 'delete_sales', label: 'Eliminar' },
    ],
  },
  {
    title: 'Pedidos',
    icon: ShoppingCart,
    color: 'orange',
    items: [
      { key: 'view_orders', label: 'Ver' },
      { key: 'edit_orders', label: 'Editar' },
      { key: 'delete_orders', label: 'Eliminar' },
    ],
  },
  {
    title: 'Servicios',
    icon: Wrench,
    color: 'indigo',
    items: [
      { key: 'view_services', label: 'Ver' },
      { key: 'create_services', label: 'Crear' },
      { key: 'edit_services', label: 'Editar' },
      { key: 'delete_services', label: 'Eliminar' },
    ],
  },
  {
    title: 'Caja',
    icon: Wallet,
    color: 'rose',
    items: [
      { key: 'view_cashbox', label: 'Ver' },
      { key: 'edit_cashbox', label: 'Editar' },
    ],
  },
  {
    title: 'Web',
    icon: Globe,
    color: 'cyan',
    items: [
      { key: 'view_web', label: 'Ver' },
      { key: 'edit_web', label: 'Editar' },
    ],
  },
  {
    title: 'Reportes',
    icon: BarChart3,
    color: 'amber',
    items: [{ key: 'view_reports', label: 'Ver' }],
  },
  {
    title: 'Administración',
    icon: Settings,
    color: 'slate',
    items: [
      { key: 'manage_settings', label: 'Config' },
      { key: 'manage_users', label: 'Usuarios' },
    ],
  },
];

const PRESETS: Array<{ key: string; label: string; permissions: string[] }> = [
  {
    key: 'solo_ver',
    label: 'Solo ver (Consulta)',
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
    label: 'Perfil Vendedor',
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
    label: 'Perfil Cajero',
    permissions: ['view_cashbox', 'edit_cashbox', 'create_sales', 'view_reports'],
  },
  {
    key: 'inventario',
    label: 'Gestor Inventario',
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
    label: 'Administrador Web',
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
      const res = await fetch(permUrl, { headers: authHeaders(token) });
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

  // Custom Toggle Switch Component (Visual only, wrapper handles click)
  const CustomSwitch = ({ checked }: { checked: boolean }) => (
    <div
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[200%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[150%] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              Gestión de Permisos
            </h1>
            <p className="text-blue-200 font-medium text-lg max-w-xl">
              Controla exactamente qué puede ver y hacer cada miembro de tu equipo. Asigna permisos detallados o usa perfiles predeterminados.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            {role === 'super_admin' && (
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                <option value="" className="text-black">Selecciona tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={String(t.id)} className="text-black">
                    {t.admin_username || `Tenant ${t.id}`}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={load}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-sm font-bold shadow-lg transition-colors w-full md:w-auto"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar Datos</span>
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 border shadow-sm ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        
        {/* LEFT PANEL: EMPLOYEES LIST */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-250px)] min-h-[600px]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" /> Directorio de Equipo
            </h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar empleado..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filtered.map((r) => {
              const active = r.id === selectedId;
              const initials = r.username.substring(0, 2).toUpperCase();
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${active ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-sm ring-1 ring-blue-500/20' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{r.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {[r.first_name, r.last_name].filter(Boolean).join(' ') || 'Sin nombre'}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {r.enforced ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" title="Permisos controlados"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Acceso libre"></div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-3">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Ningún empleado encontrado</p>
                <p className="text-xs text-gray-500 mt-1">Intenta con otra búsqueda</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: PERMISSIONS MATRIX */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col h-[calc(100vh-250px)] min-h-[600px] overflow-hidden relative">
          {!selected ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50 dark:bg-gray-900/50 z-10 backdrop-blur-sm">
              <ShieldAlert className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-medium">Selecciona un empleado a la izquierda</p>
            </div>
          ) : (
            <>
              {/* Top Bar inside Matrix */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20 sticky top-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                    {selected.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Configurando a {selected.username}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {[selected.first_name, selected.last_name].filter(Boolean).join(' ') || 'Sin nombre real'}
                      {selected.position ? ` • ${selected.position}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={saveSelected}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                    <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>

              {/* Matrix Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/30 custom-scrollbar">
                
                {/* Master Control Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm mb-8">
                  <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                    <div className="flex items-start gap-4 max-w-lg">
                      <div className={`p-3 rounded-xl ${selected.enforced ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                        {selected.enforced ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          Restricción de Acceso
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {selected.enforced 
                            ? 'Este usuario tiene acceso restringido. Solo podrá ver e interactuar con los módulos activados debajo.' 
                            : 'Este usuario tiene ACCESO TOTAL como un administrador. Ignorará las reglas de abajo.'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 min-w-[250px]">
                      <div 
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer select-none"
                        onClick={() => setEnforced(!selected.enforced)}
                      >
                        <span className="font-bold text-gray-700 dark:text-gray-300">Activar Control</span>
                        <CustomSwitch checked={selected.enforced} />
                      </div>
                      
                      <div className={`transition-opacity ${!selected.enforced ? 'opacity-50 pointer-events-none' : ''}`}>
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) applyPreset(e.target.value); }}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-sm appearance-none"
                          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                        >
                          <option value="">Aplicar Perfil Rápido...</option>
                          {PRESETS.map((p) => (
                            <option key={p.key} value={p.key}>⭐ {p.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 transition-all duration-300 ${!selected.enforced ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  {GROUPS.map((g) => {
                    const keys = g.items.map((i) => i.key);
                    const selectedCount = keys.filter((k) => has(k)).length;
                    const isAll = selectedCount === keys.length;
                    const Icon = g.icon;
                    
                    return (
                      <div key={g.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/80">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${g.color}-100 dark:bg-${g.color}-900/30 text-${g.color}-600 dark:text-${g.color}-400`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{g.title}</div>
                              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                {selectedCount} de {keys.length} permisos
                              </div>
                            </div>
                          </div>
                          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => selectAllInGroup(keys)}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${isAll ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                              Todo
                            </button>
                            <button
                              type="button"
                              onClick={() => clearGroup(keys)}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${selectedCount === 0 ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                              Nada
                            </button>
                          </div>
                        </div>
                        <div className="p-2">
                          {g.items.map((it) => (
                            <div 
                              key={it.key} 
                              onClick={() => togglePerm(it.key)}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer transition-colors group select-none"
                            >
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                {it.label}
                              </span>
                              <CustomSwitch checked={has(it.key)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePermissionsManager;
