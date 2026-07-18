import React, { useState } from 'react';
import { 
  Palette, Plus, X, Trash2, AlertCircle, 
  CheckCircle2, Layers, ChevronDown 
} from 'lucide-react';
import SafeImage from '../SafeImage';
import { Color, Variant } from '../ProductFormPage';

interface VariantsTabProps {
  hasColors: boolean;
  setHasColors: (val: boolean) => void;
  colors: Color[];
  setColors: React.Dispatch<React.SetStateAction<Color[]>>;
  variants: Variant[];
  setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
  skus: any[];
  setSkus: React.Dispatch<React.SetStateAction<any[]>>;
  showAddColor: boolean;
  setShowAddColor: React.Dispatch<React.SetStateAction<boolean>>;
  colorName: string;
  setColorName: (val: string) => void;
  colorHex: string;
  setColorHex: (val: string) => void;
  colorInputError: string;
  setColorInputError: (val: string) => void;
  makeClientId: (prefix: string) => string;
  colorKeyOf: (c: any, idx: number) => string;
  variantKeyOf: (v: any, idx: number) => string;
  variantColorLinks: Record<string, string[] | null>;
  setVariantColorLinks: React.Dispatch<React.SetStateAction<Record<string, string[] | null>>>;
  sku: string;
  autoGenerateSkus: boolean;
  setAutoGenerateSkus: (val: boolean) => void;
  highlightSkuKey: string | null;
  dragOverVariantKey: string | null;
  setDragOverVariantKey: (val: string | null) => void;
  formatCurrency: (val: any) => string;
  mediaUrl: (val: any) => string;
  errors: any;
  inventoryQty?: string;
}

