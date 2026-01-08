import React, { useEffect, useMemo, useState } from 'react';
import { 
  Globe, 
  ShoppingBag, 
  Layers, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash,
  Layout,
  Sparkles
} from 'lucide-react';

import TemplatesManager from './dashboard/TemplatesManager';
import SiteEditor from './dashboard/SiteEditor';
import LovableManager from './dashboard/LovableManager';

interface Category {
  id: number;
  name?: string;
  nombre?: string;
  image?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number | string;
  image?: string;
  category?: { id: number; name: string };
  active?: boolean;
  sku?: string;
  total_stock?: number;
  inventory_qty?: number;
}

interface SiteUrlStatus {
  site_url: string;
  tenant_id?: number;
  ok: boolean;
  message?: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface WebPageManagerProps {
  token: string;
  apiBase: string;
  adminId?: string | number;
  role?: string;
  setView?: (v: string) => void;
  setProductEditing?: (p: Product) => void;
}

const WebPageManager: React.FC<WebPageManagerProps> = ({ token, apiBase, setView, setProductEditing }) => {
  const headers = (tkn: string | null, json = true) => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [tab, setTab] = useState('productos');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [msg, setMsg] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [visible, setVisible] = useState<Record<number, boolean>>({});
  const [visibleCats, setVisibleCats] = useState<Record<number, boolean>>({});
  
  const [siteUrl, setSiteUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState<SiteUrlStatus | null>(null);
  const [savingUrl, setSavingUrl] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorTargetUrl, setEditorTargetUrl] = useState('');
  const [editorTargetTemplateId, setEditorTargetTemplateId] = useState<number | undefined>(undefined);

  const mediaUrl = (p?: string | null) => (p && p.startsWith('http')) ? p : `${apiBase}${p || ''}`;

  const handleOpenEditor = async (url?: string, templateId?: number) => {
    let targetTemplateId = templateId;
    
    if (!targetTemplateId) {
      try {
        const res = await fetch(`${apiBase}/webconfig/templates/my/`, { headers: headers(token) });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            targetTemplateId = data.results[0].id;
          }
        }
      } catch (e) {
        console.error("Error fetching personal templates", e);
      }
    }

