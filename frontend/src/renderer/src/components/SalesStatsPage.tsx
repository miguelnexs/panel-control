import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, DollarSign, RefreshCw, ShoppingCart } from 'lucide-react';

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

  const bestRingPct = useMemo(() => {
    const bestQty = Number(stats?.best_product?.qty || 0);
    const sum = (stats?.top_products || []).reduce((acc, p) => acc + Number(p.qty || 0), 0);
    if (!bestQty || !sum) return 0;
    return Math.max(0, Math.min(100, Math.round((bestQty / sum) * 100)));
  }, [stats]);

  const topDonut = useMemo(() => {
    const items = (stats?.top_products || []).slice(0, 5);
    const totalQty = items.reduce((acc, p) => acc + Number(p.qty || 0), 0);
    const palette = ['#f97316', '#22c55e', '#ef4444', '#0ea5e9', '#a855f7'];
    const base = 'rgba(148, 163, 184, 0.18)';
    if (!totalQty) return { totalQty: 0, items: [], background: `conic-gradient(${base} 0deg 360deg)` };

    let cur = 0;
    const gap = 3;
    const segs = items.map((p, i) => {
      const isLast = i === items.length - 1;
      const span = isLast ? 360 - cur : (Number(p.qty || 0) / totalQty) * 360;
      const start = cur;
      const end = Math.max(start, start + Math.max(0, span - gap));
      cur = start + span;
      return {
        name: p.name,
        qty: Number(p.qty || 0),
        amount: p.amount,
        color: palette[i % palette.length],
        start,
        end,
        next: cur,
      };
    });
    const stops: string[] = [];
    for (const s of segs) {
      stops.push(`${s.color} ${s.start}deg ${s.end}deg`, `${base} ${s.end}deg ${s.next}deg`);
    }
    const background = `conic-gradient(${stops.join(', ')})`;
    return { totalQty, items: segs, background };
  }, [stats]);

  const trendBadge = (pct: number | null | undefined) => {
    if (pct == null) return null;
    const val = Number(pct);
    const pos = val >= 0;
    const cls = pos
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    const txt = `${pos ? '+' : ''}${val.toFixed(0)}%`;
    return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls} font-semibold`}>{txt}</span>;
  };

  if (role !== 'admin' && role !== 'super_admin') return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50/80 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas de Ventas</h2>
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

            <button onClick={load} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2" title="Recargar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Recargar</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Ventas</span>
                {trendBadge(stats?.trend?.sales_pct)}
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_sales ?? '—'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Total</span>
                {trendBadge(stats?.trend?.amount_pct)}
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats ? formatCurrency(stats.total_amount) : '—'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Hoy</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.today_sales ?? '—'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Este mes</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.month_sales ?? '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-500" /> Producto más vendido
                </div>
              </div>
              {stats?.best_product ? (
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {stats.best_product.image ? (
                      <img src={mediaUrl(stats.best_product.image)} alt={stats.best_product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="relative w-16 h-16">
                        <div
                          className="absolute inset-0 rounded-full animate-spin"
                          style={{ background: `conic-gradient(#10b981 ${bestRingPct}%, rgba(16,185,129,0.12) 0)` }}
                        />
                        <div className="absolute inset-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <div className="text-center leading-tight">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.best_product.qty}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">uds</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{stats.best_product.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{stats.best_product.qty} vendidos</div>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.best_product.amount)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">—</div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Mejor vendedor
                </div>
              </div>
              {stats?.top_seller ? (
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white truncate">{stats.top_seller.username}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stats.top_seller.sales} ventas creadas</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">—</div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900 dark:text-white">Productos más vendidos</div>
              </div>
              {topDonut.totalQty > 0 ? (
                <div className="flex gap-4 items-center">
                  <div className="relative w-24 h-24 shrink-0">
                    <div className="absolute inset-0 rounded-full animate-spin" style={{ background: topDonut.background }} />
                    <div className="absolute inset-[10px] rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                      <div className="text-center leading-tight">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{topDonut.totalQty}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">uds</div>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    {topDonut.items.map((p, idx) => (
                      <div key={`${p.name}-${idx}`} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{p.qty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">—</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">Tendencia (Monto, 14 días)</div>
              <div className="flex items-end gap-1 h-20">
                {(stats?.chart_amounts || []).map((v, i) => (
                  <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden" title={`${stats?.chart_labels?.[i] || ''}: ${formatCurrency(v)}`}>
                    <div className="w-full bg-emerald-500" style={{ height: `${Math.round((Number(v || 0) / maxAmount) * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>{stats?.chart_labels?.[0] || ''}</span>
                <span>{stats?.chart_labels?.[(stats?.chart_labels?.length || 1) - 1] || ''}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">Tendencia (Ventas, 14 días)</div>
              <div className="flex items-end gap-1 h-20">
                {(stats?.chart_data || []).map((v, i) => (
                  <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden" title={`${stats?.chart_labels?.[i] || ''}: ${v}`}>
                    <div className="w-full bg-indigo-500" style={{ height: `${Math.round((Number(v || 0) / maxCount) * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>{stats?.chart_labels?.[0] || ''}</span>
                <span>{stats?.chart_labels?.[(stats?.chart_labels?.length || 1) - 1] || ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesStatsPage;