const VariantsTab: React.FC<VariantsTabProps> = ({
  hasColors,
  setHasColors,
  colors,
  setColors,
  variants,
  setVariants,
  skus,
  setSkus,
  showAddColor,
  setShowAddColor,
  colorName,
  setColorName,
  colorHex,
  setColorHex,
  colorInputError,
  setColorInputError,
  makeClientId,
  colorKeyOf,
  variantKeyOf,
  variantColorLinks,
  setVariantColorLinks,
  sku,
  autoGenerateSkus,
  setAutoGenerateSkus,
  highlightSkuKey,
  dragOverVariantKey,
  setDragOverVariantKey,
  formatCurrency,
  mediaUrl,
  errors,
  inventoryQty
}) => {
  const [highlightSkuKeyLocal, setHighlightSkuKeyLocal] = useState<string | null>(null);
  // Track which color cards are collapsed (by colorKey -> bool)
  const [collapsedColors, setCollapsedColors] = useState<Record<string, boolean>>({});
  const toggleColorCollapse = (key: string) => setCollapsedColors(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="lg:col-span-3 space-y-6">


      <div className="space-y-6">
          {/* Creador de Colores (header siempre visible si hay colores o toggle activo) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                <Palette className="w-4 h-4" />
                <span>Colores de Producto</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddColor(!showAddColor)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${showAddColor ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500'}`}
              >
                {showAddColor ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showAddColor ? 'Cerrar' : 'Agregar Color'}</span>
              </button>
            </div>

            {showAddColor && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 mb-6">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nombre del Color</label>
                    <input 
                      type="text" 
                      value={colorName} 
                      onChange={(e) => { setColorName(e.target.value); setColorInputError(''); }} 
                      placeholder="Ej. Negro Midnight" 
                      className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border ${colorInputError ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all`}
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Paleta</label>
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
                      if (!colorName.trim()) { setColorInputError('Nombre requerido'); return; }
                      const newColor: Color = { clientId: makeClientId('color'), name: colorName.trim(), hex: colorHex, images: [] };
                      
                      if (colors.length === 0 && variants.length === 0) {
                        const defaultVariant: Variant = { clientId: makeClientId('variant'), name: 'Única', extra_price: '0' };
                        setVariants(prev => [...prev, defaultVariant]);
                        setVariantColorLinks(prev => ({ ...prev, [defaultVariant.clientId as string]: [newColor.clientId as string] }));
                        setSkus([{
                          id: null,
                          colorId: null,
                          colorClientId: newColor.clientId,
                          variantId: null,
                          variantClientId: defaultVariant.clientId,
                          colorName: newColor.name,
                          variantName: defaultVariant.name,
                          sku: '',
                          useMainSku: true,
                          stock: inventoryQty || '0',
                          active: true
                        }]);
                      }

                      setColors((cols) => [...cols, newColor]); 
                      setColorName(''); setColorHex('#000000'); setColorInputError(''); setShowAddColor(false);
                    }} 
                    className="h-9 w-9 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    title="Guardar color"
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
            
            {colors.length === 0 && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-500">
                <Palette className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No has agregado colores. Haz clic en "Agregar Color" para iniciar.</p>
              </div>
            )}
          </div>

          {/* Listado de Tarjetas de Color — acordeón colapsable */}
          {colors.map((c, idx) => {
            const cKey = colorKeyOf(c, idx);
            const colorSkus = skus.filter(s => s.colorClientId === c.clientId || (s.colorId && String(s.colorId) === String(c.id)));
            const isCollapsed = !!collapsedColors[cKey];
            
            return (
              <div key={cKey} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Header del Color — clickeable para colapsar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4 p-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleColorCollapse(cKey)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{colorSkus.length} variante{colorSkus.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Inline color picker — stop propagation so it doesn't toggle collapse */}
                    <input
                      type="color"
                      value={c.hex}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); setColors((cols) => cols.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x)); }}
                      className="h-6 w-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 p-0"
                      title="Cambiar color"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setColors((cols) => cols.filter((_, i) => i !== idx)); setSkus(prev => prev.filter(s => s.colorClientId !== c.clientId && String(s.colorId) !== String(c.id))); }}
                      className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Eliminar color"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                  </div>
                </div>

                {/* Cuerpo colapsable */}
                {!isCollapsed && (
                  <div className="p-6 space-y-6 border-t border-gray-100 dark:border-gray-800">
                    {/* Imágenes de este Color */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imágenes del Color (Máx 4)</span>
                        <label className="flex items-center justify-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer transition-colors">
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Subir Fotos
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

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {(c.images || []).map((img: any, j) => (
                          <div key={`img-${j}`} className="relative group aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <SafeImage 
                              src={img.preview ? img.preview : mediaUrl(img.image)} 
                              alt="Color variant" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                              <button 
                                type="button" 
                                onClick={() => setColors((cols) => cols.map((x, i) => i === idx ? { ...x, images: (x.images || []).filter((_, k) => k !== j) } : x))} 
                                className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg pointer-events-auto"
                                title="Eliminar imagen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!c.images || c.images.length === 0) && (
                          <div className="col-span-full py-6 text-center text-gray-400 dark:text-gray-500 text-xs border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                            No se han subido fotos para este color.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Variantes del Color */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variantes y Tallas del Color</span>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ej. Talla L"
                            id={`new-var-input-${cKey}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const val = input.value.trim();
                                if (!val) return;
                                const existing = variants.find(v => v.name.toUpperCase() === val.toUpperCase());
                                let vKey = '';
                                if (!existing) {
                                  const clientV = makeClientId('variant');
                                  const newVar: Variant = { clientId: clientV, name: val, extra_price: '0' };
                                  setVariants(prev => [...prev, newVar]);
                                  vKey = clientV;
                                } else {
                                  vKey = existing.clientId ?? `variant-${existing.id}`;
                                }
                                setVariantColorLinks(prev => {
                                  const current = prev[vKey] || [];
                                  if (!current.includes(cKey)) {
                                    return { ...prev, [vKey]: [...current, cKey] };
                                  }
                                  return prev;
                                });
                                input.value = '';
                              }
                            }}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 outline-none w-36"
                          />

                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`new-var-input-${cKey}`) as HTMLInputElement;
                            const val = input?.value?.trim();
                            if (!val) return;
                            const existing = variants.find(v => v.name.toUpperCase() === val.toUpperCase());
                            let vKey = '';
                            if (!existing) {
                              const clientV = makeClientId('variant');
                              const newVar: Variant = { clientId: clientV, name: val, extra_price: '0' };
                              setVariants(prev => [...prev, newVar]);
                              vKey = clientV;
                            } else {
                              vKey = existing.clientId ?? `variant-${existing.id}`;
                            }
                            setVariantColorLinks(prev => {
                              const current = prev[vKey] || [];
                              if (!current.includes(cKey)) {
                                return { ...prev, [vKey]: [...current, cKey] };
                              }
                              return prev;
                            });
                            if (input) input.value = '';
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>

                    {colorSkus.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                              <th className="pb-2">Variante</th>
                              <th className="pb-2">Sobrecosto (+COP)</th>
                              <th className="pb-2">SKU Código</th>
                              <th className="pb-2">Stock</th>
                              <th className="pb-2 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {colorSkus.map((skuItem) => {
                              const matchSku = (s: any) => {
                                const c1 = s.colorClientId ?? (s.colorId ? `color-${s.colorId}` : null);
                                const c2 = skuItem.colorClientId ?? (skuItem.colorId ? `color-${skuItem.colorId}` : null);
                                const v1 = s.variantClientId ?? (s.variantId ? `variant-${s.variantId}` : null);
                                const v2 = skuItem.variantClientId ?? (skuItem.variantId ? `variant-${skuItem.variantId}` : null);
                                return c1 === c2 && v1 === v2;
                              };

                              return (
                                <tr key={skuItem.id || `${skuItem.colorClientId}-${skuItem.variantClientId}`} className={!skuItem.active ? 'opacity-50' : ''}>
                                  <td className="py-2.5">
                                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                      {skuItem.variantName || 'ÚNICA'}
                                    </span>
                                  </td>
                                  <td className="py-2.5">
                                    {(() => {
                                      const vObj = variants.find(v => v.clientId === skuItem.variantClientId || (v.id && String(v.id) === String(skuItem.variantId)));
                                      if (!vObj || skuItem.variantName === 'Única') {
                                        return <span className="text-gray-400 dark:text-gray-500 text-xs font-medium pl-4">—</span>;
                                      }
                                      return (
                                        <input
                                          type="number"
                                          value={vObj && Number(vObj.extra_price) !== 0 ? vObj.extra_price : ''}
                                          min={0}
                                          onChange={(e) => {
                                            if (!vObj) return;
                                            setVariants(prev => prev.map(v =>
                                              v.clientId === vObj.clientId || (v.id && String(v.id) === String(vObj.id))
                                                ? { ...v, extra_price: e.target.value }
                                                : v
                                            ));
                                          }}
                                          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none w-24 text-right"
                                          placeholder="0"
                                        />
                                      );
                                    })()}
                                  </td>
                                  <td className="py-2.5">
                                    <input 
                                      type="text" 
                                      value={skuItem.variantName === 'Única' ? sku : skuItem.sku}
                                      readOnly={skuItem.variantName === 'Única'}
                                      onChange={(e) => setSkus(prev => prev.map(s => matchSku(s) ? { ...s, sku: e.target.value.toUpperCase(), useMainSku: false } : s))}
                                      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none w-36 ${skuItem.variantName === 'Única' ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}`}
                                      placeholder={skuItem.useMainSku ? sku : "SKU"}
                                    />
                                  </td>
                                  <td className="py-2.5">
                                    <input 
                                      type="number" 
                                      value={Number(skuItem.stock) !== 0 ? skuItem.stock : ''}
                                      min={0}
                                      onChange={(e) => setSkus(prev => prev.map(s => matchSku(s) ? { ...s, stock: e.target.value } : s))}
                                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none w-20"
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {skuItem.variantName === 'Única' ? (
                                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium pr-3">—</span>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setSkus(prev => prev.map(s => matchSku(s) ? { ...s, active: !s.active } : s))}
                                            className={`p-1.5 rounded-lg transition-colors ${skuItem.active ? 'text-gray-400 hover:text-emerald-500' : 'text-gray-300 hover:text-gray-500'}`}
                                            title={skuItem.active ? 'Desactivar variación' : 'Activar variación'}
                                          >
                                            {skuItem.active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4" />}
                                          </button>
                                          {colorSkus.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setVariantColorLinks(prev => {
                                                  const vKey = skuItem.variantClientId ?? `variant-${skuItem.variantId}`;
                                                  const cKey = skuItem.colorClientId ?? `color-${skuItem.colorId}`;
                                                  const current = prev[vKey];
                                                  if (current == null) {
                                                    const allColors = colors.map((cc, ii) => colorKeyOf(cc, ii));
                                                    return { ...prev, [vKey]: allColors.filter(k => k !== cKey) };
                                                  }
                                                  return { ...prev, [vKey]: current.filter(k => k !== cKey) };
                                                });
                                              }}
                                              className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                                              title="Eliminar talla del color"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-xs">
                        No hay variantes/tallas agregadas a este color. Escribe una arriba y presiona enter.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
    </div>
  );
};

export default VariantsTab;
