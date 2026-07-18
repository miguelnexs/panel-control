import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ShoppingCart, Search, Plus, Trash, RefreshCw, CheckCircle, AlertTriangle, X,
  Package, DollarSign, Calendar, ArrowLeft, Eye, Paperclip, FileText, Download,
  Layers, User, ArrowRight, UploadCloud, Info, Trash2, ArrowUpDown
} from 'lucide-react';

interface PurchaseItem {
  id?: number;
  product: number;
  product_name?: string;
  sku?: number;
  sku_code?: string;
  quantity: number;
  unit_cost: number;
}

interface PurchaseDocument {
  id: number;
  file: string;
  uploaded_at: string;
}

interface Purchase {
  id: number;
  supplier: number;
  supplier_name: string;
  date: string;
  total_amount: number | string;
  notes: string;
  created_at: string;
  items?: PurchaseItem[];
  documents?: PurchaseDocument[];
}

interface Product {
  id: number;
  name: string;
  sku: string;
  inventory_qty: number;
  skus?: any[];
}

interface Supplier {
  id: number;
  name: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface PurchasesPageProps {
  token: string;
  apiBase: string;
}

const PurchasesPage: React.FC<PurchasesPageProps> = ({ token, apiBase }) => {
  const [items, setItems] = useState<Purchase[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [formSupplier, setFormSupplier] = useState<number | ''>('');
  const [formNotes, setFormNotes] = useState('');
  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<number | null>(null);

  // Table pagination and filter states matching Products Manager
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const searchTimeout = useRef<any>(null);

  // State to filter products in search panel inside creation form
  const [productSearch, setProductSearch] = useState('');
  const [productDetailsMap, setProductDetailsMap] = useState<Record<number, { skus: any[], colors: any[], variants: any[] }>>({});
  const [resolvedProduct, setResolvedProduct] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const query = productSearch.trim();
    if (!query || query.length < 3) {
      setResolvedProduct(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsResolving(true);
      try {
        const res = await fetch(`${apiBase}/products/resolve-sku/?sku=${encodeURIComponent(query)}`, {
          headers: authHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            setResolvedProduct({
              ...data.product,
              matchedSkuCode: data.sku
            });
          } else {
            setResolvedProduct(null);
          }
        } else {
          setResolvedProduct(null);
        }
      } catch (e) {
        console.error("Error resolving SKU on input change:", e);
        setResolvedProduct(null);
      } finally {
        setIsResolving(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [productSearch, apiBase, token]);

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadPurchases = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      const res = await fetch(`${apiBase}/products/purchases/?${params.toString()}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) {
        if (data.results && Array.isArray(data.results)) {
          setItems(data.results);
          setTotal(data.count || data.results.length);
        } else if (Array.isArray(data)) {
          setItems(data);
          setTotal(data.length);
        } else {
          setItems([]);
          setTotal(0);
        }
      } else {
        throw new Error('Error al cargar compras');
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [resS, resP] = await Promise.all([
        fetch(`${apiBase}/products/suppliers/`, { headers: authHeaders(token) }),
        fetch(`${apiBase}/products/?page_size=1000`, { headers: authHeaders(token) })
      ]);
      const dataS = await resS.json();
      const dataP = await resP.json();
      if (resS.ok) setSuppliers(Array.isArray(dataS.results) ? dataS.results : (Array.isArray(dataS) ? dataS : []));
      if (resP.ok) setProducts(Array.isArray(dataP.results) ? dataP.results : (Array.isArray(dataP) ? dataP : []));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      loadPurchases();
    }
  }, [token, page, pageSize]);

  useEffect(() => {
    if (token) {
      loadDependencies();
    }
  }, [token]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setSearch(val);
    }, 500);
  };

  const filteredProductsForSearch = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return [];

    const localResults = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.sku && p.sku.length >= 3 && q.includes(p.sku.toLowerCase()))
    );

    if (resolvedProduct && !localResults.some(p => p.id === resolvedProduct.id)) {
      localResults.push(resolvedProduct);
    }

    return localResults.slice(0, 8);
  }, [products, productSearch, resolvedProduct]);

  const addToCart = async (p: Product) => {
    setLoading(true);
    setMsg(null);
    try {
      let details = productDetailsMap[p.id];
      if (!details) {
        const [skusRes, colorsRes, variantsRes] = await Promise.all([
          fetch(`${apiBase}/products/${p.id}/skus/`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/products/${p.id}/colors/`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/products/${p.id}/variants/`, { headers: authHeaders(token) })
        ]);

        if (!skusRes.ok || !colorsRes.ok || !variantsRes.ok) {
          throw new Error('No se pudieron obtener las variaciones de este producto');
        }

        const skusData = await skusRes.json();
        const colorsData = await colorsRes.json();
        const variantsData = await variantsRes.json();

        details = {
          skus: Array.isArray(skusData.results) ? skusData.results : (Array.isArray(skusData) ? skusData : []),
          colors: Array.isArray(colorsData.results) ? colorsData.results : (Array.isArray(colorsData) ? colorsData : []),
          variants: Array.isArray(variantsData.results) ? variantsData.results : (Array.isArray(variantsData) ? variantsData : [])
        };

        setProductDetailsMap(prev => ({ ...prev, [p.id]: details }));
      }

      const hasSkus = details.skus && details.skus.length > 0;

      // Auto-select SKU matching the search query or matchedSkuCode if available
      const query = productSearch.trim().toLowerCase();
      const matchedCode = (p as any).matchedSkuCode?.toLowerCase();
      let selectedSku = null;
      if (hasSkus) {
        // 1. Try exact SKU match
        selectedSku = details.skus.find(s => s.sku && (s.sku.toLowerCase() === query || s.sku.toLowerCase() === matchedCode));
        
        // 2. Try partial SKU match (SKU contains query or query contains SKU)
        if (!selectedSku) {
          selectedSku = details.skus.find(s => s.sku && (
            s.sku.toLowerCase().includes(query) || 
            (matchedCode && s.sku.toLowerCase().includes(matchedCode)) ||
            (query.length >= 3 && query.includes(s.sku.toLowerCase()))
          ));
        }

        // 3. Try matching by color/variant names in the query
        if (!selectedSku && query) {
          let bestScore = 0;
          let bestSku = null;
          for (const s of details.skus) {
            const colorObj = details.colors.find(c => String(c.id) === String(s.color));
            const variantObj = details.variants.find(v => String(v.id) === String(s.variant));
            
            const colorName = colorObj ? colorObj.name.toLowerCase() : '';
            const variantName = variantObj ? variantObj.name.toLowerCase() : '';
            
            let score = 0;
            if (colorName && (query.includes(colorName) || colorName.includes(query) || (colorName.length >= 3 && query.includes(colorName.substring(0, 3))))) {
              score += 10;
            }
            if (variantName) {
              const cleanQuery = query.replace(/[^a-z0-9]/g, ' ');
              const words = cleanQuery.split(/\s+/);
              if (words.includes(variantName) || query.endsWith(`-${variantName}`) || query.endsWith(`/${variantName}`)) {
                score += 5;
              } else if (query.includes(variantName) && variantName.length > 1) {
                score += 5;
              }
            }
            
            if (score > bestScore) {
              bestScore = score;
              bestSku = s;
            }
          }
          if (bestSku && bestScore > 0) {
            selectedSku = bestSku;
          }
        }

        // 4. Default to first SKU if no match
        if (!selectedSku) {
          selectedSku = details.skus[0];
        }
      }
      const selectedSkuId = selectedSku ? selectedSku.id : undefined;

      let skuCode = '';
      if (selectedSku) {
        const colorName = details.colors.find(c => String(c.id) === String(selectedSku.color))?.name || '';
        const variantName = details.variants.find(v => String(v.id) === String(selectedSku.variant))?.name || '';
        skuCode = [colorName, variantName].filter(Boolean).join(' / ') || selectedSku.sku || `SKU #${selectedSku.id}`;
      }

      if (hasSkus) {
        // Always add a new item for products with SKUs to allow choosing different SKUs
        setCart([...cart, {
          product: p.id,
          product_name: p.name,
          sku: selectedSkuId,
          sku_code: skuCode || undefined,
          quantity: 1,
          unit_cost: 0
        }]);
      } else {
        // Simple product: merge quantities if already in cart
        const existingIndex = cart.findIndex(c => c.product === p.id);
        if (existingIndex !== -1) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += 1;
          setCart(newCart);
        } else {
          setCart([...cart, {
            product: p.id,
            product_name: p.name,
            quantity: 1,
            unit_cost: 0
          }]);
        }
      }
      setProductSearch('');
    } catch (e: any) {
      console.error("Error al cargar variaciones del producto:", e);
      setMsg({ type: 'error', text: e.message || 'Error al obtener variaciones del producto' });
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newCart = [...cart];
    newCart[index] = { ...newCart[index], [field]: value };
    setCart(newCart);
  };

  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
  }, [cart]);

  const stats = useMemo(() => {
    const totalPurchases = items.length;
    const totalInvestment = items.reduce((acc, p) => acc + Number(p.total_amount), 0);
    const totalProducts = items.reduce((acc, p) => {
      const itemsCount = p.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return acc + itemsCount;
    }, 0);
    return { totalPurchases, totalInvestment, totalProducts };
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!formSupplier) {
      setMsg({ type: 'error', text: 'Debe seleccionar un proveedor' });
      return;
    }
    if (cart.length === 0) {
      setMsg({ type: 'error', text: 'Agregue al menos un producto a la compra' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier: formSupplier,
        notes: formNotes,
        total_amount: totalAmount,
        items: cart.map(c => ({
          product: c.product,
          sku: c.sku || null,
          quantity: c.quantity,
          unit_cost: c.unit_cost
        }))
      };

      const res = await fetch(`${apiBase}/products/purchases/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo guardar la compra');

      const purchaseId = data.id;

      if (documents.length > 0) {
        for (const file of documents) {
          const formData = new FormData();
          formData.append('file', file);
          await fetch(`${apiBase}/products/purchases/${purchaseId}/documents/`, {
            method: 'POST',
            headers: { ...authHeaders(token) },
            body: formData
          });
        }
      }

      setMsg({ type: 'success', text: 'Compra registrada exitosamente. El stock ha sido actualizado.' });
      closeForm();
      loadPurchases();
      // Reload products to get updated stock
      fetch(`${apiBase}/products/?page_size=1000`, { headers: authHeaders(token) })
        .then(r => r.json())
        .then(d => { if (d.results) setProducts(d.results); });
    } catch (e2: any) {
      setMsg({ type: 'error', text: e2.message });
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setIsCreating(false);
    setFormSupplier('');
    setFormNotes('');
    setCart([]);
    setDocuments([]);
    setProductSearch('');
  };

  const confirmDelete = async () => {
    if (deletingPurchaseId === null) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/purchases/${deletingPurchaseId}/`, {
        method: 'DELETE',
        headers: authHeaders(token)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Compra eliminada correctamente. El stock fue descontado.' });
        loadPurchases();
        // Reload products to get updated stock
        fetch(`${apiBase}/products/?page_size=1000`, { headers: authHeaders(token) })
          .then(r => r.json())
          .then(d => { if (d.results) setProducts(d.results); });
      } else {
        throw new Error('No se pudo eliminar la compra');
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
      setDeletingPurchaseId(null);
    }
  };

  // Filtered items list for the main table (combines server items with client-side filter for maximum UX speed)
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter search text
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(q)) ||
        String(p.id).includes(q) ||
        (p.items && p.items.some((it: any) => it.product_name && it.product_name.toLowerCase().includes(q)))
      );
    }

    // Filter by supplier
    if (supplierFilter !== '') {
      result = result.filter(p => p.supplier === supplierFilter);
    }

    // Sort by date
    result.sort((a, b) => {
      const valA = new Date(a.created_at || a.date).getTime();
      const valB = new Date(b.created_at || b.date).getTime();
      return dateSort === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [items, search, supplierFilter, dateSort]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  if (isCreating) {
    return (
      <div className="relative animate-fade-in h-full flex flex-col w-full pb-10">

        {/* Header de Creación */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={closeForm}
              className="p-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/30">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Registrar Compra / Recarga</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Introduce los datos de tu proveedor y añade productos para recargar stock</p>
            </div>
          </div>

          {msg && (
            <div className={`px-4 py-2 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
              }`}>
              {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
              <span className="font-semibold">{msg.text}</span>
            </div>
          )}
        </div>

        {/* Panel de Trabajo de Doble Columna */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 flex-1 items-start">

          {/* Columna Izquierda: Ajuste y Búsqueda (5/12) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Tarjeta de Proveedor y Ajustes */}
            <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <User size={16} className="text-indigo-500" />
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Origen de Compra</h4>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-semibold"
                >
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-500">Selecciona un proveedor...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notas / Referencia
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[75px]"
                  placeholder="Ej: Factura Compra #102, Guía de envío, fecha de llegada..."
                />
              </div>
            </div>

            {/* Búsqueda de Productos con Altura Fija y Contenida */}
            <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none backdrop-blur-md flex flex-col h-[400px]">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 shrink-0">
                <Package size={16} className="text-indigo-500" />
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Añadir Productos al Carrito</h4>
              </div>

              {/* Input de Búsqueda */}
              <div className="relative shrink-0 mb-4">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const query = productSearch.trim();
                      if (!query) return;

                      setLoading(true);
                      setMsg(null);
                      try {
                        const res = await fetch(`${apiBase}/products/resolve-sku/?sku=${encodeURIComponent(query)}`, {
                          headers: authHeaders(token)
                        });
                        if (!res.ok) throw new Error('No se pudo resolver el código SKU');

                        const resolveData = await res.json();
                        if (resolveData.found) {
                          const { type, product, color_id, variant_id } = resolveData;

                          // Load details (skus, colors, variants) for this product
                          const [skusRes, colorsRes, variantsRes] = await Promise.all([
                            fetch(`${apiBase}/products/${product.id}/skus/`, { headers: authHeaders(token) }),
                            fetch(`${apiBase}/products/${product.id}/colors/`, { headers: authHeaders(token) }),
                            fetch(`${apiBase}/products/${product.id}/variants/`, { headers: authHeaders(token) })
                          ]);

                          if (!skusRes.ok || !colorsRes.ok || !variantsRes.ok) {
                            throw new Error('No se pudieron obtener las variaciones de este producto');
                          }

                          const skusData = await skusRes.json();
                          const colorsData = await colorsRes.json();
                          const variantsData = await variantsRes.json();

                          const details = {
                            skus: Array.isArray(skusData.results) ? skusData.results : (Array.isArray(skusData) ? skusData : []),
                            colors: Array.isArray(colorsData.results) ? colorsData.results : (Array.isArray(colorsData) ? colorsData : []),
                            variants: Array.isArray(variantsData.results) ? variantsData.results : (Array.isArray(variantsData) ? variantsData : [])
                          };

                          setProductDetailsMap(prev => ({ ...prev, [product.id]: details }));

                          let targetSkuId = undefined;
                          let skuCode = '';

                          const hasSkus = details.skus && details.skus.length > 0;

                          if (type === 'combination' && hasSkus) {
                            const matchedSku = details.skus.find((s: any) =>
                              String(s.color) === String(color_id) &&
                              String(s.variant) === String(variant_id)
                            );
                            if (matchedSku) {
                              targetSkuId = matchedSku.id;
                              const colorName = details.colors.find((c: any) => String(c.id) === String(matchedSku.color))?.name || '';
                              const variantName = details.variants.find((v: any) => String(v.id) === String(matchedSku.variant))?.name || '';
                              skuCode = [colorName, variantName].filter(Boolean).join(' / ') || matchedSku.sku || `SKU #${matchedSku.id}`;
                            }
                          } else if (hasSkus) {
                            const selectedSku = details.skus[0];
                            targetSkuId = selectedSku ? selectedSku.id : undefined;
                            if (selectedSku) {
                              const colorName = details.colors.find((c: any) => String(c.id) === String(selectedSku.color))?.name || '';
                              const variantName = details.variants.find((v: any) => String(v.id) === String(selectedSku.variant))?.name || '';
                              skuCode = [colorName, variantName].filter(Boolean).join(' / ') || selectedSku.sku || `SKU #${selectedSku.id}`;
                            }
                          }

                          if (hasSkus) {
                            const existingIdx = cart.findIndex(c => c.product === product.id && c.sku === targetSkuId);
                            if (existingIdx !== -1) {
                              const newCart = [...cart];
                              newCart[existingIdx].quantity += 1;
                              setCart(newCart);
                            } else {
                              setCart([...cart, {
                                product: product.id,
                                product_name: product.name,
                                sku: targetSkuId,
                                sku_code: skuCode || undefined,
                                quantity: 1,
                                unit_cost: 0
                              }]);
                            }
                          } else {
                            const existingIndex = cart.findIndex(c => c.product === product.id);
                            if (existingIndex !== -1) {
                              const newCart = [...cart];
                              newCart[existingIndex].quantity += 1;
                              setCart(newCart);
                            } else {
                              setCart([...cart, {
                                product: product.id,
                                product_name: product.name,
                                quantity: 1,
                                unit_cost: 0
                              }]);
                            }
                          }

                          setProductSearch('');
                          setMsg({ type: 'success', text: `✓ ${product.name} agregado correctamente.` });
                          setTimeout(() => setMsg(null), 3000);
                        } else {
                          // Fallback local: buscar producto local cuyo SKU esté contenido en la consulta
                          const q = query.toLowerCase();
                          const localMatch = products.find(p => p.sku && p.sku.length >= 3 && q.includes(p.sku.toLowerCase()));
                          if (localMatch) {
                            await addToCart(localMatch);
                            setMsg({ type: 'success', text: `✓ ${localMatch.name} agregado.` });
                            setTimeout(() => setMsg(null), 3000);
                          } else {
                            setMsg({ type: 'error', text: `Código SKU "${query}" no encontrado.` });
                          }
                        }
                      } catch (err: any) {
                        console.error(err);
                        setMsg({ type: 'error', text: err.message || 'Error al procesar el código SKU' });
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400"
                  placeholder="Buscar por nombre o escanea SKU (Enter)..."
                />
              </div>
              {/* Lista de Resultados con Scroll Interno Controlado */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 relative">
                {productSearch ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredProductsForSearch.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="w-full px-4 py-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 cursor-pointer flex justify-between items-center text-left transition-colors group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono">SKU: {p.sku || 'N/A'}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-400">Stock: <strong className="text-gray-600 dark:text-gray-300">{p.inventory_qty}</strong></span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent transition-all shrink-0">
                          <Plus size={14} />
                        </div>
                      </button>
                    ))}
                    {isResolving && (
                      <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-indigo-500" />
                        <span>Buscando SKU en base de datos...</span>
                      </div>
                    )}
                    {!isResolving && filteredProductsForSearch.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center h-full">
                        <Package size={24} className="mb-2 opacity-25" />
                        <p>No se encontraron productos coincidentes</p>
                        <p className="text-[10px] text-gray-400 mt-1">Presiona Enter para buscar por código SKU en la base de datos.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <Search size={28} className="mb-2 opacity-20" />
                    <p className="text-xs font-semibold">Usa el buscador superior para listar productos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Adjuntar Archivos / Manifiestos */}
            <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Paperclip size={16} className="text-indigo-500" />
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Documentación Adjunta</h4>
              </div>

              <div className="border-2 border-dashed border-gray-250 dark:border-gray-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl p-5 text-center hover:bg-gray-100/50 dark:hover:bg-gray-800/10 transition-all relative">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files) {
                      setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
                <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Arrastra o selecciona tus archivos</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Formatos soportados: PDF, JPG, PNG (Max. 5MB)</p>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} className="text-indigo-500 shrink-0" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => setDocuments(docs => docs.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-500/15 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Quitar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Columna Derecha: Lista de Productos en Compra (7/12) */}
          <div className="lg:col-span-7 flex flex-col bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-none overflow-hidden backdrop-blur-md min-h-[500px]">

            {/* Header del Carrito */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/10 shrink-0">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <ShoppingCart size={18} className="text-indigo-500" />
                Detalle del Lote / Artículos
              </h3>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-[11px] font-bold">
                {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {/* Listado del Carrito */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar min-h-[300px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 max-w-sm mx-auto text-center py-20">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-800">
                    <ShoppingCart size={24} className="opacity-30" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">El lote está vacío</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Agrega mercancías desde la columna de búsqueda para reabastecer sus existencias.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 dark:border-gray-800/80 rounded-xl bg-gray-50/30 dark:bg-gray-900/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/25 transition-all shadow-sm"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.product_name}</div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Ingresa costos y unidades ingresadas</p>

                      {/* Desplegable de Variaciones (SKUs) si existen */}
                      {(() => {
                        const details = productDetailsMap[item.product];
                        const hasSkus = details && details.skus && details.skus.length > 0;
                        if (!hasSkus) return null;

                        return (
                          <div className="mt-2.5 max-w-xs animate-fade-in">
                            <label className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Color / Variante (SKU)
                            </label>
                            <select
                              value={item.sku || ''}
                              onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const chosenSku = details.skus.find(s => s.id === selectedId);
                                if (chosenSku) {
                                  const colorName = details.colors.find(c => String(c.id) === String(chosenSku.color))?.name || '';
                                  const variantName = details.variants.find(v => String(v.id) === String(chosenSku.variant))?.name || '';
                                  const newSkuCode = [colorName, variantName].filter(Boolean).join(' / ') || chosenSku.sku || `SKU #${chosenSku.id}`;

                                  const newCart = [...cart];
                                  // Merge duplicates: if another item in the cart already has this product and SKU
                                  const existingIdx = newCart.findIndex((c, i) => i !== idx && c.product === item.product && c.sku === chosenSku.id);
                                  if (existingIdx !== -1) {
                                    newCart[existingIdx].quantity += item.quantity;
                                    newCart.splice(idx, 1);
                                  } else {
                                    newCart[idx] = {
                                      ...newCart[idx],
                                      sku: chosenSku.id,
                                      sku_code: newSkuCode
                                    };
                                  }
                                  setCart(newCart);
                                }
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white shadow-sm cursor-pointer"
                            >
                              {details.skus.map((s: any) => {
                                const colorName = details.colors.find(c => String(c.id) === String(s.color))?.name || '';
                                const variantName = details.variants.find(v => String(v.id) === String(s.variant))?.name || '';
                                const skuLabel = [colorName, variantName].filter(Boolean).join(' / ') || s.sku || `SKU #${s.id}`;
                                return (
                                  <option key={s.id} value={s.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                                    {skuLabel} {s.sku ? `(${s.sku})` : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Controles numéricos y de costo */}
                    <div className="flex flex-wrap items-center gap-4 shrink-0 justify-between sm:justify-end">

                      {/* Control de Cantidad con Botones +/- */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</span>
                        <div className="flex items-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden h-[34px] shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateCartItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                            className="px-2.5 h-full text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 font-black transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItem(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-10 text-center text-xs font-semibold bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateCartItem(idx, 'quantity', item.quantity + 1)}
                            className="px-2.5 h-full text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 font-black transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Control de Costo Unitario */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costo Unit.</span>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                            <DollarSign size={12} />
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_cost}
                            onChange={(e) => updateCartItem(idx, 'unit_cost', Number(e.target.value))}
                            className="w-24 pl-6 pr-2 py-1.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white shadow-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="flex flex-col gap-1 w-20 text-right">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subtotal</span>
                        <span className="font-bold text-xs text-gray-900 dark:text-white h-[26px] flex items-center justify-end font-mono">
                          ${(item.quantity * item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Botón Borrar */}
                      <button
                        onClick={() => removeCartItem(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors mt-3"
                        title="Eliminar del lote"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pie del Carrito / Resumen de Total */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inversión Lote:</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight font-mono">
                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0 || !formSupplier}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Confirmar Lote y Stock</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 relative animate-fade-in w-full">

      {/* Mensajes Generales */}
      {msg && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border animate-fade-in ${msg.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/10'
          : 'bg-red-50 dark:bg-red-500/5 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/10'
          }`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Tarjetas de Estadísticas en Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Compras */}
        <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 flex items-center gap-4 shadow-sm dark:shadow-none backdrop-blur-md">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <ShoppingCart size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Total Lotes</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{total}</span>
          </div>
        </div>

        {/* Inversión Total */}
        <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 flex items-center gap-4 shadow-sm dark:shadow-none backdrop-blur-md">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Inversión Acumulada</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              ${stats.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Productos Ingresados */}
        <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 flex items-center gap-4 shadow-sm dark:shadow-none backdrop-blur-md">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Package size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Unidades Ingresadas</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {stats.totalProducts} <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">unids</span>
            </span>
          </div>
        </div>

      </div>

      {/* Contenedor Principal: Listado de Compras */}
      <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-none overflow-hidden backdrop-blur-md">

        {/* Cabecera del Listado / Barra de Herramientas (Estilo Productos) */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Registro de Compras y Lotes</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verifica el historial de ingresos de mercancías y proveedores</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Buscador de Compras */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por notas o proveedor..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <select
                value={supplierFilter}
                onChange={(e) => {
                  setPage(1);
                  setSupplierFilter(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer font-medium"
              >
                <option value="">Todos los proveedores</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={() => setDateSort((s) => (s === 'desc' ? 'asc' : 'desc'))}
                className={`px-3 py-2 rounded-xl transition-colors border ${dateSort === 'desc'
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                title={dateSort === 'desc' ? 'Recientes primero' : 'Antiguos primero'}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Calendar className="w-4 h-4" />
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-2">
              <button
                onClick={loadPurchases}
                className="p-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
                title="Actualizar tabla"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
              >
                <Plus size={15} />
                <span>Nueva Compra</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Fecha y Hora / ID</th>
                <th className="px-6 py-3.5">Proveedor</th>
                <th className="px-6 py-3.5 text-center">Adjuntos</th>
                <th className="px-6 py-3.5">Detalles del Lote</th>
                <th className="px-6 py-3.5 text-right">Inversión</th>
                <th className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs text-gray-700 dark:text-gray-300">
              {filteredItems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-all duration-150 group">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-0.5">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(p.created_at || p.date).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 pl-5">
                        {p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 mt-2">ID: #{p.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {p.supplier_name || `Proveedor ID ${p.supplier}`}
                      </div>
                      {p.notes && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 max-w-xs mt-1 border-l-2 border-indigo-500/20 pl-2 italic">
                          {p.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    {p.documents && p.documents.length > 0 ? (
                      <div className="inline-flex flex-col items-center justify-center px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                        <Paperclip size={12} className="mb-0.5" />
                        <span>{p.documents.length} archivo(s)</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium italic">Sin adjuntos</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 max-w-xs">
                      {p.items && p.items.length > 0 ? (
                        p.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs pb-1 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                            <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-300 truncate">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.quantity}x</span>
                              <span className="truncate" title={item.product_name}>
                                {item.product_name}
                                {item.sku_code && (
                                  <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold ml-1.5 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded-md">
                                    {item.sku_code}
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono shrink-0 ml-2">${Number(item.unit_cost).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Sin detalles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="font-bold text-gray-900 dark:text-white text-sm font-mono">
                      ${Number(p.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                      {p.items?.reduce((acc, it) => acc + it.quantity, 0) || 0} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewPurchase(p)}
                        className="p-1.5 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800 hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-800 rounded-lg transition-all"
                        title="Ver Detalles"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingPurchaseId(p.id)}
                        disabled={loading}
                        className="p-1.5 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 hover:bg-red-500/10 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 rounded-lg transition-all disabled:opacity-50"
                        title="Eliminar Compra"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-xs font-semibold">No se encontraron compras en el historial</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación - Estilo de Inventario de Productos */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Mostrando página <span className="font-semibold text-gray-900 dark:text-white">{page}</span> de <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span> — <span className="font-medium">{total} registros totales</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Siguiente
            </button>
          </div>
        </div>

      </div>

      {/* Modal de Detalles de Compra */}
      {viewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Detalles de Compra #{viewPurchase.id}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">Ingresado el {new Date(viewPurchase.created_at || viewPurchase.date).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setViewPurchase(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-xs">

              {/* Resumen */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/40">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Proveedor</p>
                  <p className="font-bold text-gray-900 dark:text-white">{viewPurchase.supplier_name || `ID: ${viewPurchase.supplier}`}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl text-right border border-gray-100 dark:border-gray-800/40">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Costo Total</p>
                  <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg font-mono">
                    ${Number(viewPurchase.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {viewPurchase.notes && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl col-span-2 border border-gray-100 dark:border-gray-800/40">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Notas / Observación</p>
                    <p className="text-gray-700 dark:text-gray-300 italic font-semibold">"{viewPurchase.notes}"</p>
                  </div>
                )}
              </div>

              {/* Lista de Items */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <ShoppingCart size={14} className="text-gray-400" />
                  Artículos Ingresados ({viewPurchase.items?.length || 0})
                </h4>

                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                  {viewPurchase.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{item.product_name}</p>
                          <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded mt-1 inline-block">SKU: {item.sku_code || 'Sin SKU'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white font-mono">${(item.quantity * item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">${Number(item.unit_cost).toLocaleString()} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentos Adjuntos */}
              {viewPurchase.documents && viewPurchase.documents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <FileText size={14} className="text-gray-400" />
                    Manifiestos y Archivos ({viewPurchase.documents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewPurchase.documents.map(doc => {
                      const parts = doc.file.split('/');
                      const filename = parts[parts.length - 1];
                      return (
                        <a
                          key={doc.id}
                          href={doc.file.startsWith('http') ? doc.file : `${apiBase}${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                              <Paperclip size={13} className="text-indigo-500" />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{filename}</span>
                          </div>
                          <Download size={13} className="text-gray-400 group-hover:text-indigo-500 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setViewPurchase(null)}
                className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Borrado */}
      {deletingPurchaseId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center text-xs">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Eliminar registro de compra?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Estás a punto de eliminar esta compra. Los productos ingresados serán descontados del stock automáticamente.
                Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingPurchaseId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-150 dark:bg-gray-800 hover:bg-gray-250 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/10 transition-all transform hover:scale-[1.02]"
                >
                  Confirmar y Descontar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
