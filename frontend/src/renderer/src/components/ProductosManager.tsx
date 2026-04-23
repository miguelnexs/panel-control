import React, { useEffect, useRef, useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  Calendar,
  ArrowUpDown,
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
  GripVertical,
  FileText
} from 'lucide-react';
import SafeImage from './SafeImage';
import { useOfflineSync } from '../hooks/useOfflineSync';
import SyncStatusBanner from './SyncStatusBanner';
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
  role?: string;
  netInfo?: { method: string; path: string; ms: number; ok: boolean } | null;
  onCreate?: () => void;
  onEdit?: (product: any) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
}

const SortableRow = ({ product, children, disabled }: { product: any, children: React.ReactNode, disabled: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: product.id, disabled });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 50 : 'auto',
      position: 'relative' as const,
    };

    return (
      <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
        <td
          className={`px-2 py-4 w-10 text-gray-400 dark:text-gray-500 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
          {...(!disabled ? { ...attributes, ...listeners } : {})}
        >
          <GripVertical className="w-5 h-5 hover:text-gray-600 dark:hover:text-gray-300" />
        </td>
        {children}
      </tr>
    );
  };

const ProductosManager: React.FC<ProductosManagerProps> = ({ token, apiBase, role, netInfo, onCreate, onEdit, canCreate, canEdit, canDelete, canReorder }) => {
  const offlineSync = useOfflineSync(token);
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [viewColors, setViewColors] = useState<any[]>([]);
  const [viewVariants, setViewVariants] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState('');
  const [variantSkuMatchByProductId, setVariantSkuMatchByProductId] = useState<Record<string, any>>({});
  const variantsByProductIdRef = useRef<Record<string, any[]>>({});
  const variantsAbortRef = useRef<AbortController | null>(null);
  const [variantsByProductId, setVariantsByProductId] = useState<Record<string, any[]>>({});
  const skuStockByProductIdRef = useRef<Record<string, number>>({});
  const skuStockAbortRef = useRef<AbortController | null>(null);
  const [skuStockByProductId, setSkuStockByProductId] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [cardFilter, setCardFilter] = useState<'all' | 'low' | 'active' | 'drafts'>('all');
  const canCreateSafe = typeof canCreate === 'boolean' ? canCreate : true;
  const canEditSafe = typeof canEdit === 'boolean' ? canEdit : true;
  const canDeleteSafe = typeof canDelete === 'boolean' ? canDelete : true;
  const canReorderSafe = typeof canReorder === 'boolean' ? canReorder : true;

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
    if (dateSort !== 'off' || !canReorderSafe) return;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updateOrder = async () => {
          try {
            const start = Math.min(oldIndex, newIndex);
            const end = Math.max(oldIndex, newIndex);
            const promises: Promise<any>[] = [];
            
            for (let i = start; i <= end; i++) {
              promises.push(
                offlineSync.queueMutation({
                  token,
                  method: 'PATCH',
                  url: `${apiBase}/products/${newItems[i].id}/`,
                  body: { position: i },
                })
              );
            }
            
            await Promise.all(promises);
            setMsg({ type: 'success', text: 'Orden actualizado correctamente' });
            setTimeout(() => setMsg(null), 3000);
          } catch (e) { 
            console.error(e); 
            setMsg({ type: 'error', text: 'Error al guardar el orden' });
          }
        };
        updateOrder();
        
        return newItems;
      });
    }
  };

  const authHeaders = (tkn: string | null): Record<string, string> => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadProducts = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (activeFilter !== 'all') params.set('active', activeFilter === 'active' ? 'true' : 'false');
      params.set('ordering', dateSort === 'desc' ? '-created_at' : 'created_at');
      
      const url = `${apiBase}/products/?${params.toString()}`;
      const data = await offlineSync.loadPaginatedData('products', url, token);
      setItems(data.items);
      setTotal(data.total);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadProducts(); }, [token, page, pageSize, search, categoryFilter, activeFilter, dateSort]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setSearch(val);
    }, 600);
  };
  
  const totalPages = React.useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await offlineSync.loadData('categories', `${apiBase}/products/categories/?page_size=100`, token);
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {}
    };
    if (token) loadCats();
  }, [token]);

  useEffect(() => {
    const q = search.trim();
    if (!token || !navigator.onLine) {
      setVariantSkuMatchByProductId({});
      return;
    }
    if (q.length < 2) {
      setVariantSkuMatchByProductId({});
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiBase}/products/skus/?page_size=50&search=${encodeURIComponent(q)}`,
          { headers: authHeaders(token) },
        );
        if (!res.ok) {
          setVariantSkuMatchByProductId({});
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);
        const lowered = q.toLowerCase();
        const matches = (Array.isArray(list) ? list : [])
          .map((s: any) => {
            const skuValue = String(s?.sku ?? '').trim();
            const productId =
              s?.product_id ??
              s?.productId ??
              s?.product ??
              s?.product?.id ??
              s?.product?.pk ??
              null;
            const colorId = s?.color_id ?? s?.colorId ?? s?.color ?? s?.color?.id ?? null;
            const variantId = s?.variant_id ?? s?.variantId ?? s?.variant ?? s?.variant?.id ?? null;
            const skuId = s?.id ?? s?.sku_id ?? s?.skuId ?? null;
            return { skuValue, productId, colorId, variantId, skuId };
          })
          .filter((x: any) => x.productId != null && x.skuValue.toLowerCase().includes(lowered));

        const byProduct: Record<string, any> = {};
        for (const m of matches) {
          const pid = String(m.productId);
          const existing = byProduct[pid];
          const isExact = m.skuValue.toLowerCase() === lowered;
          const existingIsExact = existing ? String(existing.sku || '').toLowerCase() === lowered : false;
          if (!existing || (isExact && !existingIsExact)) {
            byProduct[pid] = {
              sku: m.skuValue,
              skuId: m.skuId,
              colorId: m.colorId,
              variantId: m.variantId,
            };
          }
        }
        setVariantSkuMatchByProductId(byProduct);
      } catch (_) {
        setVariantSkuMatchByProductId({});
      }
    }, 250);
    return () => clearTimeout(id);
  }, [search, token, apiBase]);

  // The variants are now handled mostly by the backend, no need to poll network individually for every search hit here
  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const totalStockOf = (p: any) => {
    const fromSkus = skuStockByProductId[String(p?.id)];
    if (fromSkus != null) return fromSkus;
    const t = Number(p.total_stock ?? p.inventory_qty ?? 0);
    return Number.isFinite(t) ? t : 0;
  };
  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase();
    const variantHit = variantSkuMatchByProductId[String(p.id)];
    const variantNameHit = (variantsByProductId[String(p.id)] || []).some((v: any) =>
      String(v?.name || '').toLowerCase().includes(q),
    );
    const matchesSearch =
      q === '' ||
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.category_name || '').toLowerCase().includes(q) ||
      String(p.sku || '').toLowerCase().includes(q) ||
      (variantHit ? String(variantHit.sku || '').toLowerCase().includes(q) : false) ||
      variantNameHit ||
      (Array.isArray((p as any).skus)
        ? (p as any).skus.some((s: any) => String(s?.sku || '').toLowerCase().includes(q))
        : false);
    const matchesCategory = !categoryFilter || String(p.category) === String(categoryFilter) || String(p.category_name || '') === String(categoryFilter);
    const matchesActive = activeFilter === 'all' || (activeFilter === 'active' ? !!p.active : !p.active);
    const s = totalStockOf(p);
    const matchesLowStock = !lowStockOnly || s < Number(lowStockThreshold || 0);
    const matchesCardFilter =
      cardFilter === 'all' ||
      (cardFilter === 'low' && s < Number(lowStockThreshold || 0)) ||
      (cardFilter === 'active' && !!p.active) ||
      (cardFilter === 'drafts' && !!p.is_draft);
    return matchesLowStock && matchesCardFilter;
  });

  // Frontend-side pagination enforcement
  // If we have more items than the page size, slice them to only show the current page
  const displayed = filtered.length > pageSize 
    ? filtered.slice((page - 1) * pageSize, page * pageSize) 
    : filtered;

  // SKU Stock is also now sent natively from API ('total_stock')

  const statsTotal = total; // Global total from server count
  const statsLow = items.filter((p) => (p.total_stock ?? 0) < Number(lowStockThreshold || 0)).length;
  const statsActive = items.filter((p) => !!p.active).length;
  const statsDrafts = items.filter((p) => !!p.is_draft).length;

  const removeProduct = async (id: number) => {
    const product = items.find(p => p.id === id);
    if (product) setDeletingProduct(product);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setMsg(null);
    try {
      const result = await offlineSync.queueMutation({
        token,
        method: 'DELETE',
        url: `${apiBase}/products/${deletingProduct.id}/`,
        deleteLocalId: deletingProduct.id,
      });
      if (!result.ok) {
        throw new Error('No se pudo eliminar');
      }
      setMsg({ type: 'success', text: result.queued ? 'Producto eliminado localmente. Se sincronizará al reconectar.' : 'Producto eliminado correctamente' });
      setDeletingProduct(null);
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

  const StatCard = ({ label, value, icon: Icon, color, filterKey, onClick, isActive }: any) => (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 flex items-center justify-between shadow-sm transition-all group ${
        isActive
          ? 'ring-2 ring-blue-500 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10'
          : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      } ${filterKey !== 'all' ? 'cursor-pointer' : ''}`}
    >
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  const DraftBadge = () => (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase tracking-wider">
      <FileText className="w-3 h-3" />
      Borrador
    </span>
  );

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {loading && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-900 dark:text-white font-medium">Cargando inventario...</div>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <SyncStatusBanner
        isOnline={offlineSync.isOnline}
        pendingCount={offlineSync.pendingCount}
        syncing={offlineSync.syncing}
        lastError={offlineSync.lastError}
        onSync={offlineSync.syncNow}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total (Búsqueda)" 
          value={total} 
          icon={Package} 
          color={{ bg: 'bg-blue-100 dark:bg-blue-500', text: 'text-blue-600 dark:text-blue-200' }} 
          filterKey="all"
          isActive={cardFilter === 'all'}
          onClick={() => setCardFilter('all')}
        />
        <StatCard 
          label="Stock Bajo" 
          value={statsLow} 
          icon={AlertTriangle} 
          color={{ bg: 'bg-amber-100 dark:bg-amber-500', text: 'text-amber-600 dark:text-amber-200' }} 
          filterKey="low"
          isActive={cardFilter === 'low'}
          onClick={() => setCardFilter(cardFilter === 'low' ? 'all' : 'low')}
        />
        <StatCard 
          label="Activos" 
          value={statsActive} 
          icon={CheckCircle} 
          color={{ bg: 'bg-emerald-100 dark:bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-200' }} 
          filterKey="active"
          isActive={cardFilter === 'active'}
          onClick={() => setCardFilter(cardFilter === 'active' ? 'all' : 'active')}
        />
        <StatCard 
          label="Borradores" 
          value={statsDrafts} 
          icon={FileText} 
          color={{ bg: 'bg-amber-100 dark:bg-amber-500', text: 'text-amber-600 dark:text-amber-200' }} 
          filterKey="drafts"
          isActive={cardFilter === 'drafts'}
          onClick={() => setCardFilter(cardFilter === 'drafts' ? 'all' : 'drafts')}
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventario</h2>
            {netInfo && (
              <div className={`text-[11px] font-bold px-3 py-1 rounded-full border ${netInfo.ok ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20'}`}>
                {netInfo.ms}ms
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>

              <div className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500" />
                  <span>Bajo stock</span>
                </label>
                {lowStockOnly && (
                  <input 
                    type="number" 
                    min={0} 
                    value={lowStockThreshold} 
                    onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)} 
                    className="ml-2 w-12 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-center text-xs text-gray-900 dark:text-white" 
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-2">
              <button onClick={loadProducts} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDateSort((s) => (s === 'desc' ? 'asc' : 'desc'))}
                className={`p-2 rounded-lg transition-colors ${dateSort === 'desc' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title={dateSort === 'desc' ? 'Recientes primero' : 'Antiguos primero'}
              >
                <span className="sr-only">Ordenar por fecha</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </button>
              <button 
                onClick={() => { if (onCreate && canCreateSafe) onCreate(); }} 
                disabled={!canCreateSafe}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                  <th className="w-10 px-2"></th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <SortableContext 
                  items={displayed.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {displayed.map((p) => (
                    <SortableRow key={p.id} product={p} disabled={dateSort !== 'off' || !canReorderSafe}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                            <SafeImage 
                              src={mediaUrl(p.image)} 
                              alt={p.name} 
                              className="w-full h-full object-cover" 
                              fallbackIcon={<Package className="w-5 h-5 opacity-30" />}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</div>
                              {p.is_draft && <DraftBadge />}
                              {p.is_sale && p.sale_price && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 font-bold uppercase tracking-wider">
                                  Oferta
                                </span>
                              )}
                            </div>
                            {p.sku && <div className="text-xs text-gray-500">SKU: {p.sku}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.is_sale && p.sale_price ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(p.sale_price)}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">{formatCurrency(p.price)}</span>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(p.price)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {p.category_name ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-500/20">
                            {p.category_name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                            General
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${p.total_stock < lowStockThreshold ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                          {p.total_stock} u.
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${p.active ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={async () => {
                              setViewing(p);
                              try {
                                const [colorsRes, variantsRes] = await Promise.all([
                                  fetch(`${apiBase}/products/${p.id}/colors/`, { headers: authHeaders(token) }),
                                  fetch(`${apiBase}/products/${p.id}/variants/`, { headers: authHeaders(token) }),
                                ]);
                                const colorsData = await colorsRes.json().catch(() => null);
                                const colorsList = colorsData ? (Array.isArray(colorsData.results) ? colorsData.results : colorsData) : [];
                                setViewColors(Array.isArray(colorsList) ? colorsList : []);

                                const variantsData = await variantsRes.json().catch(() => null);
                                const variantsList = variantsData
                                  ? (Array.isArray(variantsData.results) ? variantsData.results : (Array.isArray(variantsData) ? variantsData : []))
                                  : [];
                                setViewVariants(Array.isArray(variantsList) ? variantsList : []);
                              } catch (_) {
                                setViewColors([]);
                                setViewVariants([]);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (!onEdit || !canEditSafe) return;
                              onEdit(p);
                            }} 
                            disabled={!canEditSafe}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { if (canDeleteSafe) removeProduct(p.id); }} 
                            disabled={!canDeleteSafe}
                            className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Mostrando página <span className="font-medium text-gray-900 dark:text-white">{page}</span> de <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detalle del Producto</h3>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Image & Status */}
                <div className="space-y-4">
                  <div className="aspect-square w-full rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                    <SafeImage 
                      src={mediaUrl(viewing.image)} 
                      alt={viewing.name} 
                      className="w-full h-full object-cover" 
                      fallbackIcon={
                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                          <Package className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-sm">Sin imagen</span>
                        </div>
                      }
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg ${viewing.active ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200'}`}>
                        {viewing.active ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stock Total</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{viewing.total_stock} u.</div>
                  </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{viewing.name}</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                        {viewing.category_name || 'Sin categoría'}
                      </span>
                      {viewing.sku && (
                        <span className="text-gray-500">SKU: {viewing.sku}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    {viewing.is_sale && viewing.sale_price ? (
                      <div className="flex flex-col">
                        <span className="text-3xl font-bold text-rose-700 dark:text-rose-300">{formatCurrency(viewing.sale_price)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{formatCurrency(viewing.price)}</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(viewing.price)}</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                      {viewing.description || 'No hay descripción disponible para este producto.'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Variantes de Color</h4>
                    </div>
                    
                    {viewColors.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {viewColors.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            <div 
                              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm" 
                              style={{ backgroundColor: c.hex }} 
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-800 border-dashed text-center">
                        Este producto no tiene variantes de color registradas.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Variantes</h4>
                    </div>

                    {viewVariants.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {viewVariants.map((v) => (
                          <div key={v.id ?? `${v.name}-${v.position ?? ''}`} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{v.name}</div>
                              {v.extra_price != null && Number(v.extra_price) > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">+{formatCurrency(v.extra_price)}</div>
                              )}
                            </div>
                            {v.extra_price != null && Number(v.extra_price) > 0 && (
                              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20 font-bold uppercase tracking-wider">
                                Extra
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-800 border-dashed text-center">
                        Este producto no tiene variantes registradas.
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 text-xs text-gray-500 dark:text-gray-600 border-t border-gray-200 dark:border-gray-800">
                    Registrado el: {new Date(viewing.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => { setViewing(null); setViewColors([]); setViewVariants([]); }} 
                className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar producto?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Estás a punto de eliminar <span className="font-bold text-gray-900 dark:text-white">{deletingProduct.name}</span>. 
                Esta acción no se puede deshacer y el producto dejará de estar disponible en la tienda.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteProduct}
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

export default ProductosManager;
