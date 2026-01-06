import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api.config';
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

interface DashboardProps {
  token: string | null;
  role: string;
  userId: number;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, role, userId, onSignOut }) => {
  const apiBase = API_BASE_URL;
  const [view, setView] = useState('dashboard');
  const [orderNotif, setOrderNotif] = useState(0);
  const [navLoading, setNavLoading] = useState(false);
  const [productEditing, setProductEditing] = useState<any>(null);
  const [stats, setStats] = useState({ usersCount: 0, productsCount: 0, productsActive: 0, categoriesCount: 0, clientsTotal: 0, ordersTotal: 0, clientsNewMonth: 0, salesToday: 0, salesTotal: 0, salesAmount: 0, statusCounts: { pending: 0, shipped: 0, delivered: 0, canceled: 0 } });
  const [seriesA, setSeriesA] = useState<number[]>([0,0,0,0,0,0,0]);
  const [seriesB, setSeriesB] = useState<number[]>([0,0,0,0,0,0]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [subscription, setSubscription] = useState<any>(null);

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
      // Placeholder for topProducts if not available
      setTopProducts([]); 

      setStats({ 
        usersCount, productsCount, productsActive, categoriesCount, clientsTotal, ordersTotal, 
        clientsNewMonth, salesToday, salesTotal, salesAmount,
        statusCounts: { pending: 0, shipped: 0, delivered: 0, canceled: 0 } // Default values as we don't have this data yet
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
    <div className="h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex overflow-hidden">
        <Sidebar 
          view={view} 
          setView={(v) => { 
            setNavLoading(true); 
            setView(v); 
            setTimeout(() => setNavLoading(false), 800); 
            if (v === 'pedidos') { 
              const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }; 
              fetch(`${apiBase}/sales/notifications/read/`, { method: 'POST', headers }).then(() => setOrderNotif(0)).catch(() => setOrderNotif(0)); 
            } 
          }} 
          onSignOut={onSignOut} 
          role={role} 
          orderNotif={orderNotif}
          token={token}
          apiBase={apiBase}
          subscription={subscription}
        />
      <main className="flex-1 p-6 space-y-6 relative overflow-y-auto">
        {navLoading && (
          <div className="absolute inset-0 z-40 bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800/80 border border-white/10 rounded-xl p-5 shadow-xl text-center">
              <div className="mx-auto w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="mt-2 text-white text-sm">Cargando vista...</div>
            </div>
          </div>
        )}
        <div className={`${navLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <div className="flex items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-white">
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
               'Pedidos'}
            </h1>
            <div className="text-sm text-gray-300">Rol: <span className="font-medium">{role}</span></div>
          </div>
          {view === 'dashboard' && (
            <DashboardView stats={stats} seriesA={seriesA} seriesB={seriesB} recentOrders={recentOrders} topProducts={topProducts} />
          )}
        <React.Suspense fallback={<div className="text-white text-sm">Cargando módulo...</div>}>
          {view === 'users' && (
            <UsersManager token={token} apiBase={apiBase} role={role} />
          )}
          {view === 'productos' && (
            <ProductosManager
              token={token}
              apiBase={apiBase}
              onCreate={() => { setProductEditing(null); setView('producto_form'); }}
              onEdit={(p: any) => { setProductEditing(p); setView('producto_form'); }}
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
            <WebPageManager token={token} apiBase={apiBase} adminId={userId} role={role} setView={(v: string) => setView(v)} setProductEditing={(p: any) => { setProductEditing(p); setView('producto_form'); }} />
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <div className="p-4 bg-gray-800 rounded-full mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Módulo de Servicios</h2>
              <p>Esta funcionalidad estará disponible próximamente.</p>
            </div>
          )}
        </React.Suspense>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
