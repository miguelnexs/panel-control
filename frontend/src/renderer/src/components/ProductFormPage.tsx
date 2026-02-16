import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Tag, 
  DollarSign, 
  FileText, 
  Image as ImageIcon, 
  Layers, 
  Palette, 
  Plus, 
  Trash2, 
  Upload, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProductFormPageProps {
  token: string | null;
  apiBase: string;
  product?: any;
  onCancel?: () => void;
  onSaved?: () => void;
}

interface Color {
  id?: number;
  name: string;
  hex: string;
  stock: string | number;
  position?: number;
  images?: any[];
}

interface Variant {
  id?: number;
  name: string;
  extra_price: string | number;
  position?: number;
}

interface Feature {
  id?: number;
  name: string;
  position?: number;
}

const ProductFormPage: React.FC<ProductFormPageProps> = ({ token, apiBase, product, onCancel, onSaved }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [sku, setSku] = useState('');
  const [inventoryQty, setInventoryQty] = useState('0');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [colors, setColors] = useState<Color[]>([]);
  const [initialColors, setInitialColors] = useState<Color[]>([]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [colorStock, setColorStock] = useState('0');

  const [variants, setVariants] = useState<Variant[]>([]);
  const [initialVariants, setInitialVariants] = useState<Variant[]>([]);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('0');

  const [features, setFeatures] = useState<Feature[]>([]);
  const [initialFeatures, setInitialFeatures] = useState<Feature[]>([]);
  const [featureName, setFeatureName] = useState('');

  const [activeTab, setActiveTab] = useState('detalles');
  const [loading, setLoading] = useState(false);

  const authHeaders = (tkn: string | null): Record<string, string> => ({ 
    'Accept': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) 
  });

  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };
  const normalizePrice = (v: any) => {
    const s = String(v).replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = s.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]) parts[1] = parts[1].slice(0, 2);
    return parts.join('.');
  };

  const mediaUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const UploadBox = ({ multiple = false, accept = 'image/*', onFiles }: { multiple?: boolean, accept?: string, onFiles: (files: File[]) => void }) => {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleClick = () => { if (inputRef.current) inputRef.current.click(); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (onFiles) onFiles(files);
    };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (onFiles) onFiles(files);
    };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDrag(true); };
    const handleDragLeave = () => { setDrag(false); };
    return (
      <div
        className={`w-full rounded-xl border-2 border-dashed ${drag ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'} p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500/50 hover:bg-gray-100 dark:hover:bg-gray-800`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="p-4 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Haz clic o arrastra imágenes aquí</div>
            <div className="text-xs text-gray-500 mt-1">Soporta JPG, PNG, WEBP</div>
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
        if (results.length > 0) {
          setCategoryId(prev => (prev ? prev : String(results[0].id)));
        }
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
        const loaded = (Array.isArray(list) ? list : []).map((c: any, idx: number) => ({ id: c.id, name: c.name, hex: c.hex, stock: String(c.stock || '0'), position: idx, images: [] }));
        for (let i = 0; i < loaded.length; i++) {
          const color = loaded[i];
          const imgsRes = await fetch(`${apiBase}/products/colors/${color.id}/images/`, { headers: authHeaders(token) });
          const imgsData = await imgsRes.json();
          const imgsList = Array.isArray(imgsData.results) ? imgsData.results : imgsData;
          loaded[i] = { ...color, images: (Array.isArray(imgsList) ? imgsList : []).map((im: any, pos: number) => ({ id: im.id, image: im.image, position: pos })) };
        }
        setColors(loaded);
        setInitialColors(loaded);

        // Load Variants
        const varsRes = await fetch(`${apiBase}/products/${product.id}/variants/`, { headers: authHeaders(token) });
        const varsData = await varsRes.json();
        const varsList = Array.isArray(varsData.results) ? varsData.results : (Array.isArray(varsData) ? varsData : []);
        const loadedVars = varsList.map((v: any) => ({ id: v.id, name: v.name, extra_price: String(v.extra_price || '0'), position: v.position }));
        setVariants(loadedVars);
        setInitialVariants(loadedVars);

        // Load Features
        const featsRes = await fetch(`${apiBase}/products/${product.id}/features/`, { headers: authHeaders(token) });
        const featsData = await featsRes.json();
        const featsList = Array.isArray(featsData.results) ? featsData.results : (Array.isArray(featsData) ? featsData : []);
        const loadedFeats = featsList.map((f: any) => ({ id: f.id, name: f.name, position: f.position }));
        setFeatures(loadedFeats);
        setInitialFeatures(loadedFeats);

      } catch (_) {
        setColors([]);
        setInitialColors([]);
        setVariants([]);
        setInitialVariants([]);
        setFeatures([]);
        setInitialFeatures([]);
      } finally { setLoading(false); }
    };
    loadEditing();
  }, [product]);

  const validateClient = () => {
    const errs: any = {};
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { detail: `Error inesperado (${res.status} ${res.statusText})` };
    }
    
    if (!res.ok) {
      const msg = data.detail || (product ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto');
      setErrors((e2: any) => ({ ...e2, form: msg }));
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
            if (c.id) {
                await fetch(`${apiBase}/products/colors/${c.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdColor });
            }
          }
        }
        if (!c.id) continue;
        const existingImgsRes = await fetch(`${apiBase}/products/colors/${c.id}/images/`, { headers: authHeaders(token) });
        const existingImgsData = await existingImgsRes.json();
        const existingImgs = Array.isArray(existingImgsData.results) ? existingImgsData.results : existingImgsData;
        const currentImgs = Array.isArray(c.images) ? c.images.map((im, pos) => ({ ...im, position: pos })) : [];
        const existingImgIds = new Set((Array.isArray(existingImgs) ? existingImgs : []).map((im: any) => String(im.id)));
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

      // Process Variants
      const existingVars = initialVariants;
      const currentVars = variants.map((v, idx) => ({ ...v, position: idx }));
      const currentVarIds = new Set(currentVars.filter((v) => v.id).map((v) => String(v.id)));

      for (const ev of existingVars) {
        if (ev.id && !currentVarIds.has(String(ev.id))) {
          await fetch(`${apiBase}/products/variants/${ev.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }

      for (const v of currentVars) {
        const fdV = new FormData();
        fdV.append('name', v.name);
        fdV.append('extra_price', String(Number(v.extra_price || 0)));
        fdV.append('position', String(v.position));

        if (!v.id) {
          await fetch(`${apiBase}/products/${productId}/variants/`, { method: 'POST', headers: authHeaders(token), body: fdV });
        } else {
          const prev = existingVars.find((e) => String(e.id) === String(v.id));
          if (prev && (prev.name !== v.name || String(prev.extra_price) !== String(v.extra_price) || Number(prev.position) !== Number(v.position))) {
            await fetch(`${apiBase}/products/variants/${v.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdV });
          }
        }
      }

      // Process Features
      const existingFeats = initialFeatures;
      const currentFeats = features.map((f, idx) => ({ ...f, position: idx }));
      const currentFeatIds = new Set(currentFeats.filter((f) => f.id).map((f) => String(f.id)));

      for (const ef of existingFeats) {
        if (ef.id && !currentFeatIds.has(String(ef.id))) {
          await fetch(`${apiBase}/products/features/${ef.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }

      for (const f of currentFeats) {
        const fdF = new FormData();
        fdF.append('name', f.name);
        fdF.append('position', String(f.position));

        if (!f.id) {
          await fetch(`${apiBase}/products/${productId}/features/`, { method: 'POST', headers: authHeaders(token), body: fdF });
        } else {
          const prev = existingFeats.find((e) => String(e.id) === String(f.id));
          if (prev && (prev.name !== f.name || Number(prev.position) !== Number(f.position))) {
            await fetch(`${apiBase}/products/features/${f.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdF });
          }
        }
      }

    } catch (_) {}
    if (onSaved) onSaved();
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white animate-in fade-in duration-500">
      {loading && (
        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-900 dark:text-white font-medium">Cargando datos...</div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onCancel}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product ? 'Editar Producto' : 'Nuevo Producto'}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete la información del producto a continuación</p>
            </div>
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Producto</span>
          </button>
        </div>

        {errors.form && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('detalles')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'detalles' ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Package className="w-4 h-4" />
            <span>Información General</span>
          </button>
          <button
            onClick={() => setActiveTab('colores')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'colores' ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Palette className="w-4 h-4" />
            <span>Colores</span>
          </button>
          <button
            onClick={() => setActiveTab('variantes')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'variantes' ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Layers className="w-4 h-4" />
            <span>Variantes</span>
          </button>
          <button
            onClick={() => setActiveTab('caracteristicas')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'caracteristicas' ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Características</span>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'detalles' && (
            <>
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Datos Básicos</span>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Nombre del Producto</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.name ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                        placeholder="Ej. Camiseta Deportiva Premium"
                      />
                      {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Precio (COP)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <input 
                            type="text" 
                            value={price} 
                            onChange={(e) => setPrice(normalizePrice(e.target.value))} 
                            className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.price ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                            placeholder="0.00"
                          />
                        </div>
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(price)}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">SKU / Código</label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <input 
                            type="text" 
                            value={sku} 
                            onChange={(e) => setSku(e.target.value)} 
                            className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.sku ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                            placeholder="PROD-001"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Descripción</label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={4}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.description ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none`}
                        placeholder="Describe las características principales del producto..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4" />
                    <span>Imagen Principal</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <UploadBox accept="image/*" multiple={false} onFiles={(files) => { const f = files[0]; if (!f) return; if (!['image/jpeg','image/png','image/webp'].includes(f.type)) return; setImageFile(f); }} />
                      {errors.image && <p className="mt-1 text-xs text-rose-400">{errors.image}</p>}
                    </div>
                    <div>
                      <div className="w-full aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative group">
                        {imageFile ? (
                          <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                        ) : product?.image ? (
                          <img src={mediaUrl(product.image)} alt="Current" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Organización</span>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Categoría</label>
                      <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.category ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer`}
                      >
                        {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Inventario Global</label>
                      <input 
                        type="number" 
                        value={inventoryQty} 
                        onChange={(e) => setInventoryQty(e.target.value)} 
                        min={0}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.inventoryQty ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${active ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Producto Activo</span>
                        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'colores' && (
            <div className="lg:col-span-3 space-y-6">
               <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                      <Palette className="w-4 h-4" />
                      <span>Gestión de Colores</span>
                    </div>
                 </div>

                 {/* Add Color Form */}
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Agregar Nuevo Color</h4>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre del Color</label>
                        <input 
                          type="text" 
                          value={colorName} 
                          onChange={(e) => setColorName(e.target.value)} 
                          placeholder="Ej. Rojo Pasión" 
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={colorHex} 
                            onChange={(e) => setColorHex(e.target.value)} 
                            className="h-9 w-full rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="w-32">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Stock</label>
                        <input 
                          type="number" 
                          value={colorStock} 
                          onChange={(e) => setColorStock(e.target.value)} 
                          min={0}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { if (!colorName || !/^#[0-9A-Fa-f]{6}$/.test(colorHex)) return; setColors((cols) => [...cols, { name: colorName, hex: colorHex, stock: colorStock }]); setColorName(''); setColorHex('#000000'); setColorStock('0'); }} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    </div>
                 </div>

                 {/* Color List */}
                 <div className="space-y-4">
                    {colors.map((c, idx) => (
                      <div key={`${c.id || 'new'}-${idx}`} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:border-gray-300 dark:hover:border-gray-600">
                        <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700/50">
                          <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" style={{ backgroundColor: c.hex }} />
                          
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input 
                              type="text" 
                              value={c.name} 
                              onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} 
                              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-500 text-sm">Hex:</span>
                              <input 
                                type="text" 
                                value={c.hex} 
                                onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x))} 
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none font-mono"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-500 text-sm">Stock:</span>
                              <input 
                                type="number" 
                                value={c.stock} 
                                onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, stock: e.target.value } : x))} 
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <button 
                            type="button" 
                            onClick={() => setColors((cols) => cols.filter((x, i) => i !== idx))} 
                            className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Color Images */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imágenes de la Variante (Máx 4)</div>
                            <div className="w-48">
                              <label className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer transition-all">
                                <Plus className="w-3 h-3 mr-1.5" />
                                Agregar Imágenes
                                <input 
                                  type="file" 
                                  multiple 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setColors((cols) => cols.map((x, i) => { 
                                      if (i !== idx) return x; 
                                      const imgs = Array.isArray(x.images) ? x.images.slice() : []; 
                                      for (const f of files) { 
                                        if (imgs.length >= 4) break; 
                                        if (['image/jpeg','image/png','image/webp'].includes(f.type)) { 
                                          imgs.push({ file: f, preview: URL.createObjectURL(f) }); 
                                        } 
                                      } 
                                      return { ...x, images: imgs }; 
                                    }));
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {(c.images || []).map((img: any, j) => (
                              <div key={`img-${j}`} className="relative group aspect-square rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <img 
                                  src={img.preview ? img.preview : mediaUrl(img.image)} 
                                  alt="Color variant" 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    type="button" 
                                    onClick={() => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, images: (x.images || []).filter((_, k) => k !== j) } : x))} 
                                    className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {(!c.images || c.images.length === 0) && (
                              <div className="col-span-full py-4 text-center text-gray-500 dark:text-gray-500 text-xs border border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                                No hay imágenes para este color
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {colors.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-500">
                        <Palette className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No hay variantes de color agregadas.</p>
                      </div>
                    )}
                 </div>
                 {errors.colors && <p className="mt-3 text-sm text-rose-400">{errors.colors}</p>}
               </div>
            </div>
          )}

          {activeTab === 'variantes' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Variantes de Producto (Talla, Material, etc.)</span>
                 </div>
                 
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 mb-6">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre (ej. Talla L, XL)</label>
                        <input 
                          type="text" 
                          value={variantName} 
                          onChange={(e) => setVariantName(e.target.value)} 
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sobrecosto</label>
                        <input 
                          type="number" 
                          value={variantPrice} 
                          onChange={(e) => setVariantPrice(e.target.value)} 
                          min={0}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { if (!variantName) return; setVariants([...variants, { name: variantName, extra_price: variantPrice }]); setVariantName(''); setVariantPrice('0'); }} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                         <div className="flex items-center gap-4 flex-1">
                            <input 
                              type="text" 
                              value={v.name} 
                              onChange={(e) => setVariants(vars => vars.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                              className="bg-transparent border-none text-gray-900 dark:text-white focus:ring-0 p-0 text-sm font-medium w-full"
                            />
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">+$</span>
                              <input 
                                type="number" 
                                value={v.extra_price} 
                                onChange={(e) => setVariants(vars => vars.map((x, i) => i === idx ? { ...x, extra_price: e.target.value } : x))}
                                className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none text-right"
                              />
                            </div>
                            <button onClick={() => setVariants(vars => vars.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    ))}
                    {variants.length === 0 && <p className="text-center text-gray-500 dark:text-gray-500 text-sm py-4">No hay variantes definidas.</p>}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'caracteristicas' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Características del Producto</span>
                 </div>
                 
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 mb-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Característica</label>
                        <input 
                          type="text" 
                          value={featureName} 
                          onChange={(e) => setFeatureName(e.target.value)} 
                          placeholder="Ej. Resistente al agua"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { if (!featureName) return; setFeatures([...features, { name: featureName }]); setFeatureName(''); }} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 h-[38px] self-end"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {features.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                         <div className="flex-1">
                            <input 
                              type="text" 
                              value={f.name} 
                              onChange={(e) => setFeatures(fs => fs.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                              className="bg-transparent border-none text-gray-900 dark:text-white focus:ring-0 p-0 text-sm w-full"
                            />
                         </div>
                         <button onClick={() => setFeatures(fs => fs.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                    {features.length === 0 && <p className="text-center text-gray-500 dark:text-gray-500 text-sm py-4">No hay características definidas.</p>}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;
