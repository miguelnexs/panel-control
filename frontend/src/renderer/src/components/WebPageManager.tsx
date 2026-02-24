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
  Tag,
  CreditCard,
  Truck,
  ChevronUp,
  ChevronDown,
  MoveVertical
} from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import SiteEditor from './dashboard/SiteEditor';

interface Category {
  id: number;
  name?: string;
  nombre?: string;
  image?: string;
  description?: string;
  visible?: boolean;
  position?: number;
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
  is_sale?: boolean;
  sale_price?: number | string;
}

interface SiteUrlStatus {
  site_url: string;
  tenant_id?: number;
  ok: boolean;
  message?: string;
}

interface PaymentMethod {
  id?: number;
  name: string;
  provider: string;
  fee_percent: number;
  active: boolean;
  extra_config: {
    public_key?: string;
    private_key?: string;
    [key: string]: any;
  };
}

interface AppSettings {
  company_whatsapp?: string;
  [key: string]: any;
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

const DragHandle = () => (
  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-grab active:cursor-grabbing">
    <MoveVertical size={16} />
  </button>
);

const SortableCategoryCard = ({ 
  category, 
  visible, 
  onToggleVisible, 
  imageUrl 
}: { 
  category: Category, 
  visible: boolean, 
  onToggleVisible: (c: Category, v: boolean) => void,
  imageUrl: string | null
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      <div {...attributes} {...listeners} className="touch-none">
          <DragHandle />
      </div>

      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={category.name || category.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs">Sin img</div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">{category.name || category.nombre}</h3>
        <p className="text-xs text-gray-500 mb-2">ID: {category.id}</p>
        
        <label className="inline-flex items-center gap-2 cursor-pointer group">
          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${visible ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${visible ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={!!visible} 
            onChange={(e) => onToggleVisible(category, e.target.checked)} 
          />
          <span className={`text-xs transition-colors ${visible ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
            {visible ? 'Visible en web' : 'Oculto'}
          </span>
        </label>
      </div>
    </div>
  );
};

const WebPageManager: React.FC<WebPageManagerProps> = ({ token, apiBase: rawApiBase, adminId = '', role, setView, setProductEditing }) => {
  const apiBase = rawApiBase.replace(/\/$/, '');
  const headers = (tkn: string | null, json = true) => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [tab, setTab] = useState('productos');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [categoryOrder, setCategoryOrder] = useState<number[]>([]);

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

  // Payment & Settings State
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [savingPayment, setSavingPayment] = useState(false);

  // Offers State
  const [selectedOfferProducts, setSelectedOfferProducts] = useState<number[]>([]);
  const [offerPercent, setOfferPercent] = useState<number>(0);
  const [applyingOffer, setApplyingOffer] = useState(false);

  // Shipping State
  const [shippingCost, setShippingCost] = useState<number>(15000);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(300000);
  const [pickupEnabled, setPickupEnabled] = useState<boolean>(true);
  const [savingShipping, setSavingShipping] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((c) => c.id.toString() === active.id);
        const newIndex = items.findIndex((c) => c.id.toString() === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update positions in background
        const updatePositions = async () => {
            for (let i = 0; i < newItems.length; i++) {
                const cat = newItems[i];
                try {
                    await fetch(`${apiBase}/webconfig/visible-categories/${cat.id}/`, {
                        method: 'PUT',
                        headers: headers(token),
                        body: JSON.stringify({ position: i })
                    });
                } catch (e) {
                    console.error("Error updating category position", e);
                }
            }
        };
        updatePositions();

        return newItems;
      });
    }
  };

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
      const [prodsRes, visRes, visCatsRes, urlRes, settingsRes, payRes] = await Promise.all([
        fetch(`${apiBase}/products/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/visible-products/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/visible-categories/status/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/site-url/status/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/settings/`, { headers: headersAuth }),
        fetch(`${apiBase}/webconfig/payments/`, { headers: headersAuth }),
      ]);

      const prods = await prodsRes.json();
      const vis = await visRes.json();
      const visCats = await visCatsRes.json();
      const urlData = await urlRes.json();
      const settingsData = await settingsRes.json();
      const payData = await payRes.json();

      const catsArray = Array.isArray(visCats) ? visCats : [];
      const sortedCats = [...catsArray].sort((a: any, b: any) => {
        const pa = Number(a.position || 0);
        const pb = Number(b.position || 0);
        if (pa !== pb) return pa - pb;
        return Number(a.id || 0) - Number(b.id || 0);
      });
      setCategories(sortedCats);
      const orderIds: number[] = sortedCats.map((c: any) => Number(c.id));
      setCategoryOrder(orderIds);

      setProducts(Array.isArray(prods) ? prods : []);
      
      const map: Record<number, boolean> = {};
      if (Array.isArray(vis)) { vis.forEach((v) => { if (v.active) map[v.product] = true; }); }
      setVisible(map);

      const mapCats: Record<number, boolean> = {};
      if (Array.isArray(sortedCats)) { sortedCats.forEach((v: any) => { if (v.visible) mapCats[v.id] = true; }); }
      setVisibleCats(mapCats);
      
      setUrlStatus(urlData);
      setSiteUrl(urlData.site_url || '');

      setAppSettings(settingsData);
      
      // Initialize shipping settings if they exist
      if (settingsData) {
        if (settingsData.shipping_cost !== undefined) setShippingCost(Number(settingsData.shipping_cost));
        if (settingsData.free_shipping_threshold !== undefined) setFreeShippingThreshold(Number(settingsData.free_shipping_threshold));
        if (settingsData.pickup_enabled !== undefined) setPickupEnabled(!!settingsData.pickup_enabled);
      }

      setPaymentMethods(Array.isArray(payData) ? payData : (payData.results || []));

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

  const applyOffers = async () => {
    if (selectedOfferProducts.length === 0) {
      setMsg({ type: 'error', text: 'Selecciona al menos un producto' });
      return;
    }
    if (offerPercent < 0 || offerPercent > 100) {
      setMsg({ type: 'error', text: 'El porcentaje debe estar entre 0 y 100' });
      return;
    }

    setApplyingOffer(true);
    setMsg(null);

    try {
      let successCount = 0;
      for (const pid of selectedOfferProducts) {
        const product = products.find(p => p.id === pid);
        if (!product) continue;

        const price = Number(product.price || 0);
        const salePrice = Number((price * (1 - offerPercent / 100)).toFixed(2));
        
        // Update product
        const url = `${apiBase.replace(/\/$/, '')}/products/${pid}/`;
        const res = await fetch(url, {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify({
            is_sale: offerPercent > 0,
            sale_price: offerPercent > 0 ? salePrice : null
          })
        });

        if (res.ok) successCount++;
      }

      setMsg({ type: 'success', text: `Oferta aplicada a ${successCount} productos` });
      setSelectedOfferProducts([]);
      setOfferPercent(0);
      loadData();
    } catch (e) {
      console.error(e);
      setMsg({ type: 'error', text: 'Error al aplicar ofertas' });
    } finally {
      setApplyingOffer(false);
    }
  };

  const removeOffers = async () => {
    if (selectedOfferProducts.length === 0) {
      setMsg({ type: 'error', text: 'Selecciona al menos un producto' });
      return;
    }

    setApplyingOffer(true);
    setMsg(null);

    try {
      let successCount = 0;
      for (const pid of selectedOfferProducts) {
        const url = `${apiBase.replace(/\/$/, '')}/products/${pid}/`;
        const res = await fetch(url, {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify({
            is_sale: false,
            sale_price: null
          })
        });

        if (res.ok) successCount++;
      }

      setMsg({ type: 'success', text: `Ofertas eliminadas de ${successCount} productos` });
      setSelectedOfferProducts([]);
      loadData();
    } catch (e) {
      console.error(e);
      setMsg({ type: 'error', text: 'Error al eliminar ofertas' });
    } finally {
      setApplyingOffer(false);
    }
  };

  const saveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appSettings) return;
    
    setSavingPayment(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({ company_whatsapp: appSettings.company_whatsapp })
      });
      if (!res.ok) throw new Error('Error al guardar WhatsApp');
      setMsg({ type: 'success', text: 'WhatsApp actualizado correctamente' });
      loadData();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSavingPayment(false);
    }
  };

  const saveMercadoPago = async (mp: PaymentMethod) => {
    setSavingPayment(true);
    setMsg(null);
    try {
      const body = {
        name: mp.name,
        provider: 'mercadopago',
        fee_percent: Number(mp.fee_percent),
        active: mp.active,
        currencies: 'COP',
        extra_config: {
          public_key: mp.extra_config?.public_key,
          private_key: mp.extra_config?.private_key
        }
      };

      let url = `${apiBase}/webconfig/payments/`;
      let method = 'POST';

      if (mp.id) {
        url += `${mp.id}/`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: headers(token),
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Error al guardar Mercado Pago');
      setMsg({ type: 'success', text: 'Mercado Pago actualizado correctamente' });
      loadData();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSavingPayment(false);
    }
  };

  const toggleMercadoPago = async (val: boolean) => {
    const mp = paymentMethods.find(p => p.provider === 'mercadopago');
    if (mp) {
      await saveMercadoPago({ ...mp, active: val });
    } else {
      // Create new inactive if not exists
      await saveMercadoPago({
        name: 'Mercado Pago',
        provider: 'mercadopago',
        fee_percent: 0,
        active: val,
        extra_config: {}
      });
    }
  };

  const toggleWhatsApp = async (val: boolean) => {
    const wp = paymentMethods.find(p => p.provider === 'whatsapp');
    setSavingPayment(true);
    setMsg(null);
    try {
        const body = wp ? { ...wp, active: val } : {
            name: 'WhatsApp',
            provider: 'whatsapp',
            fee_percent: 0,
            active: val,
            extra_config: {}
        };
        
        let url = `${apiBase}/webconfig/payments/`;
        let method = 'POST';
        
        if (wp && wp.id) {
            url += `${wp.id}/`;
            method = 'PUT';
        }
        
        const res = await fetch(url, {
            method,
            headers: headers(token),
            body: JSON.stringify(body)
        });
        
        if (!res.ok) throw new Error('Error al actualizar WhatsApp');
        loadData();
    } catch (e: any) {
        setMsg({ type: 'error', text: e.message });
    } finally {
        setSavingPayment(false);
    }
  };

  const saveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShipping(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({ 
          shipping_cost: shippingCost,
          free_shipping_threshold: freeShippingThreshold,
          pickup_enabled: pickupEnabled
        })
      });
      if (!res.ok) throw new Error('Error al guardar configuración de envíos');
      setMsg({ type: 'success', text: 'Configuración de envíos actualizada' });
      
      // Update local appSettings to reflect changes
      const updated = await res.json();
      setAppSettings(updated);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSavingShipping(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setTab(id)} 
      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
        tab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-white'
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
        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-900 dark:text-white font-medium">Cargando datos...</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <TabButton id="productos" label="Productos" icon={ShoppingBag} />
          <TabButton id="ofertas" label="Ofertas" icon={Tag} />
          <TabButton id="categorias" label="Categorías" icon={Layers} />
          <TabButton id="urls" label="URLs de Usuario" icon={Globe} />
          <TabButton id="pagos" label="Métodos de Pago" icon={CreditCard} />
          <TabButton id="envios" label="Envíos" icon={Truck} />
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={`https://softwarebycg.shop/?aid=${adminId}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-all flex items-center gap-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </a>

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
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        
        {/* Productos Tab */}
        {tab === 'productos' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 dark:placeholder-gray-500" 
                  placeholder="Buscar producto..." 
                />
              </div>
              <select 
                value={filterCat} 
                onChange={(e) => setFilterCat(e.target.value)} 
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <select 
                value={filterActive} 
                onChange={(e) => setFilterActive(e.target.value)} 
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los estados</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                    {p.image ? (
                      <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                       <button 
                          onClick={() => toggleVisible(p, !visible[p.id])}
                          className={`p-1.5 rounded-lg backdrop-blur-sm border transition-colors ${visible[p.id] ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-white/60 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                          title={visible[p.id] ? 'Visible en web' : 'Oculto en web'}
                       >
                         {visible[p.id] ? <Eye size={14} /> : <EyeOff size={14} />}
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={p.name}>{p.name}</h3>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {Number(p.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{p.category?.name || 'Sin cat.'}</span>
                    <span>•</span>
                    <span>Stock: {Number(p.total_stock ?? p.inventory_qty ?? 0)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <button 
                      onClick={() => setProductEditing && setProductEditing(p)}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => removeProduct(p)}
                      className="flex-1 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-600/10 hover:bg-rose-100 dark:hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors flex items-center justify-center gap-1"
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

        {/* Ofertas Tab */}
        {tab === 'ofertas' && (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Configurar Oferta Masiva
              </h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Porcentaje de Descuento (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={offerPercent} 
                    onChange={(e) => setOfferPercent(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button 
                  onClick={applyOffers}
                  disabled={applyingOffer || selectedOfferProducts.length === 0}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {applyingOffer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                  Aplicar Oferta
                </button>
                <button 
                  onClick={removeOffers}
                  disabled={applyingOffer || selectedOfferProducts.length === 0}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {applyingOffer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                  Quitar Ofertas
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selecciona los productos abajo y aplica el porcentaje. Para quitar ofertas, pon el porcentaje en 0.
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="text-gray-700 dark:text-gray-300 font-medium">Seleccionar Productos</h4>
              <button 
                onClick={() => {
                  if (selectedOfferProducts.length === products.length) {
                    setSelectedOfferProducts([]);
                  } else {
                    setSelectedOfferProducts(products.map(p => p.id));
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {selectedOfferProducts.length === products.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.filter(p => !!p.active).map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => {
                    if (selectedOfferProducts.includes(p.id)) {
                      setSelectedOfferProducts(prev => prev.filter(id => id !== p.id));
                    } else {
                      setSelectedOfferProducts(prev => [...prev, p.id]);
                    }
                  }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative group ${
                    selectedOfferProducts.includes(p.id) 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/50' 
                      : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedOfferProducts.includes(p.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {selectedOfferProducts.includes(p.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                      {p.image ? (
                        <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <ShoppingBag className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate pr-6">{p.name}</h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Precio: {Number(p.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                        </span>
                        {p.is_sale && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                            Oferta: {Number(p.sale_price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                className="w-full md:w-1/2 pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                placeholder="Buscar categoría..." 
              />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map(c => c.id.toString())} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(categories || []).filter((c) => !query || (c.name || c.nombre || '').toLowerCase().includes(query.toLowerCase())).map((c) => (
                    <SortableCategoryCard 
                      key={c.id} 
                      category={c} 
                      visible={!!visibleCats[c.id]} 
                      onToggleVisible={toggleVisibleCat} 
                      imageUrl={c.image ? mediaUrl(c.image) : null}
                    />
                  ))}
                  {(!categories || categories.length === 0) && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No hay categorías disponibles</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* URLs Tab */}
        {tab === 'urls' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configuración de Dominio</h2>
                <p className="text-gray-600 dark:text-gray-400">Define la dirección web donde tus clientes podrán acceder a tu tienda.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
                <form onSubmit={saveSiteUrl} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL del Sitio</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="text" 
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        placeholder="ejemplo.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 dark:placeholder-gray-500"
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
                  <div className={`p-2 rounded-lg ${urlStatus.ok ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                    {urlStatus.ok ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${urlStatus.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {urlStatus.ok ? 'Configuración Correcta' : 'Error de Configuración'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{urlStatus.message}</p>
                    {urlStatus.ok && (
                      <a 
                        href={`https://${urlStatus.site_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-600 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
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



        {/* Pagos Tab */}
        {tab === 'pagos' && (
          <div className="p-6 space-y-8">
            {/* WhatsApp Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600 dark:text-green-500" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">WhatsApp</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Vinculación directa para pedidos por WhatsApp.</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={paymentMethods.find(p => p.provider === 'whatsapp')?.active || false}
                    onChange={(e) => toggleWhatsApp(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {paymentMethods.find(p => p.provider === 'whatsapp')?.active && (
                <form onSubmit={saveWhatsApp} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de WhatsApp</label>
                    <input 
                      type="text" 
                      value={appSettings?.company_whatsapp || ''}
                      onChange={(e) => setAppSettings(prev => prev ? ({ ...prev, company_whatsapp: e.target.value }) : null)}
                      placeholder="Ej: 573001234567"
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={savingPayment}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
                  >
                    Guardar Número
                  </button>
                </form>
              )}
            </div>

            {/* Mercado Pago Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mercado Pago</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Pagos en línea con tarjetas y otros medios.</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={paymentMethods.find(p => p.provider === 'mercadopago')?.active || false}
                    onChange={(e) => toggleMercadoPago(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {paymentMethods.find(p => p.provider === 'mercadopago')?.active && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Public Key</label>
                      <input 
                        type="text" 
                        value={paymentMethods.find(p => p.provider === 'mercadopago')?.extra_config?.public_key || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPaymentMethods(prev => {
                            const idx = prev.findIndex(p => p.provider === 'mercadopago');
                            if (idx === -1) return prev;
                            const updated = [...prev];
                            updated[idx] = { 
                              ...updated[idx], 
                              extra_config: { ...updated[idx].extra_config, public_key: val } 
                            };
                            return updated;
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Token</label>
                      <input 
                        type="password" 
                        value={paymentMethods.find(p => p.provider === 'mercadopago')?.extra_config?.private_key || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPaymentMethods(prev => {
                            const idx = prev.findIndex(p => p.provider === 'mercadopago');
                            if (idx === -1) return prev;
                            const updated = [...prev];
                            updated[idx] = { 
                              ...updated[idx], 
                              extra_config: { ...updated[idx].extra_config, private_key: val } 
                            };
                            return updated;
                          });
                        }}
                        placeholder="••••••••••••••••"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comisión (%)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={paymentMethods.find(p => p.provider === 'mercadopago')?.fee_percent || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPaymentMethods(prev => {
                            const idx = prev.findIndex(p => p.provider === 'mercadopago');
                            if (idx === -1) return prev;
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], fee_percent: val };
                            return updated;
                          });
                        }}
                        className="w-32 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Lo que cobra la pasarela</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                     <button 
                      onClick={() => {
                        const mp = paymentMethods.find(p => p.provider === 'mercadopago');
                        if (mp) saveMercadoPago(mp);
                      }}
                      disabled={savingPayment}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Envios Tab */}
        {tab === 'envios' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de Envíos</h2>
                    <p className="text-gray-500 dark:text-gray-400">Gestiona los costos de envío y opciones de entrega.</p>
                  </div>
                </div>

                <form onSubmit={saveShipping} className="space-y-6">
                  {/* Costo de Envío Estándar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Costo de Envío Estándar</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        type="number" 
                        min="0"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Este valor se cobrará si no se cumple la condición de envío gratis.</p>
                  </div>

                  {/* Envío Gratis Desde */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Envío Gratis por compras superiores a</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        type="number" 
                        min="0"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Si el subtotal del pedido supera este valor, el envío será gratis.</p>
                  </div>

                  {/* Recogida en Tienda Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Habilitar Recogida en Tienda</h3>
                      <p className="text-sm text-gray-500">Permitir a los clientes recoger sus pedidos gratis.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={pickupEnabled}
                        onChange={(e) => setPickupEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      type="submit" 
                      disabled={savingShipping}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingShipping ? (
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebPageManager;
