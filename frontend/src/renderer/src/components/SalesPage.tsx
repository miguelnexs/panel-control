import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Package,
  Palette,
  AlertTriangle,
  Scan,
  Zap,
  Receipt,
  ChevronDown,
  ChevronUp
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
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [scanFlash, setScanFlash] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [openClientModal, setOpenClientModal] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [colorOptions, setColorOptions] = useState<Record<number, Color[]>>({});
  const [selectedColorMap, setSelectedColorMap] = useState<Record<number, string>>({});
  const [variantOptions, setVariantOptions] = useState<Record<number, Variant[]>>({});
  const [selectedVariantMap, setSelectedVariantMap] = useState<Record<number, string>>({});
  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [selectingProduct, setSelectingProduct] = useState<Product | null>(null);
  const [selectionStep, setSelectionStep] = useState<'initial' | 'color' | 'variant' | 'quantity'>('initial');
  const [useStandardColor, setUseStandardColor] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [currentAvailableStock, setCurrentAvailableStock] = useState(0);
  const [selectionQty, setSelectionQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'mixed'>('cash');
  const [isSeparado, setIsSeparado] = useState(false);
  const [separadoAmount, setSeparadoAmount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [mixedCashPart, setMixedCashPart] = useState('');
  const [discountModal, setDiscountModal] = useState<{
    idx: number;
    originalPrice: number;
    pct: string;
  } | null>(null);

  // --- Cart Persistence ---
  useEffect(() => {
    const savedCart = localStorage.getItem('assent_sales_cart');
    const savedClient = localStorage.getItem('assent_sales_client');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (e) { console.error("Error loading saved cart", e); }
    }
    if (savedClient) setSelectedClientId(savedClient);
  }, []);

  useEffect(() => {
    localStorage.setItem('assent_sales_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('assent_sales_client', selectedClientId);
  }, [selectedClientId]);

  // --- Auto-focus on barcode input ---
  const refocusBarcode = useCallback(() => {
    setTimeout(() => {
      if (!selectingProduct && !discountModal && barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 120);
  }, [selectingProduct, discountModal]);

  useEffect(() => {
    refocusBarcode();
  }, [selectingProduct, discountModal]);

  // Focus on mount
  useEffect(() => {
    setTimeout(() => barcodeInputRef.current?.focus(), 300);
  }, []);

  // --- Debounced search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [selectedCategory]);

  // --- Load catalog ---
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
        const loadedClients = Array.isArray(clientsData) ? clientsData : [];
        setClients(loadedClients);
        const savedClient = localStorage.getItem('assent_sales_client');
        if (!savedClient && loadedClients.length > 0) {
          const defaultCli = loadedClients.find(c => c.full_name.toLowerCase() === 'cliente');
          if (defaultCli) {
            setSelectedClientId(String(defaultCli.id));
          }
        }
      } catch(_) {
      } finally {
        setLoading(false);
      }
    };
    if (token) loadCatalog();
  }, [token, page, debouncedSearch, selectedCategory]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c => 
      c.full_name.toLowerCase().includes(q) || 
      (c.cedula && c.cedula.toLowerCase().includes(q))
    );
  }, [clients, clientSearch]);

  useEffect(() => {
    const q = clientSearch.trim();
    if (!q) return;
    const match = clients.find(c => 
      (c.cedula && c.cedula === q) || 
      c.full_name.toLowerCase() === q.toLowerCase()
    );
    if (match) {
      setSelectedClientId(String(match.id));
    }
  }, [clientSearch, clients]);

  useEffect(() => {
    if (selectingProduct) {
      let stock = Number(selectingProduct.inventory_qty || 0);
      
      if (selectedColor || selectedVariant) {
        const matchingSku = selectingProduct.skus?.find(s => 
          (selectedColor ? String(s.color) === String(selectedColor.id) : !s.color) &&
          (selectedVariant ? String(s.variant) === String(selectedVariant.id) : !s.variant)
        );
        if (matchingSku) { 
          stock = Number(matchingSku.stock || 0); 
        } else if (selectedColor && !selectedVariant) { 
          const col = Array.isArray(selectingProduct.colors) ? selectingProduct.colors.find(c => String(c.id) === String(selectedColor.id)) : null;
          stock = col ? Number(col.stock || 0) : 0; 
        } else { 
          stock = 0; 
        }
      }

      setCurrentAvailableStock(stock);
      if (selectionQty > stock && stock > 0) setSelectionQty(stock);
      else if (stock === 0) setSelectionQty(0);
    }
  }, [selectingProduct, selectedColor, selectedVariant]);

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

  // Returns true if the color has its own specific image (not falling back to product main image)
  const colorHasOwnImage = (product: Product, colorId: string | number): boolean => {
    const list = (colorOptions[product.id] || product.colors || []);
    const col = Array.isArray(list) ? list.find((c) => String(c.id) === String(colorId)) : null;
    if (!col || !col.images || col.images.length === 0) return false;
    const firstImg = col.images[0];
    const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg.image;
    return Boolean(imgUrl);
  };

  // Get full color object for a cart item
  const getColorForItem = (it: CartItem): Color | null => {
    if (!it.colorId) return null;
    const list = colorOptions[it.product.id] || it.product.colors || [];
    return list.find(c => String(c.id) === String(it.colorId)) || null;
  };

  // Get full variant object for a cart item
  const getVariantForItem = (it: CartItem): Variant | null => {
    if (!it.variantId) return null;
    const list = variantOptions[it.product.id] || it.product.variants || [];
    return list.find(v => String(v.id) === String(it.variantId)) || null;
  };

  // --- Open product for adding to cart (shared logic) ---
  const openProductForAdd = async (product: Product) => {
    setLoading(true);
    try {
      const [skusRes, prodRes] = await Promise.all([
        fetch(`${apiBase}/products/${product.id}/skus/`, { headers: authHeaders(token) }),
        fetch(`${apiBase}/products/${product.id}/`, { headers: authHeaders(token) })
      ]);
      const skusData = await skusRes.json();
      const fullProductData = await prodRes.json();
      const skus = Array.isArray(skusData.results) ? skusData.results : (Array.isArray(skusData) ? skusData : []);
      const fullProduct = { ...fullProductData, skus };

      if ((fullProduct.colors && fullProduct.colors.length > 0) || (fullProduct.variants && fullProduct.variants.length > 0)) {
        setSelectingProduct(fullProduct);
        setSelectedColor(null);
        setSelectedVariant(null);
        setUseStandardColor(false);
        setSelectionQty(1);
        const hasColors = fullProduct.colors && fullProduct.colors.length > 0;
        setSelectionStep(hasColors ? 'color' : 'variant');
        setLoading(false);
        return;
      }
      // Direct add
      const stock = Number(fullProduct.inventory_qty || 0);
      let currentInCart = 0;
      setCart((c) => {
        const existingItem = c.find(item => item.product.id === fullProduct.id && item.colorId === null && item.variantId === null);
        if (existingItem) currentInCart = Number(existingItem.quantity || 0);
        return c; // We don't modify here, just read
      });

      if (currentInCart + 1 > stock) {
        alert(`Solo hay ${stock} unidades disponibles para este producto.`);
        setLoading(false);
        return;
      }

      setCart((c) => {
        const existingIdx = c.findIndex(item => item.product.id === fullProduct.id && item.colorId === null && item.variantId === null);
        if (existingIdx >= 0) {
          return c.map((item, i) => i === existingIdx ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...c, { product: fullProduct, colorId: null, variantId: null, quantity: 1 }];
      });
      triggerScanFlash();
      setMsg({ type: 'success', text: `✓ ${fullProduct.name}` });
      setTimeout(() => setMsg(null), 2000);
    } catch (e) {
      console.error("Error loading product details:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerScanFlash = () => {
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 600);
  };

  // --- Add by barcode / SKU ---
  const addByBarcode = async (code: string) => {
    if (!code.trim()) return;
    setBarcodeLoading(true);
    try {
      // 1. Try to resolve the SKU via the new resolve-sku endpoint
      const resolveRes = await fetch(`${apiBase}/products/resolve-sku/?sku=${encodeURIComponent(code.trim())}`, {
        headers: authHeaders(token)
      });
      if (resolveRes.ok) {
        const resolveData = await resolveRes.json();
        if (resolveData.found) {
          const { type, product, color_id, variant_id, stock } = resolveData;
          
          if (type === 'combination') {
            const cid = color_id ? String(color_id) : null;
            const vid = variant_id ? String(variant_id) : null;
            
            let currentInCart = 0;
            // Access cart synchronously by using a temporary check or reading from state
            // since setCart is asynchronous we can use the state value directly
            const existingItem = cart.find(item => 
              item.product.id === product.id && 
              item.colorId === cid && 
              item.variantId === vid
            );
            if (existingItem) {
              currentInCart = existingItem.quantity;
            }

            if (currentInCart + 1 > stock) {
              alert(`Solo hay ${stock} unidades disponibles para esta combinación.`);
              setBarcodeLoading(false);
              setBarcodeValue('');
              refocusBarcode();
              return;
            }

            setCart((c) => {
              const existingIdx = c.findIndex(item => 
                item.product.id === product.id && 
                item.colorId === cid && 
                item.variantId === vid
              );
              if (existingIdx >= 0) {
                return c.map((item, i) => i === existingIdx ? { ...item, quantity: item.quantity + 1 } : item);
              }
              return [...c, { product, colorId: cid, variantId: vid, quantity: 1 }];
            });

            triggerScanFlash();
            setMsg({ type: 'success', text: `✓ ${product.name} (${resolveData.sku})` });
            setTimeout(() => setMsg(null), 2000);
            setBarcodeLoading(false);
            setBarcodeValue('');
            refocusBarcode();
            return;
          } else if (type === 'product') {
            setBarcodeValue('');
            await openProductForAdd(product);
            setBarcodeLoading(false);
            refocusBarcode();
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Failed resolving SKU, falling back to general search:", e);
    }

    // Fallback: search locally and by general query
    try {
      // First try local products
      const localMatch = products.find(p => 
        p.sku?.toLowerCase() === code.toLowerCase().trim()
      );
      if (localMatch) {
        setBarcodeValue('');
        await openProductForAdd(localMatch);
        refocusBarcode();
        setBarcodeLoading(false);
        return;
      }
      // Fetch from API
      const res = await fetch(`${apiBase}/products/?search=${encodeURIComponent(code.trim())}&active=true&page_size=5`, { 
        headers: authHeaders(token) 
      });
      const data = await res.json();
      const items: Product[] = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);
      
      // Find exact SKU match
      const exact = items.find(p => p.sku?.toLowerCase() === code.toLowerCase().trim());
      const target = exact || (items.length === 1 ? items[0] : null);

      if (target) {
        setBarcodeValue('');
        await openProductForAdd(target);
      } else if (items.length > 1) {
        setMsg({ type: 'warning', text: `Múltiples resultados para "${code}". Usa la búsqueda visual.` });
        setSearch(code);
        setShowCatalog(true);
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: 'error', text: `Producto no encontrado: "${code}"` });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch(e) {
      setMsg({ type: 'error', text: 'Error al buscar el producto' });
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setBarcodeLoading(false);
      setBarcodeValue('');
      refocusBarcode();
    }
  };

  const confirmSelection = () => {
    if (!selectingProduct) return;
    let stock = Number(selectingProduct.inventory_qty || 0);
    
    if (selectedColor || selectedVariant) {
      const matchingSku = selectingProduct.skus?.find(s => 
        (selectedColor ? String(s.color) === String(selectedColor.id) : !s.color) &&
        (selectedVariant ? String(s.variant) === String(selectedVariant.id) : !s.variant)
      );
      if (matchingSku) { 
        stock = Number(matchingSku.stock || 0); 
      } else if (selectedColor && !selectedVariant) { 
        const col = Array.isArray(selectingProduct.colors) ? selectingProduct.colors.find(c => String(c.id) === String(selectedColor.id)) : null;
        stock = col ? Number(col.stock || 0) : 0; 
      } else { 
        stock = 0; 
      }
    }

    if (selectionQty > stock) {
      alert(`Solo hay ${stock} unidades disponibles para esta selección.`);
      return;
    }
    
    const colorId = !useStandardColor && selectedColor ? String(selectedColor.id) : null;
    const variantId = !useStandardColor && selectedVariant ? String(selectedVariant.id) : null;

    setCart((c) => {
      const existingIdx = c.findIndex(item => 
        item.product.id === selectingProduct!.id && 
        item.colorId === colorId && 
        item.variantId === variantId
      );
      if (existingIdx >= 0) {
        return c.map((item, i) => i === existingIdx ? { ...item, quantity: item.quantity + selectionQty } : item);
      }
      return [...c, { product: selectingProduct!, colorId, variantId, quantity: selectionQty }];
    });

    triggerScanFlash();
    setMsg({ type: 'success', text: `✓ ${selectingProduct.name}` });
    setTimeout(() => setMsg(null), 2000);
    setSelectingProduct(null);
    refocusBarcode();
  };

  const updateCart = (idx: number, patch: Partial<CartItem>) => {
    setCart((c) => c.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const removeCart = (idx: number) => {
    setCart((c) => c.filter((_, i) => i !== idx));
    refocusBarcode();
  };

  const getItemPrice = (item: CartItem) => {
    if (item.manualPrice !== undefined) return item.manualPrice;
    let price = item.product.sale_price != null && Number(item.product.sale_price) > 0
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
      
      let availableStock = 0;
      if (it.product.skus && it.product.skus.length > 0) {
        const matchingSku = it.product.skus.find(s => 
          (it.colorId ? String(s.color) === String(it.colorId) : !s.color) &&
          (it.variantId ? String(s.variant) === String(it.variantId) : !s.variant)
        );
        if (matchingSku) {
          availableStock = Number(matchingSku.stock || 0);
        } else if (it.colorId && !it.variantId) {
          const colList = (colorOptions[it.product.id] || it.product.colors || []);
          const col = Array.isArray(colList) ? colList.find(c => String(c.id) === String(it.colorId)) : null;
          availableStock = col ? Number(col.stock || 0) : 0;
        }
      } else if (it.colorId) {
        const colList = (colorOptions[it.product.id] || it.product.colors || []);
        const col = Array.isArray(colList) ? colList.find(c => String(c.id) === String(it.colorId)) : null;
        availableStock = col ? Number(col.stock || 0) : 0;
      } else {
        availableStock = Number(it.product.inventory_qty || 0);
      }

      if (availableStock < qty) {
        return { ok: false, msg: `Stock insuficiente para ${it.product.name} (Disponible: ${availableStock}, Requerido: ${qty})` };
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
        setMsg({ type: 'error', text: 'El monto recibido debe ser mayor o igual al monto a pagar.' });
        return;
      }
    }
    if (paymentMethod === 'mixed') {
      const expectedTotal = isSeparado ? Number(separadoAmount || 0) : totalAmount;
      const cashPart = Number(mixedCashPart || 0);
      if (!Number.isFinite(cashPart) || cashPart <= 0 || cashPart >= expectedTotal) {
        setMsg({ type: 'error', text: 'En pago mixto, la parte en efectivo debe ser mayor a 0 y menor al total.' });
        return;
      }
      const received = Number(cashReceived || cashPart);
      if (!Number.isFinite(received) || received < cashPart) {
        setMsg({ type: 'error', text: 'El efectivo recibido debe cubrir la parte en efectivo.' });
        return;
      }
    }
    
    const payload = {
      client_id: selectedClientId,
      status: isSeparado ? 'apartado' : (['cash', 'transfer'].includes(paymentMethod) ? 'delivered' : 'pending'),
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
        text: result.queued ? 'Venta guardada localmente. Se sincronizará al reconectar.' : '¡Venta registrada exitosamente!',
      });
      setCart([]);
      localStorage.removeItem('assent_sales_cart');
      localStorage.removeItem('assent_sales_client');
      setSelectedClientId('');
      setPaymentMethod('cash');
      setIsSeparado(false);
      setSeparadoAmount('');
      setCashReceived('');
      setMixedCashPart('');
      if (onSaleCreated) onSaleCreated();
      setTimeout(() => { setMsg(null); refocusBarcode(); }, 2500);
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

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="relative animate-in fade-in duration-500 flex flex-col h-[calc(100vh-100px)]">
      {/* Sync Status */}
      <SyncStatusBanner
        isOnline={offlineSync.isOnline}
        pendingCount={offlineSync.pendingCount}
        syncing={offlineSync.syncing}
        lastError={offlineSync.lastError}
        onSync={offlineSync.syncNow}
      />

      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-8 right-8 z-[9999] p-4 rounded-xl text-sm flex items-center gap-3 border shadow-2xl animate-in slide-in-from-right duration-300 ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-500/50' : msg.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/90 text-amber-800 dark:text-amber-100 border-amber-200 dark:border-amber-500/50' : 'bg-rose-100 dark:bg-rose-900/90 text-rose-800 dark:text-rose-100 border-rose-200 dark:border-rose-500/50'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : msg.type === 'warning' ? <AlertTriangle size={20} /> : <X size={20} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      {/* Main layout — 2 columns */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* === LEFT PANEL (60%) === */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">

          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg shadow-sm">
              <CreditCard className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black dark:text-white leading-tight">Nueva Venta</h2>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Modo Caja Rápida</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {totalItems > 0 && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
                  {totalItems} ítem{totalItems !== 1 ? 's' : ''}
                </span>
              )}
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${barcodeLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} title={barcodeLoading ? 'Buscando...' : 'Listo para escanear'} />
            </div>
          </div>

          {/* Barcode Scanner Input */}
          <div className={`rounded-2xl border-2 p-4 transition-all duration-300 shrink-0 shadow-lg ${
            scanFlash 
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl transition-colors ${barcodeLoading ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {barcodeLoading 
                  ? <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  : <Scan className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                }
              </div>
              <div>
                <span className="text-sm font-black text-black dark:text-white">Escanear Código de Barras</span>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Apunta el lector o escribe el SKU y presiona Enter</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && barcodeValue.trim()) {
                    e.preventDefault();
                    addByBarcode(barcodeValue.trim());
                  }
                }}
                placeholder="Código de barras o SKU..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-base font-black text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                onClick={() => barcodeValue.trim() && addByBarcode(barcodeValue.trim())}
                disabled={!barcodeValue.trim() || barcodeLoading}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 dark:disabled:text-gray-600 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
              >
                <Zap size={18} />
              </button>
            </div>
          </div>

          {/* Cart Items List — always visible */}
          <div className="flex-1 min-h-0 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-800 rounded-2xl flex flex-col shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Carrito</span>
                {cart.length > 0 && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">{cart.length}</span>
                )}
              </div>
              {cart.length > 0 && (
                <button onClick={() => { setCart([]); localStorage.removeItem('assent_sales_cart'); refocusBarcode(); }} className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors">
                  Vaciar todo
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-600">
                  <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-black text-sm text-gray-700 dark:text-gray-500">Carrito vacío</p>
                  <p className="text-xs mt-1 font-bold opacity-80">Escanea un código para comenzar</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cart.map((it, idx) => {
                    const color = getColorForItem(it);
                    const variant = getVariantForItem(it);
                    const hasOwnImg = it.colorId ? colorHasOwnImage(it.product, it.colorId) : false;
                    const imgSrc = it.colorId
                      ? firstColorImage(it.product, it.colorId)
                      : (it.product.image ? mediaUrl(it.product.image) : '');
                    const itemPrice = getItemPrice(it);
                    return (
                      <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        {/* Product image with color/variant indicator */}
                        <div className="relative w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-visible shrink-0">
                          <div className="w-full h-full rounded-xl overflow-hidden">
                            <SafeImage 
                              src={imgSrc} 
                              alt={it.product.name} 
                              className="w-full h-full object-cover" 
                              fallbackIcon={<Package className="w-5 h-5 opacity-20" />}
                            />
                            {/* Overlay when using main image but color is selected (no specific color image) */}
                            {color && !hasOwnImg && (
                              <div className="absolute inset-0 rounded-xl flex items-end justify-start p-1 bg-gradient-to-t from-black/50 to-transparent">
                                <div className="flex items-center gap-0.5">
                                  <div
                                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Color dot badge (top-right) when color has its own image */}
                          {color && hasOwnImg && (
                            <div
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 shadow-md z-10"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          )}
                          {/* Variant badge (top-right) when no color but has variant */}
                          {!color && variant && (
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 uppercase leading-none">
                              {variant.name.slice(0, 3)}
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-black dark:text-white truncate">{it.product.name}</p>
                              <div className="flex items-center flex-wrap gap-1 mt-0.5">
                                {color && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color.hex }} />
                                    {color.name}
                                    {!hasOwnImg && <span className="text-gray-400 dark:text-gray-500 font-normal italic ml-0.5">(img. principal)</span>}
                                  </div>
                                )}
                                {variant && (
                                  <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                    {variant.name}
                                  </span>
                                )}
                                {it.product.sale_price != null && Number(it.product.sale_price) > 0 && (
                                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">Oferta</span>
                                )}
                              </div>
                            </div>
                            <button onClick={() => removeCart(idx)} className="text-gray-300 dark:text-gray-700 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <button onClick={() => updateCart(idx, { quantity: Math.max(1, Number(it.quantity || 1) - 1) })} className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded transition-colors font-bold">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-black text-black dark:text-white w-6 text-center tabular-nums">{it.quantity}</span>
                          <button onClick={() => updateCart(idx, { quantity: Number(it.quantity || 0) + 1 })} className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded transition-colors font-bold">
                            <Plus size={14} />
                          </button>
                        </div>
                        {/* Price */}
                        <div className="text-right shrink-0 min-w-[80px]">
                          <div className="relative">
                            <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input 
                              type="number"
                              value={it.manualPrice ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                updateCart(idx, { manualPrice: val });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-24 pl-5 pr-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                              placeholder={String(itemPrice)}
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 text-right">
                            = {(itemPrice * it.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Catalog toggle */}
          <div className="shrink-0">
            <button
              onClick={() => setShowCatalog(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-800 rounded-xl text-sm font-black text-gray-800 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-md"
            >
              <Search size={15} />
              {showCatalog ? 'Ocultar catálogo visual' : 'Buscar por catálogo visual'}
              {showCatalog ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          {/* Catalog (hidden by default) */}
          {showCatalog && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shrink-0 shadow-theme max-h-[380px] overflow-y-auto">
              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o SKU..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-3">
                <button onClick={() => setSelectedCategory(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  Todas
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
              {/* Product grid */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {products.map((p) => {
                    const sel = selectedColorMap[p.id];
                    const imgSrc = sel ? firstColorImage(p, sel) : (p.image ? mediaUrl(p.image) : '');
                    const hasOffer = Boolean(p.sale_price != null && Number(p.sale_price) > 0);
                    const displayPrice = hasOffer ? Number(p.sale_price) : Number(p.price);
                    return (
                      <button key={p.id} onClick={() => openProductForAdd(p)} className="text-left bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                          <SafeImage src={imgSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" fallbackIcon={<Package className="w-6 h-6 opacity-20" />} />
                          {hasOffer && <div className="absolute top-1.5 left-1.5"><span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold">Oferta</span></div>}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{displayPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Pagination */}
              {total > pageSize && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Anterior</button>
                  <span className="text-xs text-gray-500">{page} / {Math.max(1, Math.ceil(total / pageSize))}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / pageSize)} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Siguiente</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === RIGHT PANEL (38% / fixed) === */}
        <div className="w-[360px] shrink-0 flex flex-col gap-4">

          {/* Client */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-800 rounded-2xl p-4 shadow-lg shrink-0 space-y-3">
            <label className="text-xs font-black text-gray-800 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cédula o nombre..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const q = clientSearch.trim().toLowerCase();
                    if (q) {
                      const match = clients.find(c => 
                        (c.cedula && c.cedula.toLowerCase().includes(q)) || 
                        c.full_name.toLowerCase().includes(q)
                      );
                      if (match) {
                        setSelectedClientId(String(match.id));
                        setClientSearch('');
                        refocusBarcode();
                      }
                    }
                  }
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select 
                  value={selectedClientId} 
                  onChange={(e) => { setSelectedClientId(e.target.value); refocusBarcode(); }} 
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none shadow-sm"
                >
                  <option value="">Sin cliente...</option>
                  {filteredClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} — {c.cedula}</option>
                  ))}
                </select>
              </div>
              {canCreateSafe && (
                <button 
                  onClick={() => setOpenClientModal(true)} 
                  className="p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-blue-500 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"
                  title="Nuevo Cliente"
                >
                  <UserPlus size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Order type + Payment */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-800 rounded-2xl p-4 shadow-lg flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Order type */}
            <div className="mb-4">
              <label className="text-xs font-black text-gray-800 dark:text-gray-400 uppercase tracking-wider mb-2 block">Estado del Pedido</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setIsSeparado(false); setPaymentMethod('cash'); }} className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${!isSeparado ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}>Venta Normal</button>
                <button type="button" onClick={() => setIsSeparado(true)} className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${isSeparado ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}>Separado</button>
              </div>
            </div>

            {isSeparado && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 space-y-2">
                <label className="text-xs font-bold text-amber-800 dark:text-amber-300">Monto de Abono</label>
                <input type="number" min={0} max={totalAmount} value={separadoAmount} onChange={(e) => setSeparadoAmount(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-gray-900 dark:text-white" placeholder="0" />
                <div className="text-xs text-amber-700 dark:text-amber-300">Pendiente: <span className="font-bold">{(totalAmount - Number(separadoAmount || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></div>
              </div>
            )}

            {/* Payment method */}
            <div className="mb-4">
              <label className="text-xs font-black text-gray-800 dark:text-gray-400 uppercase tracking-wider mb-2 block">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'cash', label: 'Efectivo', color: 'emerald' },
                  { key: 'transfer', label: 'Transferencia', color: 'blue' },
                  { key: 'mixed', label: 'Mixto', color: 'purple' }
                ].map(({ key, label, color }) => (
                  <button key={key} type="button" onClick={() => setPaymentMethod(key as any)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${paymentMethod === key ? `bg-${color}-600 text-white border-${color}-600` : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                  >{label}</button>
                ))}
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-4 space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Efectivo recibido</label>
                <input type="number" min={0} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-900 dark:text-white" placeholder="0" />
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Cambio: {paymentSummary.change.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </div>
              </div>
            )}
            {paymentMethod === 'mixed' && (
              <div className="mb-4 space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">Parte en efectivo</label>
                <input type="number" min={0} value={mixedCashPart} onChange={(e) => setMixedCashPart(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-gray-900 dark:text-white" placeholder="0" />
                <label className="text-xs text-gray-500 dark:text-gray-400">Efectivo recibido</label>
                <input type="number" min={0} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-gray-900 dark:text-white" placeholder="0" />
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="text-blue-600 dark:text-blue-400">Transfer: {paymentSummary.transferPart.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 text-right">Cambio: {paymentSummary.change.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            )}
            {paymentMethod === 'transfer' && (
              <div className="mb-4 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg px-3 py-2">
                Pago por transferencia: {(isSeparado ? Number(separadoAmount || 0) : totalAmount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              {/* Total */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">{cart.length} producto{cart.length !== 1 ? 's' : ''} · {totalItems} unidad{totalItems !== 1 ? 'es' : ''}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total a Pagar</div>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                  {totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* Confirm button */}
              {canCreateSafe && (
                <button 
                  onClick={submitSale} 
                  disabled={cart.length === 0}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black shadow-lg shadow-emerald-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base active:scale-98"
                >
                  <Receipt size={20} />
                  Confirmar Venta
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Modal */}
      <ClientFormModal 
        isOpen={openClientModal}
        onClose={() => { setOpenClientModal(false); refocusBarcode(); }}
        token={token}
        apiBase={apiBase}
        themeColor="blue"
        onSuccess={(newClient) => {
          setClients(prev => [newClient, ...prev]);
          setSelectedClientId(String(newClient.id));
          setMsg({ type: 'success', text: 'Cliente creado y seleccionado' });
          setTimeout(() => setMsg(null), 2000);
        }}
      />

      {/* Product Selection Modal */}
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
              <button onClick={() => { setSelectingProduct(null); refocusBarcode(); }} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-4 mb-10">
                {[
                  { id: 'color', label: 'Color', show: selectingProduct.colors && selectingProduct.colors.length > 0 },
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


                {selectionStep === 'color' && (
                  <div className="space-y-6">
                    <h4 className="text-center font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">Selecciona un color base</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {Array.isArray(selectingProduct.colors) && selectingProduct.colors.length > 0 ? (
                        selectingProduct.colors.map((c) => {
                          let stock = 0;
                          if (selectingProduct.skus && selectingProduct.skus.length > 0) {
                            const colorSkus = selectingProduct.skus.filter(s => String(s.color) === String(c.id));
                            stock = colorSkus.length > 0 ? colorSkus.reduce((sum, s) => sum + Number(s.stock || 0), 0) : Number(c.stock || 0);
                          } else {
                            stock = Number(c.stock || 0);
                          }
                          const hasStock = stock > 0;
                          return (
                            <button key={c.id} disabled={!hasStock} onClick={() => { setSelectedColor(c); setSelectionStep(selectingProduct.variants && selectingProduct.variants.length > 0 ? 'variant' : 'quantity'); }}
                              className={`group relative flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all hover:scale-105 ${selectedColor?.id === c.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : (!hasStock ? 'opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700')}`}
                            >
                              <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 shadow-md group-hover:rotate-12 transition-transform" style={{ backgroundColor: c.hex }} />
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase text-center leading-tight">{c.name}</span>
                              {!hasStock && <span className="text-[8px] font-bold text-rose-500 uppercase mt-1">Sin Stock</span>}
                              {selectedColor?.id === c.id && <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in"><CheckCircle2 size={14} /></div>}
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-20" />
                          <p className="text-xs text-gray-500 font-medium italic">No hay colores disponibles</p>
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
                          let stock = 0;
                          if (selectingProduct.skus && selectingProduct.skus.length > 0) {
                            const variantSkus = selectingProduct.skus.filter(s => (!selectedColor || String(s.color) === String(selectedColor.id)) && String(s.variant) === String(v.id));
                            stock = variantSkus.reduce((sum, s) => sum + Number(s.stock || 0), 0);
                          } else {
                            stock = selectingProduct.inventory_qty || 0;
                          }
                          const hasStock = stock > 0;
                          return (
                            <button key={v.id} disabled={!hasStock} onClick={() => { setSelectedVariant(v); setSelectionStep('quantity'); }}
                              className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${selectedVariant?.id === v.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : (!hasStock ? 'opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-blue-500/30')}`}
                            >
                              <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">{v.name}</span>
                              {Number(v.extra_price) > 0 && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">+{formatCurrency(v.extra_price)}</span>}
                              {!hasStock && <span className="text-[8px] font-bold text-rose-500 uppercase">Sin Stock</span>}
                            </button>
                          );
                        })
                      ) : null}
                      <button onClick={() => { setSelectedVariant(null); setSelectionStep('quantity'); }} className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${selectedVariant === null ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30'}`}>
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
                        <button onClick={() => setSelectionQty(Math.max(1, selectionQty - 1))} disabled={currentAvailableStock === 0} className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-90 disabled:opacity-30"><Minus size={24} /></button>
                        <div className="text-6xl font-black text-gray-900 dark:text-white tabular-nums min-w-[80px] text-center">{selectionQty}</div>
                        <button onClick={() => setSelectionQty(Math.min(currentAvailableStock, selectionQty + 1))} disabled={selectionQty >= currentAvailableStock} className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30"><Plus size={24} /></button>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${currentAvailableStock === 0 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : currentAvailableStock < 5 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                        {currentAvailableStock === 0 ? 'Agotado' : `Stock disponible: ${currentAvailableStock}`}
                      </div>
                    </div>
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
              <button onClick={() => {
                if (selectionStep === 'quantity' && selectingProduct.variants && selectingProduct.variants.length > 0) setSelectionStep('variant');
                else if (selectionStep === 'variant' && selectingProduct.colors && selectingProduct.colors.length > 0) setSelectionStep('color');
                else if (selectionStep === 'quantity' && selectingProduct.colors && selectingProduct.colors.length > 0) setSelectionStep('color');
                else { setSelectingProduct(null); refocusBarcode(); }
              }} className="px-6 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Atrás
              </button>
              <button onClick={() => {
                if (selectionStep === 'color' && selectingProduct.variants && selectingProduct.variants.length > 0) setSelectionStep('variant');
                else if (selectionStep === 'color') setSelectionStep('quantity');
                else if (selectionStep === 'variant') setSelectionStep('quantity');
                else confirmSelection();
              }}
                disabled={(selectionStep === 'color' && !selectedColor) || (selectionStep === 'variant' && !selectedVariant && selectingProduct.variants && selectingProduct.variants.length > 0) || (selectionStep === 'quantity' && currentAvailableStock === 0)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                {selectionStep === 'quantity' ? (
                  <><ShoppingCart size={18} /><span>{currentAvailableStock === 0 ? 'Agotado' : 'Añadir al Carrito'}</span></>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDiscountModal(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Aplicar Descuento</h3>
                <p className="text-xs text-gray-500 mt-0.5">Precio original: {discountModal.originalPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
              </div>
              <button onClick={() => { setDiscountModal(null); refocusBarcode(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Porcentaje de descuento (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountModal.pct}
                  onChange={(e) => setDiscountModal(d => d ? { ...d, pct: e.target.value } : null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const pct = Math.max(0, Math.min(100, Number(discountModal.pct || 0)));
                      const newPrice = discountModal.originalPrice * (1 - pct / 100);
                      updateCart(discountModal.idx, { manualPrice: Math.round(newPrice) });
                      setDiscountModal(null);
                      refocusBarcode();
                    }
                  }}
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white"
                  placeholder="0"
                />
                {discountModal.pct && (
                  <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                    Nuevo precio: {(discountModal.originalPrice * (1 - Math.max(0, Math.min(100, Number(discountModal.pct))) / 100)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setDiscountModal(null); refocusBarcode(); }} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300">Cancelar</button>
                <button
                  onClick={() => {
                    const pct = Math.max(0, Math.min(100, Number(discountModal.pct || 0)));
                    const newPrice = discountModal.originalPrice * (1 - pct / 100);
                    updateCart(discountModal.idx, { manualPrice: Math.round(newPrice) });
                    setDiscountModal(null);
                    refocusBarcode();
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-colors"
                >
                  Aplicar
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
