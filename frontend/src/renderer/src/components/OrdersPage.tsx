import React, { useEffect, useMemo, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  Eye, 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Filter, 
  X,
  User,
  MapPin,
  CreditCard,
  Printer
} from 'lucide-react';

interface Color {
  id: number;
  name: string;
  hex: string;
}

interface Product {
  id: number;
  name: string;
  category_name?: string;
  price: number | string;
  image?: string;
  active?: boolean;
  description?: string;
  sku?: string;
}

interface Client {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  cedula?: string;
}

interface OrderItem {
  product?: Product;
  color?: Color;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
}

interface Order {
  id: number;
  order_number: string;
  client?: Client;
  total_amount: number | string;
  created_at: string;
  items_count: number;
  items?: OrderItem[];
  status?: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface OrdersPageProps {
  token: string;
  apiBase: string;
}

interface CompanySettings {
  company_name: string;
  company_nit: string;
  company_phone: string;
  company_address: string;
  logo: string | null;
  printer_type?: string;
  paper_width_mm?: number;
  receipt_footer?: string;
  primary_color?: string;
}

interface PrinterOptions {
  show_logo: boolean;
  header1: string;
  header2: string;
  align: string;
  font_size: number;
  margin_top: number;
  margin_bottom: number;
  show_qr: boolean;
  logo_mode: string;
  logo_url: string;
  logo_width_mm: number;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ token, apiBase }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '', company_nit: '', company_phone: '', company_address: '', logo: null,
    printer_type: 'system', paper_width_mm: 58, receipt_footer: '', primary_color: '#0ea5e9'
  });
  const [printerOpts, setPrinterOpts] = useState<PrinterOptions>({
    show_logo: true, header1: '', header2: '', align: 'center', font_size: 11,
    margin_top: 10, margin_bottom: 10, show_qr: false, logo_mode: 'company', logo_url: '', logo_width_mm: 45
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadSettings = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) return;

      const newSettings: CompanySettings = {
        company_name: data.company_name || '',
        company_nit: data.company_nit || '',
        company_phone: data.company_phone || '',
        company_address: data.company_address || '',
        logo: data.logo || null,
        printer_type: data.printer_type || 'system',
        paper_width_mm: data.paper_width_mm || 58,
        receipt_footer: data.receipt_footer || '',
        primary_color: data.primary_color || '#0ea5e9'
      };

      try {
        const raw = data.receipt_footer || '';
        const obj = typeof raw === 'string' ? JSON.parse(raw) : null;
        if (obj && typeof obj === 'object') {
          setPrinterOpts({
            show_logo: obj.show_logo !== false,
            header1: obj.header1 || '',
            header2: obj.header2 || '',
            align: obj.align || 'center',
            font_size: Number(obj.font_size || 11),
            margin_top: Number((obj.margins && obj.margins.top) || obj.margin_top || 10),
            margin_bottom: Number((obj.margins && obj.margins.bottom) || obj.margin_bottom || 10),
            show_qr: !!obj.show_qr,
            logo_mode: obj.logo_mode || 'company',
            logo_url: obj.logo_url || '',
            logo_width_mm: Number(obj.logo_width_mm || 45),
          });
          newSettings.receipt_footer = obj.message !== undefined ? obj.message : '';
        }
      } catch {}

      setSettings(newSettings);
    } catch (e) {
      console.error('Error loading settings', e);
    }
  };

  useEffect(() => {
    if (token) loadSettings();
  }, [token]);

  const generateReceiptHtml = (order: Order) => {
    const paperW = settings.paper_width_mm || 58;
    const primary = settings.primary_color || '#000';
    const brand = settings.company_name || 'Mi Tienda';
    const nit = settings.company_nit ? `NIT: ${settings.company_nit}` : '';
    const addr = settings.company_address || '';
    const phone = settings.company_phone || '';
    const logo = settings.logo || '';
    
    const absUrlFn = (path: string | null) => { try { if (!path) return ''; if (String(path).startsWith('http://') || String(path).startsWith('https://')) return path; if (String(path).startsWith('/')) return `${apiBase}${path}`; return `${apiBase}/${path}`; } catch { return path; } };
    const logoSrc = printerOpts.logo_mode === 'custom' && printerOpts.logo_url ? printerOpts.logo_url : logo;
    const logoTag = printerOpts.show_logo && logoSrc ? `<div class="c"><img src="${logoSrc.startsWith('http') ? logoSrc : absUrlFn(logoSrc)}" style="width:${Number(printerOpts.logo_width_mm || 45)}mm;height:auto;object-fit:contain"/></div>` : '';
    
    const alignCls = printerOpts.align === 'left' ? 'l' : printerOpts.align === 'right' ? 'r' : 'c';
    
    const css = `*{box-sizing:border-box} body{font-family:Arial, sans-serif;margin:0;padding:${Number(printerOpts.margin_top || 10)}px 10px ${Number(printerOpts.margin_bottom || 10)}px;width:${paperW}mm} .c{text-align:center} .l{text-align:left} .r{text-align:right} .t{font-weight:600} .hr{height:1px;background:linear-gradient(90deg, ${primary}, transparent);margin:6px 0} .row{display:flex;justify-content:space-between;gap:6px} .tab{width:100%;border-collapse:collapse} .tab th,.tab td{padding:4px 0;font-size:${Number(printerOpts.font_size || 11)}px} .tab thead th{border-bottom:1px dashed #999;text-align:left} .tab tfoot td{border-top:1px dashed #999} .small{font-size:${Math.max(9, Number(printerOpts.font_size || 11) - 2)}px}`;
    
    const itemsHtml = (order.items || []).map((it) => `<tr><td>${it.product?.name || 'Item'}</td><td class="c">${it.quantity}</td><td class="r">${Number(it.unit_price).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td><td class="r">${Number(it.line_total).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td></tr>`).join('');
    
    const header = `
      ${logoTag}
      <div class="${alignCls}">
        <div class="t">${brand}</div>
        <div class="small">${nit}</div>
        <div class="small">${addr}</div>
        <div class="small">${phone}</div>
        ${printerOpts.header1 ? `<div class="small">${printerOpts.header1}</div>` : ''}
        ${printerOpts.header2 ? `<div class="small">${printerOpts.header2}</div>` : ''}
      </div>
      <div class="hr"></div>
      <div class="row small"><div>Orden: ${order.order_number}</div><div>${new Date(order.created_at).toLocaleString()}</div></div>
      <div class="row small"><div>Cliente: ${order.client?.full_name || 'Ocasional'}</div><div></div></div>
    `;
    
    const table = `
      <table class="tab">
        <thead><tr><th>Producto</th><th class="c">Cant</th><th class="r">Unit</th><th class="r">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr><td colspan="3" class="t">Total</td><td class="r t">${Number(order.total_amount).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td></tr></tfoot>
      </table>
    `;
    
    const qr = printerOpts.show_qr ? `<div class="c"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(order.order_number)}" style="width:35mm;height:35mm;object-fit:contain"/></div>` : '';
    const footer = `<div class="hr"></div><div class="${alignCls} small">${settings.receipt_footer || ''}</div>${qr}`;
    
    return `<!doctype html><html><head><meta charset="utf-8"><title>Recibo ${order.order_number}</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
  };

  const handlePrint = () => {
    if (!printingOrder) return;
    const html = generateReceiptHtml(printingOrder);
    const win = window.open('', '', 'height=600,width=400');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const res = await fetch(`${apiBase}/sales/list/?${params.toString()}`, { headers: authHeaders(token) });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Error al cargar pedidos');
      
      setOrders(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.count || 0));
    } catch(e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrders();
  }, [token, page, pageSize, search, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = total;
    const amountSum = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const now = new Date();
    const todayCount = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }).length;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    return { totalOrders, amountSum, todayCount, pendingCount };
  }, [orders, total]);

  const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-700 transition-all group">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
          {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  const getStatusColor = (status: string = 'pending') => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getStatusLabel = (status: string = 'pending') => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'delivered': return 'Entregado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  const mediaUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {loading && !orders.length && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-white font-medium">Cargando pedidos...</div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Pedidos" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          label="Ventas Totales" 
          value={stats.amountSum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} 
          icon={DollarSign} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
        />
        <StatCard 
          label="Pedidos Hoy" 
          value={stats.todayCount} 
          icon={Calendar} 
          color={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} 
        />
        <StatCard 
          label="Pendientes" 
          value={stats.pendingCount} 
          icon={Clock} 
          color={{ bg: 'bg-amber-500', text: 'text-amber-500' }} 
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Package className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Historial de Pedidos</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Buscar pedido o cliente..."
                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-2 ml-2">
              <button onClick={loadOrders} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
                        <ShoppingBag className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">#{o.order_number}</div>
                        <div className="text-xs text-gray-500">{o.items_count} items</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 font-medium">{o.client?.full_name || 'Cliente Ocasional'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white">
                      {Number(o.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setPrintingOrder(o)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Imprimir Recibo"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewOrder(o)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 mb-3 opacity-20" />
                      <p>No se encontraron pedidos</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="text-sm text-gray-400">
            Mostrando {orders.length} de {total} pedidos
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-300 px-2">
              Página {page} de {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button 
              onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(total / pageSize)), p + 1))} 
              disabled={page === Math.max(1, Math.ceil(total / pageSize))}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
              className="px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {[10,20,50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Pedido #{viewOrder.order_number}</h3>
                  <div className="text-xs text-gray-400">{new Date(viewOrder.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(viewOrder.status)}`}>
                    {getStatusLabel(viewOrder.status)}
                 </span>
                <button onClick={() => setViewOrder(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Client Info */}
                <div className="col-span-1 space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" /> Datos del Cliente
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Nombre</div>
                        <div className="text-white font-medium">{viewOrder.client?.full_name || 'Cliente Ocasional'}</div>
                      </div>
                      {viewOrder.client?.email && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Email</div>
                           <div className="text-gray-300 text-sm truncate">{viewOrder.client.email}</div>
                        </div>
                      )}
                      {viewOrder.client?.cedula && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Documento</div>
                           <div className="text-gray-300 text-sm">{viewOrder.client.cedula}</div>
                        </div>
                      )}
                      {viewOrder.client?.address && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Dirección</div>
                           <div className="text-gray-300 text-sm">{viewOrder.client.address}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Resumen Financiero
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">{Number(viewOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Envío</span>
                        <span className="text-white">$0</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-700 flex items-center justify-between">
                        <span className="font-bold text-white">Total</span>
                        <span className="font-bold text-emerald-400 text-lg">
                          {Number(viewOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" /> Items del Pedido ({viewOrder.items_count})
                  </h4>
                  
                  <div className="space-y-3">
                    {(viewOrder.items || []).map((it, idx) => (
                      <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 flex gap-4 hover:border-gray-600 transition-colors">
                        <div className="w-20 h-20 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                          {it.product?.image ? (
                            <img src={mediaUrl(it.product.image)} alt={it.product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <Package className="w-8 h-8 opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-white font-medium truncate pr-2">{it.product?.name || 'Producto eliminado'}</h5>
                              <p className="text-xs text-gray-500">SKU: {it.product?.sku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold text-sm">
                                {Number(it.line_total).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {it.quantity} x {Number(it.unit_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {it.color && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-300 border border-gray-700">
                                <span className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: it.color.hex }}></span>
                                {it.color.name}
                              </span>
                            )}
                            {it.product?.category_name && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-300 border border-gray-700">
                                {it.product.category_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(viewOrder.items || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                        No hay items en este pedido
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setViewOrder(null)} 
                className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
              >
                Cerrar
              </button>
              {/* Future actions like Print Invoice could go here */}
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {printingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             {/* Preview Header */}
             <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Vista Previa del Recibo</h3>
                <button onClick={() => setPrintingOrder(null)} className="text-gray-500 hover:text-gray-800">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Receipt Content - Iframe */}
             <div className="flex-1 overflow-hidden bg-gray-200 flex justify-center p-4">
                <div className="shadow-lg bg-white overflow-hidden" style={{ width: `${settings.paper_width_mm || 58}mm`, maxHeight: '100%', overflowY: 'auto' }}>
                  <iframe 
                    srcDoc={generateReceiptHtml(printingOrder)} 
                    className="w-full h-full border-none bg-white"
                    title="Receipt Preview"
                    style={{ minHeight: '400px' }}
                  />
                </div>
             </div>
             
             {/* Actions */}
             <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button 
                   onClick={handlePrint}
                   className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                   <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button 
                   onClick={() => setPrintingOrder(null)}
                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                   Cerrar
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
