import React, { useEffect, useMemo, useState } from 'react';

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

  return (
    <div className="space-y-4 relative">
      {/* loading overlay removido */}
      {msg && (<div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>)}
      <div className={`opacity-100`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-gray-800/60 border border-white/10 rounded p-2">
          <div className="text-xs text-gray-400">Total pedidos</div>
          <div className="text-base text-white font-semibold">{stats.totalOrders}</div>
        </div>
        <div className="bg-gray-800/60 border border-white/10 rounded p-2">
          <div className="text-xs text-gray-400">Monto (página)</div>
          <div className="text-base text-white font-semibold">{stats.amountSum.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
        </div>
        <div className="bg-gray-800/60 border border-white/10 rounded p-2">
          <div className="text-xs text-gray-400">Pedidos hoy</div>
          <div className="text-base text-white font-semibold">{stats.todayCount}</div>
        </div>
        <div className="bg-gray-800/60 border border-white/10 rounded p-2">
          <div className="text-xs text-gray-400">Este mes (página)</div>
          <div className="text-base text-white font-semibold">{stats.monthCount}</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium">Pedidos</div>
          <div className="text-gray-300 text-sm">Fecha y hora: {new Date().toLocaleString()}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-3 py-2">N° Pedido</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-gray-700">
                  <td className="px-3 py-2">{o.order_number}</td>
                  <td className="px-3 py-2">{o.client?.full_name}</td>
                  <td className="px-3 py-2">{Number(o.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                  <td className="px-3 py-2">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{o.items_count}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => setViewOrder(o)} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Ver</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-400" colSpan={5}>Sin pedidos registrados.</td>
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
