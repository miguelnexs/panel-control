import React, { useEffect, useState } from 'react';
import DashboardView from './dashboard/DashboardView';
import Sidebar from './dashboard/Sidebar';
import UsersManager from './dashboard/UsersManager';

const ProductosManager = React.lazy(() => import('./ProductosManager'));
const ProductFormPage = React.lazy(() => import('./ProductFormPage'));
const CategoriesManager = React.lazy(() => import('./CategoriesManager'));
const SalesPage = React.lazy(() => import('./SalesPage'));
const OrdersPage = React.lazy(() => import('./OrdersPage'));
const ClientsPage = React.lazy(() => import('./ClientsPage'));
const WebPageManager = React.lazy(() => import('./WebPageManager'));
const TemplatesManager = React.lazy(() => import('./dashboard/TemplatesManager'));
const PlansManager = React.lazy(() => import('./dashboard/PlansManager'));
const ConfigPage = React.lazy(() => import('./ConfigPage'));
const CashboxPage = React.lazy(() => import('./CashboxPage'));
const ServicesPage = React.lazy(() => import('./ServicesPage'));
const FullServiceFormPage = React.lazy(() => import('./FullServiceFormPage'));
const ClientDetailsPage = React.lazy(() => import('./ClientDetailsPage'));

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
  const [stats, setStats] = useState({ usersCount: 0, productsCount: 0, productsActive: 0, categoriesCount: 0, clientsTotal: 0, ordersTotal: 0, clientsNewMonth: 0, salesToday: 0, salesTotal: 0, salesAmount: 0, statusCounts: { pending: 0, shipped: 0, delivered: 0, canceled: 0 } });
  const [seriesA, setSeriesA] = useState<number[]>([0,0,0,0,0,0,0]);
  const [chartLabels, setChartLabels] = useState<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
  const [seriesB, setSeriesB] = useState<number[]>([0,0,0,0,0,0]);
  const [recentOrders, setRecentOrders] = useState([]);
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
      caja: 'view_cashbox',
      pedidos: 'view_orders',
      servicios: 'view_services',
      service_form: 'view_services',
      web: 'view_web',
      configuracion: 'manage_settings',
      users: 'manage_users',
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
      fetch(`${apiBase}/products/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: [] })),
      fetch(`${apiBase}/products/categories/?page_size=1`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: { count: 0 } })),
      fetch(`${apiBase}/clients/stats/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: { total: 0 } })),
      fetch(`${apiBase}/sales/list/?page_size=5`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: { results: [] } })),
      fetch(`${apiBase}/sales/stats/`, { headers }).then((res) => res.json().then((d) => ({ ok: res.ok, d })) ).catch(() => ({ ok: false, d: { today_sales: 0 } })),
    ]).then(([meRes, usersRes, productsRes, catsRes, clientsStats, ordersRes, salesStats]) => {
      if (meRes.ok && meRes.d && meRes.d.subscription) {
        setSubscription(meRes.d.subscription);
      }
      if (meRes.ok && meRes.d) {
        setPermissionsEnforced(Boolean(meRes.d.permissions_enforced));
        setPermissions(Array.isArray(meRes.d.permissions) ? meRes.d.permissions : []);
      }
      const usersCount = usersRes.ok && Array.isArray(usersRes.d) ? usersRes.d.length : 0;
      const products = productsRes.ok && Array.isArray(productsRes.d) ? productsRes.d : [];
      const productsCount = products.length;
      const productsActive = products.filter((p: any) => !!p.active).length;
      const categoriesCount = catsRes.ok ? Number(catsRes.d.count || 0) : 0;
      const clientsTotal = clientsStats.ok ? Number(clientsStats.d.total || 0) : 0;
      const clientsNewMonth = clientsStats.ok ? Number(clientsStats.d.new_this_month || 0) : 0;
      const ordersTotal = ordersRes.ok ? Number(ordersRes.d.count || 0) : 0;
      const salesToday = salesStats.ok ? Number(salesStats.d.today_sales || 0) : 0;
      const salesTotal = salesStats.ok ? Number(salesStats.d.total_sales || 0) : 0;
      const salesAmount = salesStats.ok ? Number(salesStats.d.total_amount || 0) : 0;
      
      setRecentOrders(ordersRes.ok && Array.isArray(ordersRes.d.results) ? ordersRes.d.results : []);
      
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
        usersCount, productsCount, productsActive, categoriesCount, clientsTotal, ordersTotal, 
        clientsNewMonth, salesToday, salesTotal, salesAmount,
        statusCounts: statusCounts
      });
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    let active = true;
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
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
               view === 'users' ? 'Gestión de usuarios' : 
               view === 'productos' ? 'Productos' : 
               view === 'producto_form' ? (productEditing ? 'Editar Producto' : 'Nuevo Producto') :
               view === 'categorias' ? 'Categorías' : 
               view === 'clientes' ? 'Clientes' : 
               view === 'ventas' ? 'Ventas' : 
               view === 'web' ? 'Página web' : 
               view === 'planes' ? 'Planes de Suscripción' :
               view === 'configuracion' ? 'Configuración' :
               view === 'caja' ? 'Caja' :
               view === 'servicios' ? 'Servicios' :
               view === 'service_form' ? 'Nuevo Servicio' :
               view === 'client_details' ? 'Detalle del Cliente' :
               'Pedidos'}
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Rol: <span className="text-gray-900 dark:text-white ml-1">{role}</span></div>
          </div>
          {view === 'dashboard' && (
            <DashboardView stats={stats} seriesA={seriesA} seriesB={seriesB} recentOrders={recentOrders} topProducts={topProducts} chartLabels={chartLabels} />
          )}
        <React.Suspense fallback={<div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/> Cargando módulo...</div>}>
          {view === 'users' && (
            <UsersManager token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'productos' && (
            <ProductosManager
              token={token}
              apiBase={apiBase}
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
          {view === 'web' && (
            <WebPageManager token={token} apiBase={apiBase} adminId={userId} role={role} setView={(v: string) => navigate(v)} setProductEditing={(p: any) => { setProductEditing(p); navigate('producto_form'); }} />
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
            <ConfigPage token={token} apiBase={apiBase} />
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
