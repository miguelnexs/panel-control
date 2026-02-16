import React from 'react';
// Re-export fixed
import { ActivityChart, PerformanceChart } from './Charts';
import { 
  Users, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  MonitorCheck,
  Server,
  Database,
  Globe
} from 'lucide-react';

interface Stats {
  usersCount: number;
  productsCount: number;
  productsActive: number;
  categoriesCount: number;
  clientsTotal: number;
  ordersTotal: number;
  clientsNewMonth: number;
  salesToday: number;
  salesTotal: number;
  salesAmount: number;
  statusCounts: {
    pending: number;
    shipped: number;
    delivered: number;
    canceled: number;
  };
}

interface TopProduct {
  name: string;
  qty: number;
  amount: number;
}

interface DashboardViewProps {
  stats: Stats;
  seriesA: number[]; // Used for general activity
  seriesB: number[]; // Used for performance
  recentOrders: any[];
  topProducts: TopProduct[];
}

const StatCardV2: React.FC<{ 
  title: string; 
  value: string | number; 
  subValue?: string; 
  trend?: 'up' | 'down' | 'neutral'; 
  icon: React.ElementType; 
  color: string;
}> = ({ title, value, subValue, trend, icon: Icon, color }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/50 group">
    <div className={`absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${color} bg-opacity-10 text-opacity-100`}>
          <Icon size={20} className={color.replace('text-', 'text-').replace('bg-', '')} /> 
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
      </div>
      {trend && (
        <div className={`mt-2 flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          <span>{trend === 'up' ? '+12.5%' : trend === 'down' ? '-2.4%' : '0%'} vs mes anterior</span>
        </div>
      )}
    </div>
  </div>
);

const SystemHealthCard: React.FC<{ label: string; status: 'healthy' | 'warning' | 'error'; value: string; icon: React.ElementType }> = ({ label, status, value, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${status === 'healthy' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : status === 'warning' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500'}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</div>
        <div className="text-xs text-gray-500">Estado: {status === 'healthy' ? 'Óptimo' : status === 'warning' ? 'Revisar' : 'Crítico'}</div>
      </div>
    </div>
    <div className="text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ stats, seriesA, seriesB, topProducts }) => {
  // Mock data calculations for "Estadísticas clave de uso"
  const activeSessions = Math.floor(stats.usersCount * 0.8) + 2; 
  const avgSessionTime = "24m";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Section 1: Key Metrics & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardV2 
          title="Usuarios Activos" 
          value={stats.usersCount} 
          subValue={`+${stats.clientsNewMonth} nuevos`}
          trend="up"
          icon={Users}
          color="text-blue-400"
        />
        <StatCardV2 
          title="Sesiones Activas" 
          value={activeSessions}
          trend="up"
          icon={MonitorCheck}
          color="text-emerald-400"
        />
        <StatCardV2 
          title="Tiempo Promedio" 
          value={avgSessionTime}
          subValue="Por sesión"
          trend="down"
          icon={Clock}
          color="text-amber-400"
        />
        <StatCardV2 
          title="Ventas Totales" 
          value={Number(stats.salesAmount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
          trend="up"
          icon={Activity}
          color="text-purple-400"
        />
      </div>

      {/* Section 2: Charts & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad de la Plataforma</h3>
            <select className="bg-gray-100 dark:bg-gray-800 border-none text-xs text-gray-600 dark:text-gray-400 rounded-lg focus:ring-0 cursor-pointer">
              <option>Últimos 7 días</option>
              <option>Último mes</option>
            </select>
          </div>
          <div className="h-64">
            <ActivityChart data={seriesA} labels={['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']} />
          </div>
        </div>

        {/* System Health & Performance */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 h-full flex flex-col shadow-sm dark:shadow-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado del Sistema</h3>
            <div className="space-y-3 flex-1">
              <SystemHealthCard label="API Latency" status="healthy" value="45ms" icon={Globe} />
              <SystemHealthCard label="Database Load" status="healthy" value="12%" icon={Database} />
              <SystemHealthCard label="Server CPU" status="warning" value="68%" icon={Server} />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Rendimiento de Consultas</h4>
              <div className="h-32">
                 <PerformanceChart data={seriesB} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Aggregated Data (Top Products & Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm dark:shadow-none">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Productos Más Vendidos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">Producto</th>
                  <th className="px-6 py-3 text-right">Unidades</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-center">Tendencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-right">{product.qty}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium text-right">
                      {Number(product.amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs">
                        <ArrowUpRight size={12} className="mr-1" />
                        High
                      </div>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                   <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay datos disponibles</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Resumen de Pedidos</h3>
          <div className="space-y-6">
            {[
              { label: 'Completados', count: stats.statusCounts.delivered, color: 'bg-emerald-500', total: stats.ordersTotal },
              { label: 'Pendientes', count: stats.statusCounts.pending, color: 'bg-amber-500', total: stats.ordersTotal },
              { label: 'Enviados', count: stats.statusCounts.shipped, color: 'bg-blue-500', total: stats.ordersTotal },
              { label: 'Cancelados', count: stats.statusCounts.canceled, color: 'bg-rose-500', total: stats.ordersTotal },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color}`} 
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-gray-800/50 border border-blue-100 dark:border-gray-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Insight IA</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  Las ventas han aumentado un 15% en comparación con la semana pasada. Se recomienda reabastecer el inventario de la categoría principal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
