import React, { useEffect, useMemo, useState } from 'react';

const SalesPage = ({ token, apiBase, onSaleCreated }) => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientForm, setClientForm] = useState({ full_name: '', cedula: '', email: '', address: '' });
  const [openClientModal, setOpenClientModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [colorOptions, setColorOptions] = useState({});
  const [selectedColorMap, setSelectedColorMap] = useState({});
  const [variantOptions, setVariantOptions] = useState({});
  const [selectedVariantMap, setSelectedVariantMap] = useState({});
  const authHeaders = (tkn) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [openCart, setOpenCart] = useState(false);
  const [loading, setLoading] = useState(false);

  const CartIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5h2l2 9h8l2-7H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const mediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const firstColorImage = (product, colorId) => {
    if (!product) return '';
    const list = (colorOptions[product.id] || product.colors || []);
    const col = Array.isArray(list) ? list.find((c) => String(c.id) === String(colorId)) : null;
    const img = col && Array.isArray(col.images) && col.images.length > 0 ? col.images[0].image || col.images[0] : null;
    return img ? mediaUrl(img) : (product.image ? mediaUrl(product.image) : '');
  };

  const loadProducts = async () => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/products/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar productos');
      const active = (Array.isArray(data) ? data : []).filter((p) => !!p.active);
      setProducts(active);
      const map = {};
      const sel = {};
      const vmap = {};
      const vsel = {};
      for (const p of active) {
        if (Array.isArray(p.colors) && p.colors.length > 0) {
          map[p.id] = p.colors;
          sel[p.id] = String(p.colors[0].id);
        }
        if (Array.isArray(p.variants)) {
          vmap[p.id] = p.variants;
          vsel[p.id] = null;
        }
      }
      setColorOptions(map);
      setSelectedColorMap(sel);
      setVariantOptions(vmap);
      setSelectedVariantMap(vsel);
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch(`${apiBase}/clients/?page_size=200`, { headers: authHeaders(token) });
      const data = await res.json();
      setClients(Array.isArray(data.results) ? data.results : []);
    } catch (_) {}
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [prodsRes, clientsRes] = await Promise.all([
          fetch(`${apiBase}/products/`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/clients/?page_size=200`, { headers: authHeaders(token) }),
        ]);
        const prodsData = await prodsRes.json();
        const active = (Array.isArray(prodsData) ? prodsData : []).filter((p) => !!p.active);
        setProducts(active);
        const map = {};
        const sel = {};
        const vmap = {};
        const vsel = {};
        for (const p of active) {
          if (Array.isArray(p.colors) && p.colors.length > 0) {
            map[p.id] = p.colors;
            sel[p.id] = String(p.colors[0].id);
          }
          if (Array.isArray(p.variants)) {
            vmap[p.id] = p.variants;
            vsel[p.id] = null;
          }
        }
        setColorOptions(map);
        setSelectedColorMap(sel);
        setVariantOptions(vmap);
        setSelectedVariantMap(vsel);
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData.results) ? clientsData.results : []);
      } catch(_) {
      } finally {
        setLoading(false);
      }
    };
    if (token) loadAll();
  }, [token]);

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    return q === '' || String(p.name || '').toLowerCase().includes(q) || String(p.category_name || '').toLowerCase().includes(q);
  });

  const loadColors = async (productId) => {
    if (colorOptions[productId]) return;
    try {
      const res = await fetch(`${apiBase}/products/${productId}/colors/`, { headers: authHeaders(token) });
      const data = await res.json();
      const list = Array.isArray(data.results) ? data.results : [];
      setColorOptions((m) => ({ ...m, [productId]: list }));
      if (list.length > 0) setSelectedColorMap((m) => ({ ...m, [productId]: String(list[0].id) }));
    } catch (_) {
      setColorOptions((m) => ({ ...m, [productId]: [] }));
    }
  };

  const getVariantExtra = (productId, variantId) => {
    if (!variantId) return 0;
    const list = variantOptions[productId] || [];
    const v = Array.isArray(list) ? list.find((x) => String(x.id) === String(variantId)) : null;
    return v ? Number(v.extra_price || 0) : 0;
  };

  const addToCart = async (product) => {
    await loadColors(product.id);
    let sel = selectedColorMap[product.id] || null;
    const opts = colorOptions[product.id] || product.colors || [];
    if (!sel && Array.isArray(opts) && opts.length > 0) sel = String(opts[0].id);
    const vsel = selectedVariantMap[product.id] || null;
    setCart((c) => [...c, { product, colorId: sel, variantId: vsel, quantity: 1 }]);
  };

  const updateCart = (idx, patch) => {
    setCart((c) => c.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const removeCart = (idx) => {
    setCart((c) => c.filter((_, i) => i !== idx));
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, it) => {
      const base = Number(it.product.price || 0);
      const extra = getVariantExtra(it.product.id, it.variantId);
      return sum + (base + extra) * Number(it.quantity || 0);
    }, 0);
  }, [cart, variantOptions]);

  const validateCart = async () => {
    for (const it of cart) {
      const qty = Number(it.quantity || 0);
      if (!qty || qty < 1) return { ok: false, msg: 'Cantidad inválida' };
      if (it.colorId) {
        const list = (colorOptions[it.product.id] || it.product.colors || []);
        const col = Array.isArray(list) ? list.find((c) => String(c.id) === String(it.colorId)) : null;
        if (col && Number(col.stock || 0) < qty) return { ok: false, msg: 'Stock insuficiente en color' };
        // Si no se encuentra el color, no bloquear; se validará en el backend.
      } else {
        if (Number(it.product.inventory_qty || 0) < qty) return { ok: false, msg: 'Stock insuficiente del producto' };
      }
    }
    return { ok: true };
  };

  const submitSale = async () => {
    setMsg(null);
    if (!token) { setMsg({ type: 'error', text: 'Sesión no válida' }); return; }
    const clientOk = (() => {
      if (selectedClientId) return true;
      const nameOk = (clientForm.full_name || '').trim().length >= 3;
      const cedOk = /^[0-9]{6,12}$/.test((clientForm.cedula || '').trim());
      const mailOk = /^\S+@\S+\.\S+$/.test((clientForm.email || '').trim());
      const addrOk = (clientForm.address || '').trim().length >= 5;
      return nameOk && cedOk && mailOk && addrOk;
    })();
    if (!clientOk) { setMsg({ type: 'error', text: 'Seleccione un cliente o complete los datos del nuevo cliente' }); return; }
    const val = await validateCart();
    if (!val.ok) { setMsg({ type: 'error', text: val.msg }); return; }
    const payload = {
      client_id: selectedClientId || undefined,
      client_full_name: selectedClientId ? undefined : (clientForm.full_name || '').trim(),
      client_cedula: selectedClientId ? undefined : (clientForm.cedula || '').trim(),
      client_email: selectedClientId ? undefined : (clientForm.email || '').trim(),
      client_address: selectedClientId ? undefined : (clientForm.address || '').trim(),
      items: cart.map((it) => ({ product_id: it.product.id, color_id: it.colorId ? Number(it.colorId) : null, variant_id: it.variantId ? Number(it.variantId) : null, quantity: Number(it.quantity) })),
    };
    try {
      const res = await fetch(`${apiBase}/sales/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        const detail = typeof data === 'object' ? (data.detail || JSON.stringify(data)) : 'Error desconocido';
        throw new Error(detail);
      }
      setMsg({ type: 'success', text: 'Venta registrada' });
      setCart([]);
      loadProducts();
      if (onSaleCreated) onSaleCreated();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* loading overlay removido */}
      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>
      )}
      <div className={`opacity-100`}>
        <div className="bg-white/5 border border-white/10 rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-semibold">Ventas</div>
            <div className="flex items-center gap-2">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..." className="px-3 py-2 text-xs rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => setOpenCart(true)} className="relative px-3 py-2 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                <CartIcon className="w-4 h-4" />
                <span>Carrito · {totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] rounded-full px-1 min-w-[18px] text-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const sel = selectedColorMap[p.id];
              const imgSrc = sel ? firstColorImage(p, sel) : (p.image ? mediaUrl(p.image) : '');
              return (
                <div key={p.id} className="bg-gradient-to-b from-gray-900 to-gray-800 border border-white/10 rounded-lg p-3 shadow transition transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="aspect-square mb-2 rounded overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-600">Sin imagen</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.category_name || ''}</div>
                    </div>
                    <div className="text-gray-200 text-sm font-semibold">{Number(p.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  </div>
                  {Array.isArray(colorOptions[p.id]) && colorOptions[p.id].length > 0 ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {colorOptions[p.id].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedColorMap((m) => ({ ...m, [p.id]: String(c.id) }))}
                            className={`w-5 h-5 rounded-full border ${String(selectedColorMap[p.id]) === String(c.id) ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-600'}`}
                            style={{ backgroundColor: c.hex }}
                            aria-label={c.name}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">stock: {(colorOptions[p.id].find((c) => String(c.id) === String(selectedColorMap[p.id])) || {}).stock || 0}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-400">Color único</div>
                  )}
                  {(Array.isArray(variantOptions[p.id]) && variantOptions[p.id].length > 0) && (
                    <div className="mt-2">
                      <select value={selectedVariantMap[p.id] || ''} onChange={(e) => setSelectedVariantMap((m) => ({ ...m, [p.id]: e.target.value || null }))} className="w-full px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                        <option value="">Principal</option>
                        {variantOptions[p.id].map((v) => (
                          <option key={v.id} value={v.id}>{v.name} · +{Number(v.extra_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button onClick={() => addToCart(p)} className="mt-3 w-full px-3 py-2 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white">Agregar</button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-gray-400 text-sm">Sin productos activos</div>
            )}
          </div>
        </div>

        {openCart && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-4 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white font-medium"><CartIcon className="w-5 h-5" /><span>Carrito</span></div>
                <button onClick={() => setOpenCart(false)} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Cerrar</button>
              </div>
              <div className="overflow-y-auto flex-1">
                <div className="space-y-2">
                  {cart.map((it, idx) => {
                    const imgSrc = it.colorId ? firstColorImage(it.product, it.colorId) : (it.product.image ? mediaUrl(it.product.image) : '');
                    return (
                      <div key={`it-${idx}`} className="grid grid-cols-12 gap-2 items-center bg-gray-700/40 border border-gray-600 rounded p-2">
                        <div className="col-span-1">
                          {imgSrc ? (
                            <img src={imgSrc} alt={it.product.name} className="w-12 h-12 object-cover rounded border border-gray-600" />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center text-gray-500 border border-dashed border-gray-600 rounded">—</div>
                          )}
                        </div>
                        <div className="col-span-3 text-gray-200 text-sm">{it.product.name}</div>
                        <div className="col-span-3 flex items-center gap-2">
                          <select value={it.colorId || ''} onChange={(e) => updateCart(idx, { colorId: e.target.value || null })} className="flex-1 px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                            <option value="">Sin color</option>
                            {Array.isArray(colorOptions[it.product.id]) && colorOptions[it.product.id].map((c) => (
                              <option key={c.id} value={c.id}>{c.name} - stock: {c.stock}</option>
                            ))}
                          </select>
                          <div className="w-5 h-5 rounded border border-gray-600" style={{ backgroundColor: (Array.isArray(colorOptions[it.product.id]) ? (colorOptions[it.product.id].find((c) => String(c.id) === String(it.colorId)) || {}).hex : '#000000') || '#000000' }} />
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          {(Array.isArray(variantOptions[it.product.id]) && variantOptions[it.product.id].length > 0) ? (
                            <select value={it.variantId || ''} onChange={(e) => updateCart(idx, { variantId: e.target.value || null })} className="flex-1 px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                              <option value="">Principal</option>
                              {variantOptions[it.product.id].map((v) => (
                                <option key={v.id} value={v.id}>{v.name} · +{Number(v.extra_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-xs text-gray-400">Sin variantes</div>
                          )}
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          <button onClick={() => updateCart(idx, { quantity: Math.max(1, Number(it.quantity || 1) - 1) })} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">-</button>
                          <input type="number" min={1} value={it.quantity} onChange={(e) => updateCart(idx, { quantity: Number(e.target.value) })} className="w-16 px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600" />
                          <button onClick={() => updateCart(idx, { quantity: Number(it.quantity || 0) + 1 })} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">+</button>
                        </div>
                        <div className="col-span-2 text-gray-200 text-sm text-right">{((Number(it.product.price || 0) + getVariantExtra(it.product.id, it.variantId)) * Number(it.quantity || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                        <div className="col-span-12 flex items-center justify-end">
                          <button onClick={() => removeCart(idx)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Quitar</button>
                        </div>
                      </div>
                    );
                  })}
                  {cart.length === 0 && (
                    <div className="text-gray-400 text-sm">No hay productos en el carrito.</div>
                  )}
                </div>
              </div>
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">Total: {totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  <div className="flex items-center gap-2">
                    <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                      <option value="">Selecciona cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.full_name}</option>
                      ))}
                    </select>
                    <button onClick={() => { setClientForm({ full_name: '', cedula: '', email: '', address: '' }); setOpenClientModal(true); }} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white">Nuevo cliente</button>
                    <button onClick={submitSale} disabled={cart.length === 0} className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">Registrar venta</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {openClientModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-lg">
            <div className="text-white font-medium mb-3">Nuevo cliente</div>
            <form onSubmit={async (e) => { e.preventDefault(); try { const fd = new FormData(); fd.append('full_name', (clientForm.full_name||'').trim()); fd.append('cedula', (clientForm.cedula||'').trim()); fd.append('email', (clientForm.email||'').trim()); fd.append('address', (clientForm.address||'').trim()); const res = await fetch(`${apiBase}/clients/`, { method: 'POST', headers: authHeaders(token), body: fd }); const data = await res.json(); if (!res.ok) { const detail = typeof data === 'object' ? (data.detail || JSON.stringify(data)) : 'Error desconocido'; setMsg({ type: 'error', text: detail }); return; } setOpenClientModal(false); setSelectedClientId(String(data.id)); setClients((prev) => [{ id: data.id, full_name: data.full_name, cedula: data.cedula, email: data.email, address: data.address }, ...prev]); setMsg({ type: 'success', text: 'Cliente agregado' }); } catch (err) { setMsg({ type: 'error', text: err.message }); } }} className="space-y-3">
              <input type="text" value={clientForm.full_name} onChange={(e) => setClientForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Nombre completo" className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" />
              <input type="text" value={clientForm.cedula} onChange={(e) => setClientForm((f) => ({ ...f, cedula: e.target.value }))} placeholder="Cédula" className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" />
              <input type="email" value={clientForm.email} onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))} placeholder="Correo" className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" />
              <textarea value={clientForm.address} onChange={(e) => setClientForm((f) => ({ ...f, address: e.target.value }))} placeholder="Dirección" className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" rows={3} />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpenClientModal(false)} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
