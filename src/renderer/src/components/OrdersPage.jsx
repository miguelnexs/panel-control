import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FileDown, FileSpreadsheet, Eye, ShoppingCart, DollarSign, CalendarDays } from 'lucide-react';

const OrdersPage = ({ token, apiBase }) => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [form, setForm] = useState({ clientId: '', full_name: '', email: '', description: '', productId: '', colorId: '', qty: 1, unitPrice: '' });
  const authHeaders = (tkn) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${apiBase}/products/`, { headers: authHeaders(token) });
      const data = await res.json();
      const active = (Array.isArray(data) ? data : []).filter((p) => !!p.active);
      setProducts(active);
    } catch (_) {}
  };
  const loadClients = async () => {
    try {
      const res = await fetch(`${apiBase}/clients/?page_size=200`, { headers: authHeaders(token) });
      const data = await res.json();
      setClients(Array.isArray(data.results) ? data.results : []);
    } catch (_) {}
  };
  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      const res = await fetch(`${apiBase}/sales/list/?${params.toString()}`, { headers: authHeaders(token) });
      const data = await res.json();
      setOrders(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.count || 0));
    } catch (_) {}
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        const [prodsRes, clientsRes, ordersRes] = await Promise.all([
          fetch(`${apiBase}/products/`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/clients/?page_size=200`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/sales/list/?${params.toString()}`, { headers: authHeaders(token) }),
        ]);
        const prodsData = await prodsRes.json();
        const active = (Array.isArray(prodsData) ? prodsData : []).filter((p) => !!p.active);
        setProducts(active);
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData.results) ? clientsData.results : []);
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData.results) ? ordersData.results : []);
        setTotal(Number(ordersData.count || 0));
      } catch(_) {
      } finally {
        setLoading(false);
      }
    };
    if (token) loadAll();
  }, [token, page, pageSize]);

  const stats = useMemo(() => {
    const totalOrders = total;
    const amountSum = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const now = new Date();
    const todayCount = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }).length;
    const monthCount = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { totalOrders, amountSum, todayCount, monthCount };
  }, [orders, total]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const tableRef = useRef(null);

  const statusLabels = { pending: 'Pendiente', shipped: 'Enviado', delivered: 'Entregado', canceled: 'Cancelado' };
  const statusStyles = {
    pending: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
    shipped: 'bg-blue-500/20 text-blue-200 border border-blue-500/40',
    delivered: 'bg-green-500/20 text-green-200 border border-green-500/40',
    canceled: 'bg-red-500/20 text-red-200 border border-red-500/40',
  };
  const statusBadge = (st) => {
    const label = statusLabels[st] || st;
    const cls = statusStyles[st] || 'bg-gray-500/20 text-gray-200 border border-gray-500/40';
    return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{label}</span>;
  };

  const StatCard = ({ label, value, tone = 'blue', IconCmp }) => {
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
          <div className={`w-10 h-9 rounded-lg flex items-center justify-center ${toneBg}`}>
            {IconCmp ? <IconCmp className="w-5 h-5" /> : null}
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400">{label}</div>
            <div className="text-2xl font-semibold text-white">{value}</div>
          </div>
        </div>
      </div>
    );
  };

  const statuses = ['pending', 'shipped', 'delivered', 'canceled'];
  const [statusUpdating, setStatusUpdating] = useState(null);

  const changeOrderStatus = async (id, newStatus) => {
    setStatusUpdating(id);
    try {
      const res = await fetch(`${apiBase}/sales/status/${id}/`, {
        method: 'PATCH',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Error');
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: data.status } : o)));
      setMsg({ type: 'success', text: 'Estado actualizado.' });
    } catch (_) {
      setMsg({ type: 'error', text: 'No se pudo actualizar el estado.' });
    } finally {
      setStatusUpdating(null);
    }
  };

  const exportPDF = async () => {
    try {
      const el = tableRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 40;
      const imgH = (canvas.height * imgW) / canvas.width;
      let y = 20;
      pdf.setFontSize(12);
      pdf.text(`Pedidos - ${new Date().toLocaleString()}`, 20, y);
      y += 10;
      pdf.addImage(imgData, 'PNG', 20, y, imgW, Math.min(imgH, pageH - y - 20));
      pdf.save('pedidos.pdf');
      setMsg({ type: 'success', text: 'PDF generado correctamente.' });
    } catch (e) {
      setMsg({ type: 'error', text: 'No se pudo generar el PDF.' });
    }
  };

  const exportExcel = () => {
    try {
      const rows = orders.map((o) => ({
        Pedido: o.order_number,
        Cliente: o.client?.full_name,
        Estado: o.status,
        Total: Number(o.total_amount || 0),
        Fecha: new Date(o.created_at).toLocaleString(),
        Items: o.items_count,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
      XLSX.writeFile(wb, 'pedidos.xlsx');
      setMsg({ type: 'success', text: 'Excel generado correctamente.' });
    } catch (e) {
      setMsg({ type: 'error', text: 'No se pudo generar el Excel.' });
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* loading overlay removido */}
      {msg && (<div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>)}
      <div className={`opacity-100`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total pedidos" value={stats.totalOrders} IconCmp={ShoppingCart} tone="cyan" />
        <StatCard label="Monto (página)" value={stats.amountSum.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} IconCmp={DollarSign} tone="violet" />
        <StatCard label="Pedidos hoy" value={stats.todayCount} IconCmp={CalendarDays} tone="emerald" />
        <StatCard label="Este mes (página)" value={stats.monthCount} IconCmp={CalendarDays} tone="indigo" />
      </div>

      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium">Pedidos</div>
          <div className="flex items-center gap-2">
            <button onClick={exportPDF} className="px-3 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xs flex items-center gap-1"><FileDown size={16}/> PDF</button>
            <button onClick={exportExcel} className="px-3 py-2 rounded bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs flex items-center gap-1"><FileSpreadsheet size={16}/> Excel</button>
            <div className="text-gray-300 text-sm">{new Date().toLocaleString()}</div>
          </div>
        </div>
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-gray-200">
              <tr>
                <th className="px-3 py-2">N° Pedido</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-gray-700 odd:bg-gray-800/40 even:bg-gray-700/40 hover:bg-gray-700/60">
                  <td className="px-3 py-2">{o.order_number}</td>
                  <td className="px-3 py-2">{o.client?.full_name}</td>
                  <td className="px-3 py-2">{Number(o.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                  <td className="px-3 py-2">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {statusBadge(o.status)}
                      <select
                        value={o.status}
                        onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                        disabled={statusUpdating === o.id}
                        className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-3 py-2">{o.items_count}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => setViewOrder(o)} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"><Eye size={14}/> Ver</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-400" colSpan={7}>Sin pedidos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-gray-300">
          <div>
            Página {page} de {Math.max(1, Math.ceil(total / pageSize))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Anterior</button>
            <button onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(total / pageSize)), p + 1))} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Siguiente</button>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
              {[10,20,50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
            </select>
          </div>
        </div>
      </div>
      </div>
      {viewOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded-xl p-4 w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Detalle del pedido</div>
              <button onClick={() => setViewOrder(null)} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Cerrar</button>
            </div>
            <div className="text-gray-300 text-sm mb-2">Pedido: <span className="text-white font-medium">{viewOrder.order_number}</span></div>
            <div className="text-gray-300 text-sm mb-2">Cliente: <span className="text-white font-medium">{viewOrder.client?.full_name}</span></div>
            <div className="text-gray-300 text-sm mb-4">Total: <span className="text-white font-medium">{Number(viewOrder.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></div>
            <div className="overflow-y-auto flex-1">
              <div className="space-y-2">
                {(viewOrder.items || []).map((it, idx) => (
                  <div key={`it-${idx}`} className="grid grid-cols-12 gap-2 items-start bg-gray-700/40 border border-gray-600 rounded p-2">
                    <div className="col-span-2">
                      {it.product?.image ? (
                        <img src={it.product.image} alt={it.product?.name} className="w-20 h-20 object-cover rounded border border-gray-600" />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center text-gray-500 border border-dashed border-gray-600 rounded">Sin imagen</div>
                      )}
                    </div>
                    <div className="col-span-10 space-y-1">
                      <div className="text-white font-medium">{it.product?.name}</div>
                      <div className="text-gray-300 text-sm">SKU: {it.product?.sku || '—'} · Categoría: {it.product?.category_name || '—'}</div>
                      <div className="text-gray-300 text-sm">Descripción: <span className="text-gray-200">{it.product?.description || '—'}</span></div>
                      <div className="text-gray-300 text-sm flex items-center gap-2">Color: {it.color?.name || 'Sin color'} {it.color?.hex && (<span className="inline-block w-4 h-4 rounded border border-gray-600" style={{ backgroundColor: it.color.hex }} />)}</div>
                      <div className="text-gray-300 text-sm">Variante: {it.variant?.name || 'Principal'} {it.variant?.extra_price ? `· Extra: ${Number(it.variant.extra_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}` : ''}</div>
                      <div className="text-gray-300 text-sm">Cantidad: {it.quantity} · Precio unitario: {Number(it.unit_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} · Subtotal: {Number(it.line_total).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                    </div>
                  </div>
                ))}
                {(viewOrder.items || []).length === 0 && (
                  <div className="text-gray-400 text-sm">Sin items.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
