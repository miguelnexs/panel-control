import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../utils/api';
const ProductosManager = React.lazy(() => import('./ProductosManager'));
const ProductFormPage = React.lazy(() => import('./ProductFormPage'));
const CategoriesManager = React.lazy(() => import('./CategoriesManager'));
const SalesPage = React.lazy(() => import('./SalesPage'));
const OrdersPage = React.lazy(() => import('./OrdersPage'));
const ClientsPage = React.lazy(() => import('./ClientsPage'));
const WebPageManager = React.lazy(() => import('./WebPageManager'));

const Icon = ({ name, className = 'w-5 h-5' }) => {
  if (name === 'dashboard') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6.5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 20c0-3.5 4.5-6 9.5-6s9.5 2.5 9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3.5 18.5c0-2 2.8-3.8 6-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'products') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 8l9 5 9-5M12 3v5M12 13v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'categories') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4l8 4-8 4-8-4 8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 12l8 4 8-4M4 16l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'clients') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 10h5M14 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'sales') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 5h2l2 9h8l2-7H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'orders') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 3h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 8h8M9 12h8M9 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'web') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 12h18M12 3c3.5 3.5 3.5 17.5 0 19M7 5c2 2 2 12 0 14M17 5c-2 2-2 12 0 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'logout') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16l4-4-4-4M17 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 21H5a2 2 0 01-2-2V5a2 2 0 012-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
};

