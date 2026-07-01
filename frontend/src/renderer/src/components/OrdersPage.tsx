import React, { useEffect, useMemo, useState } from 'react';
import { Toast, ToastType } from './Toast';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  Eye, 
  Trash2,
  Calendar, 
  DollarSign, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Filter, 
  X,
  User,
  MapPin,
  CreditCard,
  Printer,
  Mail,
  FileText,
  ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useOfflineSync } from '../hooks/useOfflineSync';
import SyncStatusBanner from './SyncStatusBanner';
import SafeImage from './SafeImage';

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
  identification_type?: string;
  tax_regime?: string;
  city?: string;
  department?: string;
}

interface OrderItem {
  product?: Product;
  color?: Color;
  variant?: {
    id: number;
    name: string;
    extra_price: number | string;
  };
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
}

interface SalePayment {
  id: number;
  amount: number | string;
  payment_method: string;
  notes: string;
  created_at: string;
}

interface DianInfo {
  status: string;
  cufe?: string;
  created_at?: string;
  xml_url?: string;
  pdf_url?: string;
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
  dian?: DianInfo;
  payment_method?: string;
  cash_amount?: number | string;
  transfer_amount?: number | string;
  change_amount?: number | string;
  apartado_amount?: number | string;
  apartado_date?: string;
  payments?: SalePayment[];
  total_paid?: number | string;
  dian_invoice_id?: string;
  dian_invoice_url?: string;
  dian_invoice_status?: 'not_emitted' | 'emitted' | 'error';
  dian_error_message?: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface OrdersPageProps {
  token: string;
  apiBase: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface CompanySettings {
  company_name: string;
  company_nit: string;
  company_phone: string;
  company_address: string;
  logo: string | null;
  printer_type?: string;
  printer_name?: string;
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

const OrdersPage: React.FC<OrdersPageProps> = ({ token, apiBase, canEdit, canDelete }) => {
  const canEditSafe = typeof canEdit === 'boolean' ? canEdit : true;
  const canDeleteSafe = typeof canDelete === 'boolean' ? canDelete : true;
  const offlineSync = useOfflineSync(token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '', company_nit: '', company_phone: '', company_address: '', logo: null,
    printer_type: 'system', printer_name: '', paper_width_mm: 58, receipt_footer: '', primary_color: '#0ea5e9'
  });
  const [printerOpts, setPrinterOpts] = useState<PrinterOptions>({
    show_logo: true, header1: '', header2: '', align: 'center', font_size: 11,
    margin_top: 10, margin_bottom: 10, show_qr: false, logo_mode: 'company', logo_url: '', logo_width_mm: 45
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [total, setTotal] = useState(0);
  
  const [toast, setToast] = useState<{message: string, type: ToastType, isVisible: boolean}>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  
  // Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [newPaymentNotes, setNewPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // DIAN State
  const [dianModalOrder, setDianModalOrder] = useState<Order | null>(null);
  const [isEmittingDian, setIsEmittingDian] = useState(false);

  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

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
        printer_name: data.printer_name || '',
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
    const primary = '#000';
    const brand = settings.company_name || 'Mi Tienda';
    const nit = settings.company_nit ? `NIT: ${settings.company_nit}` : '';
    const addr = settings.company_address || '';
    const phone = settings.company_phone || '';
    const logo = settings.logo || '';
    
    const absUrlFn = (path: string | null) => { 
      try { 
        if (!path) return ''; 
        if (String(path).startsWith('http://') || String(path).startsWith('https://')) return path; 
        const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        const p = String(path).startsWith('/') ? path : `/${path}`;
        return `${base}${p}`; 
      } catch { return path || ''; } 
    };
    const logoSrc = printerOpts.logo_mode === 'custom' && printerOpts.logo_url ? printerOpts.logo_url : logo;
    const logoTag = printerOpts.show_logo && logoSrc ? `<div class="c"><img src="${logoSrc.startsWith('http') ? logoSrc : absUrlFn(logoSrc)}" onerror="this.style.display='none'" style="width:${Number(printerOpts.logo_width_mm || 45)}mm;height:auto;object-fit:contain;filter:grayscale(100%) brightness(0.8);"/></div>` : '';
    
    const alignCls = printerOpts.align === 'left' ? 'l' : printerOpts.align === 'right' ? 'r' : 'c';
    
    const css = `@page{size:${paperW}mm auto;margin:0} *{box-sizing:border-box} html{background:#fff} html,body{margin:0;padding:0} body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;font-family:Arial, sans-serif;width:${paperW}mm;margin:0 auto;padding:${Number(printerOpts.margin_top || 10)}px 10px ${Number(printerOpts.margin_bottom || 10)}px;font-weight:bold;color:#000} img{max-width:100%;height:auto} .c{text-align:center} .l{text-align:left} .r{text-align:right} .t{font-weight:900} .hr{border-top:1px dashed #000;height:0;margin:8px 0} .row{display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap} .tab{width:100%;border-collapse:collapse;table-layout:fixed} .tab th,.tab td{padding:4px 0;font-size:${Number(printerOpts.font_size || 11)}px;vertical-align:top;color:#000;font-weight:bold} .tab td{word-break:break-word} .tab thead th{border-bottom:1px dashed #000;text-align:left} .tab tfoot td{border-top:1px dashed #000} .small{font-size:${Math.max(9, Number(printerOpts.font_size || 11) - 2)}px;color:#000;font-weight:bold}`;
    
    const itemsHtml = (order.items || []).map((it) => `<tr><td>${it.product?.name || 'Item'}</td><td class="c">${it.quantity}</td><td class="r">${Number(it.unit_price).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})}</td><td class="r">${Number(it.line_total).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})}</td></tr>`).join('');
    
    // Determinar método de pago
    const paymentMethodText = (() => {
      if (order.payment_method === 'cash') return 'Efectivo';
      if (order.payment_method === 'transfer') return 'Transferencia';
      if (order.payment_method === 'mixed') return 'Mixto (Efectivo + Transferencia)';
      return 'No especificado';
    })();
    
    // Determinar si está apartado
    const statusText = order.status === 'apartado' ? 'SEPARADO' : null;
    
    // Datos adicionales del cliente
    const clientCedula = order.client?.cedula ? `CC/NIT: ${order.client.cedula}` : '';
    const clientEmail = order.client?.email || '';
    const clientPhone = order.client?.phone || '';
    const clientAddress = order.client?.address || '';
    const apartoAmountText = order.status === 'apartado' && order.apartado_amount ? Number(order.apartado_amount).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}) : null;
    
    const paymentsHtml = (order.payments || []).map((p) => `
      <div class="row small" style="margin-bottom: 2px; border-bottom: 0.5px dashed #000; padding-bottom: 1px;">
        <div>${new Date(p.created_at).toLocaleDateString()} - ${p.payment_method === 'cash' ? 'EFECTIVO' : 'TRANSF.'}</div>
        <div class="r">${Number(p.amount).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})}</div>
      </div>
    `).join('');

    const header = `
      ${logoTag}
      <div class="${alignCls}">
        <div class="t" style="font-size: ${Number(printerOpts.font_size || 11) + 2}px; color: ${primary};">${brand}</div>
        <div class="small" style="color: #000;">${nit}</div>
        <div class="small" style="color: #000;">${addr}</div>
        <div class="small" style="color: #000;">${phone}</div>
        ${printerOpts.header1 ? `<div class="small">${printerOpts.header1}</div>` : ''}
        ${printerOpts.header2 ? `<div class="small">${printerOpts.header2}</div>` : ''}
      </div>
      <div class="hr"></div>
      
      <!-- Información del Pedido -->
      <div style="padding: 4px 0; margin: 4px 0;">
        <div class="row small" style="margin-bottom: 2px;">
          <div><strong>ORDEN:</strong> ${order.order_number}</div>
          <div><strong>FECHA:</strong> ${new Date(order.created_at).toLocaleString()}</div>
        </div>
      </div>
      
      <!-- Información del Cliente -->
      <div style="padding: 4px 0; margin: 4px 0;">
        <div class="small" style="color: #000; font-weight: 900; margin-bottom: 4px; border-bottom: 1px dashed #000;">DATOS DEL CLIENTE</div>
        <div class="small" style="margin-bottom: 2px;"><strong>NOMBRE:</strong> ${order.client?.full_name || 'Ocasional'}</div>
        ${clientCedula ? `<div class="small" style="margin-bottom: 2px;">${clientCedula}</div>` : ''}
        ${clientEmail ? `<div class="small" style="margin-bottom: 2px;">EMAIL: ${clientEmail}</div>` : ''}
        ${clientPhone ? `<div class="small" style="margin-bottom: 2px;">TEL: ${clientPhone}</div>` : ''}
        ${clientAddress ? `<div class="small">DIR: ${clientAddress}</div>` : ''}
      </div>
      
      <!-- Información del Pago -->
      <div style="padding: 4px 0; margin: 4px 0;">
        <div class="small" style="color: #000; font-weight: 900; margin-bottom: 4px; border-bottom: 1px dashed #000;">INFORMACIÓN DEL PAGO</div>
        <div class="row small">
          <div><strong>MÉTODO:</strong> ${paymentMethodText}</div>
        </div>
        
        ${paymentsHtml ? `
          <div style="margin-top: 6px;">
            <div class="small" style="font-size: 10px; border-bottom: 1px dashed #000; margin-bottom: 3px;">HISTORIAL DE ABONOS:</div>
            ${paymentsHtml}
            <div class="row small" style="margin-top: 4px; border-top: 1px dashed #000; padding-top: 2px;">
              <div><strong>TOTAL ABONADO:</strong></div>
              <div class="r"><strong>${Number(order.total_paid || 0).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})}</strong></div>
            </div>
            ${(Number(order.total_amount) - Number(order.total_paid || 0)) > 0 ? `
              <div class="row small" style="color: #000;">
                <div><strong>SALDO PENDIENTE:</strong></div>
                <div class="r"><strong>${(Number(order.total_amount) - Number(order.total_paid || 0)).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})}</strong></div>
              </div>
            ` : ''}
          </div>
        ` : (apartoAmountText ? `<div class="row small" style="margin-top: 4px;"><div><strong>ABONO:</strong> ${apartoAmountText}</div><div></div></div>` : '')}
        
        ${statusText ? `<div class="row small" style="margin-top: 4px; color: #000; font-weight: 900;"><div>⚠️ ${statusText.toUpperCase()}</div><div></div></div>` : ''}
      </div>
      
      <div class="hr"></div>
    `;
    
