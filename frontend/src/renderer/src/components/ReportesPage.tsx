import React, { useEffect, useState, useCallback } from 'react';
import SalesStatsPage from './SalesStatsPage';
// @ts-ignore
import logoImg from '../assets/logo.png';
import { Toast, ToastType } from './Toast';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  BarChart2,
  RefreshCw,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
} from 'lucide-react';

interface ReportesPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

interface DayStats {
  date: string;
  total_sales: number;
  total_amount: number;
  total_orders: number;
  total_clients: number;
  top_product?: string;
  salesList?: any[];
}

interface MonthSummary {
  [date: string]: DayStats;
}

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAYS_ES = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];

const fmt = (v: number) =>
  v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({
  icon: Icon, label, value, sub, colorBg, colorText, trend,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  colorBg: string; colorText: string; trend?: number | null;
}) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-full h-0.5 ${colorBg}`} />
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorBg} bg-opacity-10 ${colorText}`}>
        <Icon size={18} />
      </div>
      {trend !== undefined && trend !== null && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
          trend > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : trend < 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
        }`}>
          {trend > 0 ? <ArrowUpRight size={11}/> : trend < 0 ? <ArrowDownRight size={11}/> : null}
          {trend > 0 ? '+' : ''}{Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────────── */
const ReportesPage: React.FC<ReportesPageProps> = ({ token, apiBase: rawApiBase, role }) => {
  const apiBase = rawApiBase.replace(/\/$/, '');
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(fmtDate(today));
  const [monthData, setMonthData] = useState<MonthSummary>({});
  const [dayDetail, setDayDetail] = useState<DayStats | null>(null);
  const [monthSales, setMonthSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendario' | 'estadisticas'>('calendario');
  const [rangeSales, setRangeSales] = useState<any[]>([]);
  const [tenants, setTenants] = useState<Array<{ id: number; admin_username: string }>>([]);
  const [tenantId, setTenantId] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const pdfMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target as Node)) setShowPdfMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const auth = (t: string | null): Record<string,string> => ({
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  });

  useEffect(() => {
    if (!token || role !== 'super_admin') return;
    fetch(`${apiBase}/users/api/admin/tenants/`, { headers: auth(token) })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setTenants(d); }).catch(() => {});
  }, [token, role]);

  const tq = tenantId ? `&tenant_id=${tenantId}` : '';
  const tqs = tenantId ? `?tenant_id=${tenantId}` : '';

  /* ── Fetch month calendar data from Sales Order History ── */
  const fetchMonth = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const y = currentDate.getFullYear(), m = currentDate.getMonth() + 1;
    try {
      const params = new URLSearchParams({
        year: String(y),
        month: String(m),
        no_page: 'true'
      });
      if (tenantId) params.set('tenant_id', tenantId);

      const res = await fetch(`${apiBase}/sales/list/?${params.toString()}`, { headers: auth(token) });
      let list: any[] = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data : (data.results || []);
      }
      setMonthSales(list);

      const syn: MonthSummary = {};
      const clientSets: Record<string, Set<any>> = {};

      list.forEach((sale: any) => {
        if (!sale.created_at) return;
        const dateStr = sale.created_at.split('T')[0];
        const amount = Number(sale.total_amount) || 0;

        if (!syn[dateStr]) {
          syn[dateStr] = { 
            date: dateStr, 
            total_sales: 0, 
            total_amount: 0, 
            total_orders: 0, 
            total_clients: 0 
          };
          clientSets[dateStr] = new Set();
        }

        syn[dateStr].total_sales += 1;
        syn[dateStr].total_amount += amount;
        syn[dateStr].total_orders += 1;
        if (sale.client?.id || sale.client?.full_name) {
          clientSets[dateStr].add(sale.client?.id || sale.client?.full_name);
        }
      });

      Object.keys(syn).forEach(d => {
        syn[d].total_clients = clientSets[d] ? clientSets[d].size : syn[d].total_sales;
      });

      setMonthData(syn);
    } catch (err) {
      console.error('Error fetching sales calendar stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentDate, tenantId, apiBase]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  /* ── Fetch day detail locally from sales history ── */
  const fetchDay = useCallback((date: string) => {
    setDayLoading(true);
    const daySales = monthSales.filter((s: any) => s.created_at && s.created_at.split('T')[0] === date);

    let totalSales = daySales.length;
    let totalAmount = daySales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
    let totalOrders = daySales.length;
    let clientSet = new Set(daySales.map(s => s.client?.id || s.client?.full_name).filter(Boolean));
    let totalClients = clientSet.size;

    let productCounts: Record<string, { qty: number; amount: number }> = {};

    daySales.forEach((sale: any) => {
      if (Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const pName = item.product?.name || item.product_name || 'Producto';
          const qty = Number(item.quantity) || 1;
          const lineTotal = Number(item.line_total) || 0;

          if (!productCounts[pName]) {
            productCounts[pName] = { qty: 0, amount: 0 };
          }
          productCounts[pName].qty += qty;
          productCounts[pName].amount += lineTotal;
        });
      }
    });

    let topProduct = '';
    let maxQty = 0;
    Object.entries(productCounts).forEach(([name, data]) => {
      if (data.qty > maxQty) {
        maxQty = data.qty;
        topProduct = name;
      }
    });

    setDayDetail({
      date,
      total_sales: totalSales,
      total_amount: totalAmount,
      total_orders: totalOrders,
      total_clients: totalClients,
      top_product: topProduct || undefined,
      salesList: daySales
    });
    setDayLoading(false);
  }, [monthSales]);

  useEffect(() => { fetchDay(selectedDate); }, [selectedDate, monthSales, fetchDay]);

  /* ── Fetch global stats ── */
  const fetchGlobal = useCallback(async () => {
    if (!token) return;
    setGlobalLoading(true);
    try {
      const [sr, cr] = await Promise.all([
        fetch(`${apiBase}/sales/stats/${tqs}`, { headers: auth(token) }),
        fetch(`${apiBase}/clients/stats/${tqs}`, { headers: auth(token) }),
      ]);
      const s = sr.ok ? await sr.json() : {};
      const c = cr.ok ? await cr.json() : {};
      setGlobalStats({ ...s, clients: c });
      const labels: string[] = s.chart_labels || [];
      const amounts: number[] = s.chart_amounts || [];
      const counts: number[] = s.chart_data || [];
      setRangeSales(labels.map((l,i) => ({ label:l, amount: amounts[i]||0, count: counts[i]||0 })));
    } catch {}
    setGlobalLoading(false);
  }, [token, tenantId]);

  useEffect(() => { if (activeTab === 'estadisticas') fetchGlobal(); }, [activeTab, fetchGlobal]);

  /* ── Calendar helpers ── */
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const calDays: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const getDayData = (day: number) => monthData[`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`];
  const maxAmt = Math.max(...Object.values(monthData).map(d => d.total_amount), 1);
  const maxBarAmt = Math.max(...rangeSales.map(s => s.amount), 1);

  const handleDay = (day: number) => setSelectedDate(`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
  const isToday = (day: number) => today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;
  const isSel = (day: number) => selectedDate===`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  const monthSummary = (() => {
    const days = Object.values(monthData);
    return {
      totalAmount: days.reduce((a,d)=>a+d.total_amount, 0),
      totalSales: days.reduce((a,d)=>a+d.total_sales, 0),
      activeDays: days.filter(d=>d.total_sales>0).length,
    };
  })();

  const getLogoBase64 = async (): Promise<string> => {
    try {
      const response = await fetch(logoImg);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  };

  /* ── PDF Generation ── */
  const generatePDF = async (type: 'daily' | 'monthly' | 'annual') => {
    setPdfLoading(true);
    setShowPdfMenu(false);
    try {
      const logoBase64 = await getLogoBase64();
      
      let queryParam = '';
      let reportTitle = '';
      let reportSubtitle = '';
      
      if (type === 'daily') {
         queryParam = `date=${selectedDate}`;
         reportTitle = `Reporte Diario - ${selectedDate}`;
         reportSubtitle = selectedDate;
      } else if (type === 'monthly') {
         queryParam = `month=${year}-${String(month+1).padStart(2,'0')}`;
         reportTitle = `Reporte Mensual - ${MONTHS_ES[month]} ${year}`;
         reportSubtitle = `${MONTHS_ES[month]} ${year}`;
      } else if (type === 'annual') {
         queryParam = `year=${year}`;
         reportTitle = `Reporte Anual - ${year}`;
         reportSubtitle = `Año ${year}`;
      }
      
      // Filter sales for PDF timeframe
      let periodSales: any[] = [];
      if (type === 'daily') {
        periodSales = monthSales.filter((s: any) => s.created_at && s.created_at.split('T')[0] === selectedDate);
      } else if (type === 'monthly') {
        periodSales = monthSales;
      } else if (type === 'annual') {
        const params = new URLSearchParams({
          year: String(year),
          no_page: 'true'
        });
        if (tenantId) params.set('tenant_id', tenantId);
        const res = await fetch(`${apiBase}/sales/list/?${params.toString()}`, { headers: auth(token) });
        if (res.ok) {
          const data = await res.json();
          periodSales = Array.isArray(data) ? data : (data.results || []);
        }
      }

      let totalSales = periodSales.length;
      let totalAmount = 0;
      let productMap: Record<string, { name: string, image: string, qty: number, amount: number }> = {};

      periodSales.forEach((sale: any) => {
        totalAmount += Number(sale.total_amount) || 0;
        if (Array.isArray(sale.items)) {
          sale.items.forEach((item: any) => {
            const prodName = item.product?.name || item.product_name || 'Producto';
            const prodImg = item.product?.image || '';
            const qty = Number(item.quantity) || 1;
            const lineTotal = Number(item.line_total) || 0;

            if (!productMap[prodName]) {
              productMap[prodName] = { name: prodName, image: prodImg, qty: 0, amount: 0 };
            }
            if (!productMap[prodName].image && prodImg) {
              productMap[prodName].image = prodImg;
            }
            productMap[prodName].qty += qty;
            productMap[prodName].amount += lineTotal;
          });
        }
      });

      const topProducts = Object.values(productMap).sort((a, b) => b.amount - a.amount);

      const productRows = topProducts.length > 0
        ? topProducts.map((p: any) => {
            const imgTag = p.image 
              ? `<img src="${p.image}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc" />`
              : `<div style="width:36px;height:36px;border-radius:6px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:14px">📦</div>`;
            return `<tr>
              <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;width:48px;text-align:center">${imgTag}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:11px">${p.name}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;font-size:11px">${p.qty} unidades</td>
              <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#1d4ed8;font-size:11px">${fmt(Number(p.amount || 0))}</td>
            </tr>`;
          }).join('')
        : `<tr><td colspan="4" style="padding:15px;text-align:center;color:#9ca3af;font-size:12px">No se registraron productos vendidos en este periodo.</td></tr>`;

      // Build detailed sales cards with items and product images
      const salesDetailedHtml = periodSales.length > 0
        ? periodSales.map((sale: any) => {
            const itemsRows = Array.isArray(sale.items) && sale.items.length > 0
              ? sale.items.map((item: any) => {
                  const pName = item.product?.name || item.product_name || 'Producto';
                  const pImg = item.product?.image || '';
                  const skuStr = item.product?.sku ? `SKU: ${item.product.sku}` : '';
                  const colorStr = item.color?.name ? ` • Color: ${item.color.name}` : '';
                  const variantStr = item.variant?.name ? ` • Var: ${item.variant.name}` : '';

                  const imgHtml = pImg
                    ? `<img src="${pImg}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;background:#fff" />`
                    : `<div style="width:40px;height:40px;border-radius:6px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:16px">📦</div>`;

                  return `
                    <tr style="border-bottom:1px solid #f1f5f9">
                      <td style="padding:6px 10px;width:52px;text-align:center">${imgHtml}</td>
                      <td style="padding:6px 10px;font-size:11px;font-weight:600;color:#1e293b">
                        ${pName}
                        <div style="font-size:10px;color:#64748b;font-weight:400;margin-top:1px">${skuStr}${colorStr}${variantStr}</div>
                      </td>
                      <td style="padding:6px 10px;font-size:11px;color:#334155;text-align:center;font-weight:500">${item.quantity} un.</td>
                      <td style="padding:6px 10px;font-size:11px;color:#334155;text-align:right">${fmt(Number(item.unit_price || 0))}</td>
                      <td style="padding:6px 10px;font-size:11px;font-weight:700;color:#0f172a;text-align:right">${fmt(Number(item.line_total || 0))}</td>
                    </tr>
                  `;
                }).join('')
              : `<tr><td colspan="5" style="padding:10px;text-align:center;color:#94a3b8;font-size:11px">Sin productos registrados en el pedido.</td></tr>`;

            const clientName = sale.client?.full_name || 'Cliente Ocasional';
            const clientCed = sale.client?.cedula ? ` (CC/NIT: ${sale.client.cedula})` : '';
            const pmLabel = sale.payment_method === 'cash' ? 'Efectivo' : sale.payment_method === 'transfer' ? 'Transferencia' : 'Pago Mixto';
            const statusLabel = sale.status === 'delivered' ? 'Entregado' : sale.status === 'shipped' ? 'Enviado' : sale.status === 'pending' ? 'Pendiente' : sale.status === 'processing' ? 'Procesando' : sale.status === 'apartado' ? 'Apartado' : 'Cancelado';
            const dateStr = sale.created_at ? new Date(sale.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '';

            return `
              <div style="margin-bottom:14px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;page-break-inside:avoid;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,0.03)">
                <!-- Order Header -->
                <div style="background:#f8fafc;padding:8px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center flex-wrap:wrap">
                  <div>
                    <span style="font-weight:800;font-size:12px;color:#1d4ed8;font-family:monospace">Orden #${sale.order_number}</span>
                    <span style="font-size:10px;color:#64748b;margin-left:8px">${dateStr}</span>
                    <div style="font-size:11px;font-weight:600;color:#334155;margin-top:2px">Cliente: ${clientName}${clientCed}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:13px;font-weight:800;color:#15803d">${fmt(Number(sale.total_amount || 0))}</div>
                    <div style="font-size:10px;margin-top:2px">
                      <span style="background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:4px;font-weight:700;margin-right:4px">${pmLabel}</span>
                      <span style="background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;font-weight:700">${statusLabel}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Products Table for this Order -->
                <table style="width:100%;border-collapse:collapse;margin:0">
                  <thead>
                    <tr style="background:#f1f5f9;border-bottom:1px solid #e2e8f0">
                      <th style="padding:4px 8px;width:52px;text-align:center;font-size:9px;color:#64748b;font-weight:700">IMAGEN</th>
                      <th style="padding:4px 10px;text-align:left;font-size:9px;color:#64748b;font-weight:700">PRODUCTO / DETALLES</th>
                      <th style="padding:4px 10px;text-align:center;font-size:9px;color:#64748b;font-weight:700">CANTIDAD</th>
                      <th style="padding:4px 10px;text-align:right;font-size:9px;color:#64748b;font-weight:700">PRECIO UNIT.</th>
                      <th style="padding:4px 10px;text-align:right;font-size:9px;color:#64748b;font-weight:700">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRows}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')
        : `<div style="padding:15px;text-align:center;color:#94a3b8;font-size:12px;background:#f8fafc;border-radius:10px">No se encontraron ventas para este periodo.</div>`;

      let detailedHtml = '';
      if (type === 'monthly') {
        const detailedRows = calDays.filter(Boolean).map((day) => {
          const d = getDayData(day as number);
          if (!d || d.total_sales === 0) return '';
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          return `<tr style="page-break-inside: avoid">
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:11px">${dateStr}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;font-size:11px">${d.total_sales} ventas</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;font-size:11px">${d.total_orders} pedidos</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#1d4ed8;font-size:11px">${fmt(d.total_amount)}</td>
          </tr>`;
        }).filter(Boolean).join('');
        
        detailedHtml = `
          <h3 style="font-size:13px;font-weight:800;color:#111827;margin-top:18px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.04em">Resumen de Ventas Diarias (Días con Actividad)</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th style="text-align:center">Ventas</th>
                <th style="text-align:center">Pedidos</th>
                <th style="text-align:right">Monto Facturado</th>
              </tr>
            </thead>
            <tbody>
              ${detailedRows.length > 0 ? detailedRows : `<tr><td colspan="4" style="padding:15px;text-align:center;color:#9ca3af;font-size:12px">No se registraron ventas en este periodo.</td></tr>`}
            </tbody>
          </table>
        `;
      }

      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>${reportTitle}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background:#fff;padding:28px 32px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #e5e7eb}