    if (url) {
      setEditorTargetUrl(url);
    } else {
      setEditorTargetUrl(siteUrl || 'localhost:8000');
    }
    setEditorTargetTemplateId(targetTemplateId);
    setShowEditor(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headersAuth = headers(token);
      const [catsRes, prodsRes, visRes, visCatsRes, urlRes] = await Promise.all([
        fetch(`${apiBase}/products/categories/?page_size=100`, { headers: headersAuth }),
        fetch(`${apiBase}/products/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/visible-products/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/visible-categories/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/site-url/status/`, { headers: headersAuth }),
      ]);

      const cats = await catsRes.json();
      const prods = await prodsRes.json();
      const vis = await visRes.json();
      const visCats = await visCatsRes.json();
      const urlData = await urlRes.json();

      setCategories(cats.results || []);
      setProducts(Array.isArray(prods) ? prods : []);
      
      const map: Record<number, boolean> = {};
      if (Array.isArray(vis)) { vis.forEach((v) => { if (v.active) map[v.product] = true; }); }
      setVisible(map);

      const mapCats: Record<number, boolean> = {};
      if (Array.isArray(visCats)) { visCats.forEach((v) => { if (v.active) mapCats[v.category] = true; }); }
      setVisibleCats(mapCats);
      
      setUrlStatus(urlData);
      setSiteUrl(urlData.site_url || '');

    } catch (e: any) {
      console.error(e);
      setMsg({ type: 'error', text: 'Error al cargar datos' });
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
      const matchCat = !filterCat || (p.category && String(p.category.id) === String(filterCat));
      const matchAct = !filterActive || String(!!p.active) === String(filterActive === '1');
      return matchQ && matchCat && matchAct;
    });
  }, [products, query, filterCat, filterActive]);

  const createProduct = async (e?: React.MouseEvent) => {
    e && e.preventDefault();
    setView && setView('producto_form');
  };

  const removeProduct = async (p: Product) => {
    if (!confirm('Eliminar producto?')) return;
    try {
      const res = await fetch(`${apiBase}/products/${p.id}/`, { method: 'DELETE', headers: headers(token) });
      if (!res.ok) throw new Error('No se pudo eliminar');
      loadData();
    } catch {}
  };

  const toggleVisible = async (p: Product, value: boolean) => {
    setVisible((m) => ({ ...m, [p.id]: value }));
    try {
      await fetch(`${apiBase}/webconfig/visible-products/${p.id}/`, { method: 'PUT', headers: headers(token), body: JSON.stringify({ active: !!value }) });
    } catch {}
  };

  const toggleVisibleCat = async (c: Category, value: boolean) => {
    setVisibleCats((m) => ({ ...m, [c.id]: value }));
    try {
      await fetch(`${apiBase}/webconfig/visible-categories/${c.id}/`, { method: 'PUT', headers: headers(token), body: JSON.stringify({ active: !!value }) });
    } catch {}
  };

  const saveSiteUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSavingUrl(true);
    try {
      const res = await fetch(`${apiBase}/webconfig/site-url/claim/`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ site_url: siteUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar URL');
      setMsg({ type: 'success', text: 'URL actualizada correctamente' });
      setUrlStatus({ ...urlStatus, site_url: siteUrl, ok: true } as any);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSavingUrl(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setTab(id)} 
      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
        tab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-transparent hover:border-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  if (showEditor) {
    return (
      <SiteEditor 
        token={token} 
        apiBase={apiBase} 
        siteUrl={editorTargetUrl} 
        templateId={editorTargetTemplateId}
        onClose={() => setShowEditor(false)} 
      />
    );
  }

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {loading && !products.length && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-white font-medium">Cargando datos...</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900 p-2 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2">
          <TabButton id="productos" label="Productos" icon={ShoppingBag} />
          <TabButton id="categorias" label="Categorías" icon={Layers} />
          <TabButton id="urls" label="URLs de Usuario" icon={Globe} />
          <TabButton id="plantillas" label="Plantillas" icon={Layout} />
          <TabButton id="mis_plantillas" label="Mis Plantillas" icon={Layout} />
          <TabButton id="lovable" label="Lovable AI" icon={Sparkles} />
        </div>
        
        <div className="flex items-center gap-2">
          {urlStatus?.ok && (
            <button
              onClick={() => handleOpenEditor()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Personalizar Sitio
            </button>
          )}

          {tab === 'productos' && (
            <button 
              onClick={createProduct} 
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-900/20"
            >
              Crear Producto
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        
        {/* Productos Tab */}
        {tab === 'productos' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                  placeholder="Buscar producto..." 
                />
              </div>
              <select 
                value={filterCat} 
                onChange={(e) => setFilterCat(e.target.value)} 
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <select 
                value={filterActive} 
                onChange={(e) => setFilterActive(e.target.value)} 
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los estados</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors group">
                  <div className="aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden border border-gray-700 relative">
                    {p.image ? (
                      <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                       <button 
                          onClick={() => toggleVisible(p, !visible[p.id])}
                          className={`p-1.5 rounded-lg backdrop-blur-sm border transition-colors ${visible[p.id] ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-900/60 text-gray-400 border-gray-700 hover:text-white'}`}
                          title={visible[p.id] ? 'Visible en web' : 'Oculto en web'}
                       >
                         {visible[p.id] ? <Eye size={14} /> : <EyeOff size={14} />}
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-white truncate" title={p.name}>{p.name}</h3>
                    <span className="font-bold text-emerald-400 shrink-0">
                      {Number(p.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{p.category?.name || 'Sin cat.'}</span>
                    <span>•</span>
                    <span>Stock: {Number(p.total_stock ?? p.inventory_qty ?? 0)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-700/50">
                    <button 
                      onClick={() => setProductEditing && setProductEditing(p)}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => removeProduct(p)}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categorias Tab */}
        {tab === 'categorias' && (
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="w-full md:w-1/2 pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                placeholder="Buscar categoría..." 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(categories || []).filter((c) => !query || (c.name || c.nombre || '').toLowerCase().includes(query.toLowerCase())).map((c) => (
                <div key={c.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-gray-600 transition-colors">
                  <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                    {c.image ? (
                      <img src={mediaUrl(c.image)} alt={c.name || c.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin img</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{c.name || c.nombre}</h3>
                    <p className="text-xs text-gray-500 mb-2">ID: {c.id}</p>
                    
                    <label className="inline-flex items-center gap-2 cursor-pointer group">
                      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${visibleCats[c.id] ? 'bg-blue-600' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${visibleCats[c.id] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={!!visibleCats[c.id]} 
                        onChange={(e) => toggleVisibleCat(c, e.target.checked)} 
                      />
                      <span className={`text-xs transition-colors ${visibleCats[c.id] ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                        {visibleCats[c.id] ? 'Visible en web' : 'Oculto'}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
              {(!categories || categories.length === 0) && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay categorías disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URLs Tab */}
        {tab === 'urls' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Configuración de Dominio</h2>
                <p className="text-gray-400">Define la dirección web donde tus clientes podrán acceder a tu tienda.</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                <form onSubmit={saveSiteUrl} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">URL del Sitio</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="text" 
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        placeholder="ejemplo.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Ingresa el dominio sin http:// o https://</p>
                  </div>

                  <div className="flex items-center justify-end pt-4">
                    <button 
                      type="submit" 
                      disabled={savingUrl}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingUrl ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Guardar Configuración
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {urlStatus && (
                <div className={`p-6 rounded-2xl border flex items-start gap-4 ${urlStatus.ok ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <div className={`p-2 rounded-lg ${urlStatus.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {urlStatus.ok ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${urlStatus.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {urlStatus.ok ? 'Configuración Correcta' : 'Error de Configuración'}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{urlStatus.message}</p>
                    {urlStatus.ok && (
                      <a 
                        href={`https://${urlStatus.site_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                      >
                        Visitar sitio <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plantillas Tab */}
        {tab === 'plantillas' && (
          <div className="p-6">
            <TemplatesManager token={token} onOpenEditor={handleOpenEditor} />
          </div>
        )}
        {tab === 'mis_plantillas' && (
          <div className="p-6">
            <TemplatesManager personal token={token} onOpenEditor={handleOpenEditor} />
          </div>
        )}

        {tab === 'lovable' && (
          <div className="p-6">
            <LovableManager products={products} apiBase={apiBase} />
          </div>
        )}

      </div>
    </div>
  );
};

export default WebPageManager;
