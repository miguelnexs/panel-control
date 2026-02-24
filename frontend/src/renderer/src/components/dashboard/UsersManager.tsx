import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  RefreshCw, 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Building,
  Phone,
  Lock
} from 'lucide-react';

interface UsersManagerProps {
  token: string | null;
  apiBase: string;
  role: string;
  createSignal?: number;
  openSaFormSignal?: number;
}

interface Employee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  phone?: string;
}

interface Tenant {
  id: number;
  admin_username: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

const UsersManager: React.FC<UsersManagerProps> = ({ token, apiBase, role, createSignal = 0, openSaFormSignal = 0 }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  
  // Create Form State
  const [form, setForm] = useState({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' });
  const [openCreate, setOpenCreate] = useState(false);

  // Edit Form State
  const [editing, setEditing] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', department: '', position: '', password: '', phone: '' });

  // Super Admin Form State
  const [saUsername, setSaUsername] = useState('');
  const [saPassword, setSaPassword] = useState('');
  const [saRole, setSaRole] = useState('admin');
  const [saCreating, setSaCreating] = useState(false);
  const [saMsg, setSaMsg] = useState<Msg | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [saTenantId, setSaTenantId] = useState('');
  const [showSAForm, setShowSAForm] = useState(false);
  
  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const authHeaders = (tkn: string | null): Record<string, string> => ({ 'Content-Type': 'application/json', ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadEmployees = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/users/api/users/?page_size=1000`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar usuarios');
      const list = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : (Array.isArray(data.items) ? data.items : []);
      setEmployees(list);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token && (role === 'admin' || role === 'super_admin')) loadEmployees(); }, [token, role]);
  
  useEffect(() => { 
    if (token && role === 'super_admin') { 
      fetch(`${apiBase}/users/api/admin/tenants/`, { headers: authHeaders(token) })
        .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
        .then(({ ok, d }) => { if (ok && Array.isArray(d)) setTenants(d); })
        .catch(() => {}); 
    } 
  }, [token, role]);
  
  useEffect(() => { 
    if (role === 'admin' && createSignal > 0) { 
      setForm({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' }); 
      setOpenCreate(true); 
    } 
  }, [createSignal, role]);
  
  useEffect(() => { 
    if (role === 'super_admin' && openSaFormSignal > 0) { 
      setSaRole('employee'); 
      setShowSAForm(true); 
    } 
  }, [openSaFormSignal, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const payload = { ...form, role: 'employee' };
      const res = await fetch(`${apiBase}/users/api/users/`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error((data && (data.detail || data.message)) || `Error ${res.status}`);
      setMsg({ type: 'success', text: `Empleado ${data.username || form.username} creado` });
      setForm({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' });
      setOpenCreate(false);
      loadEmployees();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/users/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'No se pudo eliminar');
      setMsg({ type: 'success', text: 'Usuario eliminado correctamente' });
      loadEmployees();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const startEdit = (emp: Employee) => {
    setMsg(null);
    setEditing(emp);
    setEditForm({ 
      first_name: emp.first_name || '', 
      last_name: emp.last_name || '', 
      email: emp.email || '', 
      department: emp.department || '', 
      position: emp.position || '', 
      password: '',
      phone: emp.phone || ''
    });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!editing) return;
    try {
      const res = await fetch(`${apiBase}/users/api/users/${editing.id}/`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(editForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo actualizar');
      setMsg({ type: 'success', text: 'Usuario actualizado correctamente' });
      setEditing(null);
      loadEmployees();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const saCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaMsg(null);
    setSaCreating(true);
    try {
      const body: any = { 
        username: saUsername, 
        password: saPassword, 
        role: saRole, 
        first_name: editForm.first_name || '', 
        last_name: editForm.last_name || '', 
        email: editForm.email || '', 
        phone: editForm.phone || '', 
        department: editForm.department || '', 
        position: editForm.position || '' 
      };
      if (saRole === 'employee') body.tenant_id = saTenantId || undefined;
      const res = await fetch(`${apiBase}/users/api/users/`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo crear el usuario');
      setSaMsg({ type: 'success', text: `Usuario ${data.username} creado como ${saRole}.` });
      setSaUsername('');
      setSaPassword('');
      setSaRole('admin');
      setSaTenantId('');
      setEditForm({ first_name: '', last_name: '', email: '', department: '', position: '', password: '', phone: '' });
      setShowSAForm(false);
      loadEmployees();
      setMsg({ type: 'success', text: 'Usuario creado correctamente' });
    } catch (e: any) {
      setSaMsg({ type: 'error', text: e.message });
    } finally {
      setSaCreating(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const q = search.toLowerCase();
      return (
        e.username.toLowerCase().includes(q) ||
        (e.first_name && e.first_name.toLowerCase().includes(q)) ||
        (e.last_name && e.last_name.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q))
      );
    });
  }, [employees, search]);

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.role === 'employee').length;
    const admins = employees.filter(e => e.role === 'admin' || e.role === 'super_admin').length;
    const depts = new Set(employees.map(e => e.department).filter(Boolean)).size;
    return { total, active, admins, depts };
  }, [employees]);

  if (role !== 'admin' && role !== 'super_admin') return null;

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all group">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500 text-gray-900 dark:text-white">
      {loading && !employees.length && (
        <div className="absolute inset-0 z-50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-900 dark:text-white font-medium">Cargando usuarios...</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Usuarios" value={stats.total} icon={Users} color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} />
        <StatCard label="Empleados" value={stats.active} icon={Briefcase} color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} />
        <StatCard label="Administradores" value={stats.admins} icon={Shield} color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} />
        <StatCard label="Departamentos" value={stats.depts} icon={Building} color={{ bg: 'bg-amber-500', text: 'text-amber-500' }} />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50/80 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Buscar usuario..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-2">
              <button onClick={loadEmployees} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  if (role === 'super_admin') {
                    setShowSAForm(true);
                  } else {
                    setOpenCreate(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol & Dept</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/60 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-600 uppercase">
                        {emp.username.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{emp.first_name} {emp.last_name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                          <User className="w-3 h-3" />
                          @{emp.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {emp.email && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {emp.email}
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {emp.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        emp.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                        emp.role === 'super_admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {emp.role === 'super_admin' ? 'Super Admin' : emp.role === 'admin' ? 'Administrador' : 'Empleado'}
                      </span>
                      {(emp.department || emp.position) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Briefcase className="w-3 h-3" />
                          {emp.position} {emp.department && `• ${emp.department}`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(emp)}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeEmployee(emp.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 mb-3 opacity-20" />
                      <p>No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginatedEmployees.length} de {filteredEmployees.length} usuarios
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
              Página {page} de {totalPages}
            </span>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {[10,20,50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Create Modal (Admin) */}
      {openCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Nuevo Empleado</h3>
              </div>
              <button onClick={() => setOpenCreate(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={createEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="usuario123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="••••••"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="juan@empresa.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Departamento</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Ventas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Cargo</label>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Vendedor"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50">{loading ? 'Creando...' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal (Super Admin) */}
      {showSAForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gestión Global de Usuarios</h3>
              </div>
              <button onClick={() => setShowSAForm(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {saMsg && (
              <div className={`mx-6 mt-4 p-3 rounded text-sm ${saMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-green-600/20 dark:text-green-200 dark:border-green-500/40' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-red-600/20 dark:text-red-200 dark:border-red-500/40'}`}>
                {saMsg.text}
              </div>
            )}

            <form onSubmit={saCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Usuario</label>
                  <input
                    type="text"
                    value={saUsername}
                    onChange={(e) => setSaUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="usuario123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Contraseña</label>
                  <input
                    type="password"
                    value={saPassword}
                    onChange={(e) => setSaPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="••••••"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Rol de Sistema</label>
                <select
                  value={saRole}
                  onChange={(e) => setSaRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="admin">Administrador (Dueño de Tenant)</option>
                  <option value="employer">Empleador</option>
                  <option value="employee">Empleado (Requiere Tenant)</option>
                </select>
              </div>

              {saRole === 'employee' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Asignar a Empresa (Tenant)</label>
                  <select
                    value={saTenantId}
                    onChange={(e) => setSaTenantId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Seleccione una empresa...</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.admin_username} (ID: {t.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-400">Información Personal (Opcional)</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Apellido"
                  />
                </div>
                <div className="mb-3">
                   <input
                     type="email"
                     name="email"
                     value={editForm.email}
                     onChange={handleEditChange}
                     className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                     placeholder="correo@ejemplo.com"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Depto"
                  />
                  <input
                    type="text"
                    name="position"
                    value={editForm.position}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Cargo"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSAForm(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saCreating} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50">{saCreating ? 'Procesando...' : 'Crear Registro'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Edit className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Editar Usuario</h3>
              </div>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Editando a: <span className="text-gray-900 dark:text-white font-bold">{editing.username}</span></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Apellido"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="301 864 5967"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Departamento</label>
                  <input
                    type="text"
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Depto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Cargo</label>
                  <input
                    type="text"
                    name="position"
                    value={editForm.position}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Cargo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-400">Nueva Contraseña (Opcional)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Dejar vacío para no cambiar"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all shadow-lg shadow-amber-900/20">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
