import React, { useEffect, useMemo, useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  UserPlus, 
  Trash2, 
  Plus, 
  Minus, 
  X,
  CreditCard,
  User,
  MapPin,
  Mail,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Color {
  id: number;
  name: string;
  hex: string;
  stock: number;
  images?: ({ image: string } | string)[];
}

interface Variant {
  id: number;
  name: string;
  extra_price: number | string;
  position?: number;
}

interface Product {
  id: number;
  name: string;
  category_name?: string;
  price: number | string;
  image?: string;
  colors?: Color[];
  active?: boolean;
  inventory_qty?: number;
  variants?: Variant[];
}

interface Client {
  id: number;
  full_name: string;
  cedula: string;
  email: string;
  address: string;
  phone?: string;
}

interface CartItem {
  product: Product;
  colorId: string | null;
  variantId: string | null;
  quantity: number;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface SalesPageProps {
  token: string;
  apiBase: string;
  onSaleCreated?: () => void;
}

const SalesPage: React.FC<SalesPageProps> = ({ token, apiBase, onSaleCreated }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientForm, setClientForm] = useState({ full_name: '', cedula: '', email: '', address: '' });
  const [openClientModal, setOpenClientModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [colorOptions, setColorOptions] = useState<Record<number, Color[]>>({});
  const [selectedColorMap, setSelectedColorMap] = useState<Record<number, string>>({});
  
  const [variantOptions, setVariantOptions] = useState<Record<number, Variant[]>>({});
  const [selectedVariantMap, setSelectedVariantMap] = useState<Record<number, string>>({});

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [openCart, setOpenCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    total_sales: number;
    total_amount: string;
    today_sales: number;
    month_sales: number;
  } | null>(null);

  const mediaUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const firstColorImage = (product: Product, colorId: string | number) => {
    if (!product) return '';
    const list = (colorOptions[product.id] || product.colors || []);
    const col = Array.isArray(list) ? list.find((c) => String(c.id) === String(colorId)) : null;
    if (!col || !col.images || col.images.length === 0) return product.image ? mediaUrl(product.image) : '';
    
    const firstImg = col.images[0];
    const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg.image;
    return imgUrl ? mediaUrl(imgUrl) : (product.image ? mediaUrl(product.image) : '');
  };

  const loadVariants = async (productId: number) => {
    if (variantOptions[productId]) return;
    try {
      const res = await fetch(`${apiBase}/products/${productId}/variants/`, { headers: authHeaders(token) });
      const data = await res.json();
      const list = Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
      setVariantOptions((m) => ({ ...m, [productId]: list }));
    } catch (_) {
      setVariantOptions((m) => ({ ...m, [productId]: [] }));
    }
  };

  const loadColors = async (productId: number) => {
    if (colorOptions[productId]) return;
    try {
      const res = await fetch(`${apiBase}/products/${productId}/colors/`, { headers: authHeaders(token) });
      const data = await res.json();
      const list = Array.isArray(data.results) ? data.results : [];
      setColorOptions((m) => ({ ...m, [productId]: list }));
      if (list.length > 0 && !selectedColorMap[productId]) {
        setSelectedColorMap((m) => ({ ...m, [productId]: String(list[0].id) }));
      }
    } catch (_) {
      setColorOptions((m) => ({ ...m, [productId]: [] }));
    }
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
        const active = (Array.isArray(prodsData) ? prodsData : []).filter((p: Product) => !!p.active);
        setProducts(active);
        
        // Pre-fill colors if available in product data
        const cMap: Record<number, Color[]> = {};
        const cSel: Record<number, string> = {};
        for (const p of active) {
          if (Array.isArray(p.colors) && p.colors.length > 0) {
            cMap[p.id] = p.colors;
            cSel[p.id] = String(p.colors[0].id);
          }
          // Pre-fetch variants for visible products
          loadVariants(p.id);
        }
        setColorOptions(cMap);
        setSelectedColorMap(cSel);
        
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

  const addToCart = async (product: Product) => {
    await loadColors(product.id);
    await loadVariants(product.id);
    
    let colorSel = selectedColorMap[product.id] || null;
    const cOpts = colorOptions[product.id] || product.colors || [];
    if (!colorSel && Array.isArray(cOpts) && cOpts.length > 0) colorSel = String(cOpts[0].id);
    
    let variantSel = selectedVariantMap[product.id] || null;
    
    setCart((c) => [...c, { product, colorId: colorSel, variantId: variantSel, quantity: 1 }]);
    setOpenCart(true);
  };

  const updateCart = (idx: number, patch: Partial<CartItem>) => {
    setCart((c) => c.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const removeCart = (idx: number) => {
    setCart((c) => c.filter((_, i) => i !== idx));
  };

  const getItemPrice = (item: CartItem) => {
    let price = Number(item.product.price || 0);
    if (item.variantId) {
      const vars = variantOptions[item.product.id] || [];
      const v = vars.find(v => String(v.id) === String(item.variantId));
      if (v) price += Number(v.extra_price || 0);
    }
    return price;
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, it) => sum + getItemPrice(it) * Number(it.quantity || 0), 0);
  }, [cart, variantOptions]);

  const validateCart = async () => {
    for (const it of cart) {
      const qty = Number(it.quantity || 0);
      if (!qty || qty < 1) return { ok: false, msg: 'Cantidad inválida' };
      if (it.colorId) {
        const list = (colorOptions[it.product.id] || it.product.colors || []);
        const col = Array.isArray(list) ? list.find((c) => String(c.id) === String(it.colorId)) : null;
        if (col && Number(col.stock || 0) < qty) return { ok: false, msg: `Stock insuficiente en color para ${it.product.name}` };
      } else {
        if (Number(it.product.inventory_qty || 0) < qty) return { ok: false, msg: `Stock insuficiente para ${it.product.name}` };
      }
    }
    return { ok: true, msg: '' };
  };

  const submitSale = async () => {
    setMsg(null);
    if (!token) { setMsg({ type: 'error', text: 'Sesión no válida' }); return; }
    
    const clientOk = (() => {
      if (selectedClientId) return true;
      const nameOk = (clientForm.full_name || '').trim().length >= 3;
      const cedOk = /^[0-9]{6,12}$/.test((clientForm.cedula || '').trim());
      // Email and address are optional or less strict for quick sales often, but keeping validation
      const mailOk = !clientForm.email || /^\S+@\S+\.\S+$/.test((clientForm.email || '').trim());
      return nameOk && cedOk && mailOk;
    })();

    if (!clientOk && !selectedClientId) { 
        setMsg({ type: 'error', text: 'Seleccione un cliente o complete Nombre y Cédula del nuevo cliente' }); 
        return; 
    }
    
    const val = await validateCart();
    if (!val.ok) { setMsg({ type: 'error', text: val.msg }); return; }
    
    const payload = {
      client_id: selectedClientId || undefined,
      client_full_name: selectedClientId ? undefined : (clientForm.full_name || '').trim(),
      client_cedula: selectedClientId ? undefined : (clientForm.cedula || '').trim(),
      client_email: selectedClientId ? undefined : (clientForm.email || '').trim(),
      client_phone: selectedClientId ? undefined : (clientForm.phone || '').trim(),
      client_address: selectedClientId ? undefined : (clientForm.address || '').trim(),
      items: cart.map((it) => ({ 
        product_id: it.product.id, 
        color_id: it.colorId ? Number(it.colorId) : null,
        variant_id: it.variantId ? Number(it.variantId) : null,
        quantity: Number(it.quantity) 
      })),
    };

    try {
      const res = await fetch(`${apiBase}/sales/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        const detail = typeof data === 'object' ? (data.detail || JSON.stringify(data)) : 'Error desconocido';
        throw new Error(detail);
      }
      setMsg({ type: 'success', text: 'Venta registrada exitosamente' });
      setCart([]);
      setOpenCart(false);
      setClientForm({ full_name: '', cedula: '', email: '', address: '' });
      setSelectedClientId('');
      if (onSaleCreated) onSaleCreated();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-700 transition-all group">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Ventas Hoy" 
            value={stats.today_sales} 
            icon={Calendar} 
            color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
          />
          <StatCard 
            label="Ventas Mes" 
            value={stats.month_sales} 
            icon={TrendingUp} 
            color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
          />
          <StatCard 
            label="Total Ventas" 
            value={stats.total_sales} 
            icon={ShoppingCart} 
            color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} 
          />
          <StatCard 
            label="Ingresos Totales" 
            value={formatCurrency(stats.total_amount)} 
            icon={DollarSign} 
            color={{ bg: 'bg-amber-500', text: 'text-amber-500' }} 
          />
        </div>
      )}

      {loading && !products.length && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-white font-medium">Cargando catálogo...</div>
          </div>
        </div>
      )}

      {msg && (
        <div className={`fixed top-4 right-4 z-[60] p-4 rounded-xl text-sm flex items-center gap-3 border shadow-2xl animate-in slide-in-from-right duration-300 ${msg.type === 'success' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50' : 'bg-rose-900/90 text-rose-100 border-rose-500/50'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Header / Toolbar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Nueva Venta</h2>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto flex-1 justify-end">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar producto..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                </div>
                
                <button 
                    onClick={() => setOpenCart(true)} 
                    className="relative px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 shrink-0"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Carrito</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs font-bold">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                </button>
            </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20">
                {filtered.map((p) => {
                    const sel = selectedColorMap[p.id];
                    const imgSrc = sel ? firstColorImage(p, sel) : (p.image ? mediaUrl(p.image) : '');
                    const variants = variantOptions[p.id] || [];
                    const selectedVarId = selectedVariantMap[p.id];
                    const selectedVariant = variants.find(v => String(v.id) === String(selectedVarId));
                    const displayPrice = Number(p.price) + (selectedVariant ? Number(selectedVariant.extra_price) : 0);

                    return (
                        <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all group flex flex-col">
                            <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                {imgSrc ? (
                                    <img src={imgSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <ShoppingCart className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <button 
                                        onClick={() => addToCart(p)}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                    >
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="font-medium text-white line-clamp-2 text-sm" title={p.name}>{p.name}</h3>
                                    <span className="font-bold text-emerald-400 text-sm whitespace-nowrap">
                                        {displayPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{p.category_name || 'General'}</p>
                                
                                <div className="mt-auto space-y-2">
                                    {/* Color Selection */}
                                    {Array.isArray(colorOptions[p.id]) && colorOptions[p.id].length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {colorOptions[p.id].map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setSelectedColorMap((m) => ({ ...m, [p.id]: String(c.id) }))}
                                                    className={`w-4 h-4 rounded-full border shadow-sm transition-transform hover:scale-110 ${String(selectedColorMap[p.id]) === String(c.id) ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900 scale-110' : 'border-gray-600'}`}
                                                    style={{ backgroundColor: c.hex }}
                                                    title={`${c.name} (${c.stock})`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Variant Selection */}
                                    {variants.length > 0 && (
                                        <select 
                                            value={selectedVariantMap[p.id] || ''} 
                                            onChange={(e) => setSelectedVariantMap(m => ({ ...m, [p.id]: e.target.value }))}
                                            className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Estándar</option>
                                            {variants.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name} (+{Number(v.extra_price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {openCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenCart(false)} />
            <div className="relative w-full max-w-md bg-gray-900 h-full border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Carrito de Compras</h2>
                    </div>
                    <button onClick={() => setOpenCart(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cart.map((it, idx) => {
                        const imgSrc = it.colorId ? firstColorImage(it.product, it.colorId) : (it.product.image ? mediaUrl(it.product.image) : '');
                        const itemPrice = getItemPrice(it);
                        const variants = variantOptions[it.product.id] || [];

                        return (
                            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 flex gap-3 group hover:border-gray-600 transition-colors">
                                <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                                    {imgSrc ? (
                                        <img src={imgSrc} alt={it.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <ShoppingCart className="w-6 h-6 opacity-30" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-white truncate pr-2">{it.product.name}</h4>
                                        <button onClick={() => removeCart(idx)} className="text-gray-500 hover:text-rose-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {/* Color Selector inside Cart */}
                                        {colorOptions[it.product.id]?.length > 0 && (
                                            <select 
                                                value={it.colorId || ''} 
                                                onChange={(e) => updateCart(idx, { colorId: e.target.value || null })}
                                                className="bg-gray-900 border border-gray-700 text-xs rounded px-1.5 py-0.5 text-gray-300 focus:outline-none focus:border-blue-500"
                                            >
                                                {colorOptions[it.product.id].map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                        
                                        {/* Variant Selector inside Cart */}
                                        {variants.length > 0 && (
                                            <select
                                                value={it.variantId || ''}
                                                onChange={(e) => updateCart(idx, { variantId: e.target.value || null })}
                                                className="bg-gray-900 border border-gray-700 text-xs rounded px-1.5 py-0.5 text-gray-300 focus:outline-none focus:border-blue-500 max-w-[120px]"
                                            >
                                                <option value="">Estándar</option>
                                                {variants.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1 border border-gray-700">
                                            <button 
                                                onClick={() => updateCart(idx, { quantity: Math.max(1, Number(it.quantity || 1) - 1) })}
                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-sm font-medium text-white w-4 text-center">{it.quantity}</span>
                                            <button 
                                                onClick={() => updateCart(idx, { quantity: Number(it.quantity || 0) + 1 })}
                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div className="font-bold text-emerald-400 text-sm">
                                            {(itemPrice * it.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                            <p>Tu carrito está vacío</p>
                            <button onClick={() => setOpenCart(false)} className="mt-4 text-blue-400 text-sm hover:underline">
                                Explorar productos
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-800 bg-gray-900 space-y-4">
                    <div className="space-y-3">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <select 
                                    value={selectedClientId} 
                                    onChange={(e) => setSelectedClientId(e.target.value)} 
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                >
                                    <option value="">Seleccionar cliente existente...</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.full_name} - {c.cedula}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => { setClientForm({ full_name: '', cedula: '', email: '', address: '', phone: '' }); setOpenClientModal(true); }} 
                                className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"
                                title="Nuevo Cliente"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400">Total a Pagar</span>
                            <span className="text-2xl font-bold text-white">
                                {totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                        </div>
                        <button 
                            onClick={submitSale} 
                            disabled={cart.length === 0}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20} />
                            Confirmar Venta
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* New Client Modal */}
      {openClientModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Nuevo Cliente</h3>
              </div>
              <button onClick={() => setOpenClientModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setOpenClientModal(false); setSelectedClientId(''); }} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={clientForm.full_name} 
                    onChange={(e) => setClientForm((f) => ({ ...f, full_name: e.target.value }))} 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Cédula</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={clientForm.cedula} 
                    onChange={(e) => setClientForm((f) => ({ ...f, cedula: e.target.value }))} 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Ej. 12345678"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Teléfono (Opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="tel" 
                    value={clientForm.phone} 
                    onChange={(e) => setClientForm((f) => ({ ...f, phone: e.target.value }))} 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Ej. 3001234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Correo (Opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    value={clientForm.email} 
                    onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))} 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Dirección (Opcional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <textarea 
                    value={clientForm.address} 
                    onChange={(e) => setClientForm((f) => ({ ...f, address: e.target.value }))} 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[80px] resize-none"
                    placeholder="Dirección completa"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setOpenClientModal(false)} 
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-900/20"
                >
                  Usar Cliente Temporal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
