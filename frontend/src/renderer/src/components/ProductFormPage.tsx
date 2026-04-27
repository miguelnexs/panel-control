import React, { useEffect, useState, useRef } from 'react';
import SafeImage from './SafeImage';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Tag, 
  DollarSign, 
  Percent,
  FileText, 
  Image as ImageIcon, 
  Layers, 
  Palette, 
  Plus, 
  Trash2, 
  Upload, 
  X,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Crop,
  GripVertical,
  CloudOff,
  Sparkles,
  Loader2,
  MessageSquare
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageCropper from './ui/ImageCropper';

const SortableImage = ({ id, src, onRemove, onCrop, isMain = false }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: String(id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 border-2 overflow-hidden group transition-all ${
        isDragging ? 'opacity-50 scale-105 border-blue-500 shadow-2xl z-[100]' : 
        isMain ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <SafeImage src={src} alt="Product" className="w-full h-full object-cover select-none pointer-events-none" />
      
      {/* Drag Handle Overlay - Captures the drag action */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
      />
      
      {/* Visual Drag Handle Icon */}
      <div className="absolute top-1.5 left-1.5 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200 dark:border-gray-700 z-20 pointer-events-none">
        <GripVertical className="w-3.5 h-3.5 text-gray-500" />
      </div>

      {isMain && (
        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-md uppercase tracking-widest shadow-lg z-20 pointer-events-none">Principal</div>
      )}

      {/* Actions Overlay - Only active on hover, pointer-events-none by default */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-30 pointer-events-none">
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onCrop(); }}
          className="p-2 bg-white text-gray-900 rounded-lg hover:bg-blue-50 transition-colors shadow-lg active:scale-95 pointer-events-auto"
          title="Recortar"
        >
          <Crop className="w-4 h-4" />
        </button>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg active:scale-95 pointer-events-auto"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ProductFormPageProps {
  token: string | null;
  apiBase: string;
  product?: any;
  onCancel?: () => void;
  onSaved?: () => void;
}

interface Color {
  id?: number;
  clientId?: string;
  name: string;
  hex: string;
  position?: number;
  images?: any[];
}

interface Variant {
  id?: number;
  clientId?: string;
  name: string;
  extra_price: string | number;
  position?: number;
}

interface Feature {
  id?: number;
  name: string;
  position?: number;
}

const ProductFormPage: React.FC<ProductFormPageProps> = ({ token, apiBase, product, onCancel, onSaved }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [isSale, setIsSale] = useState(false);
  const [offerMode, setOfferMode] = useState<'percent' | 'price'>('percent');
  const [offerPercent, setOfferPercent] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [sku, setSku] = useState(product?.sku || '');
  const [inventoryQty, setInventoryQty] = useState<string>(product?.inventory_qty != null ? String(product.inventory_qty) : '0');
  const [aiNotes, setAiNotes] = useState<string>('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showMagicSuccess, setShowMagicSuccess] = useState(false);
  const [loadingType, setLoadingType] = useState<'ai' | 'save'>('ai');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Unified Images State
  const [productImages, setProductImages] = useState<any[]>([]);
  
  const [colors, setColors] = useState<Color[]>([]);
  const [initialColors, setInitialColors] = useState<Color[]>([]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [showAddColor, setShowAddColor] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState<string | null>(null);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [initialVariants, setInitialVariants] = useState<Variant[]>([]);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('0');
  const [variantColorLinks, setVariantColorLinks] = useState<Record<string, string[] | null>>({});
  const [openVariantLinkKey, setOpenVariantLinkKey] = useState<string | null>(null);

  const [features, setFeatures] = useState<Feature[]>([]);
  const [initialFeatures, setInitialFeatures] = useState<Feature[]>([]);
  const [featureName, setFeatureName] = useState('');
  const [colorInputError, setColorInputError] = useState('');

  const [skus, setSkus] = useState<any[]>([]);
  const [initialSkus, setInitialSkus] = useState<any[]>([]);
  const [autoGenerateSkus, setAutoGenerateSkus] = useState(true);

  // Cropper State
  const [croppingImage, setCroppingImage] = useState<{ src: string, index: number, type: 'main' | 'gallery' | 'new' } | null>(null);

  const [activeTab, setActiveTab] = useState('detalles');
  const [loading, setLoading] = useState(false);
  const skuCheckTimeout = useRef<any>(null);
  const [highlightSkuKey, setHighlightSkuKey] = useState<string | null>(null);
  const [hasAppliedFocusSku, setHasAppliedFocusSku] = useState(false);
  const [highlightVariantKey, setHighlightVariantKey] = useState<string | null>(null);
  const [hasAppliedFocusVariant, setHasAppliedFocusVariant] = useState(false);

  // Offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const focusSku = (product as any)?.__focusSku;
    const focusVariant = (product as any)?.__focusVariantName;
    setHasAppliedFocusSku(false);
    setHighlightSkuKey(null);
    setHasAppliedFocusVariant(false);
    setHighlightVariantKey(null);
    if (focusSku || focusVariant) setActiveTab('variantes');
  }, [product?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sections status for sidebar
  const sections = [
    { id: 'detalles', name: 'Información General', icon: Package, isComplete: name.trim() !== '' && price !== '' && categoryId !== '' },
    { id: 'imagenes', name: 'Imágenes', icon: ImageIcon, isComplete: productImages.length > 0 },
    { id: 'variantes', name: 'Variantes', icon: Layers, isComplete: colors.length > 0 || variants.length > 0 },
    { id: 'caracteristicas', name: 'Características', icon: CheckCircle2, isComplete: features.length > 0 },
  ];

  const authHeaders = (tkn: string | null): Record<string, string> => ({ 
    'Accept': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) 
  });

  const makeClientId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const colorKeyOf = (c: any, idx: number) => String(c?.clientId ?? c?.id ?? idx);
  const variantKeyOf = (v: any, idx: number) => String(v?.clientId ?? v?.id ?? idx);
  const variantLinksStorageKey = `productForm.variantColorLinks.${String((product as any)?.id ?? 'new')}`;

  useEffect(() => {
    if (!activeColorKey) return;
    const exists = colors.some((c, idx) => colorKeyOf(c, idx) === activeColorKey);
    if (!exists) setActiveColorKey(null);
  }, [colors, activeColorKey]);

  useEffect(() => {
    setOpenVariantLinkKey(null);
    try {
      const raw = localStorage.getItem(variantLinksStorageKey);
      if (!raw) { setVariantColorLinks({}); return; }
      const parsed = JSON.parse(raw);
      setVariantColorLinks(parsed && typeof parsed === 'object' ? parsed : {});
    } catch (_) {
      setVariantColorLinks({});
    }
  }, [variantLinksStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(variantLinksStorageKey, JSON.stringify(variantColorLinks || {}));
    } catch (_) {}
  }, [variantColorLinks, variantLinksStorageKey]);

  useEffect(() => {
    const validVariantKeys = new Set(variants.map((v, idx) => variantKeyOf(v, idx)));
    setVariantColorLinks((prev) => {
      const next: Record<string, string[] | null> = {};
      for (const k of Object.keys(prev || {})) {
        if (validVariantKeys.has(k)) next[k] = prev[k];
      }
      return next;
    });
    setOpenVariantLinkKey((prev) => (prev && validVariantKeys.has(prev) ? prev : null));
  }, [variants]);

  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };
  const normalizePrice = (v: any) => {
    if (v === '' || v == null) return '';
    let s = String(v).replace(/[^0-9.,]/g, '');
    
    // Si tiene puntos y comas, el punto es miles y la coma es decimal
    if (s.includes('.') && s.includes(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.includes(',')) {
      // Solo coma: tratamos como decimal
      s = s.replace(',', '.');
    } else if (s.includes('.')) {
      // Si solo tiene punto, puede ser decimal o miles. 
      // En COP usualmente el punto es miles si hay 3 decimales después (ej: 1.500)
      // Pero para ser seguros, si no hay decimales (es un entero), eliminamos el punto.
      const parts = s.split('.');
      if (parts[parts.length - 1].length === 3) {
        s = s.replace(/\./g, '');
      }
    }
    
    // Limpieza final: si quedaron múltiples puntos, solo el último es decimal
    const parts = s.split('.');
    if (parts.length > 2) {
      s = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }
    
    // Limitar a 2 decimales
    const finalParts = s.split('.');
    if (finalParts.length > 1) {
      return finalParts[0] + '.' + finalParts[1].slice(0, 2);
    }
    return s || '0';
  };
  const normalizePercent = (v: any) => {
    const s = String(v).replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = s.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]) parts[1] = parts[1].slice(0, 2);
    return parts.join('.');
  };
  const computeSaleFromPercent = (basePrice: number, percent: number) => {
    const p = Math.max(0, Math.min(100, percent));
    const discounted = basePrice * (1 - p / 100);
    const rounded = Math.round(discounted * 100) / 100;
    return rounded.toFixed(2);
  };

  const mediaUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const UploadBox = ({ multiple = false, accept = 'image/*', onFiles }: { multiple?: boolean, accept?: string, onFiles: (files: File[]) => void }) => {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleClick = () => { if (inputRef.current) inputRef.current.click(); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (onFiles) onFiles(files);
    };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (onFiles) onFiles(files);
    };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDrag(true); };
    const handleDragLeave = () => { setDrag(false); };
    return (
      <div
        className={`w-full rounded-xl border-2 border-dashed ${drag ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'} p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500/50 hover:bg-gray-100 dark:hover:bg-gray-800`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="p-4 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Haz clic o arrastra imágenes aquí</div>
            <div className="text-xs text-gray-500 mt-1">Soporta JPG, PNG, WEBP</div>
          </div>
        </div>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      </div>
    );
  };

  useEffect(() => {
    const loadCats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/products/categories/?page_size=100`, { headers: authHeaders(token) });
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        setCategories(results);
        if (results.length > 0) {
          setCategoryId(prev => (prev ? prev : String(results[0].id)));
        }
      } catch (e) {}
      finally { setLoading(false); }
    };
    if (token) loadCats();
  }, [token]);

  useEffect(() => {
    if (autoGenerateSkus) {
      const newSkus: any[] = [];
      const baseSku = String(sku || '').toUpperCase();
      const defaultSkuFor = (colorName: string | null, variantName: string | null) => {
        if (colorName && variantName) return `${baseSku}-${colorName.substring(0,2)}-${variantName.substring(0,2)}`.toUpperCase();
        if (colorName) return `${baseSku}-${colorName.substring(0,3)}`.toUpperCase();
        if (variantName) return `${baseSku}-${variantName.substring(0,3)}`.toUpperCase();
        return baseSku;
      };
      const findExisting = (color: any | null, variant: any | null) => {
        const colorId = color?.id != null ? Number(color.id) : null;
        const variantId = variant?.id != null ? Number(variant.id) : null;
        if (colorId != null || variantId != null) {
          const byId = skus.find((s: any) => {
            const sc = s?.colorId != null ? Number(s.colorId) : null;
            const sv = s?.variantId != null ? Number(s.variantId) : null;
            return sc === colorId && sv === variantId;
          });
          if (byId) return byId;
        }
        const ccid = color?.clientId ?? null;
        const vcid = variant?.clientId ?? null;
        if (ccid != null || vcid != null) {
          const byClientId = skus.find((s: any) => {
            const sc = s?.colorClientId ?? null;
            const sv = s?.variantClientId ?? null;
            return sc === ccid && sv === vcid;
          });
          if (byClientId) return byClientId;
        }
        const cn = color?.name ?? null;
        const vn = variant?.name ?? null;
        return skus.find((s: any) => (s?.colorName ?? null) === cn && (s?.variantName ?? null) === vn);
      };
      
      // Caso 1: Hay colores y variantes
      if (colors.length > 0 && variants.length > 0) {
        variants.forEach((variant, vIdx) => {
          const vKey = variantKeyOf(variant, vIdx);
          const linked = variantColorLinks?.[vKey];
          const allowedColors =
            linked == null
              ? colors
              : colors.filter((c, cIdx) => linked.includes(colorKeyOf(c, cIdx)));

          if (Array.isArray(linked) && allowedColors.length === 0) {
            const existing = findExisting(null, variant);
            const existingUseMainSku =
              existing?.useMainSku ?? (existing != null && String(existing?.sku ?? '') === '');
            newSkus.push({
              id: existing?.id || null,
              colorId: null,
              colorClientId: null,
              variantId: variant.id ?? null,
              variantClientId: variant.clientId ?? null,
              colorName: null,
              variantName: variant.name,
              sku: existingUseMainSku ? '' : (existing?.sku ?? defaultSkuFor(null, variant.name)),
              useMainSku: existingUseMainSku,
              stock: existing?.stock ?? '0',
              active: existing?.active ?? true
            });
            return;
          }

          allowedColors.forEach((color) => {
            const existing = findExisting(color, variant);
            const existingUseMainSku =
              existing?.useMainSku ?? (existing != null && String(existing?.sku ?? '') === '');
            newSkus.push({
              id: existing?.id || null,
              colorId: color.id ?? null,
              colorClientId: color.clientId ?? null,
              variantId: variant.id ?? null,
              variantClientId: variant.clientId ?? null,
              colorName: color.name,
              variantName: variant.name,
              sku: existingUseMainSku ? '' : (existing?.sku ?? defaultSkuFor(color.name, variant.name)),
              useMainSku: existingUseMainSku,
              stock: existing?.stock ?? '0',
              active: existing?.active ?? true
            });
          });
        });
      } 
      // Caso 2: Solo colores
      else if (colors.length > 0) {
        colors.forEach(color => {
          const existing = findExisting(color, null);
          const existingUseMainSku =
            existing?.useMainSku ?? (existing != null && String(existing?.sku ?? '') === '');
          newSkus.push({
            id: existing?.id || null,
            colorId: color.id ?? null,
            colorClientId: color.clientId ?? null,
            variantId: null,
            variantClientId: null,
            colorName: color.name,
            variantName: null,
            sku: existingUseMainSku ? '' : (existing?.sku ?? defaultSkuFor(color.name, null)),
            useMainSku: existingUseMainSku,
            stock: existing?.stock ?? '0',
            active: existing?.active ?? true
          });
        });
      }
      // Caso 3: Solo variantes
      else if (variants.length > 0) {
        variants.forEach(variant => {
          const existing = findExisting(null, variant);
          const existingUseMainSku =
            existing?.useMainSku ?? (existing != null && String(existing?.sku ?? '') === '');
          newSkus.push({
            id: existing?.id || null,
            colorId: null,
            colorClientId: null,
            variantId: variant.id ?? null,
            variantClientId: variant.clientId ?? null,
            colorName: null,
            variantName: variant.name,
            sku: existingUseMainSku ? '' : (existing?.sku ?? defaultSkuFor(null, variant.name)),
            useMainSku: existingUseMainSku,
            stock: existing?.stock ?? '0',
            active: existing?.active ?? true
          });
        });
      }

      setSkus(newSkus);
    }
  }, [colors, variants, sku, autoGenerateSkus, variantColorLinks]);

  useEffect(() => {
    if (colors.length === 0 || variants.length === 0) return;
    setSkus((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.filter((s: any) => {
        const vKey =
          s?.variantClientId ??
          (s?.variantId != null ? `variant-${String(s.variantId)}` : null);
        const cKey =
          s?.colorClientId ??
          (s?.colorId != null ? `color-${String(s.colorId)}` : null);
        if (!vKey || !cKey) return true;
        const linked = variantColorLinks?.[String(vKey)];
        if (linked == null) return true;
        return linked.includes(String(cKey));
      });
    });
  }, [variantColorLinks, colors, variants]);

  useEffect(() => {
    if (autoGenerateSkus) return;
    setSkus((prev) => {
      const next = (Array.isArray(prev) ? prev : [])
        .map((s: any) => {
          const colorMatch =
            (s?.colorId != null ? colors.find((c: any) => String(c?.id) === String(s.colorId)) : null) ||
            (s?.colorClientId ? colors.find((c: any) => String(c?.clientId) === String(s.colorClientId)) : null) ||
            null;
          const variantMatch =
            (s?.variantId != null ? variants.find((v: any) => String(v?.id) === String(s.variantId)) : null) ||
            (s?.variantClientId ? variants.find((v: any) => String(v?.clientId) === String(s.variantClientId)) : null) ||
            null;

          const updated: any = { ...s };
          if (colorMatch) {
            updated.colorId = colorMatch.id ?? updated.colorId ?? null;
            updated.colorClientId = colorMatch.clientId ?? updated.colorClientId ?? null;
            updated.colorName = colorMatch.name ?? updated.colorName ?? null;
          }
          if (variantMatch) {
            updated.variantId = variantMatch.id ?? updated.variantId ?? null;
            updated.variantClientId = variantMatch.clientId ?? updated.variantClientId ?? null;
            updated.variantName = variantMatch.name ?? updated.variantName ?? null;
          }
          return updated;
        })
        .filter((s: any) => {
          const hasColor =
            s?.colorId == null && s?.colorClientId == null && (s?.colorName == null || s?.colorName === '')
              ? true
              : (s?.colorId != null ? colors.some((c: any) => String(c?.id) === String(s.colorId)) : false) ||
                (s?.colorClientId ? colors.some((c: any) => String(c?.clientId) === String(s.colorClientId)) : false) ||
                (s?.colorName ? colors.some((c: any) => String(c?.name) === String(s.colorName)) : false);
          const hasVariant =
            s?.variantId == null && s?.variantClientId == null && (s?.variantName == null || s?.variantName === '')
              ? true
              : (s?.variantId != null ? variants.some((v: any) => String(v?.id) === String(s.variantId)) : false) ||
                (s?.variantClientId ? variants.some((v: any) => String(v?.clientId) === String(s.variantClientId)) : false) ||
                (s?.variantName ? variants.some((v: any) => String(v?.name) === String(s.variantName)) : false);
          return hasColor && hasVariant;
        });
      return next;
    });
  }, [colors, variants, autoGenerateSkus]);

  useEffect(() => {
    const loadEditing = async () => {
      if (!product) return;
      setLoading(true);

      let fullProduct = product;
      if (navigator.onLine) {
        try {
          const res = await fetch(`${apiBase}/products/${product.id}/`, { headers: authHeaders(token) });
          if (res.ok) {
            fullProduct = await res.json();
          }
        } catch (e) { console.error("Error fetching full product details:", e); }
      }

      setName(fullProduct.name || '');
      setPrice(String(fullProduct.price || ''));
      setCostPrice(String(fullProduct.cost_price || '0'));
      const existingIsSale = Boolean(fullProduct.is_sale);
      setIsSale(existingIsSale);
      const existingSalePrice = fullProduct.sale_price != null ? String(fullProduct.sale_price) : '';
      setSalePrice(existingSalePrice);
      if (existingIsSale && existingSalePrice) {
        const base = Number(fullProduct.price || 0);
        const sp = Number(existingSalePrice);
        if (base > 0 && sp > 0 && sp < base) {
          const pct = ((1 - sp / base) * 100);
          setOfferPercent(pct.toFixed(2));
          setOfferMode('price');
        }
      } else {
        setOfferPercent('');
        setOfferMode('percent');
      }
      setCategoryId(String(fullProduct.category || ''));
      setSku(fullProduct.sku || '');
      setInventoryQty(String(fullProduct.inventory_qty || '0'));
      setDescription(fullProduct.description || '');
      setActive(Boolean(fullProduct.active));
      
      // Load Images
      const initialImages: any[] = [];
      if (fullProduct.image) {
        initialImages.push({
          id: 'main-existing',
          image: fullProduct.image,
          isExisting: true,
          type: 'main'
        });
      }
      if (fullProduct.gallery && Array.isArray(fullProduct.gallery)) {
        fullProduct.gallery.forEach((img: any) => {
          initialImages.push({
            id: `gallery-${img.id}`,
            image: img.image,
            isExisting: true,
            originalId: img.id,
            type: 'gallery'
          });
        });
      }
      setProductImages(initialImages);

      try {
        const res = await fetch(`${apiBase}/products/${product.id}/colors/`, { headers: authHeaders(token) });
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : data;
        const loaded = (Array.isArray(list) ? list : []).map((c: any, idx: number) => ({ id: c.id, clientId: `color-${c.id}`, name: c.name, hex: c.hex, stock: '0', position: idx, images: [] }));
        for (let i = 0; i < loaded.length; i++) {
          const color = loaded[i];
          const imgsRes = await fetch(`${apiBase}/products/colors/${color.id}/images/`, { headers: authHeaders(token) });
          const imgsData = await imgsRes.json();
          const imgsList = Array.isArray(imgsData.results) ? imgsData.results : imgsData;
          loaded[i] = { ...color, images: (Array.isArray(imgsList) ? imgsList : []).map((im: any, pos: number) => ({ id: im.id, image: im.image, position: pos })) };
        }
        setColors(loaded);
        setInitialColors(loaded);

        // Load Variants
        const varsRes = await fetch(`${apiBase}/products/${product.id}/variants/`, { headers: authHeaders(token) });
        const varsData = await varsRes.json();
        const varsList = Array.isArray(varsData.results) ? varsData.results : (Array.isArray(varsData) ? varsData : []);
        const loadedVars = varsList.map((v: any) => ({ id: v.id, clientId: `variant-${v.id}`, name: v.name, extra_price: String(v.extra_price || '0'), position: v.position }));
        setVariants(loadedVars);
        setInitialVariants(loadedVars);

        // Load Features
        const featsRes = await fetch(`${apiBase}/products/${product.id}/features/`, { headers: authHeaders(token) });
        const featsData = await featsRes.json();
        const featsList = Array.isArray(featsData.results) ? featsData.results : (Array.isArray(featsData) ? featsData : []);
        const loadedFeats = featsList.map((f: any) => ({ id: f.id, name: f.name, position: f.position }));
        setFeatures(loadedFeats);
        setInitialFeatures(loadedFeats);

        // Load SKUs (Combinations)
        const skusRes = await fetch(`${apiBase}/products/${product.id}/skus/`, { headers: authHeaders(token) });
        const skusData = await skusRes.json();
        const skusList = Array.isArray(skusData.results) ? skusData.results : (Array.isArray(skusData) ? skusData : []);
        const loadedSkus = skusList.map((s: any) => {
          const colorObj = loaded.find(c => c.id === s.color);
          const variantObj = loadedVars.find(v => v.id === s.variant);
          const normalizedSku = String(s?.sku ?? '');
          return {
            id: s.id,
            colorId: s.color,
            colorClientId: colorObj?.clientId ?? null,
            variantId: s.variant,
            variantClientId: variantObj?.clientId ?? null,
            colorName: colorObj?.name || null,
            variantName: variantObj?.name || null,
            sku: normalizedSku,
            useMainSku: normalizedSku === '',
            stock: String(s.stock),
            active: s.active,
            price_override: s.price_override
          };
        });
        setSkus(loadedSkus);
        setInitialSkus(loadedSkus);

      } catch (_) {
        setColors([]);
        setInitialColors([]);
        setVariants([]);
        setInitialVariants([]);
        setFeatures([]);
        setInitialFeatures([]);
      } finally { setLoading(false); }
    };
    loadEditing();
  }, [product]);

  useEffect(() => {
    const focus = (product as any)?.__focusSku;
    if (!focus || hasAppliedFocusSku) return;
    if (activeTab !== 'variantes') return;
    if (!Array.isArray(skus) || skus.length === 0) return;

    const focusSkuId = focus?.skuId != null ? String(focus.skuId) : null;
    const focusSku = String(focus?.sku ?? focus?.query ?? '').trim().toUpperCase();
    const focusColorId = focus?.colorId != null ? String(focus.colorId) : null;
    const focusVariantId = focus?.variantId != null ? String(focus.variantId) : null;

    const idx = skus.findIndex((s: any) => {
      if (focusSkuId && s?.id != null && String(s.id) === focusSkuId) return true;
      if (focusSku && String(s?.sku ?? '').trim().toUpperCase() === focusSku) return true;
      const sColorId = s?.colorId != null ? String(s.colorId) : null;
      const sVariantId = s?.variantId != null ? String(s.variantId) : null;
      if (focusColorId || focusVariantId) {
        return sColorId === focusColorId && sVariantId === focusVariantId;
      }
      return false;
    });
    if (idx < 0) return;

    const item: any = skus[idx];
    const key = String(item?.id ?? `${item?.colorId ?? 'n'}-${item?.variantId ?? 'n'}-${idx}`);
    setHighlightSkuKey(key);
    setHasAppliedFocusSku(true);

    requestAnimationFrame(() => {
      const el = document.getElementById(`sku-row-${key}`);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

    const t = setTimeout(() => setHighlightSkuKey(null), 2500);
    return () => clearTimeout(t);
  }, [product, skus, activeTab, hasAppliedFocusSku]);

  useEffect(() => {
    const focus = (product as any)?.__focusVariantName;
    if (!focus || hasAppliedFocusVariant) return;
    if (activeTab !== 'variantes') return;
    if (!Array.isArray(variants) || variants.length === 0) return;

    const query = String(focus?.variantName ?? focus?.query ?? '').trim().toLowerCase();
    if (!query) return;

    const idx = variants.findIndex((v: any) => String(v?.name || '').toLowerCase().includes(query));
    if (idx < 0) return;

    const item: any = variants[idx];
    const key = variantKeyOf(item, idx);
    setHighlightVariantKey(key);
    setHasAppliedFocusVariant(true);

    requestAnimationFrame(() => {
      const el = document.getElementById(`variant-row-${key}`);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

    const t = setTimeout(() => setHighlightVariantKey(null), 2500);
    return () => clearTimeout(t);
  }, [product, variants, activeTab, hasAppliedFocusVariant]);

  const handleGenerateSKU = () => {
    if (!name.trim()) return;
    
    // Obtener prefijo de categoría (primeras 3 letras)
    const category = categories.find(c => String(c.id) === String(categoryId));
    const catPrefix = category ? category.name.substring(0, 3).toUpperCase() : 'PRD';
    
    // Obtener prefijo de nombre (primeras 3 letras de la primera palabra)
    const namePrefix = name.trim().split(' ')[0].substring(0, 3).toUpperCase();
    
    setSku(`${catPrefix}-${namePrefix}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleAnalyzeImage = async () => {
    if (productImages.length === 0) return;
    const mainImg = productImages[0];
    setLoading(true);
    setLoadingType('ai');
    setErrors({});

    try {
      const fd = new FormData();
      fd.append('notes', aiNotes);
      if (mainImg.file) {
        fd.append('image', mainImg.file);
      } else if (mainImg.isExisting) {
        // We need to fetch the image and convert to blob or just send the URL
        // To simplify, let's assume the backend can fetch it if we send the URL
        fd.append('image_url', mediaUrl(mainImg.image));
      }

      const res = await fetch(`${apiBase}/webconfig/ai/analyze-product/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      if (!res.ok) throw new Error('No se pudo analizar la imagen.');
      const data = await res.json();

      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.price) setPrice(String(data.price));
      if (data.category_name) {
        const found = categories.find(c => c.name.toLowerCase().includes(data.category_name.toLowerCase()));
        if (found) setCategoryId(String(found.id));
      }
      if (Array.isArray(data.features)) {
        const newFeats = data.features.map((f: string) => ({ name: f }));
        setFeatures([...features, ...newFeats]);
      }
      if (Array.isArray(data.suggested_variants)) {
        const newVars = data.suggested_variants.map((v: any) => ({
          clientId: `variant-ai-${Math.random().toString(36).substr(2, 9)}`,
          name: (v.name || v).substring(0, 50), // Truncate to 50 chars
          extra_price: String(v.extra_price || 0),
          position: variants.length
        }));
        setVariants([...variants, ...newVars]);
      }
      if (Array.isArray(data.suggested_colors)) {
        const newCols = data.suggested_colors.map((c: any) => ({
          clientId: `color-ai-${Math.random().toString(36).substr(2, 9)}`,
          name: c.name || c,
          hex: c.hex || '#000000',
          position: colors.length,
          images: []
        }));
        setColors([...colors, ...newCols]);
      }
      
      // Magic success effect
      setShowMagicSuccess(true);
      setTimeout(() => {
        setLoading(false);
        setShowMagicSuccess(false);
        setShowAiPanel(false);
      }, 1500);

    } catch (error: any) {
      setLoading(false);
      setErrors({ form: `Error en análisis IA: ${error.message}` });
    }
  };

  const validateField = async (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) newErrors.name = 'Nombre requerido';
        else if (value.length > 100) newErrors.name = 'Máximo 100 caracteres';
        else delete newErrors.name;
        break;
      case 'price':
        const p = Number(value);
        if (isNaN(p) || p <= 0) newErrors.price = 'Precio inválido';
        else delete newErrors.price;
        break;
      case 'sku':
        if (value.length > 50) {
          newErrors.sku = 'Máximo 50 caracteres';
        } else if (value.trim()) {
          // Check SKU availability with debounce
          if (skuCheckTimeout.current) clearTimeout(skuCheckTimeout.current);
          skuCheckTimeout.current = setTimeout(async () => {
            try {
              const url = `${apiBase}/products/check-sku/?sku=${encodeURIComponent(value)}${product ? `&exclude_id=${product.id}` : ''}`;
              const res = await fetch(url, { headers: authHeaders(token) });
              const data = await res.json();
              if (!data.available) {
                setErrors(prev => ({ ...prev, sku: 'Este SKU ya está en uso' }));
              } else {
                setErrors(prev => {
                  const e = { ...prev };
                  delete e.sku;
                  return e;
                });
              }
            } catch (e) {}
          }, 500);
        } else {
          delete newErrors.sku;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Trigger validation on blur
    const valMap: any = { name, price, sku };
    validateField(field, valMap[field]);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!croppingImage) return;

    const file = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const src = URL.createObjectURL(file);
    
    setProductImages(prev => {
      const next = [...prev];
      const item = next[croppingImage.index];
      
      if (croppingImage.type === 'new' || (item.isExisting && item.type === 'main')) {
        // Para imágenes nuevas o la principal existente, actualizamos localmente
        next[croppingImage.index] = { ...item, file, src, isExisting: false };
      } else if (item.isExisting && item.type === 'gallery') {
        // Para galería existente, subimos el recorte de una vez
        const fd = new FormData();
        fd.append('image', file);
        fetch(`${apiBase}/products/gallery/${item.originalId}/`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });
        next[croppingImage.index] = { ...item, src };
      }
      return next;
    });
    
    setCroppingImage(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProductImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Sincronizar posiciones en el backend para imágenes existentes
        const syncGalleryPositions = async () => {
          const galleryItems = newItems.slice(1); // Excluir la principal
          for (let i = 0; i < galleryItems.length; i++) {
            const item = galleryItems[i];
            if (item.isExisting && item.type === 'gallery') {
              try {
                const fd = new FormData();
                fd.append('position', String(i));
                await fetch(`${apiBase}/products/gallery/${item.originalId}/`, {
                  method: 'PATCH',
                  headers: { 'Authorization': `Bearer ${token}` },
                  body: fd
                });
              } catch (e) {
                console.error("Error syncing gallery position:", e);
              }
            }
          }
        };
        
        if (product) syncGalleryPositions();
        
        return newItems;
      });
    }
  };

  const handleRemoveImage = async (index: number) => {
    const img = productImages[index];
    if (img.isExisting) {
        if (img.type === 'gallery') {
            await fetch(`${apiBase}/products/gallery/${img.originalId}/`, { method: 'DELETE', headers: authHeaders(token) });
        } else if (img.type === 'main') {
            // No eliminamos la imagen principal del servidor aquí, solo del estado local
            // Se actualizará al guardar el producto
        }
    }
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = (files: File[]) => {
    const newImages = files.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      src: URL.createObjectURL(file),
      file,
      isExisting: false,
      type: 'new'
    }));
    setProductImages(prev => [...prev, ...newImages]);
  };

  const validateClient = (forceDraft = false) => {
    const errs: any = {};
    // Relaxed regex to match backend - allowing almost any printable character
    const nameOk = name.trim().length > 0 && name.length <= 100;
    if (!nameOk) errs.name = 'Nombre requerido, máx 100 caracteres.';
    
    const priceNorm = normalizePrice(price);
    const priceNum = Number(priceNorm);
    if (!priceNorm || Number.isNaN(priceNum) || priceNum <= 0) errs.price = 'Precio debe ser positivo con 2 decimales.';
    
    if (description.length > 500) errs.description = 'Descripción máximo 500 caracteres.';
    if (!forceDraft) {
      if (!categoryId || categoryId === 'null' || categoryId === 'undefined') {
        errs.category = 'Debe seleccionar una categoría.';
      } else if (!categories.find((c) => String(c.id) === String(categoryId))) {
        errs.category = 'La categoría seleccionada no es válida.';
      }
    }

    if (sku && sku.length > 50) errs.sku = 'SKU máximo 50 caracteres.';
    
    const inv = Number(inventoryQty);
    if (!Number.isInteger(inv) || inv < 0) errs.inventoryQty = 'Cantidad debe ser entero positivo.';

    if (isSale) {
      const base = Number(normalizePrice(price));
      if (!base || Number.isNaN(base) || base <= 0) {
        errs.sale_price = 'Define primero el precio de venta.';
      } else {
        let sp = 0;
        if (offerMode === 'percent') {
          const pct = Number(normalizePercent(offerPercent));
          if (Number.isNaN(pct) || pct <= 0 || pct >= 100) {
            errs.sale_price = 'Porcentaje inválido (1 a 99.99).';
          } else {
            sp = Number(computeSaleFromPercent(base, pct));
          }
        } else {
          sp = Number(normalizePrice(salePrice));
          if (Number.isNaN(sp) || sp <= 0) errs.sale_price = 'Precio de oferta inválido.';
        }
        if (!errs.sale_price && sp >= base) errs.sale_price = 'El precio de oferta debe ser menor al precio normal.';
      }
    }
    
    if (productImages.length > 0) {
      const firstImg = productImages[0];
      if (firstImg.file) {
        const ok = ['image/jpeg','image/png','image/webp'].includes(firstImg.file.type);
        if (!ok) errs.image = 'Formato de imagen inválido (jpeg, png, webp).';
      }
    }
    
    if (colors.length > 0) {
      if (colors.some((c) => !c.name)) {
        errs.colors = 'Todos los colores deben tener un nombre.';
      }
      if (colors.some((c) => c.hex && !/^#[0-9A-Fa-f]{6}$/.test(c.hex))) {
        errs.colors = 'Verifique el formato HEX (#RRGGBB) de los colores.';
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, forceDraft = false) => {
    if (e) e.preventDefault();
    if (!navigator.onLine) {
      setErrors({ form: 'Sin conexión a internet. Conéctate para guardar el producto.' });
      return;
    }
    if (!forceDraft && !validateClient(forceDraft)) return;
    
    setLoading(true);
    setLoadingType('save');
    const fd = new FormData();
    if (name) fd.append('name', name);
    fd.append('price', normalizePrice(price) || '0');
    fd.append('cost_price', normalizePrice(costPrice) || '0');
    if (categoryId && categoryId !== 'null' && categoryId !== 'undefined') {
      fd.append('category', categoryId);
    }
    if (sku) fd.append('sku', sku);
    fd.append('inventory_qty', String(Number(inventoryQty || 0)));
    fd.append('description', description || '');
    fd.append('active', active ? 'true' : 'false');
    fd.append('is_draft', forceDraft ? 'true' : 'false');
    fd.append('is_sale', isSale ? 'true' : 'false');
    if (isSale) {
      const base = Number(normalizePrice(price) || '0');
      const sp =
        offerMode === 'percent'
          ? computeSaleFromPercent(base, Number(normalizePercent(offerPercent) || '0'))
          : (normalizePrice(salePrice) || '0');
      fd.append('sale_price', sp);
    }
    
    // Handle Main Image (First in productImages)
    if (productImages.length > 0) {
      const firstImg = productImages[0];
      if (firstImg.file) {
        fd.append('image', firstImg.file);
      } else if (firstImg.isExisting && firstImg.type === 'gallery') {
        // Swap trick: if first image is from gallery, download and re-upload as main
        try {
          const response = await fetch(firstImg.src || mediaUrl(firstImg.image));
          const blob = await response.blob();
          const file = new File([blob], 'main_image.jpg', { type: 'image/jpeg' });
          fd.append('image', file);
        } catch (e) { console.error("Error swapping main image", e); }
      }
    }

    const url = product ? `${apiBase}/products/${product.id}/` : `${apiBase}/products/`;
    const method = product ? 'PATCH' : 'POST';
    
    let res;
    try {
      res = await fetch(url, { method, headers: authHeaders(token), body: fd });
    } catch (err: any) {
      setErrors({ form: `Error de red: ${err.message}` });
      setLoading(false);
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { detail: `Error inesperado (${res.status} ${res.statusText})` };
    }

    if (!res.ok) {
      let errorDetail = '';
      if (typeof data === 'object') {
        errorDetail = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
      } else {
        errorDetail = String(data);
      }
      
      const newErrors: any = { form: `Error al guardar producto: ${errorDetail}` };
      
      // Mapeo de errores específicos a campos
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (key !== 'detail') {
            let errorMsg = '';
            if (Array.isArray(data[key])) {
              errorMsg = data[key][0];
            } else if (typeof data[key] === 'string') {
              errorMsg = data[key];
            }
            
            if (errorMsg) {
              if (key === 'inventory_qty') newErrors.inventoryQty = errorMsg;
              else if (key === 'sale_price') newErrors.sale_price = errorMsg;
              else newErrors[key] = errorMsg;
            }
          }
        });
      }
      
      setErrors(newErrors);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const productId = product ? product.id : data.id;
      const updatedColors: any[] = [];
      const updatedVariants: any[] = [];

      const existingSkus = initialSkus;
      const currentSkus = skus;
      const currentSkuIds = new Set(currentSkus.filter((s) => s.id).map((s) => String(s.id)));

      const existingColors = initialColors;
      const currentColors = colors.map((c, idx) => ({ ...c, position: idx }));
      const currentColorIds = new Set(currentColors.filter((e) => e.id).map((e) => String(e.id)));
      const removedColorIds = new Set(
        existingColors
          .filter((c) => c.id && !currentColorIds.has(String(c.id)))
          .map((c) => String(c.id)),
      );

      const existingVars = initialVariants;
      const currentVars = variants.map((v, idx) => ({ ...v, position: idx }));
      const currentVarIds = new Set(currentVars.filter((v) => v.id).map((v) => String(v.id)));
      const removedVariantIds = new Set(
        existingVars
          .filter((v) => v.id && !currentVarIds.has(String(v.id)))
          .map((v) => String(v.id)),
      );

      const skuIdsToDelete = new Set<string>();
      for (const es of existingSkus) {
        if (!es?.id) continue;
        const id = String(es.id);
        const shouldDeleteByMissing = !currentSkuIds.has(id);
        const shouldDeleteByColor =
          es?.colorId != null && removedColorIds.has(String(es.colorId));
        const shouldDeleteByVariant =
          es?.variantId != null && removedVariantIds.has(String(es.variantId));
        if (shouldDeleteByMissing || shouldDeleteByColor || shouldDeleteByVariant) {
          skuIdsToDelete.add(id);
        }
      }

      for (const skuId of skuIdsToDelete) {
        try {
          await fetch(`${apiBase}/products/skus/${skuId}/`, { method: 'DELETE', headers: authHeaders(token) });
        } catch (_) {}
      }

      for (const eCol of existingColors) {
        if (eCol.id && !currentColorIds.has(String(eCol.id))) {
          await fetch(`${apiBase}/products/colors/${eCol.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }
      for (let c of currentColors) {
        let finalColorId = c.id;
        if (!c.id) {
          const fdColor = new FormData();
          fdColor.append('name', c.name);
          fdColor.append('hex', c.hex);
          fdColor.append('position', String(c.position));
          const createRes = await fetch(`${apiBase}/products/${productId}/colors/`, { method: 'POST', headers: authHeaders(token), body: fdColor });
          if (createRes.ok) {
            const created = await createRes.json();
            finalColorId = created.id;
            updatedColors.push({ ...created, clientId: c.clientId ?? null, name: created?.name ?? c.name, hex: created?.hex ?? c.hex });
          } else {
            const errData = await createRes.json();
            console.error("Error creating color:", errData);
            setErrors({ form: `Error al crear color "${c.name}": ${errData.detail || JSON.stringify(errData)}` });
            setLoading(false);
            return;
          }
        } else {
          const prev = existingColors.find((e) => String(e.id) === String(c.id)) || {};
          const changed = prev.name !== c.name || prev.hex !== c.hex || Number(prev.position) !== Number(c.position);
          if (changed) {
            const fdColor = new FormData();
            fdColor.append('name', c.name);
            fdColor.append('hex', c.hex);
            fdColor.append('position', String(c.position));
            const upRes = await fetch(`${apiBase}/products/colors/${c.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdColor });
            if (upRes.ok) {
              const updated = await upRes.json();
              updatedColors.push({ ...updated, clientId: c.clientId ?? `color-${updated?.id ?? c.id}`, name: updated?.name ?? c.name, hex: updated?.hex ?? c.hex });
            } else {
              const errData = await upRes.json();
              setErrors({ form: `Error al actualizar color "${c.name}": ${errData.detail || JSON.stringify(errData)}` });
              setLoading(false);
              return;
            }
          } else {
            updatedColors.push(c);
          }
        }
        if (!finalColorId) continue;
        const existingImgsRes = await fetch(`${apiBase}/products/colors/${finalColorId}/images/`, { headers: authHeaders(token) });
        const existingImgsData = await existingImgsRes.json();
        const existingImgs = Array.isArray(existingImgsData.results) ? existingImgsData.results : existingImgsData;
        const currentImgs = Array.isArray(c.images) ? c.images.map((im, pos) => ({ ...im, position: pos })) : [];
        const currentImgIds = new Set(currentImgs.filter((im) => im.id).map((im) => String(im.id)));
        for (const im of (Array.isArray(existingImgs) ? existingImgs : [])) {
          if (!currentImgIds.has(String(im.id))) {
            await fetch(`${apiBase}/products/color-images/${im.id}/`, { method: 'DELETE', headers: authHeaders(token) });
          }
        }
        for (const im of currentImgs) {
          if (!im.id && im.file) {
            const fdImg = new FormData();
            fdImg.append('image', im.file);
            fdImg.append('position', String(im.position));
            await fetch(`${apiBase}/products/colors/${finalColorId}/images/`, { method: 'POST', headers: authHeaders(token), body: fdImg });
          } else if (im.id) {
            const fdImg = new FormData();
            fdImg.append('position', String(im.position));
            await fetch(`${apiBase}/products/color-images/${im.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdImg });
          }
        }
      }

      // Process Variants
      for (const ev of existingVars) {
        if (ev.id && !currentVarIds.has(String(ev.id))) {
          await fetch(`${apiBase}/products/variants/${ev.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }

      for (const v of currentVars) {
        if (!v.id) {
          const fdV = new FormData();
          fdV.append('name', v.name);
          fdV.append('extra_price', String(Number(v.extra_price || 0)));
          fdV.append('position', String(v.position));
          const resV = await fetch(`${apiBase}/products/${productId}/variants/`, { method: 'POST', headers: authHeaders(token), body: fdV });
          if (resV.ok) {
            const created = await resV.json();
            updatedVariants.push({ ...created, clientId: v.clientId ?? null, name: created?.name ?? v.name, extra_price: created?.extra_price ?? v.extra_price });
          } else {
            const errData = await resV.json();
            setErrors({ form: `Error al crear variante "${v.name}": ${errData.detail || JSON.stringify(errData)}` });
            setLoading(false);
            return;
          }
        } else {
          const prev = existingVars.find((e) => String(e.id) === String(v.id));
          if (prev && (prev.name !== v.name || String(prev.extra_price) !== String(v.extra_price) || Number(prev.position) !== Number(v.position))) {
            const fdV = new FormData();
            fdV.append('name', v.name);
            fdV.append('extra_price', String(Number(v.extra_price || 0)));
            fdV.append('position', String(v.position));
            const resV = await fetch(`${apiBase}/products/variants/${v.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdV });
            if (resV.ok) {
              const updated = await resV.json();
              updatedVariants.push({ ...updated, clientId: v.clientId ?? `variant-${updated?.id ?? v.id}`, name: updated?.name ?? v.name, extra_price: updated?.extra_price ?? v.extra_price });
            } else {
              const errData = await resV.json();
              setErrors({ form: `Error al actualizar variante "${v.name}": ${errData.detail || JSON.stringify(errData)}` });
              setLoading(false);
              return;
            }
          } else {
            updatedVariants.push(v);
          }
        }
      }

      // Process Features
      const updatedFeatures: any[] = [];
      const existingFeats = initialFeatures;
      const currentFeats = features.map((f, idx) => ({ ...f, position: idx }));
      const currentFeatIds = new Set(currentFeats.filter((f) => f.id).map((f) => String(f.id)));

      for (const ef of existingFeats) {
        if (ef.id && !currentFeatIds.has(String(ef.id))) {
          await fetch(`${apiBase}/products/features/${ef.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }

      for (const f of currentFeats) {
        const fdF = new FormData();
        fdF.append('name', f.name);
        fdF.append('position', String(f.position));

        if (!f.id) {
          const resF = await fetch(`${apiBase}/products/${productId}/features/`, { method: 'POST', headers: authHeaders(token), body: fdF });
          if (resF.ok) updatedFeatures.push(await resF.json());
        } else {
          const prev = existingFeats.find((e) => String(e.id) === String(f.id));
          if (prev && (prev.name !== f.name || Number(prev.position) !== Number(f.position))) {
            const resF = await fetch(`${apiBase}/products/features/${f.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdF });
            if (resF.ok) updatedFeatures.push(await resF.json());
          } else {
            updatedFeatures.push(f);
          }
        }
      }

      // Process Gallery Images (All except the first one which is the main image)
      const galleryItems = productImages.slice(1);
      
      for (let i = 0; i < galleryItems.length; i++) {
        const item = galleryItems[i];
        const fdG = new FormData();
        fdG.append('position', String(i));

        if (!item.isExisting) {
          // New file
          fdG.append('image', item.file);
          await fetch(`${apiBase}/products/${productId}/gallery/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fdG
          });
        } else if (item.type === 'gallery') {
          // Existing gallery image, update position
          await fetch(`${apiBase}/products/gallery/${item.originalId}/`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fdG
          });
        }
      }

      // Save or update combinations
      for (const s of currentSkus) {
        const colorMatch =
          (s.colorId != null ? updatedColors.find((c: any) => String(c.id) === String(s.colorId)) : null) ||
          (s.colorClientId != null ? updatedColors.find((c: any) => String(c.clientId) === String(s.colorClientId)) : null) ||
          updatedColors.find((c: any) => c.name === s.colorName);
        const variantMatch =
          (s.variantId != null ? updatedVariants.find((v: any) => String(v.id) === String(s.variantId)) : null) ||
          (s.variantClientId != null ? updatedVariants.find((v: any) => String(v.clientId) === String(s.variantClientId)) : null) ||
          updatedVariants.find((v: any) => v.name === s.variantName);

        const normalizedSku = String(s?.sku ?? '').trim().toUpperCase();
        const useMainSkuForSave = Boolean(s?.useMainSku) || normalizedSku === '';
        const rawStock = Number(String(s?.stock ?? '0'));
        const normalizedStock = Number.isFinite(rawStock) ? rawStock : 0;
        const payload: any = {
          sku: useMainSkuForSave ? '' : normalizedSku,
          stock: Math.max(0, normalizedStock),
          active: s.active,
          color: colorMatch?.id || null,
          variant: variantMatch?.id || null,
          price_override: s.price_override || null
        };

        if (!s.id) {
          const resSku = await fetch(`${apiBase}/products/${productId}/skus/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify(payload)
          });
          if (!resSku.ok) {
            const errData = await resSku.json().catch(() => ({}));
            setErrors({ form: `Error en combinación SKU: ${errData.detail || JSON.stringify(errData)}` });
            setLoading(false);
            return;
          }
        } else {
          const resSku = await fetch(`${apiBase}/products/skus/${s.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify(payload)
          });
          if (!resSku.ok) {
            const errData = await resSku.json().catch(() => ({}));
            setErrors({ form: `Error al actualizar combinación SKU: ${errData.detail || JSON.stringify(errData)}` });
            setLoading(false);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      if (!navigator.onLine || err?.message?.includes('fetch') || err?.message?.includes('network') || err?.name === 'TypeError') {
        setErrors({ form: 'Se perdió la conexión durante el guardado. Revisa tu conexión e inténtalo de nuevo.' });
      } else {
        setErrors({ form: err?.message || 'Error inesperado al guardar.' });
      }
      setLoading(false);
      return;
    }
    if (onSaved) onSaved();
  };


  return (
    <div className="min-h-full animate-in fade-in duration-500">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/60 dark:bg-[#0B0D14]/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-500">
          <div className="relative group">
            {/* Pulsing magic ring */}
            <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20 blur-2xl animate-pulse" />
            
            <div className="bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center relative overflow-hidden">
              {/* Rotating background detail */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
              
              <div className="relative mb-6">
                {!showMagicSuccess ? (
                  <>
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {loadingType === 'ai' ? (
                        <Wand2 className="w-6 h-6 text-indigo-500 animate-bounce" />
                      ) : (
                        <Save className="w-6 h-6 text-indigo-500 animate-pulse" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                {showMagicSuccess 
                  ? '¡Completado!' 
                  : loadingType === 'ai' 
                    ? 'Magia en progreso' 
                    : 'Guardando producto'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {showMagicSuccess 
                  ? 'La operación se realizó con éxito' 
                  : loadingType === 'ai' 
                    ? 'Gemini está analizando tu producto...' 
                    : 'Estamos sincronizando los datos con el servidor...'}
              </p>
              
              {!showMagicSuccess && (
                <div className="mt-8 flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header - Improved for integration */}
      <div className="sticky top-[-24px] z-40 bg-white/80 dark:bg-[#0B0D14]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 py-4 mb-6 transition-all">
        {!isOnline && (
          <div className="max-w-7xl mx-auto mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <CloudOff className="w-4 h-4 flex-shrink-0" />
            <span><strong>Sin conexión</strong> — No podrás guardar hasta que vuelvas a tener internet.</span>
          </div>
        )}
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onCancel}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {active ? 'Producto Activo' : 'Producto Inactivo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onCancel}
              className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={(e) => handleSubmit(e, true)} 
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all transform active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              <FileText className="w-4 h-4" />
              <span>Guardar Borrador</span>
            </button>
            <button 
              onClick={(e) => handleSubmit(e, false)} 
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Producto</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        {errors.form && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400">Error de validación</h3>
                <p className="text-sm text-rose-700 dark:text-rose-300/80 mt-1">{errors.form}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation & Progress */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Progreso</h3>
                </div>
                <div className="p-2 space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id === 'imagenes' ? 'detalles' : section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                        activeTab === section.id || (section.id === 'imagenes' && activeTab === 'detalles')
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className={`w-4 h-4 ${activeTab === section.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                        <span className="text-sm font-semibold">{section.name}</span>
                      </div>
                      {section.isComplete ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips or Summary */}
              <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/20 rotate-12" />
                <h4 className="font-bold mb-2 relative z-10">¿Sabías qué?</h4>
                <p className="text-xs text-blue-100 leading-relaxed relative z-10">
                  Los productos con buenas imágenes y descripciones detalladas tienen un 70% más de probabilidad de venta.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-3 space-y-6 pb-20">
            {errors.form && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{errors.form}</span>
              </div>
            )}

            {/* Content Switcher */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Tab Navigation (Keep for mobile or as secondary) */}
          <div className="flex lg:hidden items-center gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto mb-6">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id === 'imagenes' ? 'detalles' : s.id)}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap uppercase tracking-widest ${activeTab === s.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500'}`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.name}
              </button>
            ))}
          </div>

          {activeTab === 'detalles' && (
            <div className="space-y-6">
              {/* Unified Pro Gallery Section - MOVED TO TOP */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4" />
                    <span>Galería e Inteligencia Visual</span>
                  </div>
                  
                  {!showAiPanel && productImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAiPanel(true)}
                      disabled={loading || !isOnline}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Analizar con IA</span>
                    </button>
                  )}
                  
                  {showAiPanel && (
                    <button
                      type="button"
                      onClick={() => setShowAiPanel(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Notes for AI - Dynamic Appearance */}
                  {showAiPanel && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/20 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Asistente de Inteligencia Visual</h4>
                      </div>
                      
                      <label className="block text-[10px] font-bold text-indigo-500/60 dark:text-indigo-400/60 uppercase tracking-widest mb-2">
                        Instrucciones opcionales
                      </label>
                      <textarea 
                        value={aiNotes}
                        onChange={(e) => setAiNotes(e.target.value)}
                        placeholder="Ej: 'Añade tallas S y M', 'El material es seda'..."
                        className="w-full bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none resize-none h-24 transition-all mb-4"
                      />
                      
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleAnalyzeImage}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                          <span>{loading ? 'Analizando...' : 'Comenzar Análisis'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAiPanel(false)}
                          className="px-4 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={productImages.map(img => String(img.id))}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {productImages.map((img, idx) => (
                          <SortableImage 
                            key={img.id}
                            id={img.id}
                            src={img.src || mediaUrl(img.image)}
                            isMain={idx === 0}
                            onRemove={() => handleRemoveImage(idx)}
                            onCrop={() => setCroppingImage({ src: img.src || mediaUrl(img.image), index: idx, type: img.isExisting ? 'existing' : 'new' })}
                          />
                        ))}
                        
                        <div 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.accept = 'image/*';
                            input.onchange = (e: any) => handleAddImages(Array.from(e.target.files));
                            input.click();
                          }}
                          className="relative aspect-square rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center cursor-pointer group shadow-sm"
                        >
                          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-widest mt-3">Añadir</span>
                        </div>
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                      <span className="font-bold">Nueva Función IA:</span> Sube una foto y presiona <span className="font-bold underline text-indigo-600">Analizar con IA</span> para que Gemini complete el nombre, descripción y precio automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Datos Básicos y Organización</span>
                </div>
                
                <div className="space-y-6">
                  {/* Row 1: Name & Active Status */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Nombre del Producto</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => { setName(e.target.value); validateField('name', e.target.value); }} 
                        onBlur={() => handleBlur('name')}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.name && touched.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                        placeholder="Ej. Camiseta Deportiva Premium"
                      />
                      {errors.name && touched.name && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                    </div>
                    <div className="md:w-48 pt-0 md:pt-8">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${active ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Activo</span>
                        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Row 2: Category & Global Inventory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Categoría</label>
                      <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.category ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer`}
                      >
                        {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Inventario Base / Standalone</label>
                        {(colors.length > 0 || variants.length > 0) && (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-500/20">Tiene Variantes</span>
                        )}
                      </div>
                      <input 
                        type="number" 
                        value={inventoryQty} 
                        onChange={(e) => setInventoryQty(e.target.value)} 
                        min={0}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.inventoryQty ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Stock que no depende de variantes específicas.</p>
                    </div>
                  </div>
                  
                  {/* Total Stock Summary */}
                  {(colors.length > 0 || variants.length > 0) && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                          <Package className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Stock Total Consolidado</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {(() => {
                              const base = Number(inventoryQty || 0);
                              const skuTotal = skus.reduce((acc, s) => acc + Number(s.stock || 0), 0);
                              return base + skuTotal;
                            })()}
                            <span className="ml-2 text-xs font-medium text-gray-400">unidades</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Row 3: Prices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Precio de Venta (COP)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input 
                          type="text" 
                          value={price} 
                          onChange={(e) => { const v = normalizePrice(e.target.value); setPrice(v); validateField('price', v); }} 
                          onBlur={() => handleBlur('price')}
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.price && touched.price ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex flex-col mt-1">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(price)}</p>
                        {errors.price && touched.price && <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Precio de Compra / Costo (COP)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input 
                          type="text" 
                          value={costPrice} 
                          onChange={(e) => setCostPrice(normalizePrice(e.target.value))} 
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.cost_price ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex flex-col mt-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(costPrice)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSale}
                          onChange={(e) => {
                            const next = e.target.checked;
                            setIsSale(next);
                            if (!next) {
                              setOfferPercent('');
                              setSalePrice('');
                            } else {
                              setOfferMode('percent');
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ofertas</span>
                        </div>
                      </label>
                    </div>

                    {isSale && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Tipo de oferta</label>
                          <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <button
                              type="button"
                              onClick={() => setOfferMode('percent')}
                              className={`px-4 py-2 text-sm font-medium transition-colors ${offerMode === 'percent' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            >
                              Porcentaje
                            </button>
                            <button
                              type="button"
                              onClick={() => setOfferMode('price')}
                              className={`px-4 py-2 text-sm font-medium transition-colors ${offerMode === 'price' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            >
                              Precio oferta
                            </button>
                          </div>
                        </div>

                        <div>
                          {offerMode === 'percent' ? (
                            <>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Porcentaje</label>
                              <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <input
                                  type="text"
                                  value={offerPercent}
                                  onChange={(e) => setOfferPercent(normalizePercent(e.target.value))}
                                  className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.sale_price ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                  placeholder="Ej. 10"
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {(() => {
                                  const base = Number(normalizePrice(price));
                                  const pct = Number(normalizePercent(offerPercent));
                                  if (!base || Number.isNaN(base) || base <= 0) return 'Define primero el precio de venta.';
                                  if (!pct || Number.isNaN(pct) || pct <= 0) return 'Escribe un porcentaje para calcular el precio.';
                                  const sp = Number(computeSaleFromPercent(base, pct));
                                  return `Precio oferta: ${formatCurrency(sp.toFixed(2))}`;
                                })()}
                              </div>
                            </>
                          ) : (
                            <>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Precio de oferta (COP)</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <input
                                  type="text"
                                  value={salePrice}
                                  onChange={(e) => setSalePrice(normalizePrice(e.target.value))}
                                  className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.sale_price ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(salePrice)}</div>
                            </>
                          )}

                          {errors.sale_price && (
                            <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.sale_price}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profit Margin Info */}
                  {(Number(price) > 0 || Number(costPrice) > 0) && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-500/20">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Ganancia Estimada</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(Number(price) - Number(costPrice))}
                            <span className="ml-2 text-xs font-medium text-emerald-500">
                              ({Number(price) > 0 ? (((Number(price) - Number(costPrice)) / Number(price)) * 100).toFixed(1) : 0}%)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">SKU / Código</label>
                        <button 
                          type="button"
                          onClick={handleGenerateSKU}
                          disabled={!name.trim()}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Wand2 className="w-3 h-3" />
                          Generar
                        </button>
                      </div>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input 
                          type="text" 
                          value={sku} 
                          onChange={(e) => { const v = e.target.value.toUpperCase(); setSku(v); validateField('sku', v); }} 
                          onBlur={() => handleBlur('sku')}
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.sku && touched.sku ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm`}
                          placeholder="Ej. CAT-NOM-1234"
                        />
                      </div>
                      {errors.sku && touched.sku && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.sku}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Descripción</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      rows={4}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none`}
                      placeholder="Describe las características principales del producto..."
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'variantes' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Palette className="w-4 h-4" />
                    <span>Colores</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddColor((v) => !v)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${showAddColor ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500'}`}
                  >
                    {showAddColor ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{showAddColor ? 'Cerrar' : 'Nuevo'}</span>
                  </button>
                </div>

                {showAddColor && (
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 mb-6">
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nombre</label>
                        <input 
                          type="text" 
                          value={colorName} 
                          onChange={(e) => { setColorName(e.target.value); setColorInputError(''); }} 
                          placeholder="Ej. Azul Midnight" 
                          className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border ${colorInputError ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all`}
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Color</label>
                        <input 
                          type="color" 
                          value={colorHex} 
                          onChange={(e) => setColorHex(e.target.value)} 
                          className="h-9 w-full rounded-xl cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { 
                          if (!colorName) { setColorInputError('Nombre requerido'); return; }
                          const newColor = { clientId: makeClientId('color'), name: colorName, hex: colorHex, images: [] as any[] };
                          setColors((cols) => [...cols, newColor]); 
                          setActiveColorKey(colorKeyOf(newColor, colors.length));
                          setColorName(''); setColorHex('#000000'); setColorInputError(''); setShowAddColor(false);
                        }} 
                        className="h-9 w-9 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        title="Añadir color"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {colorInputError && <p className="mt-2 text-xs text-rose-400 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {colorInputError}</p>}
                  </div>
                )}

                {errors.colors && (
                  <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                    {errors.colors}
                  </div>
                )}

                {colors.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c, idx) => {
                      const key = colorKeyOf(c, idx);
                      const selected = key === activeColorKey;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveColorKey((prev) => (prev === key ? null : key))}
                          className={`w-11 h-11 rounded-full border transition-all flex items-center justify-center ${selected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          title={String(c?.name || 'Color')}
                        >
                          <div className="w-9 h-9 rounded-full border border-white/70" style={{ backgroundColor: c.hex }} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-500">
                    <Palette className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No hay colores agregados.</p>
                  </div>
                )}

                {(() => {
                  if (!activeColorKey) return null;
                  const idx = colors.findIndex((c, i) => colorKeyOf(c, i) === activeColorKey);
                  if (idx < 0) return null;
                  const c = colors[idx];
                  return (
                    <div className="mt-6 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: c.hex }} />
                        <div className="flex-1 min-w-[220px]">
                          <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nombre</label>
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Color</label>
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x))}
                            className="h-9 w-full rounded-xl cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => { setColors((cols) => cols.filter((_, i) => i !== idx)); setActiveColorKey(null); }}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors"
                          title="Eliminar color"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imágenes (Máx 4)</div>
                          <div className="w-44">
                            <label className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer transition-all">
                              <Plus className="w-3 h-3 mr-1.5" />
                              Agregar
                              <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  setColors((cols) => cols.map((x, i) => { 
                                    if (i !== idx) return x; 
                                    const imgs = Array.isArray(x.images) ? x.images.slice() : []; 
                                    for (const f of files) { 
                                      if (imgs.length >= 4) break; 
                                      if (['image/jpeg','image/png','image/webp'].includes(f.type)) { 
                                        imgs.push({ file: f, preview: URL.createObjectURL(f) }); 
                                      } 
                                    } 
                                    return { ...x, images: imgs }; 
                                  }));
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {(c.images || []).map((img: any, j) => (
                            <div key={`img-${j}`} className="relative group aspect-square rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                              <SafeImage 
                                src={img.preview ? img.preview : mediaUrl(img.image)} 
                                alt="Color variant" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  type="button" 
                                  onClick={() => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, images: (x.images || []).filter((_, k) => k !== j) } : x))} 
                                  className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                                  title="Eliminar imagen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!c.images || c.images.length === 0) && (
                            <div className="col-span-full py-4 text-center text-gray-500 dark:text-gray-500 text-xs border border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                              No hay imágenes para este color
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Variantes de Producto (Talla, Material, etc.)</span>
                 </div>
                 
                 <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                      <Plus className="w-4 h-4" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Nueva Variante</h4>
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre (ej. Talla L, XL, Material)</label>
                        <input 
                          type="text" 
                          value={variantName} 
                          onChange={(e) => setVariantName(e.target.value)} 
                          placeholder="Ej. Talla XL"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Sobrecosto (COP)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input 
                            type="number" 
                            value={variantPrice} 
                            onChange={(e) => setVariantPrice(e.target.value)} 
                            min={0}
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { if (!variantName) return; setVariants([...variants, { clientId: makeClientId('variant'), name: variantName, extra_price: variantPrice }]); setVariantName(''); setVariantPrice('0'); }} 
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 h-[42px]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir</span>
                      </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {variants.map((v, idx) => {
                      const rowKey = variantKeyOf(v, idx);
                      const linked = variantColorLinks?.[rowKey];
                      const label =
                        linked == null
                          ? 'Todos'
                          : linked.length === 0
                            ? 'Solo'
                            : `${linked.length}`;
                      return (
                      <div key={rowKey} id={`variant-row-${rowKey}`} className="space-y-2">
                        <div
                          className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg ${highlightVariantKey === rowKey ? 'ring-2 ring-blue-500/60' : ''}`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <input 
                              type="text" 
                              value={v.name} 
                              onChange={(e) => setVariants(vars => vars.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                              className="bg-transparent border-none text-gray-900 dark:text-white focus:ring-0 p-0 text-sm font-medium w-full"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setOpenVariantLinkKey((prev) => (prev === rowKey ? null : rowKey))}
                              disabled={colors.length === 0}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Vincular colores"
                            >
                              <Palette className="w-4 h-4 text-purple-500" />
                              <span>{label}</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">+$</span>
                              <input 
                                type="number" 
                                value={v.extra_price} 
                                onChange={(e) => setVariants(vars => vars.map((x, i) => i === idx ? { ...x, extra_price: e.target.value } : x))}
                                className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none text-right"
                              />
                            </div>
                            <button onClick={() => setVariants(vars => vars.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {openVariantLinkKey === rowKey && colors.length > 0 && (
                          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Colores vinculados</div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setVariantColorLinks((prev) => ({ ...(prev || {}), [rowKey]: null }))}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors"
                                >
                                  Todos
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVariantColorLinks((prev) => ({ ...(prev || {}), [rowKey]: [] }))}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors"
                                >
                                  Ninguno
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {colors.map((c, cIdx) => {
                                const cKey = colorKeyOf(c, cIdx);
                                const isOn = linked == null ? true : linked.includes(cKey);
                                return (
                                  <button
                                    key={cKey}
                                    type="button"
                                    onClick={() => {
                                      const allKeys = colors.map((cc, ii) => colorKeyOf(cc, ii));
                                      setVariantColorLinks((prev) => {
                                        const current = prev?.[rowKey];
                                        if (current == null) {
                                          const next = allKeys.filter((k) => k !== cKey);
                                          return { ...(prev || {}), [rowKey]: next.length === allKeys.length ? null : next };
                                        }
                                        const has = current.includes(cKey);
                                        const next = has ? current.filter((k) => k !== cKey) : [...current, cKey];
                                        return { ...(prev || {}), [rowKey]: next.length === allKeys.length ? null : next };
                                      });
                                    }}
                                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isOn ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700 opacity-50 hover:opacity-80'}`}
                                    title={String(c?.name || 'Color')}
                                  >
                                    <div className="w-8 h-8 rounded-full border border-white/70" style={{ backgroundColor: c.hex }} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })}
                    {variants.length === 0 && <p className="text-center text-gray-500 dark:text-gray-500 text-sm py-4">No hay variantes definidas.</p>}
                 </div>

                 {/* Combinations Generator Section */}
                 {(colors.length > 0 || variants.length > 0) && (
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Combinaciones de Inventario</h4>
                        <p className="text-xs text-gray-500">Gestione el stock y SKU específico para cada combinación</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto-generar</span>
                        <button
                          type="button"
                          onClick={() => setAutoGenerateSkus(!autoGenerateSkus)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${autoGenerateSkus ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoGenerateSkus ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-4 pb-2">Combinación</th>
                            <th className="px-4 pb-2">SKU</th>
                            <th className="px-4 pb-2">Principal</th>
                            <th className="px-4 pb-2">Stock</th>
                            <th className="px-4 pb-2 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {skus.map((skuItem, idx) => {
                            const rowKey = String(skuItem?.id ?? `${skuItem?.colorId ?? 'n'}-${skuItem?.variantId ?? 'n'}-${idx}`);
                            return (
                            <tr
                              key={rowKey}
                              id={`sku-row-${rowKey}`}
                              className={`bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group ${!skuItem.active ? 'opacity-50' : ''} ${highlightSkuKey === rowKey ? 'ring-2 ring-blue-500/60' : ''}`}
                            >
                              <td className="px-4 py-3 rounded-l-xl">
                                <div className="flex items-center gap-2">
                                  {skuItem.colorName && (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-900 dark:!text-white">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.find(c => c.name === skuItem.colorName)?.hex }} />
                                      {skuItem.colorName}
                                    </span>
                                  )}
                                  {skuItem.variantName && (
                                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:!text-white rounded-lg border border-blue-100 dark:border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                                      {skuItem.variantName}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="text" 
                                  value={String(skuItem.sku ?? '')}
                                  disabled={Boolean(skuItem.useMainSku)}
                                  onChange={(e) => setSkus(prev => prev.map((s, i) => i === idx ? { ...s, sku: e.target.value.toUpperCase(), useMainSku: false } : s))}
                                  onBlur={(e) => {
                                    const v = String(e.target.value ?? '').trim();
                                    if (v !== '') return;
                                    setSkus(prev => prev.map((s, i) => i === idx ? { ...s, sku: '', useMainSku: true } : s));
                                  }}
                                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="SKU específico"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 select-none cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(skuItem.useMainSku)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setSkus(prev => prev.map((s, i) => {
                                        if (i !== idx) return s;
                                        if (checked) return { ...s, sku: '', useMainSku: true };
                                        const baseSku = String(sku || '').toUpperCase();
                                        const cn = s.colorName ? String(s.colorName) : null;
                                        const vn = s.variantName ? String(s.variantName) : null;
                                        const generated = cn && vn ? `${baseSku}-${cn.substring(0,2)}-${vn.substring(0,2)}`.toUpperCase() : cn ? `${baseSku}-${cn.substring(0,3)}`.toUpperCase() : vn ? `${baseSku}-${vn.substring(0,3)}`.toUpperCase() : baseSku;
                                        return { ...s, sku: generated, useMainSku: false };
                                      }));
                                    }}
                                    className="rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>Usar SKU principal</span>
                                </label>
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  value={skuItem.stock}
                                  onChange={(e) => setSkus(prev => prev.map((s, i) => i === idx ? { ...s, stock: e.target.value } : s))}
                                  className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                              </td>
                              <td className="px-4 py-3 rounded-r-xl text-right">
                                <button
                                  type="button"
                                  onClick={() => setSkus(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s))}
                                  className={`p-1.5 rounded-lg transition-colors ${skuItem.active ? 'text-gray-400 hover:text-emerald-500' : 'text-gray-300 hover:text-gray-500'}`}
                                  title={skuItem.active ? 'Desactivar combinación' : 'Activar combinación'}
                                >
                                  {skuItem.active ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <Wand2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                        <span className="font-bold">Generador Automático:</span> El sistema genera automáticamente todas las combinaciones posibles entre tus colores y variantes. Puedes asignar un stock diferente a cada una para tener un control total de tu inventario.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'caracteristicas' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Características del Producto</span>
                 </div>
                 
                 <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                      <Plus className="w-4 h-4" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Nueva Característica</h4>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Descripción</label>
                        <input 
                          type="text" 
                          value={featureName} 
                          onChange={(e) => setFeatureName(e.target.value)} 
                          placeholder="Ej. Material 100% Algodón orgánico"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { if (!featureName) return; setFeatures([...features, { name: featureName }]); setFeatureName(''); }} 
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 h-[42px] self-end"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir</span>
                      </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {features.map((f, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500/30 transition-all">
                         <div className="flex items-center gap-3 flex-1">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                              {idx + 1}
                            </div>
                            <input 
                              type="text" 
                              value={f.name} 
                              onChange={(e) => setFeatures(fs => fs.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                              className="bg-transparent border-none text-gray-900 dark:text-white focus:ring-0 p-0 text-sm font-medium w-full"
                            />
                         </div>
                         <button onClick={() => setFeatures(fs => fs.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                    {features.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No has añadido características específicas todavía.</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Image Cropper Modal */}
  {croppingImage && (
    <ImageCropper 
      image={croppingImage.src}
      onCancel={() => setCroppingImage(null)}
      onCropComplete={handleCropComplete}
    />
  )}
</div>
  );
};

export default ProductFormPage;
