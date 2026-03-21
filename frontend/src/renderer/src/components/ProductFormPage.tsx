import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Tag, 
  DollarSign, 
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
  GripVertical
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

interface ProductFormPageProps {
  token: string | null;
  apiBase: string;
  product?: any;
  onCancel?: () => void;
  onSaved?: () => void;
}

interface Color {
  id?: number;
  name: string;
  hex: string;
  stock: string | number;
  position?: number;
  images?: any[];
}

interface Variant {
  id?: number;
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
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [sku, setSku] = useState('');
  const [inventoryQty, setInventoryQty] = useState('0');
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
  const [colorStock, setColorStock] = useState('0');

  const [variants, setVariants] = useState<Variant[]>([]);
  const [initialVariants, setInitialVariants] = useState<Variant[]>([]);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('0');

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sections status for sidebar
  const sections = [
    { id: 'detalles', name: 'Información General', icon: Package, isComplete: name.trim() !== '' && price !== '' && categoryId !== '' },
    { id: 'imagenes', name: 'Imágenes', icon: ImageIcon, isComplete: productImages.length > 0 },
    { id: 'colores', name: 'Colores y Stock', icon: Palette, isComplete: colors.length > 0 },
    { id: 'variantes', name: 'Variantes', icon: Layers, isComplete: variants.length > 0 },
    { id: 'caracteristicas', name: 'Características', icon: CheckCircle2, isComplete: features.length > 0 },
  ];

