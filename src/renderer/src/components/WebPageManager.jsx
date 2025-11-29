import React, { useEffect, useMemo, useState } from 'react';

const WebPageManager = ({ token, apiBase, adminId, role, setView, setProductEditing }) => {
  const headers = (tkn, json = true) => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [tab, setTab] = useState('productos');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', stock: '', active: true, images: [] });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [settings, setSettings] = useState({ primary_color: '#0ea5e9', secondary_color: '#1f2937', font_family: 'Inter, system-ui, sans-serif', currencies: 'COP', site_url: '', company_name: '', company_nit: '', company_phone: '', company_whatsapp: '', company_email: '', company_address: '', company_description: '', logo: null });
  const [policy, setPolicy] = useState({ shipping_text: '', returns_text: '' });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  
  const [stats, setStats] = useState({ visits_total: 0, conversions_total: 0 });
  const [visible, setVisible] = useState({});
  const [visibleCats, setVisibleCats] = useState({});

  const mediaUrl = (p) => (p && p.startsWith('http')) ? p : `${apiBase}${p}`;

  const loadBasics = async () => {
    try {
      const headersAuth = headers(token);
      const catsPromise = fetch(`${apiBase}/products/categories/?page_size=100`, { headers: headersAuth });
      const prodsPromise = fetch(`${apiBase}/products/`, { headers: headersAuth });
      const visPromise = fetch(`${apiBase}/webconfig/visible-products/`, { headers: headersAuth });
      const visCatsPromise = fetch(`${apiBase}/webconfig/visible-categories/`, { headers: headersAuth });

      // Mostrar productos tan pronto como estén disponibles
      const prodsRes = await prodsPromise;
      const prods = await prodsRes.json();
      setProducts(Array.isArray(prods) ? prods : []);

      // Resolver el resto en paralelo
      const [catsRes, visRes, visCatsRes] = await Promise.all([catsPromise, visPromise, visCatsPromise]);
      const cats = await catsRes.json();
      const vis = await visRes.json();
      const visCats = await visCatsRes.json();
      setCategories(cats.results || []);
      const map = {};
      if (Array.isArray(vis)) { vis.forEach((v) => { if (v.active) map[v.product] = true; }); }
      setVisible(map);
      const mapCats = {};
      if (Array.isArray(visCats)) { visCats.forEach((v) => { if (v.active) mapCats[v.category] = true; }); }
      setVisibleCats(mapCats);
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, { headers: headers(token) });
      const data = await res.json();
      if (res.ok) {
        setSettings((s) => ({
          ...s,
          company_name: data.company_name || '',
          company_nit: data.company_nit || '',
          company_phone: data.company_phone || '',
          company_whatsapp: data.company_whatsapp || '',
          company_email: data.company_email || '',
          company_address: data.company_address || '',
          company_description: data.company_description || '',
          site_url: data.site_url || '',
          logo: data.logo || null,
        }));
      }
    } catch {}
  };

  useEffect(() => { if (token) loadBasics(); }, [token]);
  // Se elimina el refresco periódico para reducir carga
  useEffect(() => { if (token && tab === 'configuraciones') loadSettings(); }, [token, tab]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
      const matchCat = !filterCat || (p.category && String(p.category.id) === String(filterCat));
      const matchAct = !filterActive || String(!!p.active) === String(filterActive === '1');
      return matchQ && matchCat && matchAct;
    });
  }, [products, query, filterCat, filterActive]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, [name]: value }));
  };

  const handleImages = (files) => {
    setForm((f) => ({ ...f, images: files }));
  };

  const handleLogo = (e) => {
    const file = e.target.files && e.target.files[0];
    setLogoFile(file || null);
  };

  const createProduct = async (e) => {
    e && e.preventDefault();
    setView && setView('producto_form');
  };

  const removeProduct = async (p) => {
    if (!confirm('Eliminar producto?')) return;
    try {
      const res = await fetch(`${apiBase}/products/${p.id}/`, { method: 'DELETE', headers: headers(token) });
      if (!res.ok) throw new Error('No se pudo eliminar');
      loadBasics();
    } catch {}
  };

  const toggleVisible = async (p, value) => {
    setVisible((m) => ({ ...m, [p.id]: value }));
    try {
      await fetch(`${apiBase}/webconfig/visible-products/${p.id}/`, { method: 'PUT', headers: headers(token), body: JSON.stringify({ active: !!value }) });
    } catch {}
  };

  const toggleVisibleCat = async (c, value) => {
    setVisibleCats((m) => ({ ...m, [c.id]: value }));
    try {
      await fetch(`${apiBase}/webconfig/visible-categories/${c.id}/`, { method: 'PUT', headers: headers(token), body: JSON.stringify({ active: !!value }) });
    } catch {}
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try { const u = new URL(url); return !!u.protocol && !!u.host; } catch { return false; }
  };

  const saveSettings = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (!validateUrl(settings.site_url)) throw new Error('La URL del sitio no es válida');
      const fd = new FormData();
      fd.append('company_name', settings.company_name || '');
      fd.append('company_nit', settings.company_nit || '');
      fd.append('company_phone', settings.company_phone || '');
      fd.append('company_whatsapp', settings.company_whatsapp || '');
      fd.append('company_email', settings.company_email || '');
      fd.append('company_address', settings.company_address || '');
      fd.append('company_description', settings.company_description || '');
      fd.append('site_url', settings.site_url || '');
      if (logoFile) fd.append('logo', logoFile);
      const res = await fetch(`${apiBase}/webconfig/settings/`, { method: 'PUT', headers: headers(token, false), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron guardar cambios');
      setMsg({ type: 'success', text: 'Configuraciones guardadas' });
      setLogoFile(null);
      setSettings((s) => ({
        ...s,
        logo: data.logo || s.logo,
        site_url: data.site_url || s.site_url,
        company_name: data.company_name || s.company_name,
        company_nit: data.company_nit || s.company_nit,
        company_phone: data.company_phone || s.company_phone,
        company_whatsapp: data.company_whatsapp || s.company_whatsapp,
        company_email: data.company_email || s.company_email,
        company_address: data.company_address || s.company_address,
        company_description: data.company_description || s.company_description,
      }));
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  

  

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['productos','categorias','configuraciones'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white':'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}>{t==='productos'?'Productos':t==='categorias'?'Categorías':'Configuraciones'}</button>
          ))}
        </div>
        {tab==='productos' && (
          <button onClick={createProduct} className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white">Crear nuevo</button>
        )}
      </div>

      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>
      )}
      <div className={`opacity-100`}>
      {tab === 'productos' && (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Buscar por palabra clave" />
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600">
                <option value="">Todas las categorías</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600">
                <option value="">Todos</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded p-3 text-white">
                  <div className="aspect-video bg-gray-800 rounded mb-2 overflow-hidden">
                    {p.image ? (<img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />) : (<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>)}
                  </div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-300">{p.category ? p.category.name : 'Sin categoría'} • {p.active ? 'Activo' : 'Inactivo'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Stock: {Number(p.total_stock ?? p.inventory_qty ?? 0)}</div>
                  <label className="mt-1 inline-flex items-center gap-2 text-xs text-gray-300">
                    <input type="checkbox" checked={!!visible[p.id]} onChange={(e) => toggleVisible(p, e.target.checked)} /> Mostrar en página web
                  </label>
                  <div className="text-sm mt-1">{Number(p.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => { setProductEditing && setProductEditing(p); }} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700">Editar</button>
                    <button onClick={() => removeProduct(p)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700">Eliminar</button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-gray-300 text-sm">No hay productos con los filtros seleccionados.</div>
              )}
            </div>
        </div>
      )}

      {tab === 'categorias' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Buscar por categoría" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {(categories || []).filter((c) => !query || (c.name || c.nombre || '').toLowerCase().includes(query.toLowerCase())).map((c) => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded p-3 text-white flex items-center gap-3">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-800 flex items-center justify-center">
                  {c.image ? (<img src={mediaUrl(c.image)} alt={c.name || c.nombre} className="w-full h-full object-cover" loading="lazy" />) : (<span className="text-gray-400 text-xs">Sin imagen</span>)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{c.name || c.nombre}</div>
                  <div className="text-xs text-gray-300">ID {c.id}</div>
                  <label className="mt-1 inline-flex items-center gap-2 text-xs text-gray-300">
                    <input type="checkbox" checked={!!visibleCats[c.id]} onChange={(e) => toggleVisibleCat(c, e.target.checked)} /> Mostrar en página web
                  </label>
                </div>
              </div>
            ))}
            {(!categories || categories.length === 0) && (
              <div className="text-gray-300 text-sm">No hay categorías.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'configuraciones' && (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Configuraciones de la tienda</div>
            </div>
            <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">Nombre de la empresa</span>
                <input name="company_name" value={settings.company_name} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Mi Empresa" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">NIT</span>
                <input name="company_nit" value={settings.company_nit} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="123456789-0" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">Teléfono</span>
                <input name="company_phone" value={settings.company_phone} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="3001234567" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">WhatsApp</span>
                <input name="company_whatsapp" value={settings.company_whatsapp} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="3001234567" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">Correo</span>
                <input type="email" name="company_email" value={settings.company_email} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="correo@empresa.com" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">Dirección</span>
                <input name="company_address" value={settings.company_address} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Calle 123 #45-67" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <span className="text-xs text-gray-300">Descripción</span>
                <textarea name="company_description" value={settings.company_description} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Breve descripción de la empresa" rows={3} />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <span className="text-xs text-gray-300">URL de la página web</span>
                <input name="site_url" value={settings.site_url} onChange={handleSettingsChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="https://mi-tienda.com" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300">Foto de perfil (logo)</span>
                <input type="file" accept="image/*" onChange={handleLogo} className="text-white" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-800 flex items-center justify-center">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : settings.logo ? (
                    <img src={mediaUrl(settings.logo)} alt="Logo" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={loadSettings} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      

      

      

      

      
      </div>
    </div>
  );
};

export default WebPageManager;
