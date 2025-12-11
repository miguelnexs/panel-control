import React, { useEffect, useState, useRef } from 'react';

const ProductFormPage = ({ token, apiBase, product, onCancel, onSaved }) => {
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
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [colorStock, setColorStock] = useState('0');
  const [variants, setVariants] = useState([]);
  const [initialVariants, setInitialVariants] = useState([]);
  const [variantName, setVariantName] = useState('');
  const [variantExtra, setVariantExtra] = useState('');
  const [features, setFeatures] = useState([]);
  const [initialFeatures, setInitialFeatures] = useState([]);
  const [featureText, setFeatureText] = useState('');
  const [activeTab, setActiveTab] = useState('detalles');
  const [loading, setLoading] = useState(false);

  const authHeaders = (tkn) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

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

  const mediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const UploadBox = ({ multiple = false, accept = 'image/*', onFiles }) => {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef(null);
    const handleClick = () => { if (inputRef.current) inputRef.current.click(); };
    const handleChange = (e) => {
      const files = Array.from(e.target.files || []);
      if (onFiles) onFiles(files);
    };
    const handleDrop = (e) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (onFiles) onFiles(files);
    };
    const handleDragOver = (e) => { e.preventDefault(); setDrag(true); };
    const handleDragLeave = () => { setDrag(false); };
    return (
      <div
        className={`w-full rounded-lg border-2 border-dashed ${drag ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'} p-4 flex items-center justify-center cursor-pointer transition`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center gap-3 text-gray-300">
          <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H5v-2h14v2zm-7 8l-5-5h3V8h4v8h3l-5 5zM16 1H8v2h8V1z"/></svg>
          <div className="text-sm">
            <div>Arrastra y suelta archivos aquí</div>
            <div className="text-xs text-gray-400">o haz clic para seleccionar</div>
          </div>
        </div>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      </div>
    );
  };

  useEffect(() => {
    const loadCats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/products/categories/?page_size=100`, { headers: authHeaders(token) });
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        setCategories(results);
        if (results.length > 0 && !categoryId) setCategoryId(String(results[0].id));
      } catch (e) {}
      finally { setLoading(false); }
    };
    if (token) loadCats();
  }, [token]);

  useEffect(() => {
    const loadEditing = async () => {
      if (!product) return;
      setLoading(true);
      setName(product.name || '');
      setPrice(String(product.price || ''));
      setCategoryId(String(product.category || ''));
      setSku(product.sku || '');
      setInventoryQty(String(product.inventory_qty || '0'));
      setDescription(product.description || '');
      setActive(Boolean(product.active));
      setImageFile(null);
      try {
        const res = await fetch(`${apiBase}/products/${product.id}/colors/`, { headers: authHeaders(token) });
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : data;
        const loaded = (Array.isArray(list) ? list : []).map((c, idx) => ({ id: c.id, name: c.name, hex: c.hex, stock: String(c.stock || '0'), position: idx, images: [] }));
        for (let i = 0; i < loaded.length; i++) {
          const color = loaded[i];
          const imgsRes = await fetch(`${apiBase}/products/colors/${color.id}/images/`, { headers: authHeaders(token) });
          const imgsData = await imgsRes.json();
          const imgsList = Array.isArray(imgsData.results) ? imgsData.results : imgsData;
          loaded[i] = { ...color, images: (Array.isArray(imgsList) ? imgsList : []).map((im, pos) => ({ id: im.id, image: im.image, position: pos })) };
        }
        setColors(loaded);
        setInitialColors(loaded);
      } catch (_) {
        setColors([]);
        setInitialColors([]);
      } finally { setLoading(false); }
    };
    loadEditing();
  }, [product]);

  useEffect(() => {
    const loadVariants = async () => {
      if (!product) return;
      try {
        const res = await fetch(`${apiBase}/products/${product.id}/variants/`, { headers: authHeaders(token) });
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : data;
        const loaded = (Array.isArray(list) ? list : []).map((v, idx) => ({ id: v.id, name: v.name, extra_price: String(v.extra_price || ''), position: idx }));
        setVariants(loaded);
        setInitialVariants(loaded);
      } catch (_) {
        setVariants([]);
        setInitialVariants([]);
      }
    };
    loadVariants();
  }, [product]);

  useEffect(() => {
    const loadFeatures = async () => {
      if (!product) return;
      try {
        const res = await fetch(`${apiBase}/products/${product.id}/features/`, { headers: authHeaders(token) });
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : data;
        const loaded = (Array.isArray(list) ? list : []).map((f, idx) => ({ id: f.id, name: f.name, position: idx }));
        setFeatures(loaded);
        setInitialFeatures(loaded);
      } catch (_) {
        setFeatures([]);
        setInitialFeatures([]);
      }
    };
    loadFeatures();
  }, [product]);

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
    if (variants.some((v) => !v.name || Number(normalizePrice(v.extra_price || '0')) < 0)) {
      errs.variants = 'Verifique nombre y sobrecosto (0 o positivo, 2 decimales).';
    }
    if (features.some((f) => !f.name || f.name.length > 100)) {
      errs.features = 'Cada característica requiere nombre (máx 100).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateClient()) return;
    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', normalizePrice(price));
    fd.append('category', categoryId);
    fd.append('sku', sku);
    fd.append('inventory_qty', String(Number(inventoryQty)));
    fd.append('description', description);
    fd.append('active', active ? 'true' : 'false');
    if (imageFile) fd.append('image', imageFile);
    const url = product ? `${apiBase}/products/${product.id}/` : `${apiBase}/products/`;
    const method = product ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(token), body: fd });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || (product ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto');
      setErrors((e2) => ({ ...e2, form: msg }));
      return;
    }
    try {
      const productId = product ? product.id : data.id;
      const existing = initialColors;
      const current = colors.map((c, idx) => ({ ...c, position: idx }));
      const existingIds = new Set(existing.filter((e) => e.id).map((e) => String(e.id)));
      const currentIds = new Set(current.filter((e) => e.id).map((e) => String(e.id)));
      for (const eCol of existing) {
        if (eCol.id && !currentIds.has(String(eCol.id))) {
          await fetch(`${apiBase}/products/colors/${eCol.id}/`, { method: 'DELETE', headers: authHeaders(token) });
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
        const currentImgs = Array.isArray(c.images) ? c.images.map((im, pos) => ({ ...im, position: pos })) : [];
        const existingImgIds = new Set((Array.isArray(existingImgs) ? existingImgs : []).map((im) => String(im.id)));
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
      // Variantes
      const existingV = initialVariants;
      const currentV = variants.map((v, idx) => ({ ...v, position: idx }));
      const existingVIds = new Set(existingV.filter((e) => e.id).map((e) => String(e.id)));
      const currentVIds = new Set(currentV.filter((e) => e.id).map((e) => String(e.id)));
      for (const eVar of existingV) {
        if (eVar.id && !currentVIds.has(String(eVar.id))) {
          await fetch(`${apiBase}/products/variants/${eVar.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }
      for (let vIndex = 0; vIndex < currentV.length; vIndex++) {
        let v = currentV[vIndex];
        const extraNorm = normalizePrice(v.extra_price || '0');
        if (!v.id) {
          const fdVar = new FormData();
          fdVar.append('name', v.name);
          fdVar.append('extra_price', extraNorm || '0');
          fdVar.append('position', String(v.position));
          const createRes = await fetch(`${apiBase}/products/${productId}/variants/`, { method: 'POST', headers: authHeaders(token), body: fdVar });
          const created = await createRes.json();
          if (createRes.ok && created && created.id) {
            v = { ...v, id: created.id };
            setVariants((vs) => vs.map((x, i) => i === vIndex ? v : x));
          }
        } else {
          const prev = existingV.find((e) => String(e.id) === String(v.id)) || {};
          const changed = prev.name !== v.name || String(prev.extra_price) !== String(v.extra_price) || Number(prev.position) !== Number(v.position);
          if (changed) {
            const fdVar = new FormData();
            fdVar.append('name', v.name);
            fdVar.append('extra_price', extraNorm || '0');
            fdVar.append('position', String(v.position));
            await fetch(`${apiBase}/products/variants/${v.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdVar });
          }
        }
      }
      // Características
      const existingF = initialFeatures;
      const currentFObjs = features.map((f, idx) => ({ ...f, position: idx }));
      const existingFIds = new Set(existingF.filter((e) => e.id).map((e) => String(e.id)));
      const currentFIds = new Set(currentFObjs.filter((e) => e.id).map((e) => String(e.id)));
      for (const eFeat of existingF) {
        if (eFeat.id && !currentFIds.has(String(eFeat.id))) {
          await fetch(`${apiBase}/products/features/${eFeat.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }
      for (let fIndex = 0; fIndex < currentFObjs.length; fIndex++) {
        let f = currentFObjs[fIndex];
        if (!f.id) {
          const fdFeat = new FormData();
          fdFeat.append('name', f.name);
          fdFeat.append('position', String(f.position));
          const createRes = await fetch(`${apiBase}/products/${productId}/features/`, { method: 'POST', headers: authHeaders(token), body: fdFeat });
          const created = await createRes.json();
          if (createRes.ok && created && created.id) {
            f = { ...f, id: created.id };
            setFeatures((fs) => fs.map((x, i) => i === fIndex ? f : x));
          }
        } else {
          const prev = existingF.find((e) => String(e.id) === String(f.id)) || {};
          const changed = prev.name !== f.name || Number(prev.position) !== Number(f.position);
          if (changed) {
            const fdFeat = new FormData();
            fdFeat.append('name', f.name);
            fdFeat.append('position', String(f.position));
            await fetch(`${apiBase}/products/features/${f.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdFeat });
          }
        }
      }
    } catch (_) {}
    if (onSaved) onSaved();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative">
      {loading && (
        <div className="absolute inset-0 z-50 bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800/80 border border-white/10 rounded-xl p-6 shadow-xl text-center">
            <div className="mx-auto w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <div className="mt-3 text-white font-medium">Cargando datos...</div>
            <div className="text-xs text-gray-300">Por favor espera</div>
          </div>
        </div>
      )}
      <div className={`max-w-5xl mx-auto p-6 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <div className="text-white text-xl font-semibold">{product ? 'Editar producto' : 'Nuevo producto'}</div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
            <button onClick={handleSubmit} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar</button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('detalles')}
            className={`px-4 py-2 text-sm rounded-t ${activeTab==='detalles' ? 'bg-white/10 text-white border-b-2 border-blue-500' : 'text-gray-300 hover:text-white'}`}
          >Detalles</button>
          <button
            onClick={() => setActiveTab('colores')}
            className={`px-4 py-2 text-sm rounded-t ${activeTab==='colores' ? 'bg-white/10 text-white border-b-2 border-blue-500' : 'text-gray-300 hover:text-white'}`}
          >Colores</button>
          <button
            onClick={() => setActiveTab('variantes')}
            className={`px-4 py-2 text-sm rounded-t ${activeTab==='variantes' ? 'bg-white/10 text-white border-b-2 border-blue-500' : 'text-gray-300 hover:text-white'}`}
          >Variantes</button>
          <button
            onClick={() => setActiveTab('caracteristicas')}
            className={`px-4 py-2 text-sm rounded-t ${activeTab==='caracteristicas' ? 'bg-white/10 text-white border-b-2 border-blue-500' : 'text-gray-300 hover:text-white'}`}
          >Características</button>
        </div>
        {errors.form && (
          <div className="mb-4 p-3 rounded text-sm bg-red-600/20 text-red-200 border border-red-500/40">{errors.form}</div>
        )}
        {activeTab === 'detalles' && (
          <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded p-4 shadow">
            <div className="text-gray-300 text-sm mb-3">Información básica</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-200 text-sm mb-1">Nombre del producto</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.name ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Nombre del producto" />
                  {errors.name && <div className="mt-1 text-xs text-red-300">{errors.name}</div>}
                </div>
                <div>
                  <label className="block text-gray-200 text-sm mb-1">Precio</label>
                  <input type="text" value={price} onChange={(e) => setPrice(normalizePrice(e.target.value))} required className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.price ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Precio" />
                  <div className="text-xs text-gray-400">{formatCurrency(price)}</div>
                  {errors.price && <div className="mt-1 text-xs text-red-300">{errors.price}</div>}
                </div>
                <div className="md:col-span-3">
                  <label className="block text-gray-200 text-sm mb-1">Descripción del producto</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.description ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Descripción del producto" rows={4} />
                  {errors.description && <div className="mt-1 text-xs text-red-300">{errors.description}</div>}
                </div>
              </div>
            </div>
          <div className="bg-white/5 border border-white/10 rounded p-4 shadow">
            <div className="text-gray-300 text-sm mb-3">Clasificación e inventario</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-200 text-sm mb-1">Categoría</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.category ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                  {errors.category && <div className="mt-1 text-xs text-red-300">{errors.category}</div>}
                </div>
                <div>
                  <label className="block text-gray-200 text-sm mb-1">SKU/Código</label>
                  <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} maxLength={50} className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.sku ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="SKU/Código" />
                  {errors.sku && <div className="mt-1 text-xs text-red-300">{errors.sku}</div>}
                </div>
                <div>
                  <label className="block text-gray-200 text-sm mb-1">Cantidad en inventario</label>
                  <input type="number" value={inventoryQty} onChange={(e) => setInventoryQty(e.target.value)} min={0} step={1} className={`w-full px-3 py-2 rounded bg-gray-700 text-white border ${errors.inventoryQty ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Cantidad en inventario" />
                  {errors.inventoryQty && <div className="mt-1 text-xs text-red-300">{errors.inventoryQty}</div>}
                </div>
                <div className="md:col-span-3">
                  <label className="flex items-center gap-2 text-gray-200"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activo</label>
                </div>
              </div>
            </div>
          <div className="bg-white/5 border border-white/10 rounded p-4 shadow">
            <div className="text-gray-300 text-sm mb-3">Imágenes del producto</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  <label className="block text-gray-200 text-sm mb-1">Imagen principal</label>
                  <UploadBox accept="image/*" multiple={false} onFiles={(files) => { const f = files[0]; if (!f) return; if (!['image/jpeg','image/png','image/webp'].includes(f.type)) return; setImageFile(f); }} />
                  {errors.image && <div className="mt-1 text-xs text-red-300">{errors.image}</div>}
                </div>
                <div>
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-600" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-400 border border-dashed border-gray-600 rounded-lg">Sin imagen</div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colores' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded p-4 shadow">
              <div className="text-gray-300 text-sm mb-3">Colores disponibles</div>
              <div className="flex items-center gap-3 mb-4">
                <input type="text" value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="Nombre" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="rounded border border-gray-600 w-10 h-10 p-0" />
                <input type="number" value={colorStock} onChange={(e) => setColorStock(e.target.value)} min={0} step={1} placeholder="Stock" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm w-24" />
                <button type="button" onClick={() => { if (!colorName || !/^#[0-9A-Fa-f]{6}$/.test(colorHex)) return; setColors((cols) => [...cols, { name: colorName, hex: colorHex, stock: colorStock }]); setColorName(''); setColorHex('#000000'); setColorStock('0'); }} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm">Agregar</button>
              </div>
              <div className="space-y-4">
                {colors.map((c, idx) => (
                  <div key={`${c.id || 'new'}-${idx}`} className="space-y-3 bg-gray-800/60 border border-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="w-8 h-8 rounded shadow" style={{ backgroundColor: c.hex }} />
                      <input type="text" value={c.name} onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} placeholder="Nombre" className="col-span-2 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                      <input type="color" value={c.hex} onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x))} className="rounded border border-gray-600 w-10 h-10 p-0" />
                      <input type="number" value={c.stock} onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, stock: e.target.value } : x))} min={0} step={1} placeholder="Stock" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                      <div className="flex items-center justify-end">
                        <button type="button" onClick={() => setColors((cols) => cols.filter((x, i) => i !== idx))} className="px-2.5 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Quitar</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-300 text-xs">Imágenes del color (máx. 4)</div>
                        <div className="w-64">
                          <UploadBox multiple accept="image/*" onFiles={(files) => { setColors((cols) => cols.map((x, i) => { if (i !== idx) return x; const imgs = Array.isArray(x.images) ? x.images.slice() : []; for (const f of files) { if (imgs.length >= 4) break; if (['image/jpeg','image/png','image/webp'].includes(f.type)) { imgs.push({ file: f, preview: URL.createObjectURL(f) }); } } return { ...x, images: imgs }; })); }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(c.images || []).map((img, j) => (
                          <div key={`img-${j}`} className="relative group">
                            <img src={img.preview ? img.preview : mediaUrl(img.image)} alt="Color" className="w-28 h-28 object-cover rounded-lg border border-gray-600 group-hover:ring-2 group-hover:ring-blue-500 group-hover:scale-105 transition" />
                            <button type="button" onClick={() => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, images: (x.images || []).filter((_, k) => k !== j) } : x))} className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] rounded bg-red-600 text-white">X</button>
                          </div>
                        ))}
                        {(!c.images || c.images.length === 0) && (<div className="text-xs text-gray-400">Sin imágenes.</div>)}
                      </div>
                    </div>
                  </div>
                ))}
                {colors.length === 0 && (<div className="text-xs text-gray-400">Sin colores agregados.</div>)}
              </div>
              {errors.colors && <div className="mt-2 text-xs text-red-300">{errors.colors}</div>}
            </div>
          </div>
        )}

        {activeTab === 'variantes' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded p-4 shadow">
              <div className="text-gray-300 text-sm mb-3">Variantes del producto</div>
              <div className="flex items-center gap-3 mb-4">
                <input type="text" value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="Nombre" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                <input type="text" value={variantExtra} onChange={(e) => setVariantExtra(normalizePrice(e.target.value))} placeholder="Sobrecosto" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm w-32" />
                <div className="text-xs text-gray-400">{formatCurrency(variantExtra)}</div>
                <button type="button" onClick={() => { if (!variantName) return; setVariants((vs) => [...vs, { name: variantName, extra_price: variantExtra || '0' }]); setVariantName(''); setVariantExtra(''); }} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm">Agregar</button>
              </div>
              <div className="space-y-4">
                {variants.map((v, idx) => (
                  <div key={`${v.id || 'new'}-${idx}`} className="space-y-3 bg-gray-800/60 border border-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <input type="text" value={v.name} onChange={(e) => setVariants((vs) => vs.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} placeholder="Nombre" className="col-span-3 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                      <input type="text" value={v.extra_price} onChange={(e) => setVariants((vs) => vs.map((x, i) => i === idx ? { ...x, extra_price: normalizePrice(e.target.value) } : x))} placeholder="Sobrecosto" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                      <div className="text-xs text-gray-400">{formatCurrency(v.extra_price)}</div>
                      <div className="flex items-center justify-end">
                        <button type="button" onClick={() => setVariants((vs) => vs.filter((x, i) => i !== idx))} className="px-2.5 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Quitar</button>
                      </div>
                    </div>
                  </div>
                ))}
                {variants.length === 0 && (<div className="text-xs text-gray-400">Sin variantes agregadas.</div>)}
              </div>
              {errors.variants && <div className="mt-2 text-xs text-red-300">{errors.variants}</div>}
            </div>
          </div>
        )}

        {activeTab === 'caracteristicas' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded p-4 shadow">
              <div className="text-gray-300 text-sm mb-3">Características del producto</div>
              <div className="flex items-center gap-3 mb-4">
                <input type="text" value={featureText} onChange={(e) => setFeatureText(e.target.value)} placeholder="Característica" className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                <button type="button" onClick={() => { const t = featureText.trim(); if (!t) return; setFeatures((fs) => [...fs, { name: t }]); setFeatureText(''); }} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm">Agregar</button>
              </div>
              <div className="space-y-4">
                {features.map((f, idx) => (
                  <div key={`feature-${idx}`} className="space-y-3 bg-gray-800/60 border border-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <input type="text" value={f.name} onChange={(e) => setFeatures((fs) => fs.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} placeholder="Característica" className="col-span-5 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm" />
                      <div className="flex items-center justify-end">
                        <button type="button" onClick={() => setFeatures((fs) => fs.filter((_, i) => i !== idx))} className="px-2.5 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Quitar</button>
                      </div>
                    </div>
                  </div>
                ))}
                {features.length === 0 && (<div className="text-xs text-gray-400">Sin características agregadas.</div>)}
              </div>
              {errors.features && <div className="mt-2 text-xs text-red-300">{errors.features}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFormPage;
