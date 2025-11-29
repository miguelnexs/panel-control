import React, { useEffect, useMemo, useState } from 'react';

const ClientsPage = ({ token, apiBase }) => {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [ordering, setOrdering] = useState('-created_at');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ full_name: '', cedula: '', email: '', address: '' });
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({ total: 0, new_this_month: 0, top_cities: [] });
  const [open, setOpen] = useState(false);
  const [viewClient, setViewClient] = useState(null);
  const [viewOrders, setViewOrders] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', cedula: '', email: '', address: '' });

  const authHeaders = (tkn) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadClients = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (ordering) params.set('ordering', ordering);
      const res = await fetch(`${apiBase}/clients/?${params.toString()}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar clientes');
      setItems(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.count || 0));
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${apiBase}/clients/stats/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (_) {}
  };

  useEffect(() => { if (token) { loadClients(); loadStats(); } }, [token, page, pageSize, search, ordering]);

  const validateForm = () => {
    const e = {};
    if (!form.full_name || form.full_name.trim().length < 3) e.full_name = 'Nombre obligatorio';
    if (!/^[0-9]{6,12}$/.test(form.cedula || '')) e.cedula = 'Cédula 6-12 dígitos';
    if (!/^\S+@\S+\.\S+$/.test(form.email || '')) e.email = 'Correo inválido';
    if (!form.address || form.address.trim().length < 5) e.address = 'Dirección obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!validateForm()) return;
    try {
      const fd = new FormData();
      fd.append('full_name', form.full_name);
      fd.append('cedula', form.cedula);
      fd.append('email', form.email);
      fd.append('address', form.address);
      const res = await fetch(`${apiBase}/clients/`, { method: 'POST', headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo registrar el cliente');
      setMsg({ type: 'success', text: 'Cliente registrado' });
      setForm({ full_name: '', cedula: '', email: '', address: '' });
      setOpen(false);
      loadClients();
      loadStats();
    } catch (e2) {
      setMsg({ type: 'error', text: e2.message });
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const SimpleBar = ({ data }) => {
    const max = Math.max(...data.map((d) => d.count || 0), 1);
    return (
      <div className="flex items-end gap-2 h-16">
        {data.map((d, i) => (
          <div key={i} className="w-4 bg-blue-500/70" style={{ height: `${(d.count / max) * 100}%` }} title={`${d.label}: ${d.count}`} />
        ))}
      </div>
    );
  };

  const SimplePie = ({ data }) => {
    const totalCount = data.reduce((acc, d) => acc + (d.count || 0), 0) || 1;
    let acc = 0;
    const segments = data.map((d) => {
      const start = acc / totalCount * 2 * Math.PI;
      acc += d.count || 0;
      const end = acc / totalCount * 2 * Math.PI;
      const x1 = 50 + 50 * Math.cos(start);
      const y1 = 50 + 50 * Math.sin(start);
      const x2 = 50 + 50 * Math.cos(end);
      const y2 = 50 + 50 * Math.sin(end);
      const largeArc = end - start > Math.PI ? 1 : 0;
      return { d, path: `M50,50 L${x1},${y1} A50,50 0 ${largeArc} 1 ${x2},${y2} Z` };
    });
    const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6'];
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={colors[i % colors.length]} title={`${s.d.label}: ${s.d.count}`} />
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-4 relative">
      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>
      )}
      {/* loading overlay removido */}

      <div className={`space-y-4 opacity-100`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gray-800/60 border border-white/10 rounded p-2">
              <div className="text-xs text-gray-400">Total clientes</div>
              <div className="text-base text-white font-semibold">{stats.total}</div>
            </div>
            <div className="bg-gray-800/60 border border-white/10 rounded p-2">
              <div className="text-xs text-gray-400">Nuevos este mes</div>
              <div className="text-base text-white font-semibold">{stats.new_this_month}</div>
            </div>
            <div className="bg-gray-800/60 border border-white/10 rounded p-2">
              <div className="text-xs text-gray-400">Top ciudades</div>
              <SimpleBar data={stats.top_cities} />
            </div>
            <div className="bg-gray-800/60 border border-white/10 rounded p-2">
              <div className="text-xs text-gray-400">Nuevos hoy</div>
              <div className="text-base text-white font-semibold">{stats.new_today || 0}</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Clientes</div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setForm({ full_name: '', cedula: '', email: '', address: '' }); setErrors({}); setOpen(true); }} className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white">Nuevo cliente</button>
                <input type="text" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Buscar..." className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600" />
                <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                  <option value="full_name">Nombre A-Z</option>
                  <option value="-full_name">Nombre Z-A</option>
                  <option value="cedula">Cédula</option>
                  <option value="email">Correo</option>
                  <option value="-created_at">Más recientes</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-800 text-gray-200">
                  <tr>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Cédula</th>
                    <th className="px-3 py-2">Correo</th>
                    <th className="px-3 py-2">Dirección</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-t border-gray-700">
                      <td className="px-3 py-2">{c.full_name}</td>
                      <td className="px-3 py-2">{c.cedula}</td>
                      <td className="px-3 py-2">{c.email}</td>
                      <td className="px-3 py-2 whitespace-pre-wrap">{c.address}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={async () => { try { setViewLoading(true); const res = await fetch(`${apiBase}/clients/orders/${c.id}/`, { headers: authHeaders(token) }); const data = await res.json(); if (res.ok) { setViewClient(data.client); setViewOrders(data.orders || []); } } catch(_){} finally { setViewLoading(false); } }} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white">Ver</button>
                          <button onClick={() => { setEditClient(c); setEditForm({ full_name: c.full_name || '', cedula: c.cedula || '', email: c.email || '', address: c.address || '' }); }} className="px-2 py-1 text-xs rounded bg-yellow-600 hover:bg-yellow-700 text-white">Editar</button>
                          <button onClick={async () => { if (!confirm('Eliminar cliente?')) return; try { const res = await fetch(`${apiBase}/clients/${c.id}/`, { method: 'DELETE', headers: authHeaders(token) }); if (res.ok) { loadClients(); loadStats(); } } catch(_){} }} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-center text-gray-400" colSpan={4}>No hay clientes registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3 text-gray-300">
              <div>
                Página {page} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Anterior</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Siguiente</button>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                  {[10,20,50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-lg">
            <div className="text-white font-medium mb-3">Registrar cliente</div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-200 text-sm mb-1">Nombre completo</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.full_name ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                {errors.full_name && <div className="mt-1 text-xs text-red-300">{errors.full_name}</div>}
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-1">Cédula</label>
                <input type="text" value={form.cedula} onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))} required className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.cedula ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                {errors.cedula && <div className="mt-1 text-xs text-red-300">{errors.cedula}</div>}
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-1">Correo electrónico</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.email ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                {errors.email && <div className="mt-1 text-xs text-red-300">{errors.email}</div>}
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-1">Dirección</label>
                <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.address ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} rows={3} />
                {errors.address && <div className="mt-1 text-xs text-red-300">{errors.address}</div>}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">{loading ? 'Guardando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewClient && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Detalle del cliente</div>
              <button onClick={() => { setViewClient(null); setViewOrders([]); }} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Cerrar</button>
            </div>
            {viewLoading && (
              <div className="mb-3 p-3 rounded bg-white/5 border border-white/10 text-sm text-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <span>Cargando detalle del cliente...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-200 mb-4">
              <div><div className="text-xs text-gray-400">Nombre</div><div className="font-medium">{viewClient.full_name}</div></div>
              <div><div className="text-xs text-gray-400">Cédula</div><div className="font-medium">{viewClient.cedula}</div></div>
              <div><div className="text-xs text-gray-400">Correo</div><div className="font-medium">{viewClient.email}</div></div>
              <div><div className="text-xs text-gray-400">Dirección</div><div className="font-medium whitespace-pre-wrap">{viewClient.address}</div></div>
            </div>
            <div className="text-white font-medium mb-2">Pedidos</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-gray-300">
                <thead className="bg-gray-800 text-gray-200">
                  <tr>
                    <th className="px-3 py-2">Orden</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrders.map((o) => (
                    <tr key={o.id} className="border-t border-gray-700">
                      <td className="px-3 py-2">{o.order_number}</td>
                      <td className="px-3 py-2">{o.status}</td>
                      <td className="px-3 py-2">{new Date(o.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{Number(o.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                      <td className="px-3 py-2">
                        <ul className="list-disc pl-4">
                          {o.items.map((it, i) => (
                            <li key={i}>{it.product}{it.color ? ` (${it.color})` : ''} × {it.quantity}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                  {viewOrders.length === 0 && (
                    <tr><td className="px-3 py-3 text-gray-400" colSpan={5}>Sin pedidos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {editClient && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-lg">
            <div className="text-white font-medium mb-3">Editar cliente</div>
            <form onSubmit={async (e) => { e.preventDefault(); try { const res = await fetch(`${apiBase}/clients/${editClient.id}/`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) }); if (res.ok) { setEditClient(null); loadClients(); } } catch(_){} }} className="space-y-3">
              <input value={editForm.full_name} onChange={(e)=>setEditForm((f)=>({...f, full_name: e.target.value}))} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Nombre" />
              <input value={editForm.cedula} onChange={(e)=>setEditForm((f)=>({...f, cedula: e.target.value}))} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Cédula" />
              <input type="email" value={editForm.email} onChange={(e)=>setEditForm((f)=>({...f, email: e.target.value}))} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Correo" />
              <textarea value={editForm.address} onChange={(e)=>setEditForm((f)=>({...f, address: e.target.value}))} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" rows={3} placeholder="Dirección" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditClient(null)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
