import React, { useEffect, useState } from 'react';

const ProductosManager = ({ token, apiBase, onCreate, onEdit }) => {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [sku, setSku] = useState('');
  const [inventoryQty, setInventoryQty] = useState('0');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [colors, setColors] = useState([]);
  const [initialColors, setInitialColors] = useState([]);
  const [viewColors, setViewColors] = useState([]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [colorStock, setColorStock] = useState('0');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const authHeaders = (tkn) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadProducts = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar productos');
      setItems(data);
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadProducts(); }, [token]);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await fetch(`${apiBase}/products/categories/?page_size=100`, { headers: authHeaders(token) });
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        setCategories(results);
        if (results.length > 0 && !categoryId) setCategoryId(String(results[0].id));
      } catch (e) {}
    };
    if (token) loadCats();
  }, [token]);

  
  const formatCurrency = (v) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };
  const normalizePrice = (v) => {
    const s = String(v).replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = s.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]) parts[1] = parts[1].slice(0, 2);
    return parts.join('.');
  };
  const totalStockOf = (p) => {
    const t = Number(p.total_stock ?? p.inventory_qty ?? 0);
    return Number.isFinite(t) ? t : 0;
  };
  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q === '' || String(p.name || '').toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || String(p.category) === String(categoryFilter) || String(p.category_name || '') === String(categoryFilter);
    const matchesActive = activeFilter === 'all' || (activeFilter === 'active' ? !!p.active : !p.active);
    const s = totalStockOf(p);
    const matchesLowStock = !lowStockOnly || s < Number(lowStockThreshold || 0);
    return matchesSearch && matchesCategory && matchesActive && matchesLowStock;
  });
  const statsTotal = items.length;
  const statsLow = items.filter((p) => totalStockOf(p) < Number(lowStockThreshold || 0)).length;
  const statsActive = items.filter((p) => !!p.active).length;
  const statsInactive = items.filter((p) => !p.active).length;
  const validateClient = () => {
    const errs = {};
    const nameOk = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\-\s]{1,100}$/.test(name);
    if (!nameOk) errs.name = 'Nombre requerido, máx 100 y sin caracteres inválidos.';
    const priceNorm = normalizePrice(price);
    const priceNum = Number(priceNorm);
    if (!priceNorm || Number.isNaN(priceNum) || priceNum <= 0) errs.price = 'Precio debe ser positivo con 2 decimales.';
    if (description.length > 500) errs.description = 'Descripción máximo 500 caracteres.';
    if (!categories.find((c) => String(c.id) === String(categoryId))) errs.category = 'Debe seleccionar una categoría válida.';
    if (sku && !/^[A-Za-z0-9\-]{1,50}$/.test(sku)) errs.sku = 'SKU inválido (alfanumérico y guiones).';
    const inv = Number(inventoryQty);
    if (!Number.isInteger(inv) || inv < 0) errs.inventoryQty = 'Cantidad debe ser entero positivo.';
    if (imageFile) {
      const ok = ['image/jpeg','image/png','image/webp'].includes(imageFile.type);
      if (!ok) errs.image = 'Formato de imagen inválido (jpeg, png, webp).';
    }
    if (colors.some((c) => !c.name || !/^#[0-9A-Fa-f]{6}$/.test(c.hex) || Number(c.stock) < 0 || !Number.isInteger(Number(c.stock)))) {
      errs.colors = 'Verifique nombre, HEX (#RRGGBB) y stock entero positivo de los colores.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      if (!validateClient()) { setLoading(false); return; }
      const fd = new FormData();
      fd.append('name', name);
      fd.append('price', normalizePrice(price));
      fd.append('category', categoryId);
      fd.append('sku', sku);
      fd.append('inventory_qty', String(Number(inventoryQty)));
      fd.append('description', description);
      fd.append('active', active ? 'true' : 'false');
      if (imageFile) fd.append('image', imageFile);
      const url = editing ? `${apiBase}/products/${editing.id}/` : `${apiBase}/products/`;
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (editing ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto'));
      setMsg({ type: 'success', text: editing ? 'Producto actualizado' : 'Producto creado' });
      setName('');
      setPrice('');
      setCategoryId(categories.length ? String(categories[0].id) : '');
      setSku('');
      setInventoryQty('0');
      setDescription('');
      setActive(true);
      setImageFile(null);
      // Sincronizar colores
      try {
        const productId = editing ? editing.id : data.id;
        const existing = initialColors;
        const current = colors.map((c, idx) => ({ ...c, position: idx }));
        const existingIds = new Set(existing.filter((e) => e.id).map((e) => String(e.id)));
        const currentIds = new Set(current.filter((e) => e.id).map((e) => String(e.id)));
        for (const e of existing) {
          if (e.id && !currentIds.has(String(e.id))) {
            await fetch(`${apiBase}/products/colors/${e.id}/`, { method: 'DELETE', headers: authHeaders(token) });
          }
        }
        for (let c of current) {
          if (!c.id) {
            const fdColor = new FormData();
            fdColor.append('name', c.name);
            fdColor.append('hex', c.hex);
            fdColor.append('stock', String(Number(c.stock || 0)));
            fdColor.append('position', String(c.position));
            const createRes = await fetch(`${apiBase}/products/${productId}/colors/`, { method: 'POST', headers: authHeaders(token), body: fdColor });
            const created = await createRes.json();
            if (createRes.ok && created && created.id) {
              c = { ...c, id: created.id };
            }
          } else {
            const prev = existing.find((e) => String(e.id) === String(c.id)) || {};
            const changed = prev.name !== c.name || prev.hex !== c.hex || String(prev.stock) !== String(c.stock) || Number(prev.position) !== Number(c.position);
            if (changed) {
              const fdColor = new FormData();
              fdColor.append('name', c.name);
              fdColor.append('hex', c.hex);
              fdColor.append('stock', String(Number(c.stock || 0)));
              fdColor.append('position', String(c.position));
              await fetch(`${apiBase}/products/colors/${c.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdColor });
            }
          }
          const existingImgsRes = await fetch(`${apiBase}/products/colors/${c.id}/images/`, { headers: authHeaders(token) });
          const existingImgsData = await existingImgsRes.json();
          const existingImgs = Array.isArray(existingImgsData.results) ? existingImgsData.results : existingImgsData;
          const existingImgIds = new Set((Array.isArray(existingImgs) ? existingImgs : []).map((im) => String(im.id)));
          const currentImgs = Array.isArray(c.images) ? c.images.map((im, pos) => ({ ...im, position: pos })) : [];
          const currentImgIds = new Set(currentImgs.filter((im) => im.id).map((im) => String(im.id)));
          for (const im of (Array.isArray(existingImgs) ? existingImgs : [])) {
            if (!currentImgIds.has(String(im.id))) {
              await fetch(`${apiBase}/products/color-images/${im.id}/`, { method: 'DELETE', headers: authHeaders(token) });
            }
          }
          for (const im of currentImgs) {
            if (!im.id && im.file) {
              const fdImg = new FormData();
              fdImg.append('image', im.file);
              fdImg.append('position', String(im.position));
              await fetch(`${apiBase}/products/colors/${c.id}/images/`, { method: 'POST', headers: authHeaders(token), body: fdImg });
            } else if (im.id) {
              const fdImg = new FormData();
              fdImg.append('position', String(im.position));
              await fetch(`${apiBase}/products/color-images/${im.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdImg });
            }
          }
        }
      } catch (_) {}

      setEditing(null);
      setOpen(false);
      loadProducts();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/products/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'No se pudo eliminar');
      }
      setMsg({ type: 'success', text: 'Producto eliminado' });
      loadProducts();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const mediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  return (
    <div className="space-y-4 relative">
      {/* loading overlay removido */}
      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
          {msg.text}
        </div>
      )}
      <div className={`opacity-100`}>
      <div className="bg-white/5 border border-white/10 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium">Productos</div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (onCreate) onCreate(); }} className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white">Nuevo producto</button>
            <button onClick={loadProducts} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Recargar</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/60 border border-white/10 rounded p-3">
            <div className="text-xs text-gray-400">Total productos</div>
            <div className="text-lg text-white font-semibold">{statsTotal}</div>
          </div>
          <div className="bg-gray-800/60 border border-white/10 rounded p-3">
            <div className="text-xs text-gray-400">Bajo stock (&lt;{lowStockThreshold})</div>
            <div className="text-lg text-white font-semibold">{statsLow}</div>
          </div>
          <div className="bg-gray-800/60 border border-white/10 rounded p-3">
            <div className="text-xs text-gray-400">Activos</div>
            <div className="text-lg text-white font-semibold">{statsActive}</div>
          </div>
          <div className="bg-gray-800/60 border border-white/10 rounded p-3">
            <div className="text-xs text-gray-400">Inactivos</div>
            <div className="text-lg text-white font-semibold">{statsInactive}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre"
            className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-xs md:col-span-2"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-xs"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-xs"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-gray-300 text-xs">
              <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} /> Bajo stock
            </label>
            <input type="number" min={0} value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)} className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-3 py-2">Imagen</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Precio</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Stock total</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-gray-700">
                  <td className="px-3 py-2">
                    {p.image ? (
                      <img src={mediaUrl(p.image)} alt="Producto" className="w-16 h-16 object-cover rounded border border-gray-600" loading="lazy" />
                    ) : (
                      <span className="text-gray-500">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{formatCurrency(p.price)}</td>
                  <td className="px-3 py-2">{p.category_name || ''}</td>
                  <td className="px-3 py-2">{p.active ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-3 py-2">{totalStockOf(p)}</td>
                  <td className="px-3 py-2">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button onClick={async () => { setViewing(p); try { const res = await fetch(`${apiBase}/products/${p.id}/colors/`, { headers: authHeaders(token) }); const data = await res.json(); const list = Array.isArray(data.results) ? data.results : data; setViewColors(Array.isArray(list) ? list : []); } catch (_) { setViewColors([]); } }} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Ver</button>
                      <button onClick={() => { if (onEdit) onEdit(p); }} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white">Editar</button>
                      <button onClick={() => removeProduct(p.id)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-400" colSpan={4}>No hay productos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      

      {viewing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Detalle del producto</div>
              <button onClick={() => setViewing(null)} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Cerrar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                {viewing.image ? (
                  <img src={mediaUrl(viewing.image)} alt={viewing.name} className="w-full h-40 object-cover rounded border border-gray-600" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-500 border border-dashed border-gray-600 rounded">Sin imagen</div>
                )}
              </div>
              <div className="md:col-span-2 space-y-2 text-gray-200">
                <div><span className="text-gray-400">Nombre:</span> {viewing.name}</div>
                <div><span className="text-gray-400">Precio:</span> {formatCurrency(viewing.price)}</div>
                <div><span className="text-gray-400">Categoría:</span> {viewing.category_name || ''}</div>
                <div><span className="text-gray-400">SKU:</span> {viewing.sku || ''}</div>
                <div><span className="text-gray-400">Cantidad:</span> {viewing.inventory_qty}</div>
                <div><span className="text-gray-400">Estado:</span> {viewing.active ? 'Activo' : 'Inactivo'}</div>
                <div><span className="text-gray-400">Fecha:</span> {new Date(viewing.created_at).toLocaleString()}</div>
                <div className="mt-2"><span className="text-gray-400">Descripción:</span>
                  <p className="mt-1 whitespace-pre-wrap">{viewing.description}</p>
                </div>
                <div className="mt-2"><span className="text-gray-400">Colores:</span>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {viewColors.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 bg-gray-700/40 border border-gray-600 rounded p-2">
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: c.hex }} />
                        <div className="text-xs text-gray-200">{c.name} · Stock: {c.stock}</div>
                      </div>
                    ))}
                    {viewColors.length === 0 && (
                      <div className="text-xs text-gray-400">Sin colores definidos.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosManager;
