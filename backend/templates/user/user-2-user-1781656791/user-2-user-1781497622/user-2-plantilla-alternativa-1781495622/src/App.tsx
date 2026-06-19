import React, { useState, useEffect, useRef } from "react";
import {Search, ShoppingBag, User, Heart, Menu, Phone, Mail, MapPin, Shield, Truck, RefreshCw, Star, ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import { useDraggable } from "./hooks/useDraggable";
import { ContextMenu } from "./components/ContextMenu";

interface AppSettings {
  company_name: string;
  company_description: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  logo?: string | null;
}

interface SectionData {
  announcement?: { text: string };
  header?: { nav_links: string[] };
  hero?: { badge: string; title: string; description: string; cta_primary: string; cta_secondary: string };
  advantages?: { items: { title: string; desc: string }[] };
  products?: { title: string; subtitle: string };
  banner?: { badge: string; title: string; description: string; cta: string };
  footer?: { city: string; phone: string; email: string };
}

interface SectionVisibility {
  announcement: boolean;
  header: boolean;
  hero: boolean;
  advantages: boolean;
  products: boolean;
  banner: boolean;
  footer: boolean;
}

const defaultSectionData: SectionData = {
  announcement: { text: "¡Envío gratis en compras superiores a $150,000 COP! | 3 cuotas sin interés" },
  header: { nav_links: ["Inicio", "Productos", "Categorías", "Nosotros", "Contacto"] },
  hero: {
    badge: "Nueva Colección 2026",
    title: "Eleva tu estilo con",
    description: "Descubre nuestra última selección exclusiva de productos premium creados para ti.",
    cta_primary: "Ver Catálogo",
    cta_secondary: "Conocer Más",
  },
  advantages: {
    items: [
      { title: "Envío Express", desc: "Entrega segura y rápida en todo el país" },
      { title: "Garantía Total", desc: "Protección en todas tus compras y pagos" },
      { title: "Cambios Libres", desc: "Devoluciones sencillas durante 15 días" },
      { title: "Soporte 24/7", desc: "Atención personalizada vía WhatsApp" },
    ],
  },
  products: { title: "Productos Destacados", subtitle: "Explora nuestros artículos más vendidos y mejor valorados por los usuarios." },
  banner: {
    badge: "Oferta Especial de Temporada",
    title: "Únete hoy y obtén un 15% de descuento",
    description: "Registra tu correo electrónico en nuestro boletín informativo y recibe ofertas exclusivas.",
    cta: "Suscribirme",
  },
  footer: { city: "Bogotá, Colombia", phone: "+57 300 123 4567", email: "contacto@tutienda.com" },
};

const defaultVisibility: SectionVisibility = {
  announcement: true,
  header: true,
  hero: true,
  advantages: true,
  products: true,
  banner: true,
  footer: true,
};

const EditableText = ({
  tag: Tag = 'span',
  value,
  section,
  field,
  className = '',
  position = { x: 0, y: 0 },
  styles = {},
  disableDrag = false
}: any) => {
  const { style, onPointerDown, onResizeDown, size } = useDraggable(section, field, position);
  const textRef = useRef<HTMLElement>(null);

  const dragStyles = disableDrag ? {} : { 
    ...style, 
    position: style.position || 'relative', 
    zIndex: style.zIndex || 10 
  };

  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);

  const customStyleProps = (section && field && typeof window !== 'undefined' && (window as any).__sectionData) 
    ? ((window as any).__sectionData[section]?.styles?.[field] || {}) 
    : {};

  const currentFontSize = styles.fontSize || customStyleProps.fontSize; // undefined by default
  const currentColor = styles.color || customStyleProps.color || 'inherit';
  const currentFontFamily = styles.fontFamily || customStyleProps.fontFamily || 'inherit';

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleStyleChange = (styleField: string, val: any) => {
    window.parent.postMessage({
      type: 'CANVAS_UPDATE_ELEMENT_STYLE',
      section,
      field,
      style: { [styleField]: val }
    }, '*');
  };

  const handleDelete = () => {
    window.parent.postMessage({
      type: 'INLINE_TEXT_UPDATE',
      section,
      field,
      value: ''
    }, '*');
  };

  if (disableDrag) {
    return (
      <>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            currentColor={currentColor !== 'inherit' ? currentColor : undefined}
            currentFontSize={currentFontSize}
            currentFontFamily={currentFontFamily !== 'inherit' ? currentFontFamily : undefined}
            currentTextAlign={currentTextAlign !== 'inherit' ? currentTextAlign : undefined}
            currentAlignItems={currentAlignItems !== 'inherit' ? currentAlignItems : undefined}
            currentFontWeight={currentFontWeight !== 'inherit' ? currentFontWeight : undefined}
            currentFontStyle={currentFontStyle !== 'inherit' ? currentFontStyle : undefined}
            currentTextDecoration={currentTextDecoration !== 'inherit' ? currentTextDecoration : undefined}
            currentBackgroundColor={currentBackgroundColor !== 'transparent' ? currentBackgroundColor : undefined}
            onChange={handleStyleChange}
            onDelete={handleDelete}
          />
        )}
        {(() => {
          let finalClassName = className;
          if (currentBackgroundColor !== 'transparent') {
            finalClassName = finalClassName
              .replace(/\bbg-\S+/g, '')
              .replace(/\bhover:bg-\S+/g, '');
          }
          if (currentColor !== 'inherit') {
            finalClassName = finalClassName
              .replace(/\btext-\S+/g, '')
              .replace(/\bhover:text-\S+/g, '');
          }
          return (
            <Tag
              ref={textRef}
              contentEditable
              suppressContentEditableWarning
              onContextMenu={handleContextMenu}
              className={`outline-none hover:outline-dashed hover:outline-1 hover:outline-gray-400 focus:outline-solid focus:ring-2 focus:ring-[var(--primary)] rounded px-1 -mx-1 transition-all ${finalClassName} ${getAlignmentClasses()}`}
              style={{
                 fontSize: currentFontSize ? `${currentFontSize}px` : undefined,
                 color: currentColor !== 'inherit' ? currentColor : undefined,
                 backgroundColor: currentBackgroundColor !== 'transparent' ? currentBackgroundColor : undefined,
                 fontFamily: currentFontFamily !== 'inherit' ? currentFontFamily : undefined,
                 textAlign: currentTextAlign !== 'inherit' ? currentTextAlign : undefined,
                 fontWeight: currentFontWeight !== 'inherit' ? currentFontWeight : undefined,
                 fontStyle: currentFontStyle !== 'inherit' ? currentFontStyle : undefined,
                 textDecoration: currentTextDecoration !== 'inherit' ? currentTextDecoration : undefined,
              }}
              onBlur={(e: React.FocusEvent<HTMLElement>) => {
                const newVal = e.currentTarget.innerText;
                if (newVal !== value) {
                  window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section, field, value: newVal }, '*');
                }
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
              }}
            >
              {value}
            </Tag>
          );
        })()}
      </>
    );
  }

  return (
    <span 
      className={`relative group/drag inline-block`} 
      style={dragStyles}
      onContextMenu={handleContextMenu}
    >
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          currentColor={currentColor !== 'inherit' ? currentColor : undefined}
          currentFontSize={currentFontSize}
          currentFontFamily={currentFontFamily !== 'inherit' ? currentFontFamily : undefined}
          onChange={handleStyleChange}
          onDelete={handleDelete}
        />
      )}

      {!disableDrag && (
        <>
          {/* Wireframe X and Size overlay */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity z-40 bg-blue-500/10 border border-blue-400 border-dashed overflow-hidden">
            <svg className="absolute inset-0 w-full h-full text-blue-500/30" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Resize handles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity z-50">
            <div onPointerDown={onResizeDown('nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize pointer-events-auto" />
            <div onPointerDown={onResizeDown('n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize pointer-events-auto" />
            <div onPointerDown={onResizeDown('ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize pointer-events-auto" />
            
            <div onPointerDown={onResizeDown('w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize pointer-events-auto" />
            <div onPointerDown={onResizeDown('e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize pointer-events-auto" />
            
            <div onPointerDown={onResizeDown('sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize pointer-events-auto" />
            <div onPointerDown={onResizeDown('s')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize pointer-events-auto" />
            <div onPointerDown={onResizeDown('se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize pointer-events-auto" />
          </div>

          {/* Center Drag handle */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-blue-500 text-white text-[10px] font-mono border border-blue-600 rounded shadow-lg cursor-move opacity-0 group-hover/drag:opacity-100 transition-opacity z-50 flex items-center justify-center pointer-events-auto whitespace-nowrap"
            onPointerDown={onPointerDown}
            onClick={(e) => e.stopPropagation()}
            title="Arrastrar para mover"
          >
            <span className="mr-1">✥</span>
            {size.w !== undefined ? `${Math.round(size.w)} x ${Math.round(size.h || 0)}` : 'Mover'}
          </div>
        </>
      )}

      <Tag
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        className={`outline-none hover:outline-dashed hover:outline-1 hover:outline-gray-400 focus:outline-solid focus:ring-2 focus:ring-[var(--primary)] rounded px-1 -mx-1 transition-all inline-block ${className} ${!disableDrag ? 'w-full h-full overflow-hidden flex items-center justify-center' : ''}`}
        style={{
           fontSize: currentFontSize ? `${currentFontSize}px` : undefined,
           color: currentColor !== 'inherit' ? currentColor : undefined,
           backgroundColor: currentBackgroundColor !== 'transparent' ? currentBackgroundColor : undefined,
           fontFamily: currentFontFamily !== 'inherit' ? currentFontFamily : undefined,
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const newVal = e.currentTarget.innerText;
          if (newVal !== value) {
            window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section, field, value: newVal }, '*');
          }
        }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
      >
        {value}
      </Tag>
          );
        })()}
    </span>
  )
}

// Componente para Mover Bloques Completos (Botones, Imagenes)
const DraggableContainer = ({ section, field, position, children, className = '' }: any) => {
  const { style, onPointerDown, onResizeDown, size } = useDraggable(section, field, position);

  return (
    <div className={`relative group/drag inline-block ${className}`} style={{ ...style, position: style.position || 'relative', zIndex: style.zIndex || 10 }}>
      
      {/* Wireframe X and Size overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity z-40 bg-blue-500/10 border border-blue-400 border-dashed overflow-hidden">
        <svg className="absolute inset-0 w-full h-full text-blue-500/30" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Resize handles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity z-50">
        <div onPointerDown={onResizeDown('nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize pointer-events-auto" />
        <div onPointerDown={onResizeDown('n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize pointer-events-auto" />
        <div onPointerDown={onResizeDown('ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize pointer-events-auto" />
        
        <div onPointerDown={onResizeDown('w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize pointer-events-auto" />
        <div onPointerDown={onResizeDown('e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize pointer-events-auto" />
        
        <div onPointerDown={onResizeDown('sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize pointer-events-auto" />
        <div onPointerDown={onResizeDown('s')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize pointer-events-auto" />
        <div onPointerDown={onResizeDown('se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize pointer-events-auto" />
      </div>

      {/* Center Drag handle with Size Display */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-blue-500 text-white text-[10px] font-mono border border-blue-600 rounded shadow-lg cursor-move opacity-0 group-hover/drag:opacity-100 transition-opacity z-50 flex items-center justify-center pointer-events-auto whitespace-nowrap"
        onPointerDown={onPointerDown}
        onClick={(e) => e.stopPropagation()}
        title="Arrastrar para mover"
      >
        <span className="mr-1">✥</span>
        {size.w !== undefined ? `${Math.round(size.w)} x ${Math.round(size.h || 0)}` : 'Mover'}
      </div>

      {children}
    </div>
  )
}

// Componente para Controles Flotantes
const SectionControls = ({ section, isSelected }: { section: string, isSelected: boolean }) => {
  if (!isSelected) return null;
  return (
    <div className="absolute top-2 right-2 flex gap-1 z-50">
       <button 
         onClick={(e) => { e.stopPropagation(); window.parent.postMessage({type: 'CANVAS_SECTION_MOVE_UP', section}, '*'); }} 
         className="p-1.5 bg-white border border-gray-300 rounded shadow-md hover:bg-gray-100 text-gray-700 transition-colors" 
         title="Mover arriba"
       >
         <ArrowUp className="w-4 h-4" />
       </button>
       <button 
         onClick={(e) => { e.stopPropagation(); window.parent.postMessage({type: 'CANVAS_SECTION_MOVE_DOWN', section}, '*'); }} 
         className="p-1.5 bg-white border border-gray-300 rounded shadow-md hover:bg-gray-100 text-gray-700 transition-colors" 
         title="Mover abajo"
       >
         <ArrowDown className="w-4 h-4" />
       </button>
       <button 
         onClick={(e) => { e.stopPropagation(); window.parent.postMessage({type: 'CANVAS_SECTION_DELETE', section}, '*'); }} 
         className="p-1.5 bg-white border border-red-300 rounded shadow-md hover:bg-red-50 text-red-600 transition-colors" 
         title="Eliminar sección"
       >
         <Trash2 className="w-4 h-4" />
       </button>
    </div>
  )
}

const InsertDivider = ({ index }: { index: number }) => {
  return (
    <div className="w-full flex justify-center group my-[-12px] relative z-40">
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-full h-px bg-custom-primary/50" />
         <button 
           onClick={() => window.parent.postMessage({ type: 'CANVAS_REQUEST_INSERT', index }, '*')}
           className="absolute px-3 py-1 bg-custom-primary text-white text-xs rounded-full font-medium shadow-md hover:scale-105 transition-transform cursor-pointer"
         >
           + Añadir Sección
         </button>
      </div>
      <div className="h-6 w-full cursor-pointer" />
    </div>
  )
}

export default function App() {
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const [receivedConfig, setReceivedConfig] = useState(!isIframe);

  const [settings, setSettings] = useState<AppSettings>({
    company_name: "Mi Tienda Virtual",
    company_description: "La mejor selección de productos de alta calidad para ti.",
    primary_color: "#3b82f6",
    secondary_color: "#f3f4f6",
    font_family: "Inter",
  });

  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [sectionsConfig, setSectionsConfig] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [headerIdForModal, setHeaderIdForModal] = useState<string | null>(null);

  // Sync state to global so EditableText can read it during its own render
  if (typeof window !== 'undefined') {
    (window as any).__sectionData = sectionData;
  }

  const applySettings = (data: any) => {
    if (!data) return;
    setSettings(prev => ({
      ...prev,
      company_name: data.company_name ?? prev.company_name,
      company_description: data.company_description ?? prev.company_description,
      primary_color: data.primary_color ?? prev.primary_color,
      secondary_color: data.secondary_color ?? prev.secondary_color,
      font_family: data.font_family ?? prev.font_family,
      logo: data.logo !== undefined ? data.logo : prev.logo,
    }));
  };

  useEffect(() => {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (!isIframe) {
      const apiBase = window.location.hostname === "localhost" ? "http://localhost:8000" : "";
      fetch(`${apiBase}/webconfig/settings/`)
        .then(res => res.json())
        .then(data => applySettings(data))
        .catch(() => {});
    }

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};

      if (type === "SETTINGS_CHANGED") {
        applySettings(payload);
      }

      if (type === "SECTION_UPDATE") {
        const { section, data } = payload || {};
        if (section) {
          setSectionData(prev => ({
            ...prev,
            [section]: data,
          }));
        }
      }

      if (type === "SECTIONS_CONFIG") {
         const { sections } = payload || {};
         if (sections && Array.isArray(sections)) {
            setSectionsConfig(sections);
            setReceivedConfig(true);
         }
      }

      if (type === "SECTION_FOCUS") {
        const { section } = payload || {};
        setSelectedSection(section);
        if (section) {
          const el = document.querySelector(`[data-section="${section}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      if (type === "EDITOR_PING") {
        event.source?.postMessage({ type: "EDITOR_PONG" }, { targetOrigin: "*" });
      }
    };

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "TEMPLATE_READY" }, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const apiBase = typeof window !== 'undefined' && window.location.hostname === "localhost" ? "http://localhost:8000" : "";
    const fetchProducts = async () => {
      try {
        const headers: any = {};
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const url = authToken 
          ? `${apiBase}/products/?page_size=4` 
          : `${apiBase}/webconfig/public/products/?site=${window.location.hostname}&page_size=4`;
          
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const productsList = data.results || data;
          if (Array.isArray(productsList)) {
            setDbProducts(productsList);
          }
        }
      } catch (err) {
        console.error("Error fetching products from database:", err);
      }
    };
    fetchProducts();
  }, [authToken]);

  // Forward keyboard shortcuts to parent editor (Undo/Redo/Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { 
        e.preventDefault(); 
        window.parent.postMessage({ type: 'EDITOR_UNDO' }, '*');
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { 
        e.preventDefault(); 
        window.parent.postMessage({ type: 'EDITOR_REDO' }, '*');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { 
        e.preventDefault(); 
        window.parent.postMessage({ type: 'EDITOR_SAVE' }, '*');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const customStyles = {
    "--primary": settings.primary_color,
    "--secondary": settings.secondary_color,
    fontFamily: `'${settings.font_family}', sans-serif`,
  } as React.CSSProperties;

  const sectionStyle = (id: string, data?: any) => ({
    outline: selectedSection === id ? "2px solid var(--primary)" : "none",
    outlineOffset: "-2px",
    transition: "outline 0.2s",
    paddingTop: data?.paddingTop !== undefined ? `${data.paddingTop}px` : undefined,
    paddingBottom: data?.paddingBottom !== undefined ? `${data.paddingBottom}px` : undefined,
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const sectionEl = target.closest('[data-section]');
    if (sectionEl) {
      if (target.tagName.toLowerCase() === 'a' || target.closest('a')) {
        e.preventDefault();
      }
      const sectionName = sectionEl.getAttribute('data-section');
      if (sectionName) {
        window.parent.postMessage({ type: 'CANVAS_SECTION_CLICKED', section: sectionName }, '*');
      }
    }
  };

  const renderSection = (section: any) => {
    if (!section.visible) return null;
    const { id, type } = section;
    const isSelected = selectedSection === id;
    
    // Merge with default data
    const defaultDataEntry = Object.entries(defaultSectionData).find(([k]) => k.startsWith(type));
    const defaultData = defaultDataEntry ? defaultDataEntry[1] : {};
    const data = { ...defaultData, ...(sectionData[id] || {}) };

    switch (type) {
      case 'announcement':
        return (
          <div key={id} data-section={id} style={sectionStyle(id, data)} className="relative bg-custom-primary text-white text-xs py-2 text-center font-medium px-4">
            <SectionControls section={id} isSelected={isSelected} />
            <EditableText tag="div" value={data.text} section={id} field="text" position={data.positions?.text} />
          </div>
        );
        
      case 'header':
        return (
          <header key={id} data-section={id} style={sectionStyle(id, data)} className="relative sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
            <SectionControls section={id} isSelected={isSelected} />
            
            {/* Top Bar Contact/Promo */}
            <div className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 py-1.5">
              <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-custom-primary" />
                    <EditableText tag="span" value={data.top_phone !== undefined ? data.top_phone : "+57 300 123 4567"} section={id} field="top_phone" disableDrag={true} />
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Mail className="w-3 h-3 text-custom-primary" />
                    <EditableText tag="span" value={data.top_email !== undefined ? data.top_email : "contacto@tienda.com"} section={id} field="top_email" disableDrag={true} />
                  </span>
                </div>
                <div>
                  <EditableText tag="span" value={data.top_promo !== undefined ? data.top_promo : "⚡ 10% OFF en tu primera compra"} section={id} field="top_promo" disableDrag={true} />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                  <Menu className="h-6 w-6" />
                </button>
                <div 
                  className="flex items-center gap-2 cursor-pointer border border-dashed border-transparent hover:border-custom-primary/50 p-1 rounded-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeaderIdForModal(id);
                    setLogoModalOpen(true);
                  }}
                  title="Configurar Logo"
                >
                  {settings.logo ? (
                    <img src={settings.logo} alt={settings.company_name} className="h-10 object-contain" />
                  ) : (
                    <span className="text-xl font-black tracking-tight text-custom-primary">
                      {settings.company_name}
                    </span>
                  )}
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
                {["Inicio", "Productos", "Categorías", "Nosotros", "Contacto"].map((defaultLink, i) => {
                  const val = data[`nav_link_${i}`] !== undefined ? data[`nav_link_${i}`] : defaultLink;
                  if (val === '') return null;
                  return (
                    <EditableText
                      key={i}
                      tag="span"
                      value={val}
                      section={id}
                      field={`nav_link_${i}`}
                      disableDrag={true}
                      className="hover:text-custom-primary transition-colors cursor-pointer"
                    />
                  );
                })}
              </nav>
              <div 
                className="flex items-center gap-1.5 cursor-pointer border border-dashed border-transparent hover:border-custom-primary/50 p-1 rounded-lg transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeaderIdForModal(id);
                  setLogoModalOpen(true);
                }}
                title="Configurar Iconos"
              >
                {(data.show_search !== false) && (
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Search className="h-5 w-5" /></button>
                )}
                {(data.show_user !== false) && (
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><User className="h-5 w-5" /></button>
                )}
                {(data.show_heart !== false) && (
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Heart className="h-5 w-5" /></button>
                )}
                {(data.show_cart !== false) && (
                  <button className="p-2 bg-custom-primary text-white rounded-full flex items-center justify-center relative shadow-md">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        );

      case 'hero':
        return (
          <section key={id} data-section={id} style={sectionStyle(id, data)} className="relative bg-gray-50 py-20 px-4 overflow-hidden border-b border-gray-100">
            <SectionControls section={id} isSelected={isSelected} />
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-12">
              <div className="space-y-6">
                <EditableText 
                  tag="span" 
                  value={data.badge} 
                  section={id} 
                  field="badge"
                  position={data.positions?.badge}
                  styles={data.styles?.badge}
                  className="inline-block bg-custom-primary/10 text-custom-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" 
                />
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-gray-900">
                  <EditableText tag="span" value={data.title} section={id} field="title" position={data.positions?.title} styles={data.styles?.title} />{' '}
                  <EditableText 
                    tag="span" 
                    value={settings.company_name} 
                    section="settings" 
                    field="company_name" 
                    disableDrag={true} 
                    className="text-custom-primary"
                  />
                </h1>
                
                <EditableText 
                  tag="p" 
                  value={data.description} 
                  section={id} 
                  field="description"
                  position={data.positions?.description}
                  styles={data.styles?.description}
                  className="text-lg text-gray-600 leading-relaxed max-w-lg block" 
                />
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <DraggableContainer section={id} field="btn_primary" position={data.positions?.btn_primary}>
                      <EditableText 
                        disableDrag 
                        tag="span" 
                        value={data.cta_primary} 
                        section={id} 
                        field="cta_primary" 
                        styles={data.styles?.cta_primary} 
                        className="px-8 py-4 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all w-full h-full inline-flex items-center justify-center cursor-pointer bg-custom-primary text-white shadow-custom-primary/30"
                      />
                    </DraggableContainer>
                  <DraggableContainer section={id} field="btn_secondary" position={data.positions?.btn_secondary}>
                      <EditableText 
                        disableDrag 
                        tag="span" 
                        value={data.cta_secondary} 
                        section={id} 
                        field="cta_secondary" 
                        styles={data.styles?.cta_secondary} 
                        className={`px-8 py-4 rounded-xl font-bold shadow-sm border hover:-translate-y-1 transition-all w-full h-full inline-flex items-center justify-center cursor-pointer ${isBgDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'}`}
                      />
                    </DraggableContainer>
                </div>
              </div>
              <DraggableContainer section={id} field="image_hero" position={data.positions?.image_hero} className="w-full">
                <div 
                  className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center text-gray-400 font-mono text-sm group cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); window.parent.postMessage({ type: 'CANVAS_IMAGE_CLICKED', section: id }, '*'); }}
                >
                  {data.image ? (
                    <img src={data.image} alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                      [ CLIC PARA CAMBIAR IMAGEN HERO ]
                    </div>
                  )}
                </div>
              </DraggableContainer>
            </div>
          </section>
        );

      case 'advantages':
        return (
          <section key={id} data-section={id} style={sectionStyle(id, data)} className="relative py-16 bg-white border-b border-gray-100">
            <SectionControls section={id} isSelected={isSelected} />
            <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(data.items || []).map((advItem: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 shrink-0 bg-custom-primary/10 text-custom-primary rounded-xl flex items-center justify-center">
                    {i === 0 ? <Truck className="w-6 h-6" /> : i === 1 ? <Shield className="w-6 h-6" /> : i === 2 ? <RefreshCw className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{advItem.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{advItem.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'products':
        return (
          <section key={id} data-section={id} style={sectionStyle(id, data)} className="relative py-20 bg-gray-50 px-4 border-b border-gray-100">
            <SectionControls section={id} isSelected={isSelected} />
            
            {/* Hidden inputs for product image uploads */}
            <div className="hidden">
              {[1, 2, 3, 4].map(i => (
                <input
                  key={i}
                  id={`product-image-upload-${i}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const MAX_SIZE = 15 * 1024 * 1024; // 15MB
                      if (file.size > MAX_SIZE) {
                        alert('El archivo supera el límite de 15MB.');
                        return;
                      }

                      const apiBase = window.location.hostname === "localhost" ? "http://localhost:8000" : "";
                      const formData = new FormData();
                      formData.append('file', file);

                      const xhr = new XMLHttpRequest();
                      xhr.open('POST', `${apiBase}/webconfig/media/upload/`);
                      
                      const token = authTokenRef.current;
                      if (token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                      }

                      xhr.onloadstart = () => {
                        setUploadingText(`Subiendo Imagen del Producto ${i}...`);
                        setIsUploadingVideo(true);
                        setVideoUploadProgress(0);
                      };

                      xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                          setVideoUploadProgress(Math.round((event.loaded / event.total) * 100));
                        }
                      };

                      xhr.onload = () => {
                        setIsUploadingVideo(false);
                        if (xhr.status === 201) {
                          try {
                            const resp = JSON.parse(xhr.responseText);
                            if (resp.url) {
                              window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section: id, field: `product_image_${i}`, value: resp.url }, '*');
                            }
                          } catch (err) {
                            alert('Error al procesar la respuesta del servidor.');
                          }
                        } else {
                          try {
                            const errResp = JSON.parse(xhr.responseText || '{}');
                            alert(errResp.detail || 'Error al subir la imagen.');
                          } catch (e) {
                            alert('Error en la subida.');
                          }
                        }
                      };
                      
                      xhr.onerror = () => {
                        setIsUploadingVideo(false);
                        alert('Error de red al subir la imagen.');
                      };

                      xhr.send(formData);
                    }
                  }}
                />
              ))}
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <EditableText tag="h2" value={data.title} section={id} field="title" position={data.positions?.title} className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4 block" />
                <EditableText tag="p" value={data.subtitle} section={id} field="subtitle" position={data.positions?.subtitle} className="text-gray-600 block" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dbProducts.length > 0 ? (
                  dbProducts.map((prod) => (
                    <div key={prod.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all group">
                      <div className="aspect-[4/5] rounded-2xl bg-gray-100 mb-4 relative overflow-hidden flex items-center justify-center cursor-pointer group/img">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-gray-400 text-[10px]">SIN IMAGEN</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-red-500 cursor-pointer">
                          <Heart className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2 text-amber-400">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                        <span className="text-gray-400 text-[10px] ml-1">(128)</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 block">
                        <span className="hover:text-custom-primary cursor-text block">{prod.name}</span>
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-custom-primary">
                          ${parseFloat(prod.price).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </span>
                        <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-custom-primary hover:text-white transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all group">
                      <div 
                        className="aspect-[4/5] rounded-2xl bg-gray-100 mb-4 relative overflow-hidden flex items-center justify-center cursor-pointer group/img"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById(`product-image-upload-${i}`)?.click();
                        }}
                        title="Haz clic para cambiar la imagen del producto"
                      >
                        {data[`product_image_${i}`] ? (
                          <img src={data[`product_image_${i}`]} alt={`Producto ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-gray-300 font-mono text-xs mb-2">[ CLIC PARA CAMBIAR ]</span>
                            <span className="text-gray-400 text-[10px]">IMG PRODUCTO {i}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                          Cambiar Imagen
                        </div>
                        <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-red-500 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <Heart className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2 text-amber-400">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                        <span className="text-gray-400 text-[10px] ml-1">(128)</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 block">
                        <EditableText 
                          tag="span" 
                          value={data[`product_name_${i}`] !== undefined ? data[`product_name_${i}`] : `Producto Premium ${i}`} 
                          section={id} 
                          field={`product_name_${i}`} 
                          disableDrag={true} 
                          className="hover:text-custom-primary cursor-text block"
                        />
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-custom-primary">
                          <EditableText 
                            tag="span" 
                            value={data[`product_price_${i}`] !== undefined ? data[`product_price_${i}`] : "$120,000"} 
                            section={id} 
                            field={`product_price_${i}`} 
                            disableDrag={true} 
                            className="cursor-text"
                          />
                        </span>
                        <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-custom-primary hover:text-white transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        );

      case 'banner':
        return (
          <section key={id} data-section={id} style={sectionStyle(id, data)} className="relative py-16 bg-white px-4 border-b border-gray-100">
            <SectionControls section={id} isSelected={isSelected} />
            <div className="max-w-7xl mx-auto rounded-3xl bg-custom-primary p-8 md:p-16 text-white grid md:grid-cols-2 items-center gap-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white_20%,transparent)]" />
              <div className="space-y-5 relative z-10">
                <EditableText tag="span" value={data.badge} section={id} field="badge" position={data.positions?.badge} className="text-xs uppercase font-extrabold tracking-widest text-amber-400" />
                <EditableText tag="h2" value={data.title} section={id} field="title" position={data.positions?.title} className="text-3xl md:text-5xl font-black tracking-tight leading-tight block" />
                <EditableText tag="p" value={data.description} section={id} field="description" position={data.positions?.description} className="text-white/80 text-sm md:text-base block" />
                <form className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-md" onClick={(e) => e.preventDefault()}>
                  <input type="email" placeholder="tu@correo.com" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
                  <DraggableContainer section={id} field="btn_banner" position={data.positions?.btn_banner}>
                    <EditableText 
                      disableDrag 
                      tag="span" 
                      value={data.cta} 
                      section={id} 
                      field="cta" 
                      styles={data.styles?.cta} 
                      className="px-6 py-3 bg-white text-custom-primary hover:bg-gray-100 font-bold rounded-xl text-sm transition-all shadow-lg w-full h-full inline-flex items-center justify-center cursor-pointer"
                    />
                  </DraggableContainer>
                </form>
              </div>
              <DraggableContainer section={id} field="image_banner" position={data.positions?.image_banner} className="w-full">
                <div 
                  className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center text-white/50 font-mono text-sm group cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); window.parent.postMessage({ type: 'CANVAS_IMAGE_CLICKED', section: id }, '*'); }}
                >
                  {data.image ? (
                    <img src={data.image} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
                      [ CLIC PARA CAMBIAR IMAGEN BANNER ]
                    </div>
                  )}
                </div>
              </DraggableContainer>
            </div>
          </section>
        );

      case 'footer':
        return (
          <footer key={id} data-section={id} style={sectionStyle(id, data)} className="relative bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
            <SectionControls section={id} isSelected={isSelected} />
            <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
              <div className="space-y-4">
                <EditableText 
                  tag="h3" 
                  value={settings.company_name} 
                  section="settings" 
                  field="company_name" 
                  disableDrag={true} 
                  className="text-white font-black text-lg tracking-tight"
                />
                <p className="text-xs leading-relaxed">{settings.company_description}</p>
                <div className="flex gap-3 text-xs text-white">
                  <a href="#" className="hover:underline">Instagram</a>
                  <a href="#" className="hover:underline">Facebook</a>
                  <a href="#" className="hover:underline">WhatsApp</a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Categorías</h4>
                <ul className="space-y-2 text-xs">
                  {["Tecnología", "Moda & Calzado", "Hogar & Decoración", "Deportes"].map(c => (
                    <li key={c}><a href="#" className="hover:text-white transition-colors">{c}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Soporte</h4>
                <ul className="space-y-2 text-xs">
                  {["Preguntas Frecuentes", "Políticas de Envío", "Términos del Servicio", "Privacidad"].map(s => (
                    <li key={s}><a href="#" className="hover:text-white transition-colors">{s}</a></li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Contacto</h4>
                <div className="flex items-center gap-2 text-xs"><MapPin className="h-4 w-4 shrink-0 text-custom-primary" /><span>{data.city}</span></div>
                <div className="flex items-center gap-2 text-xs"><Phone className="h-4 w-4 shrink-0 text-custom-primary" /><span>{data.phone}</span></div>
                <div className="flex items-center gap-2 text-xs"><Mail className="h-4 w-4 shrink-0 text-custom-primary" /><span className="truncate">{data.email}</span></div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
              <p>© {new Date().getFullYear()} {settings.company_name}. Todos los derechos reservados.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">Términos</a>
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </footer>
        );
      default:
        return null;
    }
  };

  if (!receivedConfig) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div style={customStyles} className="min-h-screen bg-white text-gray-900 flex flex-col" onClick={handleCanvasClick}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Poppins:wght@400;600;700;900&family=Roboto:wght@400;700&family=Outfit:wght@400;600;700;900&family=Playfair+Display:wght@400;700;900&display=swap');
        :root {
          --primary: ${settings.primary_color};
          --secondary: ${settings.secondary_color};
        }
        .bg-custom-primary { background-color: var(--primary) !important; }
        .text-custom-primary { color: var(--primary) !important; }
        .border-custom-primary { border-color: var(--primary) !important; }
        .bg-custom-secondary { background-color: var(--secondary) !important; }
        .text-custom-secondary { color: var(--secondary) !important; }
        
        /* Efectos de Hover interactivos para el editor */
        [data-section] {
          position: relative;
          transition: all 0.2s ease-in-out;
        }
        [data-section]:hover { 
          outline: 2px solid var(--primary); 
          outline-offset: -2px; 
          cursor: pointer;
          z-index: 40;
        }
      `}</style>
      
      {sectionsConfig.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-gray-50/50">
          <div className="max-w-md p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col items-center">
            <div className="w-16 h-16 bg-custom-primary/10 text-custom-primary rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Lienzo en Blanco</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
              Esta plantilla está completamente vacía. Comienza a diseñar agregando tu primera sección.
            </p>
            <button
              onClick={() => window.parent.postMessage({ type: 'CANVAS_REQUEST_INSERT', index: 0 }, '*')}
              className="px-6 py-3 bg-custom-primary text-white rounded-xl font-bold shadow-lg shadow-custom-primary/25 hover:scale-105 hover:shadow-custom-primary/35 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Añadir Sección
            </button>
          </div>
        </div>
      ) : (
        <>
          <InsertDivider index={0} />
          {sectionsConfig.map((section, idx) => (
            <React.Fragment key={section.id}>
              {renderSection(section)}
              <InsertDivider index={idx + 1} />
            </React.Fragment>
          ))}
        </>
      )}

      {logoModalOpen && headerIdForModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          onClick={() => setLogoModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-base">Configuración del Encabezado</h3>
              <button 
                onClick={() => setLogoModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Logo Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logo del Sitio</h4>
                
                {/* Logo Type Selector */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      if (settings.logo) {
                        window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section: 'settings', field: 'logo', value: null }, '*');
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${!settings.logo ? 'bg-white text-custom-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Texto (Nombre de Empresa)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fileInput = document.getElementById('logo-file-upload');
                      if (fileInput) fileInput.click();
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${settings.logo ? 'bg-white text-custom-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Imagen
                  </button>
                </div>

                {/* Text Logo Input */}
                {!settings.logo ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre de la Empresa</label>
                    <input
                      type="text"
                      value={settings.company_name}
                      onChange={(e) => {
                        window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section: 'settings', field: 'company_name', value: e.target.value }, '*');
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-custom-primary"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <img src={settings.logo} alt="Preview Logo" className="h-10 object-contain max-w-[120px]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">Logo cargado</p>
                        <p className="text-[10px] text-gray-400">Imagen en formato base64/URL</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section: 'settings', field: 'logo', value: null }, '*');
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Eliminar logo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  id="logo-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        if (base64) {
                          window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', section: 'settings', field: 'logo', value: base64 }, '*');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <hr className="border-gray-100" />

              {/* Action Icons Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Iconos de Acción</h4>
                <div className="space-y-2">
                  {[
                    { label: "Mostrar Buscador", field: "show_search", currentVal: sectionData[headerIdForModal]?.show_search !== false },
                    { label: "Mostrar Mi Cuenta", field: "show_user", currentVal: sectionData[headerIdForModal]?.show_user !== false },
                    { label: "Mostrar Favoritos", field: "show_heart", currentVal: sectionData[headerIdForModal]?.show_heart !== false },
                    { label: "Mostrar Carrito", field: "show_cart", currentVal: sectionData[headerIdForModal]?.show_cart !== false },
                  ].map((item) => (
                    <label key={item.field} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        checked={item.currentVal}
                        onChange={(e) => {
                          window.parent.postMessage({
                            type: 'INLINE_TEXT_UPDATE',
                            section: headerIdForModal,
                            field: item.field,
                            value: e.target.checked
                          }, '*');
                        }}
                        className="rounded border-gray-300 text-custom-primary focus:ring-custom-primary"
                      />
                      <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setLogoModalOpen(false)}
                className="px-4 py-2 bg-custom-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-custom-primary/20 hover:scale-105 transition-transform"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