  const authHeaders = (tkn: string | null): Record<string, string> => ({ 
    'Accept': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) 
  });

  const formatCurrency = (v: any) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };
  const normalizePrice = (v: any) => {
    const s = String(v).replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = s.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]) parts[1] = parts[1].slice(0, 2);
    return parts.join('.');
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
      
      // Caso 1: Hay colores y variantes
      if (colors.length > 0 && variants.length > 0) {
        colors.forEach(color => {
          variants.forEach(variant => {
            const existing = skus.find(s => s.colorName === color.name && s.variantName === variant.name);
            newSkus.push({
              id: existing?.id || null,
              colorName: color.name,
              variantName: variant.name,
              sku: existing?.sku || `${sku}-${color.name.substring(0,2)}-${variant.name.substring(0,2)}`.toUpperCase(),
              stock: existing?.stock || '0',
              active: existing?.active ?? true
            });
          });
        });
      } 
      // Caso 2: Solo colores
      else if (colors.length > 0) {
        colors.forEach(color => {
          const existing = skus.find(s => s.colorName === color.name && !s.variantName);
          newSkus.push({
            id: existing?.id || null,
            colorName: color.name,
            variantName: null,
            sku: existing?.sku || `${sku}-${color.name.substring(0,3)}`.toUpperCase(),
            stock: existing?.stock || color.stock || '0',
            active: existing?.active ?? true
          });
        });
      }
      // Caso 3: Solo variantes
      else if (variants.length > 0) {
        variants.forEach(variant => {
          const existing = skus.find(s => !s.colorName && s.variantName === variant.name);
          newSkus.push({
            id: existing?.id || null,
            colorName: null,
            variantName: variant.name,
            sku: existing?.sku || `${sku}-${variant.name.substring(0,3)}`.toUpperCase(),
            stock: existing?.stock || '0',
            active: existing?.active ?? true
          });
        });
      }

      setSkus(newSkus);
    }
  }, [colors, variants, sku, autoGenerateSkus]);

  useEffect(() => {
    const loadEditing = async () => {
      if (!product) return;
      setLoading(true);
      setName(product.name || '');
      setPrice(String(product.price || ''));
      setCostPrice(String(product.cost_price || '0'));
      setCategoryId(String(product.category || ''));
      setSku(product.sku || '');
      setInventoryQty(String(product.inventory_qty || '0'));
      setDescription(product.description || '');
      setActive(Boolean(product.active));
      
      // Load Images
      const initialImages: any[] = [];
      if (product.image) {
        initialImages.push({
          id: 'main-existing',
          image: product.image,
          isExisting: true,
          type: 'main'
        });
      }
      if (product.gallery && Array.isArray(product.gallery)) {
        product.gallery.forEach((img: any) => {
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
        const loaded = (Array.isArray(list) ? list : []).map((c: any, idx: number) => ({ id: c.id, name: c.name, hex: c.hex, stock: String(c.stock || '0'), position: idx, images: [] }));
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
        const loadedVars = varsList.map((v: any) => ({ id: v.id, name: v.name, extra_price: String(v.extra_price || '0'), position: v.position }));
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
          return {
            id: s.id,
            colorId: s.color,
            variantId: s.variant,
            colorName: colorObj?.name || null,
            variantName: variantObj?.name || null,
            sku: s.sku,
            stock: String(s.stock),
            active: s.active,
            price_override: s.price_override
          };
        });
        setSkus(loadedSkus);
        setInitialSkus(loadedSkus);
        if (loadedSkus.length > 0) setAutoGenerateSkus(false);

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

  const handleGenerateSKU = () => {
    if (!name.trim()) return;
    
    // Obtener prefijo de categoría (primeras 3 letras)
    const category = categories.find(c => String(c.id) === String(categoryId));
    const catPrefix = category ? category.name.substring(0, 3).toUpperCase() : 'PRD';
    
    // Obtener prefijo de nombre (primeras 3 letras de la primera palabra)
    const namePrefix = name.trim().split(' ')[0].substring(0, 3).toUpperCase();
    
    // Generar sufijo aleatorio de 4 dígitos
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    
    const newSku = `${catPrefix}-${namePrefix}-${randomSuffix}`;
    setSku(newSku);
    validateField('sku', newSku);
    
    // Limpiar error de SKU si existía
    if (errors.sku) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.sku;
        return newErrs;
      });
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
        return arrayMove(items, oldIndex, newIndex);
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

  const SortableImage = ({ id, src, onRemove, onCrop, isMain = false }: any) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id });

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
          isDragging ? 'opacity-50 scale-105 border-blue-500 shadow-2xl' : 
          isMain ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <img src={src} alt="Product" className="w-full h-full object-cover" />
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-1.5 left-1.5 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-500" />
        </div>

        {isMain && (
          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-md uppercase tracking-widest shadow-lg">Principal</div>
        )}

        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            type="button"
            onClick={onCrop}
            className="p-2 bg-white text-gray-900 rounded-lg hover:bg-blue-50 transition-colors shadow-lg active:scale-95"
            title="Recortar"
          >
            <Crop className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={onRemove}
            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg active:scale-95"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const validateClient = () => {
    const errs: any = {};
    // Relaxed regex to match backend - allowing almost any printable character
    const nameOk = name.trim().length > 0 && name.length <= 100;
    if (!nameOk) errs.name = 'Nombre requerido, máx 100 caracteres.';
    
    const priceNorm = normalizePrice(price);
    const priceNum = Number(priceNorm);
    if (!priceNorm || Number.isNaN(priceNum) || priceNum <= 0) errs.price = 'Precio debe ser positivo con 2 decimales.';
    
    if (description.length > 500) errs.description = 'Descripción máximo 500 caracteres.';
    if (!categories.find((c) => String(c.id) === String(categoryId))) errs.category = 'Debe seleccionar una categoría válida.';
    
    // SKU is optional but if present must be valid (relaxed validation)
    if (sku && sku.length > 50) errs.sku = 'SKU máximo 50 caracteres.';
    
    const inv = Number(inventoryQty);
    if (!Number.isInteger(inv) || inv < 0) errs.inventoryQty = 'Cantidad debe ser entero positivo.';
    
    if (productImages.length > 0) {
      const firstImg = productImages[0];
      if (firstImg.file) {
        const ok = ['image/jpeg','image/png','image/webp'].includes(firstImg.file.type);
        if (!ok) errs.image = 'Formato de imagen inválido (jpeg, png, webp).';
      }
    }
    
    if (colors.some((c) => !c.name || !/^#[0-9A-Fa-f]{6}$/.test(c.hex) || Number(c.stock) < 0 || !Number.isInteger(Number(c.stock)))) {
      errs.colors = 'Verifique nombre, HEX (#RRGGBB) y stock entero positivo de los colores.';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, forceDraft = false) => {
    if (e) e.preventDefault();
    if (!forceDraft && !validateClient()) return;
    
    setLoading(true);
    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', normalizePrice(price) || '0');
    fd.append('cost_price', normalizePrice(costPrice) || '0');
    fd.append('category', categoryId || '');
    fd.append('sku', sku || '');
    fd.append('inventory_qty', String(Number(inventoryQty || 0)));
    fd.append('description', description || '');
    fd.append('active', active ? 'true' : 'false');
    fd.append('is_draft', forceDraft ? 'true' : 'false');
    
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
    const res = await fetch(url, { method, headers: authHeaders(token), body: fd });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { detail: `Error inesperado (${res.status} ${res.statusText})` };
    }
    
    if (!res.ok) {
      const msg = data.detail || (product ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto');
      const newErrors: any = { form: msg };
      
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
                    if (key === 'inventory_qty') {
                        newErrors.inventoryQty = errorMsg;
                    } else {
                        newErrors[key] = errorMsg;
                    }
                }
            }
        });
      }
      setErrors(newErrors);
      return;
    }
    try {
      const productId = product ? product.id : data.id;
      const updatedColors: any[] = [];
      const updatedVariants: any[] = [];

      // Process Colors
      const existing = initialColors;
      const current = colors.map((c, idx) => ({ ...c, position: idx }));
      const currentIds = new Set(current.filter((e) => e.id).map((e) => String(e.id)));
      for (const eCol of existing) {
        if (eCol.id && !currentIds.has(String(eCol.id))) {
          await fetch(`${apiBase}/products/colors/${eCol.id}/`, { method: 'DELETE', headers: authHeaders(token) });
        }
      }
      for (let c of current) {
        let finalColorId = c.id;
        if (!c.id) {
          const fdColor = new FormData();
          fdColor.append('name', c.name);
          fdColor.append('hex', c.hex);
          fdColor.append('stock', String(Number(c.stock || 0)));
          fdColor.append('position', String(c.position));
          const createRes = await fetch(`${apiBase}/products/${productId}/colors/`, { method: 'POST', headers: authHeaders(token), body: fdColor });
          if (createRes.ok) {
            const created = await createRes.json();
            finalColorId = created.id;
            updatedColors.push(created);
          }
        } else {
          const prev = existing.find((e) => String(e.id) === String(c.id)) || {};
          const changed = prev.name !== c.name || prev.hex !== c.hex || String(prev.stock) !== String(c.stock) || Number(prev.position) !== Number(c.position);
          if (changed) {
            const fdColor = new FormData();
            fdColor.append('name', c.name);
            fdColor.append('hex', c.hex);
            fdColor.append('stock', String(Number(c.stock || 0)));
            fdColor.append('position', String(c.position));
            const upRes = await fetch(`${apiBase}/products/colors/${c.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdColor });
            if (upRes.ok) updatedColors.push(await upRes.json());
            else updatedColors.push(c);
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
      const existingVars = initialVariants;
      const currentVars = variants.map((v, idx) => ({ ...v, position: idx }));
      const currentVarIds = new Set(currentVars.filter((v) => v.id).map((v) => String(v.id)));

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
          if (resV.ok) updatedVariants.push(await resV.json());
        } else {
          const prev = existingVars.find((e) => String(e.id) === String(v.id));
          if (prev && (prev.name !== v.name || String(prev.extra_price) !== String(v.extra_price) || Number(prev.position) !== Number(v.position))) {
            const fdV = new FormData();
            fdV.append('name', v.name);
            fdV.append('extra_price', String(Number(v.extra_price || 0)));
            fdV.append('position', String(v.position));
            const resV = await fetch(`${apiBase}/products/variants/${v.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fdV });
            if (resV.ok) updatedVariants.push(await resV.json());
            else updatedVariants.push(v);
          } else {
            updatedVariants.push(v);
          }
        }
      }

      // Process SKUs (Combinations)
      const existingSkus = initialSkus;
      const currentSkus = skus;
      const currentSkuIds = new Set(currentSkus.filter(s => s.id).map(s => String(s.id)));

      // Delete removed combinations
      for (const es of existingSkus) {
        if (es.id && !currentSkuIds.has(String(es.id))) {
          await fetch(`${apiBase}/products/skus/${es.id}/`, { method: 'DELETE', headers: authHeaders(token) });
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
        const colorMatch = updatedColors.find((c: any) => c.name === s.colorName);
        const variantMatch = updatedVariants.find((v: any) => v.name === s.variantName);

        const payload: any = {
          sku: s.sku,
          stock: Number(s.stock || 0),
          active: s.active,
          color: colorMatch?.id || null,
          variant: variantMatch?.id || null,
          price_override: s.price_override || null
        };

        if (!s.id) {
          await fetch(`${apiBase}/products/${productId}/skus/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch(`${apiBase}/products/skus/${s.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify(payload)
          });
        }
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    }
    if (onSaved) onSaved();
  };

  return (
    <div className="min-h-full animate-in fade-in duration-500">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-900 dark:text-white font-medium">Cargando datos...</div>
          </div>
        </div>
      )}

      {/* Sticky Header - Improved for integration */}
      <div className="sticky top-[-24px] z-40 bg-white/80 dark:bg-[#0B0D14]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 py-4 mb-6 transition-all">
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Inventario Global</label>
                      <input 
                        type="number" 
                        value={inventoryQty} 
                        onChange={(e) => setInventoryQty(e.target.value)} 
                        min={0}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.inventoryQty ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                      />
                    </div>
                  </div>

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

              {/* Unified Pro Gallery Section */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4" />
                    <span>Galería Pro</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={productImages.map(img => img.id)}
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
                  
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex items-start gap-3">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                      <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                      <span className="font-bold">Tip Pro:</span> La imagen en la <span className="underline">primera posición</span> será la portada principal. Arrastra para reordenar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colores' && (
            <div className="lg:col-span-3 space-y-6">
               <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                      <Palette className="w-4 h-4" />
                      <span>Gestión de Colores</span>
                    </div>
                 </div>

                 {/* Add Color Form */}
                 <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                      <Plus className="w-4 h-4" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Nuevo Color</h4>
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre del Color</label>
                        <input 
                          type="text" 
                          value={colorName} 
                          onChange={(e) => { setColorName(e.target.value); setColorInputError(''); }} 
                          placeholder="Ej. Azul Midnight" 
                          className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${colorInputError ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all`}
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Color</label>
                        <div className="relative group">
                          <input 
                            type="color" 
                            value={colorHex} 
                            onChange={(e) => setColorHex(e.target.value)} 
                            className="h-10 w-full rounded-xl cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1"
                          />
                        </div>
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Stock</label>
                        <input 
                          type="number" 
                          value={colorStock} 
                          onChange={(e) => setColorStock(e.target.value)} 
                          min={0}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { 
                            if (!colorName) { setColorInputError('Nombre requerido'); return; }
                            setColors((cols) => [...cols, { name: colorName, hex: colorHex, stock: colorStock }]); 
                            setColorName(''); setColorHex('#000000'); setColorStock('0'); setColorInputError('');
                        }} 
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 h-[42px]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir</span>
                      </button>
                    </div>
                    {colorInputError && <p className="mt-2 text-xs text-rose-400 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {colorInputError}</p>}
                 </div>

                 {errors.colors && (
                    <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                        {errors.colors}
                    </div>
                 )}

                 {/* Color List */}
                 <div className="space-y-4">
                    {colors.map((c, idx) => (
                      <div key={`${c.id || 'new'}-${idx}`} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:border-gray-300 dark:hover:border-gray-600">
                        <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700/50">
                          <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" style={{ backgroundColor: c.hex }} />
                          
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input 
                              type="text" 
                              value={c.name} 
                              onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} 
                              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-500 text-sm">Hex:</span>
                              <input 
                                type="text" 
                                value={c.hex} 
                                onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x))} 
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none font-mono"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-500 text-sm">Stock:</span>
                              <input 
                                type="number" 
                                value={c.stock} 
                                onChange={(e) => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, stock: e.target.value } : x))} 
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <button 
                            type="button" 
                            onClick={() => setColors((cols) => cols.filter((x, i) => i !== idx))} 
                            className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Color Images */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imágenes de la Variante (Máx 4)</div>
                            <div className="w-48">
                              <label className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer transition-all">
                                <Plus className="w-3 h-3 mr-1.5" />
                                Agregar Imágenes
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
                                <img 
                                  src={img.preview ? img.preview : mediaUrl(img.image)} 
                                  alt="Color variant" 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    type="button" 
                                    onClick={() => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, images: (x.images || []).filter((_, k) => k !== j) } : x))} 
                                    className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
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
                    ))}
                    {colors.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-500">
                        <Palette className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No hay variantes de color agregadas.</p>
                      </div>
                    )}
                 </div>
                 {errors.colors && <p className="mt-3 text-sm text-rose-400">{errors.colors}</p>}
               </div>
            </div>
          )}

          {activeTab === 'variantes' && (
            <div className="lg:col-span-3 space-y-6">
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
                        onClick={() => { if (!variantName) return; setVariants([...variants, { name: variantName, extra_price: variantPrice }]); setVariantName(''); setVariantPrice('0'); }} 
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 h-[42px]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir</span>
                      </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                         <div className="flex items-center gap-4 flex-1">
                            <input 
                              type="text" 
                              value={v.name} 
                              onChange={(e) => setVariants(vars => vars.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                              className="bg-transparent border-none text-gray-900 dark:text-white focus:ring-0 p-0 text-sm font-medium w-full"
                            />
                         </div>
                         <div className="flex items-center gap-4">
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
                    ))}
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
                            <th className="px-4 pb-2">SKU Específico</th>
                            <th className="px-4 pb-2">Stock</th>
                            <th className="px-4 pb-2 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {skus.map((skuItem, idx) => (
                            <tr key={idx} className={`bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group ${!skuItem.active ? 'opacity-50' : ''}`}>
                              <td className="px-4 py-3 rounded-l-xl">
                                <div className="flex items-center gap-2">
                                  {skuItem.colorName && (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-bold">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.find(c => c.name === skuItem.colorName)?.hex }} />
                                      {skuItem.colorName}
                                    </span>
                                  )}
                                  {skuItem.variantName && (
                                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                                      {skuItem.variantName}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="text" 
                                  value={skuItem.sku}
                                  onChange={(e) => setSkus(prev => prev.map((s, i) => i === idx ? { ...s, sku: e.target.value.toUpperCase() } : s))}
                                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  value={skuItem.stock}
                                  onChange={(e) => setSkus(prev => prev.map((s, i) => i === idx ? { ...s, stock: e.target.value } : s))}
                                  className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/50 outline-none"
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
                          ))}
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
