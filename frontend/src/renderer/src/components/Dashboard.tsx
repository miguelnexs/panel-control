import React, { useEffect, useState } from 'react';
import DashboardView from './dashboard/DashboardView';
import Sidebar from './dashboard/Sidebar';
import SupportChatWidget from './dashboard/SupportChatWidget';

const ProductosManager = React.lazy(() => import('./ProductosManager'));
const ProductFormPage = React.lazy(() => import('./ProductFormPage'));
const CategoriesManager = React.lazy(() => import('./CategoriesManager'));
const SalesPage = React.lazy(() => import('./SalesPage'));
const SalesStatsPage = React.lazy(() => import('./SalesStatsPage'));
const OrdersPage = React.lazy(() => import('./OrdersPage'));
const ClientsPage = React.lazy(() => import('./ClientsPage'));
const WebProductsPage = React.lazy(() => import('./WebProductsPage'));
const WebCategoriesPage = React.lazy(() => import('./WebCategoriesPage'));
const WebOffersPage = React.lazy(() => import('./WebOffersPage'));
const WebUrlsPage = React.lazy(() => import('./WebUrlsPage'));
const WebPaymentsPage = React.lazy(() => import('./WebPaymentsPage'));
const WebShippingPage = React.lazy(() => import('./WebShippingPage'));
const TemplatesManager = React.lazy(() => import('./dashboard/TemplatesManager'));
const PlansManager = React.lazy(() => import('./dashboard/PlansManager'));
const ConfigProfilePage = React.lazy(() => import('./ConfigProfilePage'));
const ConfigCompanyPage = React.lazy(() => import('./ConfigCompanyPage'));
const ConfigPrinterPage = React.lazy(() => import('./ConfigPrinterPage'));
const ConfigGoogleApiPage = React.lazy(() => import('./ConfigGoogleApiPage'));
const CashboxPage = React.lazy(() => import('./CashboxPage'));
const ServicesPage = React.lazy(() => import('./ServicesPage'));
const FullServiceFormPage = React.lazy(() => import('./FullServiceFormPage'));
const ClientDetailsPage = React.lazy(() => import('./ClientDetailsPage'));
const UsersEmployeesPage = React.lazy(() => import('./dashboard/UsersEmployeesPage'));
const UsersPermissionsPage = React.lazy(() => import('./dashboard/UsersPermissionsPage'));
const UsersActivitiesPage = React.lazy(() => import('./dashboard/UsersActivitiesPage'));
const UsersStatsPage = React.lazy(() => import('./dashboard/UsersStatsPage'));

