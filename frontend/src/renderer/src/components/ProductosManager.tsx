import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  Layers,
  Palette,
  X,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductosManagerProps {
  token: string | null;
  apiBase: string;
  onCreate?: () => void;
  onEdit?: (product: any) => void;
}

const SortableRow = ({ product, children }: { product: any, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-800/30 transition-colors group">
      <td className="px-2 py-4 w-10 text-gray-500 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5 hover:text-gray-300" />
      </td>
      {children}
    </tr>
  );
};

const ProductosManager: React.FC<ProductosManagerProps> = ({ token, apiBase, onCreate, onEdit }) => {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [viewColors, setViewColors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // Here you would typically save the new order to the backend
    }
  };

  const authHeaders = (tkn: string | null): Record<string, string> => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadProducts = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar productos');
      setItems(data);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadProducts(); }, [token]);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await fetch(`${apiBase}/products/categories/?page_size=100`, { headers: authHeaders(token) });
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        setCategories(results);
      } catch (e) {}
    };
    if (token) loadCats();
  }, [token]);

  
  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const totalStockOf = (p: any) => {
    const t = Number(p.total_stock ?? p.inventory_qty ?? 0);
    return Number.isFinite(t) ? t : 0;
  };
  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q === '' || String(p.name || '').toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || String(p.category) === String(categoryFilter) || String(p.category_name || '') === String(categoryFilter);
    const matchesActive = activeFilter === 'all' || (activeFilter === 'active' ? !!p.active : !p.active);
    const s = totalStockOf(p);
    const matchesLowStock = !lowStockOnly || s < Number(lowStockThreshold || 0);
    return matchesSearch && matchesCategory && matchesActive && matchesLowStock;
  });
  const statsTotal = items.length;
  const statsLow = items.filter((p) => totalStockOf(p) < Number(lowStockThreshold || 0)).length;
  const statsActive = items.filter((p) => !!p.active).length;
  const statsInactive = items.filter((p) => !p.active).length;

  const removeProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/products/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'No se pudo eliminar');
      }
      setMsg({ type: 'success', text: 'Producto eliminado correctamente' });
      loadProducts();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const mediaUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
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
      {loading && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-white font-medium">Cargando inventario...</div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Productos" 
          value={statsTotal} 
          icon={Package} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          label="Stock Bajo" 
          value={statsLow} 
          icon={AlertTriangle} 
          color={{ bg: 'bg-amber-500', text: 'text-amber-500' }} 
        />
        <StatCard 
          label="Activos" 
          value={statsActive} 
          icon={CheckCircle} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
        />
        <StatCard 
          label="Inactivos" 
          value={statsInactive} 
          icon={XCircle} 
          color={{ bg: 'bg-rose-500', text: 'text-rose-500' }} 
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Package className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Inventario</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>

              <div className="flex items-center px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500" />
                  <span>Bajo stock</span>
                </label>
                {lowStockOnly && (
                  <input 
                    type="number" 
                    min={0} 
                    value={lowStockThreshold} 
                    onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)} 
                    className="ml-2 w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-center text-xs text-white" 
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-2 ml-2">
              <button onClick={loadProducts} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { if (onCreate) onCreate(); }} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/30">
                  <th className="w-10 px-2"></th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <SortableContext 
                  items={filtered.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filtered.map((p) => (
                    <SortableRow key={p.id} product={p}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{p.name}</div>
                            {p.sku && <div className="text-xs text-gray-500">SKU: {p.sku}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-200">{formatCurrency(p.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-400 border border-gray-700">
                          {p.category_name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${totalStockOf(p) < lowStockThreshold ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {totalStockOf(p)} u.
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${p.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={async () => { setViewing(p); try { const res = await fetch(`${apiBase}/products/${p.id}/colors/`, { headers: authHeaders(token) }); const data = await res.json(); const list = Array.isArray(data.results) ? data.results : data; setViewColors(Array.isArray(list) ? list : []); } catch (_) { setViewColors([]); } }}
                            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { if (onEdit) onEdit(p); }} 
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeProduct(p.id)} 
                            className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </SortableRow>
                  ))}
                </SortableContext>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 mb-3 opacity-20" />
                        <p>No se encontraron productos</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DndContext>
      </div>

      {/* Product Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Detalle del Producto</h3>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Image & Status */}
                <div className="space-y-4">
                  <div className="aspect-square w-full rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden relative">
                    {viewing.image ? (
                      <img src={mediaUrl(viewing.image)} alt={viewing.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                        <Package className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg ${viewing.active ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-gray-200'}`}>
                        {viewing.active ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Stock Total</div>
                    <div className="text-2xl font-bold text-white">{viewing.inventory_qty} u.</div>
                  </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{viewing.name}</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {viewing.category_name || 'Sin categoría'}
                      </span>
                      {viewing.sku && (
                        <span className="text-gray-500">SKU: {viewing.sku}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <span className="text-3xl font-bold text-emerald-400">{formatCurrency(viewing.price)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Descripción</h4>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap bg-gray-800/30 p-4 rounded-xl border border-gray-800">
                      {viewing.description || 'No hay descripción disponible para este producto.'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-medium text-gray-300">Variantes de Color</h4>
                    </div>
                    
                    {viewColors.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {viewColors.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors">
                            <div 
                              className="w-8 h-8 rounded-full border border-gray-600 shadow-sm" 
                              style={{ backgroundColor: c.hex }} 
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{c.name}</div>
                              <div className="text-xs text-gray-400">Stock: {c.stock}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-800/30 p-3 rounded-lg border border-gray-800 border-dashed text-center">
                        Este producto no tiene variantes de color registradas.
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 text-xs text-gray-600 border-t border-gray-800">
                    Registrado el: {new Date(viewing.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setViewing(null)} 
                className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosManager;
