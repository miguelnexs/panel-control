import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, Search, Plus, Trash, RefreshCw, CheckCircle, AlertTriangle, X, Package, DollarSign, Calendar, ArrowLeft, Eye, Paperclip, FileText, Download
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
  const [productSearch, setProductSearch] = useState('');

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadPurchases = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/purchases/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) {
        setItems(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []));
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
      loadDependencies();
    }
  }, [token]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(productSearch.toLowerCase())) || 
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    ).slice(0, 10);
  }, [products, productSearch]);

  const addToCart = (p: Product) => {
    const existing = cart.find(c => c.product === p.id);
    if (existing) {
      setCart(cart.map(c => c.product === p.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { product: p.id, product_name: p.name, quantity: 1, unit_cost: 0 }]);
    }
    setProductSearch('');
  };

  const updateCartItem = (index: number, field: keyof PurchaseItem, value: number) => {
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
        setMsg({ type: 'success', text: 'Compra eliminada. El stock fue descontado.' });
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

  if (isCreating) {
    return (
      <div className="relative animate-in fade-in duration-300 h-full flex flex-col">
        <div className="bg-white dark:bg-transparent flex flex-col h-full min-h-[calc(100vh-100px)]">
          
          <div className="pb-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:justify-between md:items-center shrink-0 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={closeForm} 
                className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hidden sm:block">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Registrar Compra</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ingresa productos al inventario desde tu proveedor</p>
              </div>
            </div>
            {msg && (
              <div className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                <span className="font-medium">{msg.text}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row pt-6 gap-6">
            {/* Left Col: Setup & Product Search */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Proveedor <span className="text-rose-500">*</span></label>
                <select
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(Number(e.target.value))}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-medium"
                >
                  <option value="" className="bg-white dark:bg-[#0B0D14] text-gray-900 dark:text-white">Selecciona un proveedor...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-[#0B0D14] text-gray-900 dark:text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Buscar Productos</label>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={productSearch} 
                    onChange={(e) => setProductSearch(e.target.value)} 
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Escribe el nombre o SKU..."
                  />
                </div>
                
                <div className="mt-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl custom-scrollbar relative">
                  {productSearch ? (
                    <div className="divide-y divide-gray-200 dark:divide-white/10">
                      {filteredProducts.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => addToCart(p)}
                          className="px-5 py-4 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer flex justify-between items-center transition-colors group"
                        >
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stock actual: <span className="font-bold text-gray-700 dark:text-gray-300">{p.inventory_qty}</span></div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                            <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                          </div>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
                          <Package className="w-8 h-8 mb-3 opacity-20" />
                          <p>No se encontraron productos con ese término</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500">
                      <Search className="w-10 h-10 mb-4 opacity-20" />
                      <p className="text-sm font-medium">Busca productos para agregarlos a la compra</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Notas Adicionales</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Factura #, número de guía, detalles de entrega..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Documentos / Manifiestos</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-2xl p-6 text-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative">
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
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Haz clic o arrastra tus archivos aquí</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOCX</p>
                </div>
                
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#0B0D14] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{doc.name}</span>
                        </div>
                        <button 
                          onClick={() => setDocuments(docs => docs.filter((_, i) => i !== idx))}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Cart */}
            <div className="w-full lg:w-2/3 flex flex-col bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-200 dark:border-white/5 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-500" />
                  Lista de Compra
                </h3>
                <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                  {cart.length} {cart.length === 1 ? 'Producto' : 'Productos'}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center max-w-sm mx-auto">
                    <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                      <ShoppingCart className="w-12 h-12 opacity-40" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Tu lista está vacía</h4>
                    <p className="text-sm">Agrega productos desde el buscador de la izquierda para comenzar a armar tu compra de inventario.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors shadow-sm">
                        <div className="flex-1">
                          <div className="font-bold text-base text-gray-900 dark:text-white">{item.product_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresa la cantidad y costo unitario</div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</label>
                            <input 
                              type="number" 
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(idx, 'quantity', Number(e.target.value))}
                              className="w-24 px-3 py-2.5 bg-gray-50 dark:bg-[#0B0D14] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costo Unit.</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input 
                                type="number" 
                                min="0"
                                step="0.01"
                                value={item.unit_cost}
                                onChange={(e) => updateCartItem(idx, 'unit_cost', Number(e.target.value))}
                                className="w-32 pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-[#0B0D14] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="w-28 text-right flex flex-col justify-end h-full">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Subtotal</label>
                            <span className="font-black text-gray-900 dark:text-white text-base">
                              ${(item.quantity * item.unit_cost).toLocaleString()}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => removeCartItem(idx)}
                            className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors mt-6"
                            title="Quitar producto"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 md:p-8 border-t border-gray-200 dark:border-white/5 shrink-0 bg-white/50 dark:bg-transparent">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Compra</span>
                    <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || cart.length === 0 || !formSupplier}
                    className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-base font-black shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirmar Compra</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-1">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Total Compras</span>
          </div>
          <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalPurchases}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-1">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Inversión Total</span>
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${stats.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Productos Ingresados</span>
          </div>
          <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalProducts} <span className="text-lg text-gray-400 font-medium">unidades</span></span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compras y Recargas de Stock</h2>
              <p className="text-xs text-gray-500">Registra el ingreso de mercancía de proveedores</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-2">
            <button onClick={loadPurchases} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Compra</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha y Hora / ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Documentos</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalles de Ingreso</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Costo Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(p.created_at || p.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {p.created_at ? new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">ID: #{p.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {p.supplier_name || `Proveedor ID ${p.supplier}`}
                      </div>
                      {p.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 italic">
                          "{p.notes}"
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    {p.documents && p.documents.length > 0 ? (
                      <div className="inline-flex flex-col items-center justify-center p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                        <Paperclip className="w-5 h-5 text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{p.documents.length} Archivo(s)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-600 font-medium italic">Sin adjuntos</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 max-w-sm">
                      {p.items && p.items.length > 0 ? (
                        p.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 last:border-0 pb-1 last:pb-0">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.quantity}x</span>
                              <span className="truncate" title={item.product_name}>{item.product_name}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">${Number(item.unit_cost).toLocaleString()} c/u</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Sin detalles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="font-black text-gray-900 dark:text-white text-lg">
                      ${Number(p.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.items?.reduce((acc, it) => acc + it.quantity, 0) || 0} artículos
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setViewPurchase(p)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingPurchaseId(p.id)}
                        disabled={loading}
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar Compra"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                      <p>No hay compras registradas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* View Modal */}
      {viewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0D14] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Detalles de Compra #{viewPurchase.id}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Registrada el {new Date(viewPurchase.created_at || viewPurchase.date).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewPurchase(null)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Proveedor</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewPurchase.supplier_name || `ID: ${viewPurchase.supplier}`}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Costo Total</p>
                  <p className="font-black text-indigo-600 dark:text-indigo-400 text-xl">${Number(viewPurchase.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                {viewPurchase.notes && (
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Notas / Referencia</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{viewPurchase.notes}"</p>
                  </div>
                )}
              </div>

              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                Artículos Ingresados ({viewPurchase.items?.length || 0})
              </h4>
              
              <div className="space-y-3">
                {viewPurchase.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.sku_code || 'Sin SKU'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">${(item.quantity * item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">${Number(item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })} c/u</p>
                    </div>
                  </div>
                ))}
              </div>

              {viewPurchase.documents && viewPurchase.documents.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Documentos Adjuntos ({viewPurchase.documents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewPurchase.documents.map(doc => {
                      // Extract filename from URL
                      const parts = doc.file.split('/');
                      const filename = parts[parts.length - 1];
                      return (
                        <a 
                          key={doc.id} 
                          href={doc.file.startsWith('http') ? doc.file : `${apiBase}${doc.file}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white dark:bg-[#0B0D14] rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                              <Paperclip className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{filename}</span>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setViewPurchase(null)} 
                className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPurchaseId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar compra?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Estás a punto de eliminar esta compra. Los productos ingresados serán descontados del stock automáticamente.
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingPurchaseId(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-900/20 transition-all transform hover:scale-[1.02]"
                >
                  Eliminar ahora
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