const Sidebar = ({ view, setView, onSignOut, role, orderNotif }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [clientsStats, setClientsStats] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const absUrl = (path) => {
    try {
      if (!path) return '';
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
      return `${API_BASE_URL}/${path}`;
    } catch { return path; }
  };
  useEffect(() => {
    try {
      const s = localStorage.getItem('sidebar_collapsed');
      if (s === '1' || s === '0') setCollapsed(s === '1');
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => {
      setUpdateMsg((m) => (m && m.type === 'info' && m.text.includes('Buscando') ? { type: 'info', text: 'No hay actualizaciones disponibles.' } : m));
    };
    window.addEventListener('upd-fallback', handler);
    return () => window.removeEventListener('upd-fallback', handler);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'b') {
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/webconfig/public/settings/`, { headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (res.ok && data && typeof data.company_name === 'string') {
          setCompanyName(data.company_name || '');
          if (data.logo) setCompanyLogo(absUrl(data.logo));
        }
      } catch {}
    };
    loadSettings();
  }, []);
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch(`${API_BASE_URL}/clients/stats/`, { headers: { 'Content-Type': 'application/json' } }),
          fetch(`${API_BASE_URL}/sales/stats/`, { headers: { 'Content-Type': 'application/json' } }),
        ]);
        const cData = await cRes.json();
        const sData = await sRes.json();
        if (cRes.ok) setClientsStats(cData);
        if (sRes.ok) setSalesStats(sData);
      } catch {}
    };
    loadStats();
  }, []);

  const asideClass = collapsed ? 'w-16' : 'w-64';
  const textClass = collapsed ? 'hidden' : 'inline';
  const tooltipClass = collapsed ? 'absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded bg-gray-800 text-white text-xs shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none' : 'hidden';
  const itemBase = `group relative w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-2 px-3 py-2 rounded hover:bg-white/5 transition text-gray-300 hover:text-white`;
  const activeClass = 'bg-gradient-to-r from-blue-600/20 to-white/5 text-white ring-1 ring-white/10';
  const toneClasses = (key) => {
    if (key === 'dashboard') return 'bg-blue-600/20 text-blue-300';
    if (key === 'users') return 'bg-cyan-600/20 text-cyan-300';
    if (key === 'productos') return 'bg-indigo-600/20 text-indigo-300';
    if (key === 'categorias') return 'bg-violet-600/20 text-violet-300';
    if (key === 'clientes') return 'bg-blue-600/20 text-blue-300';
    if (key === 'ventas') return 'bg-emerald-600/20 text-emerald-300';
    if (key === 'pedidos') return 'bg-rose-600/20 text-rose-300';
    if (key === 'web') return 'bg-cyan-600/20 text-cyan-300';
    return 'bg-blue-600/20 text-blue-300';
  };

  const ToggleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <aside className={`${asideClass} shrink-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border-r border-white/10 text-gray-200 transition-all duration-200 flex flex-col relative z-50`}>
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded object-cover border border-white/20 ring-2 ring-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-white/10">
              {(companyName || 'P').charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`${textClass} text-lg font-semibold text-white`}>{companyName || 'Panel'}</div>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded hover:bg-gray-800"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <ToggleIcon />
        </button>
      </div>
      <div className="px-4 py-2 border-b border-white/10">
        <div className={`${textClass} text-xs text-gray-300 flex items-center gap-2`}>
          <span>Panel {role === 'super_admin' ? 'Super Administrador' : role === 'admin' ? 'Administrador' : 'Empleado'}</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border border-white/10 bg-blue-600/15 text-blue-300 text-[11px]`}>
            {role}
          </span>
        </div>
      </div>
      <nav className="p-2 space-y-1">
        <button
          className={`${itemBase} ${view === 'dashboard' ? activeClass : ''}`}
          onClick={() => setView('dashboard')}
          title="Dashboard"
        >
          {view === 'dashboard' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('dashboard')} ${view === 'dashboard' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="dashboard" className="w-5 h-5" />
          </span>
          <span className={textClass}>Dashboard</span>
          <span className={tooltipClass}>Dashboard</span>
        </button>
        <button
          className={`${itemBase} ${view === 'users' ? activeClass : ''}`}
          onClick={() => setView('users')}
          disabled={role !== 'admin' && role !== 'super_admin'}
          title="Usuarios"
        >
          {view === 'users' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('users')} ${view === 'users' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="users" className="w-5 h-5" />
          </span>
          <span className={`${textClass} ${role !== 'admin' && role !== 'super_admin' ? 'opacity-50' : ''}`}>Usuarios</span>
          <span className={tooltipClass}>Usuarios</span>
        </button>
        <button
          className={`${itemBase} ${view === 'productos' ? activeClass : ''}`}
          onClick={() => setView('productos')}
          title="Productos"
        >
          {view === 'productos' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('productos')} ${view === 'productos' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="products" className="w-5 h-5" />
          </span>
          <span className={textClass}>Productos</span>
          <span className={tooltipClass}>Productos</span>
        </button>
        <button
          className={`${itemBase} ${view === 'categorias' ? activeClass : ''}`}
          onClick={() => setView('categorias')}
          title="Categorías"
        >
          {view === 'categorias' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('categorias')} ${view === 'categorias' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="categories" className="w-5 h-5" />
          </span>
          <span className={textClass}>Categorías</span>
          <span className={tooltipClass}>Categorías</span>
        </button>
        <button
          className={`${itemBase} ${view === 'clientes' ? activeClass : ''}`}
          onClick={() => setView('clientes')}
          title="Clientes"
        >
          {view === 'clientes' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('clientes')} ${view === 'clientes' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="clients" className="w-5 h-5" />
          </span>
          <span className={textClass}>Clientes</span>
          {clientsStats?.total > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-blue-600 text-white text-xs">
              {clientsStats.total}
            </span>
          )}
          <span className={tooltipClass}>Clientes</span>
        </button>
        <button
          className={`${itemBase} ${view === 'ventas' ? activeClass : ''}`}
          onClick={() => setView('ventas')}
          title="Ventas"
        >
          {view === 'ventas' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('ventas')} ${view === 'ventas' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="sales" className="w-5 h-5" />
          </span>
          <span className={textClass}>Ventas</span>
          {(salesStats?.today_sales || salesStats?.total_sales) ? (
            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-xs">
              {salesStats?.today_sales ?? salesStats?.total_sales}
            </span>
          ) : null}
          <span className={tooltipClass}>Ventas</span>
        </button>
        <button
          className={`${itemBase} ${view === 'pedidos' ? activeClass : ''}`}
          onClick={() => setView('pedidos')}
          title="Pedidos"
        >
          {view === 'pedidos' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('pedidos')} ${view === 'pedidos' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="orders" className="w-5 h-5" />
          </span>
          <span className={textClass}>Pedidos</span>
          {orderNotif > 0 && (
            <span className="absolute right-2 top-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-blue-600 text-white text-xs">{orderNotif}</span>
          )}
          <span className={tooltipClass}>Pedidos</span>
        </button>
        <button
          className={`${itemBase} ${view === 'web' ? activeClass : ''}`}
          onClick={() => setView('web')}
          title="Página web"
        >
          {view === 'web' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-9 rounded-md flex items-center justify-center ${toneClasses('web')} ${view === 'web' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="web" className="w-5 h-5" />
          </span>
          <span className={textClass}>Página web</span>
          <span className={tooltipClass}>Página web</span>
        </button>
      </nav>
      <div className="mt-auto p-2">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          onClick={onSignOut}
          title="Cerrar sesión"
        >
          <Icon name="logout" />
          <span className={textClass}>Cerrar sesión</span>
          <span className={tooltipClass}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

const KPI = ({ label, value, delta, positive }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-2xl font-semibold text-white mt-1">{value}</div>
    {typeof delta !== 'undefined' && (
      <div className={`text-xs mt-1 ${positive ? 'text-green-300' : 'text-red-300'}`}>{positive ? '▲' : '▼'} {delta}%</div>
    )}
  </div>
);

const StatCard = ({ label, value, delta, positive, icon, tone = 'blue' }) => {
  const toneBg = tone === 'emerald'
    ? 'bg-emerald-600/20 text-emerald-300'
    : tone === 'indigo'
    ? 'bg-indigo-600/20 text-indigo-300'
    : tone === 'violet'
    ? 'bg-violet-600/20 text-violet-300'
    : tone === 'rose'
    ? 'bg-rose-600/20 text-rose-300'
    : tone === 'cyan'
    ? 'bg-cyan-600/20 text-cyan-300'
    : 'bg-blue-600/20 text-blue-300';
  return (
    <div className="group relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition shadow-sm hover:shadow-md">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 to-transparent transition" />
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneBg}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
          {typeof delta !== 'undefined' && (
            <div className={`text-xs mt-1 ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>{positive ? '▲' : '▼'} {delta}%</div>
          )}
        </div>
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data }) => {
  const points = useMemo(() => {
    const w = 300, h = 100, max = Math.max(...data), min = Math.min(...data);
    const xStep = w / (data.length - 1);
    return data
      .map((d, i) => {
        const x = i * xStep;
        const y = h - ((d - min) / (max - min || 1)) * h;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);
  return (
    <svg viewBox="0 0 300 100" className="w-full h-24">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
    </svg>
  );
};

const SimpleBarChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="w-6 bg-indigo-500/70" style={{ height: `${(d / (max || 1)) * 100}%` }} />
      ))}
    </div>
  );
};

const ChartsPanel = ({ seriesA, seriesB }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="text-sm text-gray-200 font-medium mb-2">Tendencia de actividad</div>
      <SimpleLineChart data={seriesA} />
    </div>
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="text-sm text-gray-200 font-medium mb-2">Distribución por departamentos</div>
      <SimpleBarChart data={seriesB} />
    </div>
  </div>
);

const UsersManager = ({ token, apiBase, role, createSignal }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', department: '', position: '', password: '' });
  const [openCreate, setOpenCreate] = useState(false);
  const [saUsername, setSaUsername] = useState('');
  const [saPassword, setSaPassword] = useState('');
  const [saRole, setSaRole] = useState('admin');
  const [saCreating, setSaCreating] = useState(false);
  const [saMsg, setSaMsg] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [saTenantId, setSaTenantId] = useState('');
  const [showSAForm, setShowSAForm] = useState(false);
  const labels = {
    username: 'Usuario',
    password: 'Contraseña',
    first_name: 'Nombre',
    last_name: 'Apellido',
    email: 'Correo electrónico',
    department: 'Departamento',
    position: 'Cargo',
  };

  const authHeaders = (tkn) => ({ 'Content-Type': 'application/json', ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadEmployees = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/users/api/users/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar usuarios');
      setEmployees(data);
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token && role === 'admin') loadEmployees(); }, [token, role]);
  useEffect(() => { if (token && role === 'super_admin') { fetch(`${apiBase}/users/api/admin/tenants/`, { headers: authHeaders(token) }).then((res) => res.json().then((d) => ({ ok: res.ok, d }))).then(({ ok, d }) => { if (ok && Array.isArray(d)) setTenants(d); }).catch(() => {}); } }, [token, role]);
  useEffect(() => { if (role === 'admin' && createSignal > 0) { setForm({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' }); setOpenCreate(true); } }, [createSignal, role]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createEmployee = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/users/api/users/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo crear el usuario');
      setMsg({ type: 'success', text: `Empleado ${data.username} creado` });
      setForm({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' });
      loadEmployees();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (id) => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/users/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'No se pudo eliminar');
      setMsg({ type: 'success', text: 'Empleado eliminado' });
      loadEmployees();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const startEdit = (emp) => {
    setMsg(null);
    setEditing(emp);
    setEditForm({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      email: emp.email || '',
      department: emp.department || '',
      position: emp.position || '',
      password: ''
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/users/${editing.id}/`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo actualizar');
      setMsg({ type: 'success', text: 'Empleado actualizado' });
      setEditing(null);
      loadEmployees();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const saCreateUser = async (e) => {
    e.preventDefault();
    setSaMsg(null);
    setSaCreating(true);
    try {
      const body = {
        username: saUsername,
        password: saPassword,
        role: saRole,
        first_name: editForm.first_name || '',
        last_name: editForm.last_name || '',
        email: editForm.email || '',
        phone: editForm.phone || '',
        department: editForm.department || '',
        position: editForm.position || '',
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
      setEditForm({ first_name: '', last_name: '', email: '', department: '', position: '', password: '' });
    } catch (e) {
      setSaMsg({ type: 'error', text: e.message });
    } finally {
      setSaCreating(false);
    }
  };

  if (role !== 'admin' && role !== 'super_admin') {
    return null;
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
          {msg.text}
        </div>
      )}
      {role === 'super_admin' && showSAForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Crear Administrador o Empleado</div>
              <button onClick={() => setShowSAForm(false)} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Cerrar</button>
            </div>
            {saMsg && (
              <div className={`mb-3 p-3 rounded text-sm ${saMsg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{saMsg.text}</div>
            )}
            <form onSubmit={saCreateUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <input type="text" value={saUsername} onChange={(e) => setSaUsername(e.target.value)} required minLength={4} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Usuario" />
              <input type="password" value={saPassword} onChange={(e) => setSaPassword(e.target.value)} required className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contraseña" />
              <select value={saRole} onChange={(e) => setSaRole(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="admin">Administrador</option>
                <option value="employer">Empleador</option>
                <option value="employee">Empleado</option>
              </select>
              {saRole === 'employee' && (
                <select value={saTenantId} onChange={(e) => setSaTenantId(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Seleccione tenant (administrador)</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.admin_username} ({t.id})</option>
                  ))}
                </select>
              )}
              <input type="text" name="first_name" value={editForm.first_name} onChange={handleEditChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Nombre" />
              <input type="text" name="last_name" value={editForm.last_name} onChange={handleEditChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Apellido" />
              <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Correo electrónico" />
              <input type="text" name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Teléfono" />
              <input type="text" name="department" value={editForm.department} onChange={handleEditChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Departamento" />
              <input type="text" name="position" value={editForm.position} onChange={handleEditChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Cargo" />
              <div className="sm:col-span-2 md:col-span-3 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowSAForm(false)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" disabled={saCreating} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50">{saCreating ? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {role === 'super_admin' && (
        <div className="flex items-center justify-end">
          <button onClick={() => setShowSAForm((v) => !v)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">
            {showSAForm ? 'Ocultar formulario' : 'Mostrar formulario'}
          </button>
        </div>
      )}
      
      {role === 'super_admin' && tenants.length > 0 && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">Administradores</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tenants.map((t) => (
              <StatCard key={t.id} label={t.admin_username} value={typeof t.users_count === 'number' ? t.users_count : '—'} icon="users" tone="indigo" />
            ))}
          </div>
        </div>
      )}

      {role === 'admin' && (
        <>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <div className="text-white font-medium mb-3">Estadísticas</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Empleados" value={empCount} icon="users" tone="cyan" />
              <StatCard label="Con correo" value={withEmail} icon="users" tone="blue" />
              <StatCard label="Con departamento" value={withDept} icon="categories" tone="violet" />
              <StatCard label="Departamentos" value={uniqueDept} icon="categories" tone="indigo" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Empleados</div>
              <div className="flex items-center gap-2">
                <button onClick={loadEmployees} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Recargar</button>
              </div>
            </div>
            <ul className="space-y-2">
              {employees.map((emp) => (
                <li key={emp.id} className="flex items-center justify-between bg-gray-700/40 border border-white/10 rounded-lg p-3 text-sm text-white hover:bg-gray-700/60 hover:border-white/20 transition">
                  <span className="flex-1 min-w-0">
                    <span className="font-medium">{emp.username}</span>
                    <span className="text-gray-300 ml-2 truncate">{emp.first_name} {emp.last_name}</span>
                    <span className="text-gray-400 ml-2 text-xs truncate">{emp.email}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(emp)} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white">Editar</button>
                    <button onClick={() => removeEmployee(emp.id)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
                  </div>
                </li>
              ))}
              {employees.length === 0 && (
                <li className="text-gray-300 text-sm">No hay empleados registrados.</li>
              )}
            </ul>
          </div>
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-lg">
            <div className="text-white font-medium mb-3">Editar usuario: {editing.username}</div>
            <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['first_name','last_name','email','department','position','password'].map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-300">{labels[field]}</span>
                  <input
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={editForm[field]}
                    onChange={handleEditChange}
                    className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={labels[field]}
                  />
                </div>
              ))}
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {openCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-lg">
            <div className="text-white font-medium mb-3">Nuevo usuario</div>
            <form onSubmit={(e) => { createEmployee(e); if (!loading) setOpenCreate(false); }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['username','password','first_name','last_name','email','department','position'].map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-300">{labels[field]}</span>
                  <input
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required={field === 'username' || field === 'password'}
                    className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={labels[field]}
                  />
                </div>
              ))}
              <div className="col-span-1 md:grid-cols-2 flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={() => setOpenCreate(false)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">{loading ? 'Creando...' : 'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardView = ({ stats, seriesA, seriesB }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Usuarios" value={stats.usersCount} icon="users" tone="cyan" />
      <StatCard label="Productos" value={stats.productsCount} icon="products" tone="indigo" />
      <StatCard label="Activos" value={stats.productsActive} icon="products" tone="emerald" />
      <StatCard label="Categorías" value={stats.categoriesCount} icon="categories" tone="violet" />
      <StatCard label="Clientes" value={stats.clientsTotal} icon="clients" tone="blue" />
      <StatCard label="Pedidos" value={stats.ordersTotal} icon="orders" tone="rose" />
    </div>
    <ChartsPanel seriesA={seriesA} seriesB={seriesB} />
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="text-sm text-gray-200 font-medium">Resumen</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <StatCard label="Nuevos clientes (mes)" value={stats.clientsNewMonth} icon="clients" tone="blue" />
        <StatCard label="Ventas hoy" value={stats.salesToday} icon="sales" tone="emerald" />
        <StatCard label="Ventas totales" value={stats.salesTotal} icon="sales" tone="indigo" />
        <StatCard label="Monto ventas" value={Number(stats.salesAmount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} icon="sales" tone="violet" />
      </div>
    </div>
  </div>
);

const Dashboard = ({ token, role, userId, onSignOut }) => {
  const apiBase = API_BASE_URL;
  const [view, setView] = useState('dashboard');
  const [orderNotif, setOrderNotif] = useState(0);
  const [navLoading, setNavLoading] = useState(false);
  const [productEditing, setProductEditing] = useState(null);
  const [createUserSignal, setCreateUserSignal] = useState(0);
  const [stats, setStats] = useState({ usersCount: 0, productsCount: 0, productsActive: 0, categoriesCount: 0, clientsTotal: 0, ordersTotal: 0, clientsNewMonth: 0, salesToday: 0, salesTotal: 0, salesAmount: 0 });
  const [seriesA, setSeriesA] = useState([3, 5, 4, 6, 8, 7, 9]);
  const [seriesB, setSeriesB] = useState([5, 3, 6, 2, 4, 7]);
  const [updateMsg, setUpdateMsg] = useState(null);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${apiBase}/users/api/users/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ),
      fetch(`${apiBase}/products/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ),
      fetch(`${apiBase}/products/categories/?page_size=1`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ),
      fetch(`${apiBase}/clients/stats/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ),
      fetch(`${apiBase}/sales/list/?page_size=1`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ),
      fetch(`${apiBase}/sales/stats/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ),
    ]).then(([usersRes, productsRes, catsRes, clientsStats, ordersRes, salesStats]) => {
      const usersCount = usersRes.ok && Array.isArray(usersRes.d) ? usersRes.d.length : 0;
      const products = productsRes.ok && Array.isArray(productsRes.d) ? productsRes.d : [];
      const productsCount = products.length;
      const productsActive = products.filter((p) => !!p.active).length;
      const categoriesCount = catsRes.ok ? Number(catsRes.d.count || 0) : 0;
      const clientsTotal = clientsStats.ok ? Number(clientsStats.d.total || 0) : 0;
      const clientsNewMonth = clientsStats.ok ? Number(clientsStats.d.new_this_month || 0) : 0;
      const ordersTotal = ordersRes.ok ? Number(ordersRes.d.count || 0) : 0;
      const salesToday = salesStats.ok ? Number(salesStats.d.today_sales || 0) : 0;
      const salesTotal = salesStats.ok ? Number(salesStats.d.total_sales || 0) : 0;
      const salesAmount = salesStats.ok ? Number(salesStats.d.total_amount || 0) : 0;
      setStats({ usersCount, productsCount, productsActive, categoriesCount, clientsTotal, ordersTotal, clientsNewMonth, salesToday, salesTotal, salesAmount });
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    let active = true;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const poll = () => {
      fetch(`${apiBase}/sales/notifications/count/`, { headers })
        .then((res) => res.json())
        .then((d) => { if (active) setOrderNotif(Number(d.unread || 0)); })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => { active = false; clearInterval(id); };
  }, [token]);

  useEffect(() => {
    const onChecking = () => setUpdateMsg({ type: 'info', text: 'Buscando actualizaciones...' });
    const onAvail = () => setUpdateMsg({ type: 'success', text: 'Actualización disponible. Descargando...' });
    const onDown = () => setUpdateMsg({ type: 'success', text: 'Actualización descargada. Se instalará al cerrar.' });
    const onNone = () => setUpdateMsg({ type: 'info', text: 'No hay actualizaciones disponibles.' });
    const onErr = () => setUpdateMsg({ type: 'error', text: 'Error al buscar actualizaciones.' });
    try {
      if (window.electronAPI) {
        window.electronAPI.onUpdateChecking(onChecking);
        window.electronAPI.onUpdateAvailable(onAvail);
        window.electronAPI.onUpdateDownloaded(onDown);
        window.electronAPI.onUpdateNone(onNone);
        window.electronAPI.onUpdateError(onErr);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (window.electronAPI && typeof window.electronAPI.getVersion === 'function') {
        window.electronAPI.getVersion().then((v) => setAppVersion(v || ''));
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex">
        <Sidebar view={view} setView={(v) => { setNavLoading(true); setView(v); setTimeout(() => setNavLoading(false), 800); if (v === 'pedidos') { const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }; fetch(`${apiBase}/sales/notifications/read/`, { method: 'POST', headers }).then(() => setOrderNotif(0)).catch(() => setOrderNotif(0)); } }} onSignOut={onSignOut} role={role} orderNotif={orderNotif} />
      <main className="flex-1 p-6 space-y-6 relative">
        {navLoading && (
          <div className="absolute inset-0 z-40 bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800/80 border border-white/10 rounded-xl p-5 shadow-xl text-center">
              <div className="mx-auto w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="mt-2 text-white text-sm">Cargando vista...</div>
            </div>
          </div>
        )}
        <div className={`${navLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">{view === 'dashboard' ? 'Dashboard' : view === 'users' ? 'Gestión de usuarios' : view === 'productos' ? 'Productos' : view === 'categorias' ? 'Categorías' : view === 'clientes' ? 'Clientes' : view === 'ventas' ? 'Ventas' : view === 'web' ? 'Página web' : 'Pedidos'}</h1>
            {view === 'dashboard' && (
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full bg-amber-600 text-white text-xs">
                Panel actualizado
              </span>
            )}
            {appVersion && (
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full bg-blue-600 text-white text-xs">v{appVersion}</span>
            )}
          </div>
          <div className="flex items-center gap-5">
              {view === 'users' && role === 'admin' && (
                <button onClick={() => setCreateUserSignal((n) => n + 1)} className="inline-flex items-center gap-3 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Agregar empleado
                </button>
              )}
              <div className="text-sm text-gray-300">Rol: <span className="font-medium">{role}</span></div>
              <button onClick={() => { try { if (window.electronAPI) { setUpdateMsg({ type: 'info', text: 'Buscando actualizaciones...' }); window.electronAPI.checkForUpdates(); } } catch {} }} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">
                Buscar actualizaciones
              </button>
              {/* Fallback si no hay eventos en 15s */}
              {updateMsg?.type === 'info' && updateMsg?.text?.includes('Buscando') && (
                <script dangerouslySetInnerHTML={{ __html: `setTimeout(function(){window.dispatchEvent(new CustomEvent('upd-fallback'))},15000);` }} />
              )}
          </div>
          {view === 'dashboard' && updateMsg && (
            <div className={`mt-3 p-3 rounded text-sm ${updateMsg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : updateMsg.type === 'error' ? 'bg-red-600/20 text-red-200 border border-red-500/40' : 'bg-blue-600/20 text-blue-200 border border-blue-500/40'}`}>
              {updateMsg.text}
            </div>
          )}
        </div>
        {view === 'dashboard' && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button onClick={() => setView('productos')} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-sm">Productos</button>
            <button onClick={() => setView('categorias')} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-sm">Categorías</button>
            <button onClick={() => setView('ventas')} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 shadow-sm">Ventas</button>
            <button onClick={() => setView('clientes')} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 shadow-sm">Clientes</button>
            <button onClick={() => setView('pedidos')} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-sm">Pedidos</button>
            <button onClick={() => setView('web')} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-700 hover:to-sky-600 shadow-sm">Página web</button>
          </div>
        )}
          {view === 'dashboard' && (
            <DashboardView stats={stats} seriesA={seriesA} seriesB={seriesB} />
          )}
        <React.Suspense fallback={<div className="text-white text-sm">Cargando módulo...</div>}>
          {view === 'users' && (
            <UsersManager token={token} apiBase={apiBase} role={role} createSignal={createUserSignal} />
          )}
          {view === 'productos' && (
            <ProductosManager
              token={token}
              apiBase={apiBase}
              onCreate={() => { setProductEditing(null); setView('producto_form'); }}
              onEdit={(p) => { setProductEditing(p); setView('producto_form'); }}
            />
          )}
          {view === 'producto_form' && (
            <ProductFormPage
              token={token}
              apiBase={apiBase}
              product={productEditing}
              onCancel={() => setView('productos')}
              onSaved={() => setView('productos')}
            />
          )}
          {view === 'categorias' && (
            <CategoriesManager token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'clientes' && (
            <ClientsPage token={token} apiBase={apiBase} />
          )}
          {view === 'ventas' && (
            <SalesPage token={token} apiBase={apiBase} onSaleCreated={() => setOrderNotif((n) => n + 1)} />
          )}
          {view === 'web' && (
            <WebPageManager token={token} apiBase={apiBase} adminId={userId} role={role} setView={(v) => setView(v)} setProductEditing={(p) => { setProductEditing(p); setView('producto_form'); }} />
          )}
          {view === 'pedidos' && (
            <OrdersPage token={token} apiBase={apiBase} />
          )}
        </React.Suspense>
        </main>
    </div>
  );
};

export default Dashboard;
  const empCount = employees.length;
  const withEmail = employees.filter((e) => !!e.email).length;
  const withDept = employees.filter((e) => !!e.department).length;
  const uniqueDept = new Set(employees.map((e) => e.department).filter(Boolean)).size;