interface DashboardProps {
  token: string | null;
  role: string;
  userId: number;
  onSignOut: () => void;
  apiBase: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token, role, userId, onSignOut, apiBase }) => {
  const [view, setView] = useState('dashboard');
  const [orderNotif, setOrderNotif] = useState(0);
  const [navLoading, setNavLoading] = useState(false);
  const [productEditing, setProductEditing] = useState<any>(null);
  const [lastNet, setLastNet] = useState<{ method: string; path: string; ms: number; ok: boolean } | null>(null);
  const [stats, setStats] = useState({ usersCount: 0, clientsNewMonth: 0, ordersTotal: 0, salesAmount: 0, statusCounts: { pending: 0, shipped: 0, delivered: 0, canceled: 0 } });
  const [seriesA, setSeriesA] = useState<number[]>([0,0,0,0,0,0,0]);
  const [chartLabels, setChartLabels] = useState<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
  const [seriesB, setSeriesB] = useState<number[]>([0,0,0,0,0,0]);
  const [topProducts, setTopProducts] = useState([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [permissionsEnforced, setPermissionsEnforced] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [accessMsg, setAccessMsg] = useState<string | null>(null);

  const canAccess = (targetView: string): boolean => {
    if (role === 'admin' || role === 'super_admin') return true;
    if (!permissionsEnforced) return true;
    if (targetView === 'dashboard') return true;
    const map: Record<string, string | null> = {
      productos: 'view_products',
      producto_form: 'view_products',
      categorias: 'view_categories',
      clientes: 'view_clients',
      client_details: 'view_clients',
      ventas: 'create_sales',
      ventas_estadisticas: 'create_sales',
      caja: 'view_cashbox',
      pedidos: 'view_orders',
      servicios: 'view_services',
      service_form: 'view_services',
      web: 'view_web',
      web_productos: 'view_web',
      web_categorias: 'view_web',
      web_ofertas: 'view_web',
      web_urls: 'view_web',
      web_pagos: 'view_web',
      web_envios: 'view_web',
      configuracion: 'manage_settings',
      configuracion_empresa: 'manage_settings',
      configuracion_impresora: 'manage_settings',
      configuracion_google: 'manage_settings',
      users: 'manage_users',
      users_empleados: 'manage_users',
      users_permisos: 'manage_users',
      users_actividades: 'manage_users',
      users_estadisticas: 'manage_users',
    };
    const required = map[targetView];
    if (!required) return true;
    return permissions.includes(required);
  };

  const hasPermission = (perm: string): boolean => {
    if (role === 'admin' || role === 'super_admin') return true;
    if (!permissionsEnforced) return true;
    return permissions.includes(perm);
  };

  const permsUi = {
    products: {
      create: hasPermission('create_products'),
      edit: hasPermission('edit_products'),
      del: hasPermission('delete_products'),
    },
    categories: {
      create: hasPermission('create_categories'),
      edit: hasPermission('edit_categories'),
      del: hasPermission('delete_categories'),
    },
    clients: {
      create: hasPermission('create_clients'),
      edit: hasPermission('edit_clients'),
      del: hasPermission('delete_clients'),
    },
    sales: {
      create: hasPermission('create_sales'),
      edit: hasPermission('edit_sales'),
      del: hasPermission('delete_sales'),
    },
  };

  const navigate = (v: string) => {
    setAccessMsg(null);
    if (!canAccess(v)) {
      setAccessMsg('No tienes permiso para acceder a esta sección.');
      return;
    }
    setNavLoading(true);
    setView(v);
    setTimeout(() => setNavLoading(false), 800);
    if (v === 'pedidos') {
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      fetch(`${apiBase}/sales/notifications/read/`, { method: 'POST', headers }).then(() => setOrderNotif(0)).catch(() => setOrderNotif(0));
    }
  };

  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    Promise.all([
      fetch(`${apiBase}/users/api/auth/me/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: null })),
      fetch(`${apiBase}/users/api/users/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: [] })),
      fetch(`${apiBase}/clients/stats/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: { total: 0 } })),
      fetch(`${apiBase}/sales/stats/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: { today_sales: 0 } })),
    ]).then(([meRes, usersRes, clientsStats, salesStats]) => {
      if (meRes.ok && meRes.d && meRes.d.subscription) {
        setSubscription(meRes.d.subscription);
      }
      if (meRes.ok && meRes.d) {
        setPermissionsEnforced(Boolean(meRes.d.permissions_enforced));
        setPermissions(Array.isArray(meRes.d.permissions) ? meRes.d.permissions : []);
      }
      const usersCount = usersRes.ok && Array.isArray(usersRes.d) ? usersRes.d.length : 0;
      const clientsNewMonth = clientsStats.ok ? Number(clientsStats.d.new_this_month || 0) : 0;
      const ordersTotal = salesStats.ok && salesStats.d.status_counts ? Object.values(salesStats.d.status_counts).reduce((a: any, b: any) => a + b, 0) as number : 0;
      const salesAmount = salesStats.ok ? Number(salesStats.d.total_amount || 0) : 0;
      
      if (salesStats.ok && salesStats.d.top_products) {
        setTopProducts(salesStats.d.top_products);
      } else {
        setTopProducts([]);
      }

      const statusCounts = (salesStats.ok && salesStats.d.status_counts) ? salesStats.d.status_counts : { pending: 0, shipped: 0, delivered: 0, canceled: 0 };
      if (salesStats.ok && salesStats.d.chart_data) {
        setSeriesA(salesStats.d.chart_data);
      }
      if (salesStats.ok && salesStats.d.chart_amounts) {
        setSeriesB(salesStats.d.chart_amounts);
      }
      if (salesStats.ok && salesStats.d.chart_labels) {
        setChartLabels(salesStats.d.chart_labels);
      }

      setStats({ 
        usersCount, clientsNewMonth, ordersTotal, salesAmount,
        statusCounts: statusCounts
      });
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    let active = true;
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    let intervalId: ReturnType<typeof setInterval>;
    const poll = () => {
      fetch(`${apiBase}/sales/notifications/count/`, { headers })
        .then((res) => {
          if (res.status === 401) { active = false; clearInterval(intervalId); onSignOut(); return null; }
          return res.json();
        })
        .then((d) => { if (active && d) setOrderNotif(Number(d.unread || 0)); })
        .catch(() => {});
    };
    poll();
    intervalId = setInterval(poll, 3000);
    return () => { active = false; clearInterval(intervalId); };
  }, [token]);

  useEffect(() => {

    const originalFetch = window.fetch.bind(window);
    const ignore = (url: string, method: string) => {
      if (method === 'GET' && url.includes('/sales/notifications/count/')) return true;
      if (method === 'POST' && url.includes('/sales/notifications/read/')) return true;
      if (url.includes('/users/api/support/')) return true;
      if (url.includes('/health/')) return true;
      return false;
    };

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const started = performance.now();
      const method = String(init?.method || 'GET').toUpperCase();
      const url = typeof input === 'string' ? input : (input as any)?.url ? String((input as any).url) : String(input);

      try {
        const res = await originalFetch(input as any, init);
        const ms = Math.round(performance.now() - started);
        if (!ignore(url, method)) {
          const path = url.replace(apiBase, '');
          setLastNet({ method, path, ms, ok: res.ok });
        }
        return res;
      } catch (e) {
        const ms = Math.round(performance.now() - started);
        if (!ignore(url, method)) {
          const path = url.replace(apiBase, '');
          setLastNet({ method, path, ms, ok: false });
        }
        throw e;
      }
    }) as any;

    return () => {
      window.fetch = originalFetch as any;
    };
  }, [role, apiBase]);

  return (
    <div className="h-full bg-gradient-to-br from-blue-100 via-blue-50/50 to-blue-100 dark:bg-none dark:bg-[#0B0D14] flex overflow-hidden transition-colors duration-300">
        <Sidebar 
          view={view} 
          setView={navigate} 
          onSignOut={onSignOut} 
          role={role} 
          orderNotif={orderNotif}
          token={token}
          apiBase={apiBase}
          subscription={subscription}
          permissions={permissions}
          permissionsEnforced={permissionsEnforced}
        />
      <main className="flex-1 p-6 space-y-6 relative overflow-y-auto">
        {(role === 'admin' || role === 'super_admin') && (
          <SupportChatWidget token={token} apiBase={apiBase} role={role} userId={userId} />
        )}
        {navLoading && (
          <div className="absolute inset-0 z-40 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center backdrop-blur-sm transition-all">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-xl text-center">
              <div className="mx-auto w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="mt-2 text-gray-900 dark:text-white text-sm font-medium">Cargando vista...</div>
            </div>
          </div>
        )}
        <div className={`${navLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          {accessMsg && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm">
              {accessMsg}
            </div>
          )}
          <div className="flex items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {view === 'dashboard' ? 'Dashboard' : 
               view === 'users' || view === 'users_empleados' ? 'Usuarios / Empleados' :
               view === 'users_permisos' ? 'Usuarios / Permisos' :
               view === 'users_actividades' ? 'Usuarios / Actividades' :
               view === 'users_estadisticas' ? 'Usuarios / Estadísticas' :
               view === 'productos' ? 'Productos' : 
               view === 'producto_form' ? (productEditing ? 'Editar Producto' : 'Nuevo Producto') :
               view === 'categorias' ? 'Categorías' : 
               view === 'clientes' ? 'Clientes' : 
               view === 'ventas' ? 'Ventas' : 
               view === 'ventas_estadisticas' ? 'Ventas / Estadísticas' :
               view === 'web' || view === 'web_productos' ? 'Página web / Productos' :
               view === 'web_categorias' ? 'Página web / Categorías' :
               view === 'web_ofertas' ? 'Página web / Ofertas' :
               view === 'web_urls' ? 'Página web / URLs' :
               view === 'web_pagos' ? 'Página web / Pagos' :
               view === 'web_envios' ? 'Página web / Envíos' :
               view === 'planes' ? 'Planes de Suscripción' :
               view === 'configuracion' ? 'Configuración / Perfil' :
               view === 'configuracion_empresa' ? 'Configuración / Empresa' :
               view === 'configuracion_impresora' ? 'Configuración / Impresora' :
               view === 'configuracion_google' ? 'Configuración / Google API' :
               view === 'caja' ? 'Caja' :
               view === 'servicios' ? 'Servicios' :
               view === 'service_form' ? 'Nuevo Servicio' :
               view === 'client_details' ? 'Detalle del Cliente' :
               'Pedidos'}
            </h1>
            <div className="flex items-center gap-2">
              {lastNet && (
                <div className={`text-[11px] font-bold px-3 py-1 rounded-full border ${lastNet.ok ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20'}`}>
                  {lastNet.ms}ms
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Rol: <span className="text-gray-900 dark:text-white ml-1">{role}</span></div>
            </div>
          </div>
          {view === 'dashboard' && (
            <DashboardView stats={stats} seriesA={seriesA} seriesB={seriesB} topProducts={topProducts} chartLabels={chartLabels} />
          )}
        <React.Suspense fallback={<div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/> Cargando módulo...</div>}>
          {view === 'users' && (
            <UsersEmployeesPage token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'users_empleados' && (
            <UsersEmployeesPage token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'users_permisos' && (
            <UsersPermissionsPage token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'users_actividades' && (
            <UsersActivitiesPage token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'users_estadisticas' && (
            <UsersStatsPage token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'productos' && (
            <ProductosManager
              token={token}
              apiBase={apiBase}
              role={role}
              netInfo={lastNet}
              canCreate={permsUi.products.create}
              canEdit={permsUi.products.edit}
              canDelete={permsUi.products.del}
              canReorder={permsUi.products.edit}
              onCreate={() => { setProductEditing(null); navigate('producto_form'); }}
              onEdit={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'producto_form' && (
            <ProductFormPage
              token={token}
              apiBase={apiBase}
              product={productEditing}
              onCancel={() => navigate('productos')}
              onSaved={() => navigate('productos')}
            />
          )}
          {view === 'categorias' && (
            <CategoriesManager
              token={token}
              apiBase={apiBase}
              role={role}
              netInfo={lastNet}
              canCreate={permsUi.categories.create}
              canEdit={permsUi.categories.edit}
              canDelete={permsUi.categories.del}
              canReorder={permsUi.categories.edit}
            />
          )}
          {view === 'clientes' && (
            <ClientsPage 
              token={token} 
              apiBase={apiBase} 
              canCreate={permsUi.clients.create}
              canEdit={permsUi.clients.edit}
              canDelete={permsUi.clients.del}
              onViewClient={(client: any) => {
                setSelectedClient(client);
                navigate('client_details');
              }}
            />
          )}
          {view === 'client_details' && selectedClient && (
            <ClientDetailsPage
              token={token}
              apiBase={apiBase}
              client={selectedClient}
              onBack={() => {
                setSelectedClient(null);
                navigate('clientes');
              }}
            />
          )}
          {view === 'ventas' && (
            <SalesPage token={token} apiBase={apiBase} onSaleCreated={() => setOrderNotif((n) => n + 1)} />
          )}
          {view === 'ventas_estadisticas' && (
            <SalesStatsPage token={token} apiBase={apiBase} role={role} />
          )}
          {(view === 'web' || view === 'web_productos') && (
            <WebProductsPage
              token={token}
              apiBase={apiBase}
              adminId={userId}
              role={role}
              setView={(v: string) => navigate(v)}
              setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'web_categorias' && (
            <WebCategoriesPage
              token={token}
              apiBase={apiBase}
              adminId={userId}
              role={role}
              setView={(v: string) => navigate(v)}
              setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'web_ofertas' && (
            <WebOffersPage
              token={token}
              apiBase={apiBase}
              adminId={userId}
              role={role}
              setView={(v: string) => navigate(v)}
              setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'web_urls' && (
            <WebUrlsPage
              token={token}
              apiBase={apiBase}
              adminId={userId}
              role={role}
              setView={(v: string) => navigate(v)}
              setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'web_pagos' && (
            <WebPaymentsPage
              token={token}
              apiBase={apiBase}
              adminId={userId}
              role={role}
              setView={(v: string) => navigate(v)}
              setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'web_envios' && (
            <WebShippingPage
              token={token}
              apiBase={apiBase}
              adminId={userId}
              role={role}
              setView={(v: string) => navigate(v)}
              setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }}
            />
          )}
          {view === 'plantillas' && (
            <TemplatesManager />
          )}
          {view === 'pedidos' && (
            <OrdersPage token={token} apiBase={apiBase} />
          )}
          {view === 'planes' && (
            <PlansManager token={token} role={role} />
          )}
          {view === 'configuracion' && (
            <ConfigProfilePage token={token} apiBase={apiBase} />
          )}
          {view === 'configuracion_empresa' && (
            <ConfigCompanyPage token={token} apiBase={apiBase} />
          )}
          {view === 'configuracion_impresora' && (
            <ConfigPrinterPage token={token} apiBase={apiBase} />
          )}
          {view === 'configuracion_google' && (
            <ConfigGoogleApiPage token={token} apiBase={apiBase} />
          )}
          {view === 'caja' && (
            <CashboxPage token={token} apiBase={apiBase} />
          )}
          {view === 'servicios' && (
            <ServicesPage 
              token={token} 
              apiBase={apiBase} 
              onCreate={() => navigate('service_form')}
            />
          )}
          {view === 'service_form' && (
            <FullServiceFormPage
              token={token}
              apiBase={apiBase}
              onCancel={() => navigate('servicios')}
              onSaved={() => navigate('servicios')}
            />
          )}
        </React.Suspense>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
