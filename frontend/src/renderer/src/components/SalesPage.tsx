import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  Phone, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Package,
  Palette,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useOfflineSync } from '../hooks/useOfflineSync';
import SyncStatusBanner from './SyncStatusBanner';
import ClientFormModal from './ClientFormModal';
import SafeImage from './SafeImage';

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
  sku?: string;
  price: number | string;
  is_sale?: boolean;
  sale_price?: number | string | null;
  image?: string;
  colors?: Color[];
  active?: boolean;
  inventory_qty?: number;
  variants?: Variant[];
  skus?: any[];
}

interface Client {
  id: number;
  full_name: string;
  cedula: string;
  email: string;
  address: string;
  phone?: string;
}

interface Category {
  id: number;
  name: string;
}

interface CartItem {
  product: Product;
  colorId: string | null;
  variantId: string | null;
  quantity: number;
  manualPrice?: number;
}

interface Msg {
  type: 'success' | 'error' | 'warning';
  text: string;
}

interface SalesPageProps {
  token: string;
  apiBase: string;
  onSaleCreated?: () => void;
  canCreate?: boolean;
}

const SalesPage: React.FC<SalesPageProps> = ({ token, apiBase, onSaleCreated, canCreate }) => {
  const canCreateSafe = typeof canCreate === 'boolean' ? canCreate : true;
  const offlineSync = useOfflineSync(token);
  const gridRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [openClientModal, setOpenClientModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [colorOptions, setColorOptions] = useState<Record<number, Color[]>>({});
  const [selectedColorMap, setSelectedColorMap] = useState<Record<number, string>>({});
  
  const [variantOptions, setVariantOptions] = useState<Record<number, Variant[]>>({});
  const [selectedVariantMap, setSelectedVariantMap] = useState<Record<number, string>>({});

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [openCart, setOpenCart] = useState(false);
  const [selectingProduct, setSelectingProduct] = useState<Product | null>(null);
  const [selectionStep, setSelectionStep] = useState<'initial' | 'color' | 'variant' | 'quantity'>('initial');
  const [useStandardColor, setUseStandardColor] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [currentAvailableStock, setCurrentAvailableStock] = useState(0);
  const [selectionQty, setSelectionQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'mixed'>('cash');
  const [isSeparado, setIsSeparado] = useState(false);
  const [separadoAmount, setSeparadoAmount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [mixedCashPart, setMixedCashPart] = useState('');

  // Discount modal state (replaces unsupported prompt())
  const [discountModal, setDiscountModal] = useState<{
    idx: number;
    originalPrice: number;
    pct: string;
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


  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ 
          page: String(page), 
          page_size: String(pageSize),
          active: 'true'
        });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (selectedCategory) params.set('category', String(selectedCategory));

        const [prodsResult, clientsData, catsData] = await Promise.all([
          offlineSync.loadPaginatedData('sales', `${apiBase}/products/?${params.toString()}`, token),
          offlineSync.loadData('clients', `${apiBase}/clients/?page_size=200`, token),
          offlineSync.loadData('categories', `${apiBase}/products/categories/?page_size=100`, token),
        ]);
        
        setProducts(prodsResult.items);
        setTotal(prodsResult.total);
        setCategories(Array.isArray(catsData) ? catsData : []);
        
        // Pre-fill colors if available in product data
        const cMap: Record<number, Color[]> = {};
        const cSel: Record<number, string> = {};
        for (const p of prodsResult.items) {
          if (Array.isArray(p.colors) && p.colors.length > 0) {
            cMap[p.id] = p.colors;
            cSel[p.id] = String(p.colors[0].id);
          }
        }
        setColorOptions(cMap);
        setSelectedColorMap(cSel);
        
        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch(_) {
      } finally {
        setLoading(false);
      }
    };
    if (token) loadCatalog();
  }, [token, page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    if (gridRef.current) {
        gridRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);


  useEffect(() => {
    if (selectingProduct) {
        let stock = selectingProduct.inventory_qty || 0;
        if (!useStandardColor && (selectedColor || selectedVariant)) {
            const matchingSku = selectingProduct.skus?.find(s => 
                (!selectedColor || String(s.color) === String(selectedColor.id)) && 
                (!selectedVariant || String(s.variant) === String(selectedVariant.id))
            );
            // Si hay un SKU que coincide, usamos su stock
            if (matchingSku) {
                stock = matchingSku.stock;
            } 
            // Si no hay SKU pero seleccionamos un color, usamos el stock del color como fallback
            else if (selectedColor && !selectedVariant) {
                stock = selectedColor.stock || 0;
            }
            // De lo contrario es 0
            else {
                stock = 0;
            }
        } else if (useStandardColor) {
            stock = selectingProduct.inventory_qty || 0;
        }
        setCurrentAvailableStock(stock);
        if (selectionQty > stock && stock > 0) setSelectionQty(stock);
        else if (stock === 0) setSelectionQty(0);
    }
  }, [selectingProduct, selectedColor, selectedVariant, useStandardColor]);


  const addToCart = async (product: Product) => {
    // Load full data including SKUs and full product details before opening modal
    setLoading(true);
    try {
        const [skusRes, prodRes] = await Promise.all([
            fetch(`${apiBase}/products/${product.id}/skus/`, { headers: authHeaders(token) }),
            fetch(`${apiBase}/products/${product.id}/`, { headers: authHeaders(token) })
        ]);
        
        const skusData = await skusRes.json();
        const fullProductData = await prodRes.json();
        
        const skus = Array.isArray(skusData.results) ? skusData.results : (Array.isArray(skusData) ? skusData : []);
        
        // Merge the full product data with SKUs
        const fullProduct = { ...fullProductData, skus };
        
        // If product has colors or variants, open the selection modal
        if ((fullProduct.colors && fullProduct.colors.length > 0) || (fullProduct.variants && fullProduct.variants.length > 0)) {
            setSelectingProduct(fullProduct);
            setSelectedColor(null);
            setSelectedVariant(null);
            setUseStandardColor(false);
            setSelectionQty(1);
            setSelectionStep('initial');
            setLoading(false);
            return;
        }
        
        // Direct add for products without variations - use fullProduct with all fields
        setCart((c) => [...c, { product: fullProduct, colorId: null, variantId: null, quantity: 1 }]);
        setMsg({ type: 'success', text: `Agregado: ${fullProduct.name}` });
    } catch (e) {
        console.error("Error loading product details:", e);
    } finally {
        setLoading(false);
    }
  };

  const confirmSelection = () => {
    if (!selectingProduct) return;
    
    // Find stock for selected combination
    let stock = selectingProduct.inventory_qty || 0;
    if (!useStandardColor && (selectedColor || selectedVariant)) {
        const matchingSku = selectingProduct.skus?.find(s => 
            (!selectedColor || String(s.color) === String(selectedColor.id)) && 
            (!selectedVariant || String(s.variant) === String(selectedVariant.id))
        );
        
        if (matchingSku) {
            stock = matchingSku.stock;
        } else if (selectedColor && !selectedVariant) {
            stock = selectedColor.stock || 0;
        } else {
            stock = 0;
        }
    } else if (useStandardColor) {
        stock = selectingProduct.inventory_qty || 0;
    }

    if (selectionQty > stock) {
        alert(`Solo hay ${stock} unidades disponibles para esta selección.`);
        return;
    }
    
    setCart((c) => [...c, { 
        product: selectingProduct, 
        colorId: !useStandardColor && selectedColor ? String(selectedColor.id) : null, 
        variantId: !useStandardColor && selectedVariant ? String(selectedVariant.id) : null, 
        quantity: selectionQty 
    }]);
    
    setMsg({ type: 'success', text: `Agregado: ${selectingProduct.name}` });
    setSelectingProduct(null);
  };

  const updateCart = (idx: number, patch: Partial<CartItem>) => {
    setCart((c) => c.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const removeCart = (idx: number) => {
    setCart((c) => c.filter((_, i) => i !== idx));
  };

  const getItemPrice = (item: CartItem) => {
    if (item.manualPrice !== undefined) return item.manualPrice;
    
    let price =
      item.product.sale_price != null && Number(item.product.sale_price) > 0
        ? Number(item.product.sale_price)
        : Number(item.product.price || 0);
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

  const paymentSummary = useMemo(() => {
    const total = isSeparado ? Number(separadoAmount || 0) : Number(totalAmount || 0);
    if (paymentMethod === 'transfer') {
      return { cashPart: 0, transferPart: total, change: 0 };
    }
    if (paymentMethod === 'cash') {
      const received = Number(cashReceived || total);
      const change = Math.max(0, received - total);
      return { cashPart: total, transferPart: 0, change };
    }
    const cashPart = Math.max(0, Math.min(total, Number(mixedCashPart || 0)));
    const transferPart = Math.max(0, total - cashPart);
    const received = Number(cashReceived || cashPart);
    const change = Math.max(0, received - cashPart);
    return { cashPart, transferPart, change };
  }, [totalAmount, isSeparado, separadoAmount, paymentMethod, cashReceived, mixedCashPart]);

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
    
    if (!selectedClientId) { 
        setMsg({ type: 'warning', text: 'Seleccione un cliente para continuar con la venta' }); 
        return; 
    }
    
    const val = await validateCart();
    if (!val.ok) { setMsg({ type: 'error', text: val.msg }); return; }

    if (paymentMethod === 'cash') {
      const expectedTotal = isSeparado ? Number(separadoAmount || 0) : totalAmount;
      const received = Number(cashReceived || expectedTotal);
      if (!Number.isFinite(received) || received < expectedTotal) {
        setMsg({ type: 'error', text: 'En efectivo, el monto recibido debe ser mayor o igual al monto pagar.' });
        return;
      }
    }
    if (paymentMethod === 'mixed') {
      const expectedTotal = isSeparado ? Number(separadoAmount || 0) : totalAmount;
      const cashPart = Number(mixedCashPart || 0);
      if (!Number.isFinite(cashPart) || cashPart <= 0 || cashPart >= expectedTotal) {
        setMsg({ type: 'error', text: 'En pago mixto, la parte en efectivo debe ser mayor a 0 y menor al monto a pagar.' });
        return;
      }
      const received = Number(cashReceived || cashPart);
      if (!Number.isFinite(received) || received < cashPart) {
        setMsg({ type: 'error', text: 'En pago mixto, el efectivo recibido debe cubrir la parte en efectivo.' });
        return;
      }
    }
    
    const payload = {
      client_id: selectedClientId,
      status: isSeparado ? 'apartado' : 'pending',
      payment_method: paymentMethod,
      cash_amount: Number(paymentSummary.cashPart || 0),
      transfer_amount: Number(paymentSummary.transferPart || 0),
      change_amount: Number(paymentSummary.change || 0),
      apartado_amount: isSeparado ? Number(separadoAmount || 0) : 0,
      items: cart.map((it) => ({ 
        product_id: it.product.id, 
        color_id: it.colorId ? Number(it.colorId) : null,
        variant_id: it.variantId ? Number(it.variantId) : null,
        quantity: Number(it.quantity),
        manual_price: it.manualPrice !== undefined ? Number(it.manualPrice) : null
      })),
    };

    try {
      const result = await offlineSync.queueMutation({
        token,
        method: 'POST',
        url: `${apiBase}/sales/`,
        body: payload,
        store: 'sales',
      });
      if (!result.ok && !result.queued) {
        const detail = typeof result.data === 'object'
          ? (result.data?.detail || JSON.stringify(result.data))
          : 'Error desconocido';
        throw new Error(detail);
      }
      setMsg({
        type: 'success',
        text: result.queued
          ? 'Venta guardada localmente. Se sincronizará al reconectar.'
          : 'Venta registrada exitosamente',
      });
      setCart([]);
      setOpenCart(false);
      setSelectedClientId('');
      setPaymentMethod('cash');
      setIsSeparado(false);
      setSeparadoAmount('');
      setCashReceived('');
      setMixedCashPart('');
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


  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {/* Sync Status */}
      <SyncStatusBanner
        isOnline={offlineSync.isOnline}
        pendingCount={offlineSync.pendingCount}
        syncing={offlineSync.syncing}
        lastError={offlineSync.lastError}
        onSync={offlineSync.syncNow}
      />


      {loading && !products.length && (
        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-900 dark:text-white font-medium">Cargando catálogo...</div>
          </div>
        </div>
      )}

      {msg && (
        <div className={`fixed bottom-8 right-8 z-[9999] p-4 rounded-xl text-sm flex items-center gap-3 border shadow-2xl animate-in slide-in-from-right duration-300 ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-500/50' : msg.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/90 text-amber-800 dark:text-amber-100 border-amber-200 dark:border-amber-500/50' : 'bg-rose-100 dark:bg-rose-900/90 text-rose-800 dark:text-rose-100 border-rose-200 dark:border-rose-500/50'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : msg.type === 'warning' ? <AlertTriangle size={20} /> : <X size={20} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Header / Toolbar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Venta</h2>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto flex-1 justify-end">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-4 shrink-0 px-1">
            <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}
            >
                Todas
            </button>
            {categories.map((cat) => (
                <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {/* Product Grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20">
                {products.map((p) => {
                    const sel = selectedColorMap[p.id];
                    const imgSrc = sel ? firstColorImage(p, sel) : (p.image ? mediaUrl(p.image) : '');
                    const variants = variantOptions[p.id] || [];
                    const selectedVarId = selectedVariantMap[p.id];
                    const selectedVariant = variants.find(v => String(v.id) === String(selectedVarId));
                    const hasOffer = Boolean(p.sale_price != null && Number(p.sale_price) > 0);
                    const basePrice = hasOffer ? Number(p.sale_price) : Number(p.price);
                    const displayPrice = basePrice + (selectedVariant ? Number(selectedVariant.extra_price) : 0);

                    return (
                        <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all group flex flex-col shadow-sm dark:shadow-none">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                <SafeImage 
                                    src={imgSrc} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    fallbackIcon={<Package className="w-8 h-8 opacity-20" />}
                                />
                                {hasOffer && (
                                  <div className="absolute top-3 left-3">
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-rose-600 text-white font-bold shadow">
                                      Oferta
                                    </span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <button 
                                        onClick={() => addToCart(p)}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                    >
                                        {(p.colors?.length || 0) > 0 || (p.variants?.length || 0) > 0 ? 'Personalizar' : 'Agregar al Carrito'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col cursor-pointer" onClick={() => addToCart(p)}>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm" title={p.name}>{p.name}</h3>
                                    {hasOffer ? (
                                      <div className="flex flex-col items-end">
                                        <span className="font-bold text-rose-700 dark:text-rose-300 text-sm whitespace-nowrap">
                                          {Number(displayPrice).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                        </span>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 line-through whitespace-nowrap">
                                          {Number(p.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                                          {Number(displayPrice).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                      </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{p.category_name || 'General'}</p>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        {p.colors?.slice(0, 4).map((c, i) => (
                                            <div key={i} className="inline-block h-4 w-4 rounded-full ring-2 ring-white dark:ring-gray-900 border border-gray-200 dark:border-gray-700" style={{ backgroundColor: c.hex }} />
                                        ))}
                                        {(p.colors?.length || 0) > 4 && (
                                            <div className="flex items-center justify-center h-4 w-4 rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-900 text-[8px] font-bold text-gray-500">
                                                +{p.colors!.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    {(p.variants?.length || 0) > 0 && (
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{p.variants!.length} Variantes</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {total > pageSize && (
                <div className="mt-6 mb-20 flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Mostrando <span className="text-gray-900 dark:text-white">{Math.min(products.length, pageSize)}</span> de <span className="text-gray-900 dark:text-white">{total}</span> productos
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage((p) => Math.max(1, p - 1))} 
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        >
                            Anterior
                        </button>
                        <div className="flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm min-w-[100px]">
                            Página {page} / {Math.max(1, Math.ceil(total / pageSize))}
                        </div>
                        <button 
                            onClick={() => setPage((p) => p + 1)} 
                            disabled={page >= Math.ceil(total / pageSize)}
                            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Cart Drawer */}
      {openCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenCart(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Carrito de Compras</h2>
                    </div>
                    <button onClick={() => setOpenCart(false)} className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cart.map((it, idx) => {
                        const imgSrc = it.colorId ? firstColorImage(it.product, it.colorId) : (it.product.image ? mediaUrl(it.product.image) : '');
                        const itemPrice = getItemPrice(it);
                        const variants = variantOptions[it.product.id] || [];

                        return (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex gap-3 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                                <SafeImage 
                                    src={imgSrc} 
                                    alt={it.product.name} 
                                    className="w-full h-full object-cover" 
                                    fallbackIcon={<ShoppingCart className="w-6 h-6 opacity-30" />}
                                />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.product.name}</h4>
                                          {it.product.sale_price != null && Number(it.product.sale_price) > 0 && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold shrink-0">
                                              Oferta
                                            </span>
                                          )}
                                        </div>
                                        <button onClick={() => removeCart(idx)} className="text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {/* Color Badge */}
                                        {it.colorId && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorOptions[it.product.id]?.find(c => String(c.id) === String(it.colorId))?.hex }} />
                                                {colorOptions[it.product.id]?.find(c => String(c.id) === String(it.colorId))?.name}
                                            </div>
                                        )}
                                        
                                        {/* Variant Badge */}
                                        {it.variantId && (
                                            <div className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[10px] font-bold uppercase">
                                                {variantOptions[it.product.id]?.find(v => String(v.id) === String(it.variantId))?.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                                            <button 
                                                onClick={() => updateCart(idx, { quantity: Math.max(1, Number(it.quantity || 1) - 1) })}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white w-4 text-center">{it.quantity}</span>
                                            <button 
                                                onClick={() => updateCart(idx, { quantity: Number(it.quantity || 0) + 1 })}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                    <input 
                                                        type="number"
                                                        value={it.manualPrice ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                                                            updateCart(idx, { manualPrice: val });
                                                        }}
                                                        className="w-24 pl-5 pr-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        placeholder={String(itemPrice)}
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const originalPrice = (() => {
                                                            let p = it.product.sale_price != null && Number(it.product.sale_price) > 0
                                                                ? Number(it.product.sale_price)
                                                                : Number(it.product.price || 0);
                                                            if (it.variantId) {
                                                                const vars = variantOptions[it.product.id] || [];
                                                                const v = vars.find(v => String(v.id) === String(it.variantId));
                                                                if (v) p += Number(v.extra_price || 0);
                                                            }
                                                            return p;
                                                        })();
                                                        setDiscountModal({ idx, originalPrice, pct: '' });
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                                    title="Aplicar porcentaje de descuento"
                                                >
                                                    <TrendingUp size={14} />
                                                </button>
                                                {it.manualPrice !== undefined && (
                                                    <button 
                                                        onClick={() => updateCart(idx, { manualPrice: undefined })}
                                                        className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                                                        title="Restablecer precio original"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                Subtotal: {(getItemPrice(it) * it.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                            <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                            <p>Tu carrito está vacío</p>
                            <button onClick={() => setOpenCart(false)} className="mt-4 text-blue-500 dark:text-blue-400 text-sm hover:underline">
                                Explorar productos
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-4">
                    <div className="space-y-3">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <select 
                                    value={selectedClientId} 
                                    onChange={(e) => setSelectedClientId(e.target.value)} 
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                >
                                    <option value="">Seleccionar cliente existente...</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.full_name} - {c.cedula}</option>
                                    ))}
                                </select>
                            </div>
                            {canCreateSafe && (
                                <button 
                                    onClick={() => { setOpenClientModal(true); }} 
                                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-blue-500 dark:text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"
                                    title="Nuevo Cliente"
                                >
                                    <UserPlus size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="mb-4 space-y-3">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado del Pedido</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsSeparado(false); setPaymentMethod('cash'); }}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${!isSeparado ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                                >
                                    Venta Normal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSeparado(true)}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${isSeparado ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                                >
                                    Separado
                                </button>
                            </div>
                        </div>

                        {isSeparado && (
                            <div className="mb-4 space-y-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                                <label className="text-xs font-medium text-amber-900 dark:text-amber-200 uppercase tracking-wider">Monto de Abono (Separado)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={Number(totalAmount || 0)}
                                    value={separadoAmount}
                                    onChange={(e) => setSeparadoAmount(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-500/20 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    placeholder="0"
                                />
                                <div className="text-xs text-amber-900 dark:text-amber-200">
                                    Pendiente: <span className="font-semibold">{(Number(totalAmount || 0) - Number(separadoAmount || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                                </div>
                                <div className="text-xs text-amber-700 dark:text-amber-300 bg-white dark:bg-gray-900 rounded p-2 border border-amber-100 dark:border-amber-500/20">
                                    ℹ️ El pedido se registrará como "Separado" con un abono inicial.
                                </div>
                            </div>
                        )}

                        <div className="mb-4 space-y-3">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Método de pago</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${paymentMethod === 'cash' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                                >
                                    Efectivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${paymentMethod === 'transfer' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                                >
                                    Transferencia
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('mixed')}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${paymentMethod === 'mixed' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                                >
                                    Mixto
                                </button>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="space-y-2">
                                    <label className="text-[11px] text-gray-500 dark:text-gray-400">Efectivo recibido</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        placeholder="0"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Cambio: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{paymentSummary.change.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'mixed' && (
                                <div className="space-y-2">
                                    <label className="text-[11px] text-gray-500 dark:text-gray-400">Parte en efectivo</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={isSeparado ? Number(separadoAmount || 0) : Number(totalAmount || 0)}
                                        value={mixedCashPart}
                                        onChange={(e) => setMixedCashPart(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                        placeholder="0"
                                    />
                                    <label className="text-[11px] text-gray-500 dark:text-gray-400">Efectivo recibido</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                        placeholder="0"
                                    />
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="text-gray-500 dark:text-gray-400">Transferencia: <span className="font-semibold text-blue-600 dark:text-blue-400">{paymentSummary.transferPart.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></div>
                                        <div className="text-gray-500 dark:text-gray-400 text-right">Cambio: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{paymentSummary.change.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'transfer' && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg px-3 py-2">
                                    Pago por transferencia: {(isSeparado ? Number(separadoAmount || 0) : totalAmount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 dark:text-gray-400">Total a Pagar</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                        </div>
                        {canCreateSafe && (
                            <button 
                                onClick={submitSale} 
                                disabled={cart.length === 0}
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} />
                                Confirmar Venta
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Reusable Client Modal */}
      <ClientFormModal 
        isOpen={openClientModal}
        onClose={() => setOpenClientModal(false)}
        token={token}
        apiBase={apiBase}
        themeColor="blue"
        onSuccess={(newClient) => {
          setClients(prev => [newClient, ...prev]);
          setSelectedClientId(String(newClient.id));
          setMsg({ type: 'success', text: 'Cliente creado y seleccionado' });
        }}
      />

      {/* Product Selection Modal (Step-by-Step) */}
      {selectingProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <SafeImage 
                            src={selectedColor && firstColorImage(selectingProduct, selectedColor.id) ? firstColorImage(selectingProduct, selectedColor.id) : (selectingProduct.image ? mediaUrl(selectingProduct.image) : '')} 
                            className="w-full h-full object-cover" 
                            fallbackIcon={<Package className="w-6 h-6 opacity-20" />}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selectingProduct.name}</h3>
                        <p className="text-xs text-gray-500 font-medium">Personaliza tu pedido</p>
                    </div>
                </div>
                <button onClick={() => setSelectingProduct(null)} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8">
                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[
                        { id: 'initial', label: 'Tipo', show: true },
                        { id: 'color', label: 'Color', show: !useStandardColor && selectingProduct.colors && selectingProduct.colors.length > 0 },
                        { id: 'variant', label: 'Variante', show: selectingProduct.variants && selectingProduct.variants.length > 0 },
                        { id: 'quantity', label: 'Cantidad', show: true }
                    ].filter(s => s.show).map((step, idx, arr) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                                    selectionStep === step.id ? 'bg-blue-600 text-white scale-110 shadow-blue-500/20 ring-4 ring-blue-500/10' : 
                                    (idx < arr.findIndex(s => s.id === selectionStep) ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400')
                                }`}>
                                    {idx < arr.findIndex(s => s.id === selectionStep) ? <CheckCircle2 size={18} /> : idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${selectionStep === step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                                <div className={`h-[2px] w-8 rounded-full transition-colors ${idx < arr.findIndex(s => s.id === selectionStep) ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {selectionStep === 'initial' && (
                        <div className="space-y-8 py-4">
                            <h4 className="text-center font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">¿Cómo deseas el producto?</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        setUseStandardColor(true);
                                        setSelectionStep(selectingProduct.variants && selectingProduct.variants.length > 0 ? 'variant' : 'quantity');
                                    }}
                                    className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors shadow-sm">
                                        <Package size={32} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-gray-900 dark:text-white uppercase tracking-wider">Estándar</span>
                                        <span className="text-[10px] text-gray-500 font-medium">Usa el stock global</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setUseStandardColor(false);
                                        setSelectionStep('color');
                                    }}
                                    className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors shadow-sm">
                                        <Palette size={32} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-gray-900 dark:text-white uppercase tracking-wider">Color Específico</span>
                                        <span className="text-[10px] text-gray-500 font-medium">Elige un tono de la lista</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {selectionStep === 'color' && (
                        <div className="space-y-6">
                            <h4 className="text-center font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">Selecciona un color base</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {Array.isArray(selectingProduct.colors) && selectingProduct.colors.length > 0 ? (
                                    selectingProduct.colors.map((c) => {
                                        // Determinar si hay stock para este color (ya sea en SKUs o directo)
                                        let stock = 0;
                                        if (selectingProduct.skus && selectingProduct.skus.length > 0) {
                                            const colorSkus = selectingProduct.skus.filter(s => String(s.color) === String(c.id));
                                            if (colorSkus.length > 0) {
                                                stock = colorSkus.reduce((sum, s) => sum + Number(s.stock || 0), 0);
                                            } else {
                                                stock = Number(c.stock || 0);
                                            }
                                        } else {
                                            stock = Number(c.stock || 0);
                                        }

                                        const hasStock = stock > 0;

                                        return (
                                            <button
                                                key={c.id}
                                                disabled={!hasStock}
                                                onClick={() => {
                                                    setSelectedColor(c);
                                                    setSelectionStep(selectingProduct.variants && selectingProduct.variants.length > 0 ? 'variant' : 'quantity');
                                                }}
                                                className={`group relative flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all hover:scale-105 ${
                                                    selectedColor?.id === c.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : 
                                                    (!hasStock ? 'opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700')
                                                }`}
                                            >
                                                <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 shadow-md group-hover:rotate-12 transition-transform" style={{ backgroundColor: c.hex }} />
                                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase text-center leading-tight">{c.name}</span>
                                                {!hasStock && <span className="text-[8px] font-bold text-rose-500 uppercase mt-1">Sin Stock</span>}
                                                {selectedColor?.id === c.id && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs text-gray-500 font-medium italic">No hay colores disponibles para este producto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectionStep === 'variant' && (
                        <div className="space-y-6">
                            <h4 className="text-center font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">Selecciona el detalle / variante</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.isArray(selectingProduct.variants) && selectingProduct.variants.length > 0 ? (
                                    selectingProduct.variants.map((v) => {
                                        // Determinar si hay stock para esta variante
                                        let stock = 0;
                                        if (selectingProduct.skus && selectingProduct.skus.length > 0) {
                                            const variantSkus = selectingProduct.skus.filter(s => 
                                                (!selectedColor || String(s.color) === String(selectedColor.id)) && 
                                                String(s.variant) === String(v.id)
                                            );
                                            stock = variantSkus.reduce((sum, s) => sum + Number(s.stock || 0), 0);
                                        } else {
                                            // Si no hay SKUs, asumimos stock global o permitimos selección
                                            stock = selectingProduct.inventory_qty || 0;
                                        }

                                        const hasStock = stock > 0;

                                        return (
                                            <button
                                                key={v.id}
                                                disabled={!hasStock}
                                                onClick={() => {
                                                    setSelectedVariant(v);
                                                    setSelectionStep('quantity');
                                                }}
                                                className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                                                    selectedVariant?.id === v.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : 
                                                    (!hasStock ? 'opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-blue-500/30')
                                                }`}
                                            >
                                                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">{v.name}</span>
                                                {Number(v.extra_price) > 0 && (
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        +{formatCurrency(v.extra_price)}
                                                    </span>
                                                )}
                                                {!hasStock && <span className="text-[8px] font-bold text-rose-500 uppercase">Sin Stock</span>}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs text-gray-500 font-medium italic">No hay variantes disponibles para este producto</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedVariant(null);
                                        setSelectionStep('quantity');
                                    }}
                                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                                        selectedVariant === null ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30'
                                    }`}
                                >
                                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">Estándar</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Sin cargo extra</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {selectionStep === 'quantity' && (
                        <div className="flex flex-col items-center justify-center space-y-8 py-4">
                            <h4 className="text-center font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">Define la cantidad</h4>
                            
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-8">
                                    <button 
                                        onClick={() => setSelectionQty(Math.max(1, selectionQty - 1))}
                                        disabled={currentAvailableStock === 0}
                                        className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-90 disabled:opacity-30"
                                    >
                                        <Minus size={24} />
                                    </button>
                                    <div className="text-6xl font-black text-gray-900 dark:text-white tabular-nums min-w-[80px] text-center">
                                        {selectionQty}
                                    </div>
                                    <button 
                                        onClick={() => setSelectionQty(Math.min(currentAvailableStock, selectionQty + 1))}
                                        disabled={selectionQty >= currentAvailableStock}
                                        className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                                    currentAvailableStock === 0 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                                    currentAvailableStock < 5 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                    {currentAvailableStock === 0 ? 'Agotado' : `Stock disponible: ${currentAvailableStock}`}
                                </div>
                            </div>

                            {/* Selection Summary Badge */}
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {selectedColor && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold shadow-sm">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
                                        {selectedColor.name}
                                    </span>
                                )}
                                {selectedVariant && (
                                    <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20 text-xs font-bold uppercase tracking-widest shadow-sm">
                                        {selectedVariant.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                <button 
                    onClick={() => {
                        if (selectionStep === 'quantity' && selectingProduct.variants && selectingProduct.variants.length > 0) setSelectionStep('variant');
                        else if (selectionStep === 'variant' && selectingProduct.colors && selectingProduct.colors.length > 0) setSelectionStep('color');
                        else if (selectionStep === 'quantity' && selectingProduct.colors && selectingProduct.colors.length > 0) setSelectionStep('color');
                        else setSelectingProduct(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                    Atrás
                </button>
                <button 
                    onClick={() => {
                        if (selectionStep === 'color' && selectingProduct.variants && selectingProduct.variants.length > 0) setSelectionStep('variant');
                        else if (selectionStep === 'color') setSelectionStep('quantity');
                        else if (selectionStep === 'variant') setSelectionStep('quantity');
                        else confirmSelection();
                    }}
                    disabled={(selectionStep === 'color' && !selectedColor) || (selectionStep === 'variant' && !selectedVariant && selectingProduct.variants && selectingProduct.variants.length > 0) || (selectionStep === 'quantity' && currentAvailableStock === 0)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                    {selectionStep === 'quantity' ? (
                        <>
                            <ShoppingCart size={18} />
                            <span>{currentAvailableStock === 0 ? 'Agotado' : 'Añadir al Carrito'}</span>
                        </>
                    ) : (
                        <span>Siguiente</span>
                    )}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Percentage Modal */}
      {discountModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDiscountModal(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Aplicar Descuento</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Precio original: {discountModal.originalPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </p>
              </div>
              <button onClick={() => setDiscountModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Porcentaje de Descuento</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountModal.pct}
                    onChange={e => setDiscountModal({ ...discountModal, pct: e.target.value })}
                    autoFocus
                    placeholder="Ej: 10"
                    className="w-full pr-10 pl-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-lg"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const p = parseFloat(discountModal.pct);
                        if (!isNaN(p) && p >= 0 && p <= 100) {
                          updateCart(discountModal.idx, { manualPrice: Math.round(discountModal.originalPrice * (1 - p / 100)) });
                          setDiscountModal(null);
                        }
                      }
                    }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">%</span>
                </div>
              </div>
              {discountModal.pct !== '' && !isNaN(parseFloat(discountModal.pct)) && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Precio resultante</span>
                  <span className="text-lg font-black text-blue-700 dark:text-blue-300 tabular-nums">
                    {Math.round(discountModal.originalPrice * (1 - parseFloat(discountModal.pct) / 100)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setDiscountModal(null)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const p = parseFloat(discountModal.pct);
                    if (!isNaN(p) && p >= 0 && p <= 100) {
                      updateCart(discountModal.idx, { manualPrice: Math.round(discountModal.originalPrice * (1 - p / 100)) });
                      setDiscountModal(null);
                    }
                  }}
                  disabled={discountModal.pct === '' || isNaN(parseFloat(discountModal.pct)) || parseFloat(discountModal.pct) < 0 || parseFloat(discountModal.pct) > 100}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-colors"
                >
                  Aplicar Descuento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