    const table = `
      <table class="tab">
        <thead><tr><th>Producto</th><th class="c">Cant</th><th class="r">Unit</th><th class="r">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr><td colspan="3" class="t">Total</td><td class="r t">${Number(order.total_amount).toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})}</td></tr></tfoot>
      </table>
    `;
    
    const qr = printerOpts.show_qr ? `<div class="c"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(order.order_number)}" style="width:35mm;height:35mm;object-fit:contain"/></div>` : '';
    const footer = `<div class="hr"></div>${qr}<div class="${alignCls} small">${settings.receipt_footer || ''}</div>`;
    
    return `<!doctype html><html><head><meta charset="utf-8"><title>Recibo ${order.order_number}</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
  };

  const handleSilentPrint = async (order: Order) => {
    // Primero abrimos la vista previa
    setPrintingOrder(order);
    setShowPrintPreview(true);
  };

  const confirmSilentPrint = async () => {
    if (!printingOrder) return;

    showToast('Abriendo diálogo de impresión...', 'info');
    handlePrint();
  };

  const handlePrint = () => {
    if (!printingOrder) return;
    const html = generateReceiptHtml(printingOrder);
    const win = window.open('', '', 'height=600,width=400');
    if (win) {
      win.document.write(html);
      win.document.close();
      const finish = () => {
        setShowPrintPreview(false);
        try { win.close(); } catch {}
      };
      const safePrint = async () => {
        const waitForLoad = new Promise<void>((resolve) => win.addEventListener('load', () => resolve(), { once: true }));
        const waitTimeout = new Promise<void>((resolve) => setTimeout(() => resolve(), 1500));
        await Promise.race([waitForLoad, waitTimeout]);
        const imgs = Array.from(win.document.images || []);
        const imgsDone = Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); }))));
        await Promise.race([imgsDone, waitTimeout]);
        await new Promise((r) => setTimeout(r, 150));
        win.focus();
        win.onafterprint = finish;
        win.print();
        setTimeout(finish, 1200);
      };
      safePrint();
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const url = `${apiBase}/sales/list/?${params.toString()}`;
      // Use loadPaginatedData to get both items and total count correctly
      const { items, total: serverTotal } = await offlineSync.loadPaginatedData('orders', url, token);
      
      setOrders(items);
      setTotal(serverTotal);
    } catch(e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedOrderIds([]);
    if (token) loadOrders();
  }, [token, page, pageSize, search, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = total;
    const amountSum = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const now = new Date();
    const todayOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    });
    const todayCount = todayOrders.length;
    const todayAmount = todayOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const pendingCount = orders.filter(o => ['pending', 'apartado', 'processing'].includes(o.status || '')).length;
    return { totalOrders, amountSum, todayCount, pendingCount, todayAmount };
  }, [orders, total]);

  const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all group">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
          {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  const [showReportsMenu, setShowReportsMenu] = useState(false);
  
  const getStatusColor = (status: string = 'pending') => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'delivered': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'pending': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'apartado': return 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
      case 'canceled':
      case 'cancelled': return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      case 'processing': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'shipped': return 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';
      default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
    }
  };

  const handleSendReceipt = async (order: Order) => {
    if (!order.client?.email) {
      showToast('El cliente no tiene email registrado', 'error');
      return;
    }
    
    showToast('Enviando recibo...', 'loading');
    
    try {
      const res = await fetch(`${apiBase}/sales/receipt/send/${order.id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Error al enviar recibo');
      }
      
