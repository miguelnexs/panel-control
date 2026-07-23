import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Package, Plus, Trash2, Search, ArrowUpRight, FileText, RefreshCw, Calendar, Tag, DollarSign, Layers } from 'lucide-react';

interface StockExitsPageProps {
  token: string | null;
  apiBase: string;
  role?: string;
  onNavigate?: (view: string) => void;
}

interface StockExitItem {
  id?: number;
  product: number;
  product_name?: string;
  sku?: number | null;
  sku_code?: string;
  quantity: number;
  unit_cost: number;
  subtotal?: number;
}

interface StockExit {
  id: number;
  reason: string;
  total_value: string;
  notes: string;
  user_username: string;
  created_at: string;
  items: StockExitItem[];
}

const REASON_MAP: Record<string, { label: string; bg: string; text: string }> = {
  damage: { label: 'Dañado / Defectuoso', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900', text: 'text-rose-600 dark:text-rose-400' },
  internal_use: { label: 'Uso Interno / Muestra', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900', text: 'text-blue-600 dark:text-blue-400' },
  loss: { label: 'Pérdida / Robo', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900', text: 'text-amber-600 dark:text-amber-400' },
  adjustment: { label: 'Ajuste de Inventario', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900', text: 'text-indigo-600 dark:text-indigo-400' },
  expired: { label: 'Vencido / Caducado', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900', text: 'text-purple-600 dark:text-purple-400' },
  other: { label: 'Otro motivo', bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', text: 'text-gray-600 dark:text-gray-400' },
};

const StockExitsPage: React.FC<StockExitsPageProps> = ({ token, apiBase: rawApiBase, role, onNavigate }) => {
  const apiBase = rawApiBase.replace(/\/$/, '');
  const [exits, setExits] = useState<StockExit[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExit, setSelectedExit] = useState<StockExit | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [reason, setReason] = useState('adjustment');
  const [notes, setNotes] = useState('');

  // Product selection inside modal
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [formItems, setFormItems] = useState<StockExitItem[]>([]);

  const authHeaders = (tkn: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
  });

  const formatCurrency = (val: number | string) => {
    return Number(val || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const loadExits = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/exits/`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        setExits(Array.isArray(data) ? data : data.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/products/`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadExits();
    loadProducts();
  }, [token]);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const cost = unitCost || Number(selectedProduct.cost_price || selectedProduct.price || 0);
    const newItem: StockExitItem = {
      product: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: Math.max(1, quantity),
      unit_cost: cost,
      subtotal: cost * Math.max(1, quantity),
    };
    setFormItems((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setQuantity(1);
    setUnitCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      setMsg({ type: 'error', text: 'Agrega al menos un producto a la salida.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/products/exits/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          reason,
          notes,
          items: formItems.map((it) => ({
            product: it.product,
            quantity: it.quantity,
            unit_cost: it.unit_cost,
          })),
        }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Salida de inventario registrada con éxito' });
        setShowModal(false);
        setFormItems([]);
        setNotes('');
        setReason('adjustment');
        loadExits();
      } else {
        const errData = await res.json().catch(() => null);
        setMsg({ type: 'error', text: errData?.detail || 'Error al guardar salida' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExit = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/products/exits/${id}/`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      if (res.ok || res.status === 404) {
        setMsg({ type: 'success', text: 'Registro de salida eliminado' });
        setDeletingId(null);
        setSelectedExit(null);
        loadExits();
      } else {
        setMsg({ type: 'error', text: 'Error al eliminar el registro' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const filteredExits = useMemo(() => {
    return exits.filter((x) => {
      const matchesReason = !reasonFilter || x.reason === reasonFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        String(x.id).includes(term) ||
        (x.user_username || '').toLowerCase().includes(term) ||
        (x.notes || '').toLowerCase().includes(term) ||
        x.items.some((i) => (i.product_name || '').toLowerCase().includes(term));
      return matchesReason && matchesSearch;
    });
  }, [exits, search, reasonFilter]);

  const totalValueSum = useMemo(() => {
    return exits.reduce((acc, x) => acc + Number(x.total_value || 0), 0);
  }, [exits]);

  const totalItemsSum = useMemo(() => {
    return exits.reduce((acc, x) => acc + x.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0), 0);
  }, [exits]);

  return (
    <div className="space-y-8 pb-10">
      {msg && (
        <div className={`p-4 md:p-5 rounded-2xl text-sm flex items-center gap-3.5 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          {msg.text}
        </div>
      )}

      {/* Inventory Navigation Sub-Links Bar */}
      {onNavigate && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200/80 dark:border-gray-800">
          <button
            onClick={() => onNavigate('productos')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-indigo-500" />
            <span>Productos</span>
          </button>
          <button
            onClick={() => onNavigate('categorias')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-violet-500" />
            <span>Categorías</span>
          </button>
          <button
            onClick={() => onNavigate('compras')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-teal-500" />
            <span>Compras / Entradas</span>
          </button>
          <button
            onClick={() => onNavigate('inventario_salidas')}
            className="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-2 shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
            <span>Salidas</span>
          </button>
          <button
            onClick={() => onNavigate('proveedores')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Proveedores</span>
          </button>
        </div>
      )}

      {/* Main Header Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-7 border-b border-gray-200/80 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/10">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Salidas de Inventario</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Control contable de retiros, mermas y ajustes de stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadExits}
              className="px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-2xl transition-all flex items-center gap-2 shadow-sm"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>

            <button
              onClick={() => {
                setShowModal(true);
                setFormItems([]);
              }}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Salida</span>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-100 dark:border-amber-900/40 flex flex-col justify-between min-h-[120px]">
              <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Registros</span>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{exits.length}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">Salidas contabilizadas</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/60 to-red-50/30 dark:from-rose-950/20 dark:to-red-950/10 border border-rose-100 dark:border-rose-900/40 flex flex-col justify-between min-h-[120px]">
              <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Costo Total de Salidas</span>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{formatCurrency(totalValueSum)}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">Valorizado en precio de costo</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between min-h-[120px]">
              <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Unidades Retiradas</span>
              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{totalItemsSum}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">Artículos dados de baja</p>
              </div>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuario, nota o producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                <option value="">Todos los motivos</option>
                {Object.entries(REASON_MAP).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            {/* List Table */}
            {filteredExits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4"># Reg.</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Motivo</th>
                      <th className="py-3 px-4">Nota / Observación</th>
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Artículos</th>
                      <th className="py-3 px-4 text-right">Valor Total</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                    {filteredExits.map((x) => {
                      const rInfo = REASON_MAP[x.reason] || REASON_MAP.other;
                      const dateStr = x.created_at ? new Date(x.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—';

                      return (
                        <tr key={x.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">#SAL-{x.id}</td>
                          <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">{dateStr}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${rInfo.bg} ${rInfo.text}`}>
                              {rInfo.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium max-w-[220px]" title={x.notes || 'Sin nota'}>
                            {x.notes ? (
                              <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs border border-amber-200/60 dark:border-amber-800/40 font-medium">
                                <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="truncate max-w-[170px]">{x.notes}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Sin nota registrada</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{x.user_username || 'Sistema'}</td>
                          <td className="py-4 px-4 font-medium text-gray-600 dark:text-gray-300">
                            {x.items.length} productos ({x.items.reduce((s, i) => s + i.quantity, 0)} un.)
                          </td>
                          <td className="py-4 px-4 text-right font-black text-gray-900 dark:text-white text-sm">
                            {formatCurrency(x.total_value)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedExit(x)}
                                className="p-2 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors"
                                title="Ver Detalle"
                              >
                                <FileText size={16} />
                              </button>
                              <button
                                onClick={() => setDeletingId(x.id)}
                                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors"
                                title="Eliminar Registro"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Package className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No se encontraron registros de salida</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Registrar Salida */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Registrar Salida de Inventario</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveExit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Motivo de Salida</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white"
                  >
                    {Object.entries(REASON_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nota / Orden de Salida</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Orden #1042 - Merma por daño en despacho, muestras a clientes, baja..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Add Box */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 space-y-3">
                <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Agregar Producto a la Salida</p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const p = products.find((x) => x.id === Number(e.target.value));
                        setSelectedProduct(p || null);
                        if (p) setUnitCost(Number(p.cost_price || p.price || 0));
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white"
                    >
                      <option value="">Selecciona producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku || 'Sin SKU'}) — Stock: {p.total_stock || p.inventory_qty || 0}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedProduct}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl transition-all"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Productos en esta Salida ({formItems.length})</p>
                {formItems.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {formItems.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 text-xs">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{it.product_name}</p>
                          <p className="text-[10px] text-gray-500">{it.quantity} un. x {formatCurrency(it.unit_cost)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900 dark:text-white">{formatCurrency(it.subtotal || 0)}</span>
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700 font-bold">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">No has agregado ningún producto aún</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || formItems.length === 0}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-amber-600/20"
                >
                  {saving ? 'Guardando...' : 'Confirmar Salida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Salida */}
      {selectedExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Detalle de Salida #SAL-{selectedExit.id}</h3>
              <button onClick={() => setSelectedExit(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800 p-3.5 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Motivo</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{REASON_MAP[selectedExit.reason]?.label || selectedExit.reason}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Usuario</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedExit.user_username || 'Sistema'}</p>
                </div>
              </div>

              {selectedExit.notes && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Notas</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">{selectedExit.notes}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Desglose de Artículos</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedExit.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{it.product_name}</p>
                        <p className="text-[10px] text-gray-500">{it.quantity} unidades x {formatCurrency(it.unit_cost)}</p>
                      </div>
                      <p className="font-black text-gray-900 dark:text-white">{formatCurrency(it.subtotal || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm font-black">
                <span>Costo Total:</span>
                <span className="text-amber-600 dark:text-amber-400">{formatCurrency(selectedExit.total_value)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedExit(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">¿Eliminar registro #SAL-{deletingId}?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Esta acción restaurará el stock de los productos retirados en este registro.</p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteExit(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockExitsPage;