.brand-name{font-size:20px;font-weight:800;color:#1d4ed8;letter-spacing:-0.5px}
.brand-sub{font-size:11px;color:#9ca3af;margin-top:2px}
.meta{text-align:right}
.meta-title{font-size:15px;font-weight:700;color:#111827}
.meta-sub{font-size:11px;color:#9ca3af;margin-top:3px}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px}
.box-label{font-size:10px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.box-value{font-size:20px;font-weight:800;color:#111827}
.box-blue .box-value{color:#1d4ed8}
table{width:100%;border-collapse:collapse;margin-top:10px;page-break-inside:avoid}
thead th{padding:9px 12px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;background:#f3f4f6;border-bottom:2px solid #e5e7eb}
.footer{margin-top:30px;padding-top:14px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;page-break-inside:avoid}
@media print{body{padding:12px 16px}@page{margin:0.8cm;size:A4 portrait}}
</style></head><body>
<div class="header">
  <div style="display:flex;align-items:center;gap:12px">
    ${logoBase64 ? `<img src="${logoBase64}" style="height:36px;width:auto"/>` : ''}
    <div><div class="brand-name">Asenting</div><div class="brand-sub">Sistema de Gestion Empresarial</div></div>
  </div>
  <div class="meta"><div class="meta-title">Reporte de Operaciones &mdash; ${reportSubtitle}</div>
  <div class="meta-sub">Generado el ${new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
</div>
<div class="summary">
  <div class="box box-blue"><div class="box-label">Total Facturado</div><div class="box-value">${fmt(totalAmount)}</div></div>
  <div class="box"><div class="box-label">Total Ventas</div><div class="box-value">${totalSales}</div></div>
  ${type === 'monthly' ? `
  <div class="box"><div class="box-label">Dias Activos</div><div class="box-value">${monthSummary.activeDays} / ${daysInMonth}</div></div>
  <div class="box"><div class="box-label">Promedio Diario</div><div class="box-value">${fmt(monthSummary.activeDays > 0 ? totalAmount / monthSummary.activeDays : 0)}</div></div>
  ` : ''}
</div>

${detailedHtml}

<h3 style="font-size:13px;font-weight:800;color:#111827;margin-top:22px;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.04em">Desglose de Ventas y Productos Vendidos</h3>
${salesDetailedHtml}

<h3 style="font-size:13px;font-weight:800;color:#111827;margin-top:22px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.04em">Consolidado de Productos Vendidos</h3>
<table>
  <thead>
    <tr>
      <th style="width:48px;text-align:center">Imagen</th>
      <th>Nombre del Producto</th>
      <th style="text-align:center">Cantidad Vendida</th>
      <th style="text-align:right">Total Facturado</th>
    </tr>
  </thead>
  <tbody>
    ${productRows}
  </tbody>
</table>

<div class="footer">
  <span>Asenting &copy; ${new Date().getFullYear()} &mdash; Reporte confidencial, solo para uso interno</span>
  <span>${reportSubtitle}</span>
</div>
</body></html>`;

      const hasElectron = Boolean((window as any)?.electron?.ipcRenderer?.invoke);
      if (hasElectron) {
        const defaultName = `Reporte_${type}_${type === 'daily' ? selectedDate : type === 'monthly' ? `${MONTHS_ES[month]}_${year}` : year}.pdf`;
        const res = await (window as any).electron.ipcRenderer.invoke('save-pdf-dialog', { html, defaultName });
        if (res?.success) {
          showToast(`Reporte PDF guardado con éxito en:\n${res.filePath}`, 'success');
        } else if (res?.error) {
          showToast(`Error al generar el PDF: ${res.error}`, 'error');
        }
      } else {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.addEventListener('load', () => { setTimeout(() => win.print(), 400); });
        }
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      }
    } catch (err) {
      console.error('PDF error:', err);
    }
    setPdfLoading(false);
  };

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col min-h-screen pb-10">
      <style>{`
        @keyframes repFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .rep-fade { animation: repFade 0.22s ease; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'calendario'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={14}/>Calendario
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'estadisticas'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 size={14}/>Estadisticas
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {role === 'super_admin' && tenants.length > 0 && (
            <select value={tenantId} onChange={e => setTenantId(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Todas las empresas</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.admin_username}</option>)}
            </select>
          )}
          {activeTab === 'calendario' && (
            <div className="relative" ref={pdfMenuRef}>
              <button
                onClick={() => setShowPdfMenu(!showPdfMenu)}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95"
              >
                {pdfLoading
                  ? <RefreshCw size={13} className="animate-spin"/>
                  : <Printer size={13}/>}
                {pdfLoading ? 'Generando...' : 'Generar PDF'}
              </button>
              
              {showPdfMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in slide-in-from-top-2 duration-150">
                  <button 
                    onClick={() => generatePDF('daily')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <span>Reporte Diario</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">{selectedDate.split('-')[2]}</span>
                  </button>
                  <button 
                    onClick={() => generatePDF('monthly')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <span>Reporte Mensual</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">{MONTHS_ES[month].substring(0,3)}</span>
                  </button>
                  <button 
                    onClick={() => generatePDF('annual')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <span>Reporte Anual</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">{year}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ CALENDARIO ═══ */}
      {activeTab === 'calendario' && (
        <div className="flex flex-1 gap-4 min-h-0 rep-fade">

          {/* ── Calendar panel ── */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden min-h-0">

            {/* Month nav */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/80 dark:bg-gray-900">
              <button onClick={() => setCurrentDate(new Date(year, month-1, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                <ChevronLeft size={17}/>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{MONTHS_ES[month]} {year}</h2>
                {loading && <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={fetchMonth} title="Actualizar"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
                </button>
                <button onClick={() => setCurrentDate(new Date(year, month+1, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                  <ChevronRight size={17}/>
                </button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 shrink-0">
              {DAYS_ES.map(d => (
                <div key={d} className="py-2.5 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{d}</div>
              ))}
            </div>

            {/* Calendar grid – fills all remaining height */}
            <div className="flex-1 grid grid-cols-7 min-h-0" style={{ gridAutoRows: '1fr' }}>
              {calDays.map((day, idx) => {
                if (!day) return (
                  <div key={`e${idx}`} className="border-b border-r border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-950/20"/>
                );
                const data = getDayData(day);
                const intensity = data ? Math.min(data.total_amount / maxAmt, 1) : 0;
                const sel = isSel(day);
                const tod = isToday(day);

                return (
                  <button key={day} onClick={() => handleDay(day)}
                    className={`border-b border-r border-gray-50 dark:border-gray-800/50 flex flex-col items-start p-2.5 text-left transition-all relative overflow-hidden group
                      hover:bg-blue-50 dark:hover:bg-blue-950/30
                      ${sel ? 'ring-2 ring-inset ring-blue-500 bg-blue-50 dark:bg-blue-950/40' : ''}
                      ${tod && !sel ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : ''}
                    `}
                  >
                    {/* heat overlay */}
                    {data && data.total_amount > 0 && (
                      <div className="absolute inset-0 pointer-events-none transition-opacity"
                        style={{ background: `linear-gradient(to top, rgba(37,99,235,${intensity * 0.18}), transparent)` }}/>
                    )}

                    {/* Day number badge */}
                    <div className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-lg text-sm font-extrabold shrink-0 transition-colors
                      ${sel ? 'bg-blue-600 text-white shadow-sm' : tod ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-950 dark:group-hover:text-white'}`}>
                      {day}
                    </div>

                    {/* Sales data */}
                    {data && data.total_amount > 0 ? (
                      <div className="relative z-10 w-full mt-auto">
                        <div className="text-xs font-black text-blue-700 dark:text-blue-400 truncate leading-tight">{fmt(data.total_amount)}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight font-medium">{data.total_sales} ventas</div>
                      </div>
                    ) : (
                      <div className="relative z-10 mt-auto text-[10px] text-gray-400 dark:text-gray-700">-</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer legend + month totals */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 flex items-center justify-between shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-600">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block"/>Hoy</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded ring-2 ring-blue-500 inline-block"/>Sel.</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded inline-block" style={{background:'linear-gradient(to top,rgba(37,99,235,0.25),transparent)',border:'1px solid rgba(37,99,235,0.15)'}}/>Volumen
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-gray-400 dark:text-gray-600">Mes: <strong className="text-gray-800 dark:text-gray-200">{fmt(monthSummary.totalAmount)}</strong></span>
                <span className="text-gray-400 dark:text-gray-600">{monthSummary.totalSales} ventas</span>
                <span className="text-gray-400 dark:text-gray-600">{monthSummary.activeDays}/{daysInMonth} dias</span>
              </div>
            </div>
          </div>

          {/* ── Day detail sidebar ── */}
          <div className="w-60 shrink-0 flex flex-col gap-3 min-h-0">

            {/* Day info card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={13}/>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Detalle del Dia</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {new Date(selectedDate+'T00:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {dayLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-7 h-7 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/>
                  </div>
                ) : dayDetail ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wide">Ventas</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{dayDetail.total_sales}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wide">Pedidos</p>
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{dayDetail.total_orders}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                      <p className="text-[9px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wide mb-0.5">Monto Total</p>
                      <p className="text-base font-black text-gray-900 dark:text-white leading-tight">{fmt(dayDetail.total_amount)}</p>
                    </div>

                    {dayDetail.total_clients > 0 && (
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Users size={13} className="text-gray-400 shrink-0"/>
                        <div>
                          <p className="text-[9px] text-gray-500">Nuevos clientes</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{dayDetail.total_clients}</p>
                        </div>
                      </div>
                    )}

                    {dayDetail.top_product && (
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Package size={13} className="text-gray-400 shrink-0"/>
                        <div className="min-w-0">
                          <p className="text-[9px] text-gray-500">Producto estrella</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{dayDetail.top_product}</p>
                        </div>
                      </div>
                    )}

                    {dayDetail.salesList && dayDetail.salesList.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <p className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Historial de Pedidos ({dayDetail.salesList.length})
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {dayDetail.salesList.map((sale: any) => (
                            <div key={sale.id} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 text-xs">
                              <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                                <span className="font-mono text-[11px]">{sale.order_number}</span>
                                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{fmt(Number(sale.total_amount || 0))}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                <span className="truncate max-w-[100px]">{sale.client?.full_name || 'Cliente'}</span>
                                <span className="capitalize px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-semibold">
                                  {sale.payment_method === 'cash' ? 'Efectivo' : sale.payment_method === 'transfer' ? 'Transf.' : 'Mixto'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dayDetail.total_sales === 0 && (
                      <div className="flex flex-col items-center justify-center py-4 text-gray-400 gap-1">
                        <AlertCircle size={20} className="opacity-30"/>
                        <p className="text-xs text-center text-gray-400">Sin actividad registrada</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                    <AlertCircle size={20} className="opacity-30"/>
                    <p className="text-xs text-center">Selecciona un dia del calendario</p>
                  </div>
                )}
              </div>
            </div>

            {/* Month summary card */}
            <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-600/20 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold opacity-90">Resumen del Mes</p>
                <Calendar size={14} className="opacity-60"/>
              </div>
              <p className="text-[10px] opacity-60 mb-0.5">Total facturado</p>
              <p className="text-xl font-black mb-3 leading-tight">{fmt(monthSummary.totalAmount)}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-[9px] opacity-60">Ventas</p>
                  <p className="text-lg font-black">{monthSummary.totalSales}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-[9px] opacity-60">Dias activos</p>
                  <p className="text-lg font-black">{monthSummary.activeDays}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ESTADISTICAS (Exact same component as sub-link) ═══ */}
      {activeTab === 'estadisticas' && (
        <div className="flex-1 overflow-y-auto rep-fade pr-0.5">
          <SalesStatsPage token={token} apiBase={rawApiBase} role={role} />
        </div>
      )}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default ReportesPage;