      showToast('Recibo enviado correctamente', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    showToast('Actualizando estado...', 'loading');
    try {
      const res = await fetch(`${apiBase}/sales/status/${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.detail || (data.status ? (Array.isArray(data.status) ? data.status[0] : data.status) : 'Error al actualizar estado');
        throw new Error(errorMsg);
      }

      showToast('Estado actualizado correctamente', 'success');
      
      // Actualizar localmente si estamos viendo el detalle
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, status: newStatus });
      }
      
      loadOrders(); // Recargar la lista y estadísticas
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    setDeletingOrder(order);
  };

  const confirmDeleteOrder = async () => {
    if (!deletingOrder) return;

    showToast('Eliminando pedido...', 'loading');

    try {
      const result = await offlineSync.queueMutation({
        token,
        method: 'DELETE',
        url: `${apiBase}/sales/status/${deletingOrder.id}/`,
        deleteLocalId: deletingOrder.id,
        store: 'orders',
      });

      if (!result.ok) {
        throw new Error('Error al eliminar pedido');
      }

      showToast(result.queued ? 'Pedido eliminado localmente. Se sincronizará al reconectar.' : 'Pedido eliminado correctamente', 'success');
      setDeletingOrder(null);
      loadOrders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteModal(false);
    showToast('Eliminando pedidos...', 'loading');
    try {
      const res = await fetch(`${apiBase}/sales/bulk-delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: selectedOrderIds })
      });
      if (!res.ok) {
        throw new Error('Error al eliminar pedidos en lote');
      }
      showToast('Pedidos eliminados correctamente', 'success');
      setSelectedOrderIds([]);
      loadOrders();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleAddPayment = async () => {
    if (!paymentModalOrder) return;
    if (!newPaymentAmount || Number(newPaymentAmount) <= 0) {
      showToast('Ingrese un monto válido', 'error');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await fetch(`${apiBase}/sales/${paymentModalOrder.id}/payments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: newPaymentAmount,
          payment_method: newPaymentMethod,
          notes: newPaymentNotes
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al registrar pago');
      }

      showToast('Pago registrado correctamente', 'success');
      setNewPaymentAmount('');
      setNewPaymentNotes('');
      setPaymentModalOrder(null);
      loadOrders();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleEmitDianInvoice = async (orderId: number) => {
    setIsEmittingDian(true);
    try {
      const res = await fetch(`${apiBase}/sales/${orderId}/emit_dian/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Error al emitir factura electrónica');
      }
      
      showToast('Factura electrónica emitida correctamente', 'success');
      loadOrders();
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ 
          ...viewOrder, 
          dian_invoice_status: 'emitted', 
          dian_invoice_id: data.dian_invoice_id,
          dian_invoice_url: data.dian_invoice_url 
        });
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsEmittingDian(false);
      setDianModalOrder(null);
    }
  };

  const getStatusLabel = (status: string = 'pending') => {
    switch(status.toLowerCase()) {
      case 'apartado': return 'Separado';
      case 'completed':
      case 'delivered': return 'Entregado';
      case 'pending': return 'Pendiente';
      case 'canceled':
      case 'cancelled': return 'Cancelado';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  const downloadReport = async (period: 'day' | 'month' | 'year') => {
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      // Buscamos una cantidad grande para cubrir el periodo (en un sistema real se filtraría por fecha en el backend)
      const response = await fetch(`${apiBase}/sales/list/?page_size=1000`, { headers });
      const data = await response.json();
      const allOrders = data.results || data;

      const now = new Date();
      const filtered = allOrders.filter((o: any) => {
        const d = new Date(o.created_at);
        if (period === 'day') {
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
        } else if (period === 'month') {
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        } else if (period === 'year') {
          return d.getFullYear() === now.getFullYear();
        }
        return true;
      });

      if (filtered.length === 0) {
        alert('No se encontraron pedidos para este periodo.');
        return;
      }

      const doc = new jsPDF();
      const periodLabel = period === 'day' ? 'Diario' : period === 'month' ? 'Mensual' : 'Anual';
      
      // Header
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE PEDIDOS', 14, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`TIPO: ${periodLabel.toUpperCase()}`, 14, 33);
      doc.text(`FECHA GENERACIÓN: ${new Date().toLocaleString()}`, 120, 33);

      const tableData = filtered.map((o: any) => [
        o.order_number,
        new Date(o.created_at).toLocaleDateString(),
        o.client?.full_name || 'N/A',
        getStatusLabel(o.status),
        o.payment_method === 'cash' ? 'Efectivo' : o.payment_method === 'transfer' ? 'Transferencia' : 'Mixto',
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(o.total_amount)
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Nº Orden', 'Fecha', 'Cliente', 'Estado', 'Método Pago', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          5: { halign: 'right', fontStyle: 'bold' }
        }
      });

      const totalAmount = filtered.reduce((acc: number, o: any) => acc + Number(o.total_amount), 0);
      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFillColor(248, 250, 252);
      doc.rect(130, finalY, 66, 20, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(130, finalY, 66, 20, 'S');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.text('TOTAL PERIODO:', 135, finalY + 8);
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalAmount), 135, finalY + 16);

      doc.save(`Reporte_Pedidos_${periodLabel}_${now.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
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

      {/* Sync Status */}
      <SyncStatusBanner
        isOnline={offlineSync.isOnline}
        pendingCount={offlineSync.pendingCount}
        syncing={offlineSync.syncing}
        lastError={offlineSync.lastError}
        onSync={offlineSync.syncNow}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Pedidos" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          label="Ventas del Día" 
          value={stats.todayAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} 
          icon={TrendingUp} 
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



      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Pedidos</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Buscar pedido o cliente..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="apartado">Separado</option>
                <option value="processing">Procesando</option>
                <option value="delivered">Entregado</option>
                <option value="canceled">Cancelado</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-2">
              <div className="relative">
                <button 
                  onClick={() => setShowReportsMenu(!showReportsMenu)}
                  className={`flex items-center gap-2 px-3 py-2 ${showReportsMenu ? 'bg-indigo-700' : 'bg-indigo-600'} hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Reportes</span>
                  <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${showReportsMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showReportsMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowReportsMenu(false)} 
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 z-50 overflow-hidden">
                      <button 
                        onClick={() => { downloadReport('day'); setShowReportsMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Reporte Diario
                      </button>
                      <button 
                        onClick={() => { downloadReport('month'); setShowReportsMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Reporte Mensual
                      </button>
                      <button 
                        onClick={() => { downloadReport('year'); setShowReportsMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        Reporte Anual
                      </button>
                    </div>
                  </>
                )}
              </div>

              {selectedOrderIds.length > 0 && canDeleteSafe && (
                <button 
                  onClick={() => setShowBulkDeleteModal(true)} 
                  className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                  title="Eliminar seleccionados"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar ({selectedOrderIds.length})</span>
                </button>
              )}

              <button onClick={loadOrders} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                {canDeleteSafe && (
                  <th className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                    <input 
                      type="checkbox"
                      checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrderIds(orders.map(o => o.id));
                        } else {
                          setSelectedOrderIds([]);
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Método de Pago</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  {canDeleteSafe && (
                    <td className="px-4 py-4 w-10">
                      <input 
                        type="checkbox"
                        checked={selectedOrderIds.includes(o.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds(prev => [...prev, o.id]);
                          } else {
                            setSelectedOrderIds(prev => prev.filter(id => id !== o.id));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">#{o.order_number}</div>
                        <div className="text-xs text-gray-500">{o.items_count} items</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{o.client?.full_name || 'Cliente Ocasional'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {Number(o.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {o.payment_method === 'cash' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            Efectivo
                          </span>
                        )}
                        {o.payment_method === 'transfer' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                            Transferencia
                          </span>
                        )}
                        {o.payment_method === 'mixed' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                            Mixto
                          </span>
                        )}
                        {!o.payment_method && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            Sin especificar
                          </span>
                        )}
                      </div>
                      {o.status === 'apartado' && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Pagado: {Number(o.total_paid || o.apartado_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <select
                        value={o.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none transition-all dark:bg-gray-900 ${getStatusColor(o.status)}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="apartado">Separado</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="canceled">Cancelado</option>
                      </select>
                      
                      {o.dian_invoice_status === 'emitted' && (
                        <a href={o.dian_invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors" title="Ver Factura Electrónica">
                          <FileText className="w-3 h-3" /> DIAN Ok
                        </a>
                      )}
                      {o.dian_invoice_status === 'error' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20" title={o.dian_error_message || 'Error DIAN'}>
                          <AlertTriangle className="w-3 h-3" /> DIAN Error
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-600">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleSilentPrint(o)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Imprimir Recibo"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSendReceipt(o)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Enviar Recibo por Correo"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewOrder(o)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canEditSafe && o.status === 'apartado' && (
                        <button 
                          onClick={() => setPaymentModalOrder(o)}
                          className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-500 transition-colors"
                          title="Gestionar Abonos"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteSafe && (
                        <button 
                          onClick={() => handleDeleteOrder(o)}
                          className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {orders.length} de {total} pedidos
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
              Página {page} de {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button 
              onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(total / pageSize)), p + 1))} 
              disabled={page === Math.max(1, Math.ceil(total / pageSize))}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Pedido #{viewOrder.order_number}</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(viewOrder.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <select
                    value={viewOrder.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(viewOrder.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none transition-all dark:bg-gray-900 ${getStatusColor(viewOrder.status)}`}
                 >
                    <option value="pending">Pendiente</option>
                    <option value="apartado">Separado</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="canceled">Cancelado</option>
                 </select>
                <button onClick={() => setViewOrder(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Client Info */}
                <div className="col-span-1 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Datos del Cliente
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Nombre</div>
                        <div className="text-gray-900 dark:text-white font-medium">{viewOrder.client?.full_name || 'Cliente Ocasional'}</div>
                      </div>
                      {viewOrder.client?.email && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Email</div>
                           <div className="text-gray-700 dark:text-gray-300 text-sm truncate">{viewOrder.client.email}</div>
                        </div>
                      )}
                      {viewOrder.client?.cedula && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Documento</div>
                           <div className="text-gray-700 dark:text-gray-300 text-sm">{viewOrder.client.cedula}</div>
                        </div>
                      )}
                      {viewOrder.client?.phone && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Teléfono</div>
                           <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">{viewOrder.client.phone}</div>
                        </div>
                      )}
                      {viewOrder.client?.address && (
                        <div>
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Dirección</div>
                           <div className="text-gray-700 dark:text-gray-300 text-sm">{viewOrder.client.address}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Resumen Financiero
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-gray-900 dark:text-white">{Number(viewOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                      </div>
                      
                      {/* Payment Method */}
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Método de Pago:</span>
                          {viewOrder.payment_method === 'cash' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                              Efectivo
                            </span>
                          )}
                          {viewOrder.payment_method === 'transfer' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                              Transferencia
                            </span>
                          )}
                          {viewOrder.payment_method === 'mixed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400">
                              Mixto
                            </span>
                          )}
                        </div>

                        {/* Payment Details */}
                        {viewOrder.payment_method === 'cash' && (
                          <div className="text-xs space-y-1 ml-0">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Efectivo:</span>
                              <span className="text-gray-900 dark:text-white font-medium">{Number(viewOrder.cash_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                            </div>
                            {Number(viewOrder.change_amount || 0) > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Vuelto:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{Number(viewOrder.change_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {viewOrder.payment_method === 'transfer' && (
                          <div className="text-xs space-y-1 ml-0">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Transferencia:</span>
                              <span className="text-gray-900 dark:text-white font-medium">{Number(viewOrder.transfer_amount || viewOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                            </div>
                          </div>
                        )}

                        {viewOrder.payment_method === 'mixed' && (
                          <div className="text-xs space-y-1 ml-0">
                            {Number(viewOrder.cash_amount || 0) > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Efectivo:</span>
                                <span className="text-gray-900 dark:text-white font-medium">{Number(viewOrder.cash_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                              </div>
                            )}
                            {Number(viewOrder.transfer_amount || 0) > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Transferencia:</span>
                                <span className="text-gray-900 dark:text-white font-medium">{Number(viewOrder.transfer_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                              </div>
                            )}
                            {Number(viewOrder.change_amount || 0) > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Vuelto:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{Number(viewOrder.change_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Envío</span>
                        <span className="text-gray-900 dark:text-white">$0</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                          {Number(viewOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </span>
                      </div>
                      
                      {viewOrder.status === 'apartado' && (
                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Total Pagado</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {Number(viewOrder.total_paid || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Saldo Pendiente</span>
                            <span className="font-bold text-amber-600 dark:text-amber-500">
                              {(Number(viewOrder.total_amount) - Number(viewOrder.total_paid || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Historial de Pagos (si es apartado) */}
                  {(viewOrder.status === 'apartado' || (viewOrder.payments && viewOrder.payments.length > 0)) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Historial de Abonos
                      </h4>
                      <div className="space-y-3">
                        {viewOrder.payments?.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {Number(p.amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                              </div>
                              <div className="text-gray-500">{p.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}</div>
                              {p.notes && <div className="text-gray-400 italic">"{p.notes}"</div>}
                            </div>
                            <div className="text-gray-400">
                              {new Date(p.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 flex justify-between items-center font-bold text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Pagado:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {Number(viewOrder.total_paid || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                          </span>
                        </div>
                        {Number(viewOrder.total_amount) - Number(viewOrder.total_paid || 0) > 0 && (
                          <div className="flex justify-between items-center font-bold text-sm text-amber-600 dark:text-amber-400">
                            <span>Saldo Pendiente:</span>
                            <span>
                              {(Number(viewOrder.total_amount) - Number(viewOrder.total_paid || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Items del Pedido ({viewOrder.items_count})
                  </h4>
                  
                  <div className="space-y-3">
                    {(viewOrder.items || []).map((it, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <div className="w-20 h-20 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                          <SafeImage 
                            src={mediaUrl(it.product?.image)} 
                            alt={it.product?.name} 
                            className="w-full h-full object-cover" 
                            fallbackIcon={<Package className="w-8 h-8 opacity-50" />}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-gray-900 dark:text-white font-medium truncate pr-2">{it.product?.name || 'Producto eliminado'}</h5>
                              <p className="text-xs text-gray-500">SKU: {it.product?.sku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 dark:text-white font-bold text-sm">
                                {Number(it.line_total).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {it.quantity} x {Number(it.unit_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                             {it.color && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                <span className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: it.color.hex }}></span>
                                {it.color.name}
                              </span>
                            )}
                            {it.variant && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 uppercase">
                                {it.variant.name}
                              </span>
                            )}
                            {it.product?.category_name && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {it.product.category_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(viewOrder.items || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        No hay items en este pedido
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {viewOrder.dian_invoice_status !== 'emitted' && (
                  <button
                    onClick={() => setDianModalOrder(viewOrder)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                  >
                    <FileText className="w-5 h-5" /> Emitir Factura DIAN
                  </button>
                )}
                {viewOrder.dian_invoice_status === 'emitted' && viewOrder.dian_invoice_url && (
                  <a
                    href={viewOrder.dian_invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-500/20 transition-colors"
                  >
                    <FileText className="w-5 h-5" /> Ver PDF Factura DIAN
                  </a>
                )}
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <button 
                    onClick={() => setViewOrder(null)} 
                    className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-colors"
                >
                    Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && printingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg h-[80vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                   <Printer className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                   Vista Previa de Recibo
                </h3>
                <button onClick={() => { setShowPrintPreview(false); setPrintingOrder(null); }} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Receipt Content - Iframe */}
             <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-200 flex justify-center p-4">
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
             <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-3">
                <button 
                   onClick={confirmSilentPrint}
                   className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                   <Printer className="w-4 h-4" /> Imprimir Recibo
                </button>
                <button 
                   onClick={() => { setShowPrintPreview(false); setPrintingOrder(null); }}
                   className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                   Cerrar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar pedido?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Estás a punto de eliminar el pedido <span className="font-mono font-bold text-gray-900 dark:text-white">#{deletingOrder.order_number}</span>. 
                Esta acción no se puede deshacer y se borrarán todos los datos asociados.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingOrder(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteOrder}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-900/20 transition-all transform hover:scale-[1.02]"
                >
                  Eliminar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar múltiples pedidos?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Estás a punto de eliminar <span className="font-bold text-gray-900 dark:text-white">{selectedOrderIds.length}</span> pedidos seleccionados. 
                Esta acción no se puede deshacer y se borrarán todos los datos asociados.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-900/20 transition-all transform hover:scale-[1.02]"
                >
                  Eliminar seleccionados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Payment Modal (Abonos) */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registrar Abono</h3>
              <button onClick={() => setPaymentModalOrder(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Orden #{paymentModalOrder.order_number}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Venta:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{Number(paymentModalOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Pagado:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{Number(paymentModalOrder.total_paid || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                </div>
                <div className="flex justify-between text-base mt-1 pt-1 border-t border-blue-200 dark:border-blue-500/30">
                  <span className="font-bold text-blue-700 dark:text-blue-300">Saldo Pendiente:</span>
                  <span className="font-black text-blue-700 dark:text-blue-300">{(Number(paymentModalOrder.total_amount) - Number(paymentModalOrder.total_paid || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Monto del Abono</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number"
                    value={newPaymentAmount}
                    onChange={(e) => setNewPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setNewPaymentMethod('cash')}
                    className={`py-2.5 rounded-xl border font-medium transition-all ${newPaymentMethod === 'cash' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  >
                    Efectivo
                  </button>
                  <button 
                    onClick={() => setNewPaymentMethod('transfer')}
                    className={`py-2.5 rounded-xl border font-medium transition-all ${newPaymentMethod === 'transfer' ? 'bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  >
                    Transferencia
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Notas (Opcional)</label>
                <textarea 
                  value={newPaymentNotes}
                  onChange={(e) => setNewPaymentNotes(e.target.value)}
                  placeholder="Ej: Pago parcial, transferencia Bancolombia..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-20 resize-none text-sm text-gray-700 dark:text-gray-300"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setPaymentModalOrder(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddPayment}
                  disabled={isSubmittingPayment || !newPaymentAmount}
                  className="flex-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {isSubmittingPayment ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DIAN Emit Modal */}
      {dianModalOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Facturación Electrónica DIAN
              </h3>
              <button onClick={() => setDianModalOrder(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 mb-2">
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Estás a punto de emitir una factura electrónica en la DIAN para el pedido <strong>#{dianModalOrder.order_number}</strong>.
                </div>
              </div>

              {!dianModalOrder.client ? (
                <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 text-sm text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-5 h-5 inline mr-1 mb-1" /> Este pedido no tiene un cliente asignado. Por favor, cancela y asigna un cliente desde la edición del pedido, o asegúrate de que sea un cliente con datos válidos para la DIAN.
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Verificación de Datos Fiscales</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 uppercase">Documento</div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {dianModalOrder.client.cedula ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                        {dianModalOrder.client.cedula || 'Faltante'}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 uppercase">Régimen</div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {dianModalOrder.client.tax_regime ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                        {dianModalOrder.client.tax_regime || 'Faltante'}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 uppercase">Email</div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {dianModalOrder.client.email ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                        <span className="truncate max-w-[120px]">{dianModalOrder.client.email || 'Faltante'}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 uppercase">Ciudad</div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {dianModalOrder.client.city ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-amber-500" />}
                        {dianModalOrder.client.city || 'Opcional'}
                      </div>
                    </div>
                  </div>

                  {(!dianModalOrder.client.cedula || !dianModalOrder.client.tax_regime) && (
                     <div className="mt-2 text-xs text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg border border-rose-200 dark:border-rose-500/20">
                       <AlertTriangle className="w-4 h-4 inline mr-1" />
                       Faltan datos fiscales requeridos para el cliente. Ve a la sección de "Clientes", edita el perfil de <b>{dianModalOrder.client.full_name}</b> y completa su Documento y Régimen Fiscal.
                     </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0 flex gap-3">
              <button 
                onClick={() => setDianModalOrder(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleEmitDianInvoice(dianModalOrder.id)}
                disabled={isEmittingDian || !dianModalOrder.client || !dianModalOrder.client.cedula || !dianModalOrder.client.tax_regime}
                className="flex-[2] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                {isEmittingDian ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isEmittingDian ? 'Emitiendo...' : 'Emitir Factura DIAN'}
              </button>
            </div>
          </div>
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

export default OrdersPage;
