import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, DollarSign, RefreshCw, ShoppingCart, TrendingUp, Award, Package, Receipt, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SalesStatsPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface SalesStatsResponse {
  total_sales: number;
  total_amount: string;
  today_sales: number;
  month_sales: number;
  trend?: {
    last7_sales: number;
    prev7_sales: number;
    sales_pct: number | null;
    last7_amount: string;
    prev7_amount: string;
    amount_pct: number | null;
  };
  chart_data: number[];
  chart_amounts: number[];
  chart_labels: string[];
  top_products: Array<{
    product_id: number | null;
    name: string;
    image?: string;
    qty: number;
    amount: string;
  }>;
  best_product: {
    product_id: number | null;
    name: string;
    image?: string;
    qty: number;
    amount: string;
  } | null;
  top_seller: { username: string; sales: number } | null;
}

const SalesStatsPage: React.FC<SalesStatsPageProps> = ({ token, apiBase: rawApiBase, role }) => {
  const apiBase = rawApiBase.replace(/\/$/, '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [stats, setStats] = useState<SalesStatsResponse | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: number; admin_username: string }>>([]);
  const [tenantId, setTenantId] = useState<string>('');
  const [chartMode, setChartMode] = useState<'amounts' | 'counts'>('amounts');

  const authHeaders = (tkn: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
  });

  const mediaUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const formatCurrency = (v: number | string) => {
    const n = Number(v || 0);
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
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
    if (!token) return;
    setMsg(null);
    if (role === 'super_admin' && !tenantId) {
      setMsg({ type: 'error', text: 'Selecciona un tenant para ver estadísticas.' });
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (role === 'super_admin' && tenantId) qs.set('tenant_id', tenantId);
      const url = qs.toString() ? `${apiBase}/sales/stats/?${qs.toString()}` : `${apiBase}/sales/stats/`;
      const res = await fetch(url, { headers: authHeaders(token) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'No se pudieron cargar estadísticas');
      setStats(data as SalesStatsResponse);
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

  const maxAmount = useMemo(() => {
    const list = stats?.chart_amounts || [];
    return Math.max(1, ...list.map((n) => Number(n) || 0));
  }, [stats]);

  const maxCount = useMemo(() => {
    const list = stats?.chart_data || [];
    return Math.max(1, ...list.map((n) => Number(n) || 0));
  }, [stats]);

  const avgTicket = useMemo(() => {
    if (!stats || !stats.total_sales || !Number(stats.total_amount)) return 0;
    return Number(stats.total_amount) / stats.total_sales;
  }, [stats]);

  const topProductsTotalQty = useMemo(() => {
    return (stats?.top_products || []).reduce((acc, p) => acc + Number(p.qty || 0), 0);
  }, [stats]);

  const trendBadge = (pct: number | null | undefined) => {
    if (pct == null) return null;
    const val = Number(pct);
    const pos = val >= 0;
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold border ${pos ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'}`}>
        {pos ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
        {pos ? '+' : ''}{val.toFixed(1)}%
      </span>
    );
  };

  if (role !== 'admin' && role !== 'super_admin') return null;

  return (
    <div className="space-y-8 pb-8">
      {msg && (
        <div className={`p-4 md:p-5 rounded-2xl text-sm flex items-center gap-3.5 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          {msg.text}
        </div>
      )}

      {/* Main Header Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-7 border-b border-gray-200/80 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-500/10">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Panel de Rendimiento y Ventas</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Resumen analítico e indicadores clave del negocio</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {role === 'super_admin' && (
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-sm"
              >
                <option value="">Selecciona tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.admin_username || `Tenant ${t.id}`}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={load}
              className="px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-2xl transition-all flex items-center gap-2 shadow-sm"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Ingresos Totales</span>
                {trendBadge(stats?.trend?.amount_pct)}
              </div>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {stats ? formatCurrency(stats.total_amount) : '—'}
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">Acumulado facturado</p>
              </div>
            </div>

            {/* Total Sales Orders */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ventas Totales</span>
                {trendBadge(stats?.trend?.sales_pct)}
              </div>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {stats?.total_sales ?? '—'} <span className="text-xs font-medium text-gray-500 dark:text-gray-400">pedidos</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {stats ? `${stats.today_sales} hoy • ${stats.month_sales} este mes` : '—'}
                </p>
              </div>
            </div>

            {/* Average Ticket */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/60 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10 border border-purple-100 dark:border-purple-900/40 flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Ticket Promedio</span>
                <Receipt className="w-5 h-5 text-purple-500 opacity-60" />
              </div>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {formatCurrency(avgTicket)}
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">Promedio por orden</p>
              </div>
            </div>

            {/* Performance Status */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-100 dark:border-amber-900/40 flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Ventas de Hoy</span>
                <TrendingUp className="w-5 h-5 text-amber-500 opacity-60" />
              </div>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {stats?.today_sales ?? '—'} <span className="text-xs font-medium text-gray-500 dark:text-gray-400">órdenes</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">Registradas el día de hoy</p>
              </div>
            </div>
          </div>

          {/* Highlights & Star Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Producto Estrella Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Award className="w-4.5 h-4.5" />
                    <span>Producto Estrella</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-200 dark:border-emerald-800">
                    Más Vendido
                  </span>
                </div>

                {stats?.best_product ? (
                  <div className="flex items-center gap-4 py-1">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {stats.best_product.image ? (
                        <img src={mediaUrl(stats.best_product.image)} alt={stats.best_product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{stats.best_product.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {stats.best_product.qty} unidades
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(stats.best_product.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center">Sin datos de productos</p>
                )}
              </div>
            </div>

            {/* Vendedor Principal Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <Users className="w-4.5 h-4.5" />
                    <span>Líder de Ventas</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold border border-blue-200 dark:border-blue-800">
                    Top Asesor
                  </span>
                </div>

                {stats?.top_seller ? (
                  <div className="flex items-center gap-4 py-1">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center shrink-0 uppercase border border-blue-200 dark:border-blue-800 shadow-xs">
                      {stats.top_seller.username.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{stats.top_seller.username}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                        {stats.top_seller.sales} órdenes registradas
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center">Sin datos de asesores</p>
                )}
              </div>
            </div>

            {/* Comparativa 7 Días */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    <TrendingUp className="w-4.5 h-4.5" />
                    <span>Tendencia 7 Días</span>
                  </div>
                  {trendBadge(stats?.trend?.sales_pct)}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Últimos 7 días</span>
                    <p className="text-base font-black text-gray-900 dark:text-white mt-1">{stats?.trend?.last7_sales ?? 0} ordenes</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{formatCurrency(stats?.trend?.last7_amount || 0)}</p>
                  </div>
                  <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">7 días previos</span>
                    <p className="text-base font-black text-gray-500 dark:text-gray-400 mt-1">{stats?.trend?.prev7_sales ?? 0} ordenes</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{formatCurrency(stats?.trend?.prev7_amount || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Comportamiento Diario de Ventas (Últimos 14 días)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Visualización temporal de ingresos y volumen de pedidos</p>
              </div>

              <div className="inline-flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setChartMode('amounts')}
                  className={`px-4 py-2 rounded-xl transition-all ${chartMode === 'amounts' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                >
                  Monto Facturado
                </button>
                <button
                  onClick={() => setChartMode('counts')}
                  className={`px-4 py-2 rounded-xl transition-all ${chartMode === 'counts' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                >
                  Número de Pedidos
                </button>
              </div>
            </div>

            {chartMode === 'amounts' ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-end gap-2.5 h-52 pt-8">
                  {(stats?.chart_amounts || []).map((v, i) => {
                    const numVal = Number(v || 0);
                    const pct = Math.max((numVal / maxAmount) * 100, 3);
                    const label = stats?.chart_labels?.[i] || '';
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all cursor-pointer relative"
                          style={{ height: `${pct}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            {label}: {formatCurrency(numVal)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 pt-2">
                  <span>{stats?.chart_labels?.[0] || ''}</span>
                  <span>{stats?.chart_labels?.[Math.floor((stats?.chart_labels?.length || 1) / 2)] || ''}</span>
                  <span>{stats?.chart_labels?.[(stats?.chart_labels?.length || 1) - 1] || ''}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex items-end gap-2.5 h-52 pt-8">
                  {(stats?.chart_data || []).map((v, i) => {
                    const numVal = Number(v || 0);
                    const pct = Math.max((numVal / maxCount) * 100, 3);
                    const label = stats?.chart_labels?.[i] || '';
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all cursor-pointer relative"
                          style={{ height: `${pct}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            {label}: {numVal} pedidos
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 pt-2">
                  <span>{stats?.chart_labels?.[0] || ''}</span>
                  <span>{stats?.chart_labels?.[Math.floor((stats?.chart_labels?.length || 1) / 2)] || ''}</span>
                  <span>{stats?.chart_labels?.[(stats?.chart_labels?.length || 1) - 1] || ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ranking of Top Products Breakdown */}
          {stats?.top_products && stats.top_products.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Ranking de Productos Más Vendidos</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Participación sobre el volumen total facturado</p>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl">
                  Top {Math.min(stats.top_products.length, 6)} artículos
                </span>
              </div>

              <div className="space-y-4">
                {stats.top_products.slice(0, 6).map((item, index) => {
                  const sharePct = topProductsTotalQty > 0 ? Math.round((Number(item.qty || 0) / topProductsTotalQty) * 100) : 0;
                  const rankColors = [
                    'bg-amber-500 text-white shadow-xs',
                    'bg-slate-400 text-white shadow-xs',
                    'bg-amber-700 text-white shadow-xs',
                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  ];
                  const rankBg = rankColors[index] || rankColors[3];

                  return (
                    <div key={`${item.name}-${index}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all">
                      <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${rankBg}`}>
                        {index + 1}
                      </span>

                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {item.image ? (
                          <img src={mediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</span>
                          <span className="text-xs font-extrabold text-gray-900 dark:text-white ml-3 shrink-0">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200/70 dark:bg-gray-700/70 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${sharePct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 shrink-0">{item.qty} un. ({sharePct}%)</span>
                        </div>
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
  );
};

export default SalesStatsPage;
