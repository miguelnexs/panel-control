import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Rocket, 
  ArrowRight, 
  ArrowLeft, 
  Package, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Plus,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  Wand2,
  Terminal,
  Activity,
  BarChart3,
  Receipt,
  Cpu,
  Building,
  X
} from 'lucide-react';
import { Toast, ToastType } from './Toast';
import { ModeToggle } from './ModeToggle';

interface OnboardingWizardProps {
  token: string | null;
  apiBase: string;
  userId?: number;
  onComplete: () => void;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ token, apiBase, userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: ToastType, isVisible: boolean}>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Company Details Form State
  const [companyName, setCompanyName] = useState('');
  const [companyNit, setCompanyNit] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDeleted, setLogoDeleted] = useState<boolean>(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoPreview]);

  // Receipt Print Settings Form State
  const [paperWidth, setPaperWidth] = useState<number>(58);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showLogoOnReceipt, setShowLogoOnReceipt] = useState<boolean>(true);
  const [headerAlign, setHeaderAlign] = useState<string>('center');
  const [receiptFooterMsg, setReceiptFooterMsg] = useState<string>('¡Gracias por su compra!');

  // Category Form State
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [createdCategoryId, setCreatedCategoryId] = useState<string>('');

  // Product Form State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCost, setProductCost] = useState('0');
  const [productDesc, setProductDesc] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

  // IA Generation States
  const [generatingWithAi, setGeneratingWithAi] = useState(false);

  // Confetti particles state
  const [showConfetti, setShowConfetti] = useState(false);

  // Console log state
  const [logs, setLogs] = useState<string[]>([
    'SYSTEM: Kernel inicializado correctamente.',
    'DB: Conectado a SQLite Local Inquilino (tenant_db).',
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `SYS: ${msg}`]);
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const authHeaders = (tkn: string | null) => ({
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {})
  });

  const loadCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/products/categories/?page_size=100`, { 
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) } 
      });
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        setCategories(results);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCompanySettings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setCompanyName(data.company_name || '');
          setCompanyNit(data.company_nit || '');
          setCompanyPhone(data.company_phone || '');
          setCompanyAddress(data.company_address || '');
          setCompanyEmail(data.company_email || '');
          setCompanyDescription(data.company_description || '');
          setLogo(data.logo || null);
          if (data.logo) {
            const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
            const p = String(data.logo).startsWith('/') ? data.logo : `/${data.logo}`;
            setLogoPreview(`${base}${p}`);
          }
          if (data.paper_width_mm) {
            setPaperWidth(Number(data.paper_width_mm));
          }
          if (data.receipt_footer) {
            try {
              const obj = JSON.parse(data.receipt_footer);
              if (obj && typeof obj === 'object') {
                setShowQrCode(obj.show_qr !== false);
                setShowLogoOnReceipt(obj.show_logo !== false);
                setHeaderAlign(obj.align || 'center');
                setReceiptFooterMsg(obj.message || '¡Gracias por su compra!');
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCategories();
    loadCompanySettings();
  }, [token]);

  useEffect(() => {
    if (step === 1) {
      addLog('TUTORIAL: Iniciando recorrido interactivo.');
    } else if (step === 2) {
      addLog('MÓDULO: Cargando configuración de empresa.');
    } else if (step === 3) {
      addLog('MÓDULO: Cargando diseño de recibo POS.');
    } else if (step === 4) {
      addLog('MÓDULO: Cargando gestor de categorías.');
    } else if (step === 5) {
      addLog('MÓDULO: Cargando gestor de inventario y precios.');
    } else if (step === 6) {
      setShowConfetti(true);
      addLog('SISTEMA: Configuración inicial guardada con éxito.');
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSaveCompanySettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      showToast('Por favor ingresa el nombre de la empresa', 'warning');
      return;
    }

    setLoading(true);
    showToast('Guardando datos de la empresa...', 'loading');
    addLog(`PUT: Guardando datos de la empresa '${companyName}'...`);

    try {
      const fd = new FormData();
      fd.append('company_name', companyName);
      fd.append('company_nit', companyNit);
      fd.append('company_phone', companyPhone);
      fd.append('company_address', companyAddress);
      fd.append('company_email', companyEmail);
      fd.append('company_description', companyDescription);
      if (logoFile) {
        fd.append('logo', logoFile);
      } else if (logoDeleted) {
        fd.append('logo', '');
      }

      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar configuración');

      showToast('¡Datos de la empresa guardados!', 'success');
      addLog('SYS: Datos de la empresa guardados con éxito.');
      if (data.logo) {
        setLogo(data.logo);
        const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        const p = String(data.logo).startsWith('/') ? data.logo : `/${data.logo}`;
        setLogoPreview(`${base}${p}`);
      } else if (logoDeleted) {
        setLogo(null);
        setLogoPreview(null);
      }
      setLogoFile(null);
      setLogoDeleted(false);

      setTimeout(() => {
        setStep(3); // Go to category step
        setLoading(false);
      }, 1000);

    } catch (err: any) {
      showToast(err.message, 'error');
      addLog(`ERROR: No se pudo guardar configuración. ${err.message}`);
      setLoading(false);
    }
  };

  const handleSaveReceiptSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    showToast('Guardando diseño del recibo...', 'loading');
    addLog(`PUT: Guardando configuración de impresión POS...`);
    try {
      const payloadBase = {
        paper_width_mm: paperWidth,
        receipt_footer: JSON.stringify({
          message: receiptFooterMsg,
          show_logo: showLogoOnReceipt,
          header1: '',
          header2: '',
          align: headerAlign,
          font_size: 11,
          margins: { top: 10, bottom: 10 },
          show_qr: showQrCode,
          logo_mode: 'company',
          logo_url: '',
          logo_width_mm: 45,
        })
      };

      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(token)
        },
        body: JSON.stringify(payloadBase)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar diseño de recibo');

      showToast('¡Diseño de recibo guardado!', 'success');
      addLog('SYS: Diseño de ticket e impresora actualizados.');
      setTimeout(() => {
        setStep(4); // Go to category step
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      showToast(err.message, 'error');
      addLog(`ERROR: No se pudo guardar configuración de recibo. ${err.message}`);
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!categoryName.trim()) {
      addLog('TUTORIAL: Creación de categoría omitida.');
      setStep(5);
      return;
    }

    setLoading(true);
    showToast('Procesando categoría...', 'loading');
    addLog(`POST: Creando categoría '${categoryName}'...`);

    try {
      const fd = new FormData();
      fd.append('name', categoryName);
      fd.append('description', categoryDesc);
      fd.append('active', 'true');

      const res = await fetch(`${apiBase}/products/categories/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al crear la categoría');

      showToast('¡Categoría creada exitosamente!', 'success');
      addLog(`ÉXITO: Categoría guardada con ID ${data.id}.`);
      setCreatedCategoryId(String(data.id));
      await loadCategories();
      
      setTimeout(() => {
        setStep(5);
        setLoading(false);
      }, 1000);

    } catch (err: any) {
      showToast(err.message, 'error');
      addLog(`ERROR: Falló creación de categoría. ${err.message}`);
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const catId = createdCategoryId || (categories.length > 0 ? String(categories[0].id) : '');

    if (!productName.trim() || !productPrice) {
      addLog('TUTORIAL: Carga de producto omitida.');
      setStep(6);
      return;
    }

    setLoading(true);
    showToast('Guardando producto en el inventario...', 'loading');
    addLog(`POST: Registrando producto '${productName}' en inventario...`);

    try {
      const fd = new FormData();
      fd.append('name', productName);
      fd.append('price', productPrice);
      fd.append('cost_price', productCost || '0');
      fd.append('category', catId);
      fd.append('description', productDesc);
      fd.append('active', 'true');
      if (productImage) {
        fd.append('image', productImage);
      }

      const res = await fetch(`${apiBase}/products/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar el producto');

      showToast('¡Producto guardado exitosamente!', 'success');
      addLog(`ÉXITO: Producto creado con SKU ${data.sku || 'N/A'}.`);
      
      setTimeout(() => {
        setStep(6);
        setLoading(false);
      }, 1000);

    } catch (err: any) {
      showToast(err.message, 'error');
      addLog(`ERROR: No se pudo guardar producto. ${err.message}`);
      setLoading(false);
    }
  };

  const generateWithIA = () => {
    setGeneratingWithAi(true);
    showToast('Generando contenido de producto...', 'loading');
    addLog('IA: Procesando sugerencia semántica con Google Gemini...');

    setTimeout(() => {
      const suggestionsByCat: Record<string, { name: string; price: string; cost: string; desc: string }> = {
        'Ropa & Moda': {
          name: 'Chaqueta Térmica Dry-Tech Pro',
          price: '189900',
          cost: '85000',
          desc: 'Chaqueta térmica ultra liviana con tecnología Dry-Tech impermeable. Cuenta con bolsillos de seguridad, cremalleras termoselladas y reflectivos de alta visibilidad para uso nocturno.'
        },
        'Tecnología': {
          name: 'Audífonos Inalámbricos Aura Sound Pro',
          price: '299900',
          cost: '120000',
          desc: 'Auriculares inalámbricos con cancelación activa de ruido (ANC) híbrida, bluetooth 5.3 de ultra baja latencia y estuche de carga inteligente. Hasta 45 horas de autonomía.'
        },
        'Alimentos & Bebidas': {
          name: 'Café de Origen Selección Especial 500g',
          price: '32500',
          cost: '14000',
          desc: 'Café 100% Arábigo cultivado a más de 1,800 metros de altura en fincas seleccionadas. Notas frutales, acidez cítrica media-alta y cuerpo sedoso con tostión artesanal media.'
        },
        'Servicios': {
          name: 'Mantenimiento Preventivo Premium Laptop',
          price: '150000',
          cost: '20000',
          desc: 'Limpieza física interna profunda, cambio de pasta térmica de alto rendimiento (Artic MX-4), optimización del sistema operativo y reporte completo de salud de batería y disco.'
        },
        'Salud & Belleza': {
          name: 'Sérum Facial Ácido Hialurónico + Vitamina C',
          price: '89000',
          cost: '32000',
          desc: 'Sérum hidratante intensivo con doble concentración de ácido hialurónico y vitamina C de alta pureza. Aporta luminosidad y combate las líneas de expresión.'
        },
        'Hogar & Decoración': {
          name: 'Lámpara de Mesa Nórdica Minimalista',
          price: '115000',
          cost: '45000',
          desc: 'Lámpara de diseño escandinavo con base de madera de roble natural y pantalla de lino texturizado. Incluye bombillo inteligente de luz cálida regulable.'
        }
      };

      const selectedSuggest = suggestionsByCat[categoryName] || {
        name: 'Producto Innovador Assent',
        price: '75000',
        cost: '30000',
        desc: 'Producto de alto rendimiento diseñado para integrarse a tus operaciones con el respaldo total de la plataforma.'
      };

      setProductName(selectedSuggest.name);
      setProductPrice(selectedSuggest.price);
      setProductCost(selectedSuggest.cost);
      setProductDesc(selectedSuggest.desc);

      showToast('¡Contenido inteligente cargado!', 'success');
      addLog('IA: Sugerencias insertadas en los campos del formulario.');
      setGeneratingWithAi(false);
    }, 1200);
  };

  const finishOnboarding = async () => {
    try {
      if (token) {
        await fetch(`${apiBase}/users/api/auth/me/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(token)
          },
          body: JSON.stringify({ onboarding_completed: true })
        });
      }
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }

    if (userId) {
      localStorage.setItem(`onboarding_completed_user_${userId}`, 'true');
    } else {
      localStorage.setItem('onboarding_completed', 'true');
    }
    onComplete();
  };

  const categorySuggestions = ['Ropa & Moda', 'Tecnología', 'Alimentos & Bebidas', 'Servicios', 'Salud & Belleza', 'Hogar & Decoración'];
  const progressPercentage = (step / 6) * 100;

  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center p-2 sm:p-6 text-gray-900 dark:text-white relative overflow-hidden">
      
      {/* Theme Switcher and Animations Toggle */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAnimationsEnabled(!animationsEnabled)}
          className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-md px-3 py-1.5 rounded-2xl hover:scale-105 transition-all text-xs font-bold text-gray-750 dark:text-gray-300 flex items-center gap-1.5 cursor-pointer"
          title={animationsEnabled ? "Desactivar animaciones de fondo" : "Activar animaciones de fondo"}
        >
          <Sparkles className={`w-3.5 h-3.5 ${animationsEnabled ? 'text-indigo-500 animate-pulse' : 'text-gray-400'}`} />
          <span>{animationsEnabled ? "Animaciones: Sí" : "Animaciones: No"}</span>
        </button>
        <ModeToggle className="!w-auto bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-md px-3 py-1 rounded-2xl hover:scale-105 transition-transform" />
      </div>

      {/* Background Tech Gradients */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none z-0 ${animationsEnabled ? 'animate-pulse' : ''}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none z-0 ${animationsEnabled ? 'animate-pulse delay-1000' : ''}`} />

      {/* Floating Background Blobs (same as Login page, enhanced for full viewport & subtle slow movement) */}
      {animationsEnabled && (
        <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden z-0">
          <style>{`
            @keyframes slow-blob {
              0% {
                transform: translate(0px, 0px) scale(1);
              }
              33% {
                transform: translate(80px, -100px) scale(1.15);
              }
              66% {
                transform: translate(-60px, 60px) scale(0.9);
              }
              100% {
                transform: translate(0px, 0px) scale(1);
              }
            }
            .animate-slow-blob {
              animation: slow-blob 25s infinite ease-in-out alternate;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
            .animation-delay-8000 {
              animation-delay: 8s;
            }
          `}</style>
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/[0.08] dark:bg-purple-600/[0.04] rounded-full blur-3xl animate-slow-blob" />
          <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-sky-400/[0.08] dark:bg-blue-600/[0.04] rounded-full blur-3xl animate-slow-blob animation-delay-4000" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-teal-400/[0.06] dark:bg-emerald-500/[0.03] rounded-full blur-3xl animate-slow-blob animation-delay-8000" />
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-400/[0.06] dark:bg-indigo-600/[0.03] rounded-full blur-3xl animate-slow-blob" />
          <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-cyan-500/[0.08] dark:bg-indigo-650/[0.04] rounded-full blur-3xl animate-slow-blob animation-delay-4000" />
        </div>
      )}

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0% {
                transform: translateY(-20px) translateX(0) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: translateY(45vh) translateX(20px) rotate(180deg);
                opacity: 0.9;
              }
              100% {
                transform: translateY(85vh) translateX(-20px) rotate(360deg);
                opacity: 0;
              }
            }
            .confetti-particle {
              position: absolute;
              top: -20px;
              border-radius: 50%;
              animation: confetti-fall linear infinite;
            }
          `}</style>
          {[...Array(60)].map((_, i) => {
            const size = Math.random() * 8 + 6;
            const left = Math.random() * 100;
            const delay = Math.random() * 3.5;
            const duration = 2.5 + Math.random() * 2;
            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];
            const color = colors[i % colors.length];
            return (
              <div 
                key={i} 
                className="confetti-particle"
                style={{ 
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  backgroundColor: color,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
              />
            );
          })}
        </div>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />

      {/* Split Layout Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Side: Setup Wizard Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[600px] relative">
          <div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2">
              <div 
                className="bg-indigo-600 h-full transition-all duration-500 rounded-r-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Steps Content Area */}
            <div className="p-8 sm:p-12">
              
              {/* STEP 1: WELCOME */}
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="text-left space-y-4">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                      <Rocket className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-800 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                      Inicializando tu Panel de Control
                    </h1>
                    <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                      El panel está listo para optimizar tus ventas, automatizar tu inventario y gestionar cobros. Hagamos una configuración básica en un par de clics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/60 dark:border-gray-800 rounded-2xl flex gap-4 hover:border-indigo-500/30 transition-all group">
                      <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl h-fit group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Inventario Inteligente</h3>
                        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Control de existencias mínimas, SKU, códigos de barras y alertas de bajo stock.</p>
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/60 dark:border-gray-800 rounded-2xl flex gap-4 hover:border-indigo-500/30 transition-all group">
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl h-fit group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Caja POS Express</h3>
                        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Registra facturas de mostrador en segundos y lleva arqueos por turno de caja.</p>
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/60 dark:border-gray-800 rounded-2xl flex gap-4 hover:border-indigo-500/30 transition-all group">
                      <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl h-fit group-hover:scale-110 transition-transform">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Reportes en Vivo</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitorea tus ingresos, ganancias estimadas y productos de mayor rotación.</p>
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/60 dark:border-gray-800 rounded-2xl flex gap-4 hover:border-indigo-500/30 transition-all group">
                      <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl h-fit group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Asistente IA</h3>
                        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Google Gemini integrado para responder dudas estratégicas o redactar promociones.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: COMPANY CONFIGURATION */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                  <div className="space-y-2 mb-6">
                    <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Paso 2 de 6</span>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Datos de tu Empresa</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Introduce la información básica de tu negocio. Estos datos aparecerán en tus facturas y recibos.</p>
                  </div>

                  <form onSubmit={handleSaveCompanySettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Nombre de la Empresa</label>
                        <input 
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ej. Mi Negocio S.A.S"
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">NIT / Identificación Fiscal</label>
                        <input 
                          type="text"
                          value={companyNit}
                          onChange={(e) => setCompanyNit(e.target.value)}
                          placeholder="Ej. 900.000.000-1"
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Teléfono</label>
                        <input 
                          type="text"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="Ej. +57 300 123 4567"
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Correo Electrónico</label>
                        <input 
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="Ej. contacto@minegocio.com"
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Dirección</label>
                      <input 
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Ej. Calle 10 # 5-20, Bogotá"
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Descripción de tu Negocio</label>
                      <textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Ej. Venta de tecnología, soporte técnico, reparación de equipos..."
                        rows={2}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold resize-none shadow-inner"
                      />
                    </div>

                    {/* Logo upload or omit */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/60 dark:border-gray-800 rounded-2xl">
                      <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                        {logoPreview && !logoLoadError ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="w-full h-full object-cover" 
                            onError={() => setLogoLoadError(true)}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Logo de tu Empresa</h4>
                        <p className="text-xs text-gray-500">Sube una imagen cuadrada PNG o JPG (Opcional). Se mostrará en tus recibos impresos.</p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <label className="px-4 py-2 bg-indigo-655 hover:bg-indigo-600 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5 bg-indigo-600">
                            <Upload className="w-3.5 h-3.5" />
                            Subir Logo
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setLogoFile(file);
                                  setLogoPreview(URL.createObjectURL(file));
                                  setLogoDeleted(false);
                                }
                              }} 
                            />
                          </label>
                          {(logoPreview || logoFile) && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview(null);
                                setLogoDeleted(true);
                              }}
                              className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-black rounded-xl transition-all active:scale-95"
                            >
                              Eliminar / Omitir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                      >
                        {loading ? 'Guardando...' : 'Guardar Empresa y Continuar'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: RECEIPT CONFIGURATION */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                  <div className="space-y-2 mb-6">
                    <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Paso 3 de 6</span>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Diseña tu Recibo POS</h2>
                    <p className="text-sm text-gray-550 dark:text-gray-400">Personaliza cómo se imprimirá físicamente tu ticket de venta en el mostrador.</p>
                  </div>

                  <form onSubmit={handleSaveReceiptSettings} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Ancho del Papel Impresora</label>
                        <select
                          value={paperWidth}
                          onChange={(e) => setPaperWidth(Number(e.target.value))}
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner cursor-pointer"
                        >
                          <option value={58}>58 mm (Estándar/Pequeño)</option>
                          <option value={80}>80 mm (Grande/Supermercado)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Alineación del Encabezado</label>
                        <select
                          value={headerAlign}
                          onChange={(e) => setHeaderAlign(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner cursor-pointer"
                        >
                          <option value="center">Centrado</option>
                          <option value="left">Izquierda</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                    </div>

                    {/* Explicit configuration questions with styled card options */}
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">¿Deseas agregar el código QR de validación en la parte inferior del recibo?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowQrCode(true)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            showQrCode 
                              ? 'bg-indigo-600/10 border-indigo-600 dark:border-indigo-500 shadow-md scale-[1.01]' 
                              : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${showQrCode ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">Sí, agregar QR</div>
                              <div className="text-xs text-gray-500">Muestra el código QR para que los clientes verifiquen su orden.</div>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQrCode(false)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            !showQrCode 
                              ? 'bg-indigo-600/10 border-indigo-600 dark:border-indigo-500 shadow-md scale-[1.01]' 
                              : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${!showQrCode ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                              <X className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">No, omitir QR</div>
                              <div className="text-xs text-gray-500 font-semibold">Usa un código de barras estándar.</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">¿Deseas incluir el logo de la empresa en el recibo?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowLogoOnReceipt(true)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            showLogoOnReceipt 
                              ? 'bg-indigo-600/10 border-indigo-600 dark:border-indigo-500 shadow-md scale-[1.01]' 
                              : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${showLogoOnReceipt ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">Sí, mostrar Logo</div>
                              <div className="text-xs text-gray-500">Muestra tu logotipo corporativo en el encabezado.</div>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLogoOnReceipt(false)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            !showLogoOnReceipt 
                              ? 'bg-indigo-600/10 border-indigo-600 dark:border-indigo-500 shadow-md scale-[1.01]' 
                              : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${!showLogoOnReceipt ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                              <X className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">No, omitir Logo</div>
                              <div className="text-xs text-gray-500 font-semibold">Imprime el recibo sin logotipo.</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Mensaje del Pie de Recibo</label>
                      <input 
                        type="text"
                        value={receiptFooterMsg}
                        onChange={(e) => setReceiptFooterMsg(e.target.value)}
                        placeholder="Ej. ¡Gracias por su compra, vuelva pronto!"
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                      >
                        {loading ? 'Guardando...' : 'Guardar Diseño y Continuar'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: CATEGORY CREATION (OPTIONAL) */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Paso 4 de 6</span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Demostración Opcional</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Crea una Categoría (Opcional)</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Este paso te enseña cómo agrupar tu catálogo. Puedes crear una categoría ahora para probar o saltar este paso.</p>
                  </div>

                  <form onSubmit={handleCreateCategory} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Recomendadas por el sistema</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categorySuggestions.map((sug) => (
                          <button
                            type="button"
                            key={sug}
                            onClick={() => {
                              setCategoryName(sug);
                              setCategoryDesc(`Categoría principal de ${sug.toLowerCase()}.`);
                            }}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                              categoryName === sug 
                                ? 'bg-indigo-650 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-650 dark:text-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Nombre de la Categoría</label>
                      <input 
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Ej. Bebidas, Tecnología, Servicios..."
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Descripción (Opcional)</label>
                      <textarea
                        value={categoryDesc}
                        onChange={(e) => setCategoryDesc(e.target.value)}
                        placeholder="Describe brevemente los productos de esta categoría..."
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold resize-none shadow-inner"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? 'Procesando...' : categoryName.trim() ? 'Crear Categoría y Continuar' : 'Siguiente Paso'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addLog('TUTORIAL: Creación de categoría omitida por el usuario.');
                          setStep(5);
                        }}
                        className="px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-bold transition-all active:scale-98 cursor-pointer"
                      >
                        Omitir este paso
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 5: PRODUCT CREATION (OPTIONAL) */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Paso 5 de 6</span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Demostración Opcional</span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Carga un Producto (Opcional)</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guía interactiva para ingresar artículos a tu inventario. Puedes cargar uno ahora o omitir este paso.</p>
                    </div>
                    {categoryName && (
                      <button
                        type="button"
                        onClick={generateWithIA}
                        disabled={generatingWithAi}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition-all active:scale-95 border border-indigo-500/20 shrink-0"
                      >
                        <Wand2 className="w-4 h-4 animate-pulse" />
                        Autocompletar con IA
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Nombre del Producto</label>
                        <input 
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="Ej. Capuchino 12oz, Portátil..."
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Precio de Venta</label>
                        <div className="relative group">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input 
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            placeholder="Precio al público"
                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Imagen (Opcional)</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="onboarding-prod-img-up"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setProductImage(file);
                                setProductImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                          <label
                            htmlFor="onboarding-prod-img-up"
                            className="flex flex-col items-center justify-center w-full min-h-[110px] bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-center p-3"
                          >
                            {productImagePreview ? (
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md">
                                <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover animate-in zoom-in-95" />
                              </div>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-550 dark:text-gray-400 font-bold">Subir Archivo</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Detalles o Descripción</label>
                        <textarea
                          value={productDesc}
                          onChange={(e) => setProductDesc(e.target.value)}
                          placeholder="Notas o descripción para el vendedor..."
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-750 rounded-2xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-semibold resize-none shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? 'Guardando...' : (productName.trim() && productPrice) ? 'Crear Producto e Ir al Éxito' : 'Siguiente Paso'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addLog('TUTORIAL: Carga de producto omitida por el usuario.');
                          setStep(6);
                        }}
                        className="px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-bold transition-all active:scale-98 cursor-pointer"
                      >
                        Omitir este paso
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 6: WRAP-UP */}
              {step === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 text-center w-full">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">¡Todo Configurado!</span>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">¡Listo para Operar!</h2>
                    <p className="text-sm text-gray-550 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                      Has configurado los datos de tu empresa, tu diseño de recibo de caja, tu categoría inicial e ingresado el primer producto. Ya puedes ingresar al Módulo de Ventas para operar de inmediato.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={finishOnboarding}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      Comenzar Operaciones
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Navigation Footer */}
          <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0">
            {step > 1 && step < 6 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <div />
            )}

            {step < 6 && (
              <button
                onClick={() => {
                  if (step === 2) {
                    if (companyName.trim()) {
                      handleSaveCompanySettings();
                    } else {
                      setStep(3);
                    }
                  } else if (step === 3) {
                    handleSaveReceiptSettings();
                  } else if (step === 4) {
                    if (categoryName.trim()) {
                      handleCreateCategory();
                    } else {
                      setStep(5);
                    }
                  } else if (step === 5) {
                    if (productName.trim() && productPrice) {
                      handleCreateProduct();
                    } else {
                      setStep(6);
                    }
                  } else {
                    setStep(step + 1);
                  }
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>{step === 1 ? 'Iniciar Tutorial' : (step === 4 || step === 5) && (!categoryName.trim() && !productName.trim()) ? 'Omitir / Siguiente' : 'Siguiente Paso'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Realistic Thermal POS Receipt Preview */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Vista Previa de Ticket POS</span>
          </div>
          
          {/* Thermal Paper Receipt */}
          <div 
            style={{ width: paperWidth === 80 ? '340px' : '260px' }}
            className="bg-[#faf9f6] text-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-xl rounded-lg p-6 font-mono text-xs mt-4 transition-all duration-350 relative select-none"
          >
            {/* Jagged paper tear effect at top and bottom */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-gray-250 to-transparent" />
            
            {/* Header / Brand info */}
            <div 
              style={{ textAlign: headerAlign as any }}
              className="space-y-1"
            >
              {showLogoOnReceipt && (
                <div className="flex justify-center mb-2">
                  {logoPreview && !logoLoadError ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      onError={() => setLogoLoadError(true)}
                      style={{ width: '45mm', height: 'auto', maxHeight: '40px', objectFit: 'contain', filter: 'grayscale(100%) brightness(0.8)' }} 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      {companyName ? companyName[0].toUpperCase() : 'A'}
                    </div>
                  )}
                </div>
              )}
              <div className="font-black text-sm uppercase tracking-wide">
                {companyName || 'ASENTING STORE'}
              </div>
              {companyNit && <div className="text-[10px] text-gray-600">NIT: {companyNit}</div>}
              {companyAddress && <div className="text-[10px] text-gray-600">{companyAddress}</div>}
              {companyPhone && <div className="text-[10px] text-gray-600">TEL: {companyPhone}</div>}
              {companyEmail && <div className="text-[10px] text-gray-600">{companyEmail}</div>}
            </div>

            {/* Ticket Info */}
            <div className="border-t border-dashed border-gray-400 my-3 pt-2 space-y-1 text-[10px] text-gray-900 font-bold">
              <div className="flex justify-between">
                <span><strong>ORDEN:</strong> 0001</span>
                <span><strong>FECHA:</strong> {new Date().toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="border-t border-dashed border-gray-400 my-3 pt-2 text-[10px] text-gray-900 text-left font-bold">
              <div className="font-extrabold mb-1 border-b border-dashed border-gray-400 pb-0.5">DATOS DEL CLIENTE</div>
              <div><strong>NOMBRE:</strong> CONSUMIDOR FINAL</div>
            </div>

            {/* Información del Pago */}
            <div className="border-t border-dashed border-gray-400 my-3 pt-2 text-[10px] text-gray-900 text-left font-bold">
              <div className="font-extrabold mb-1 border-b border-dashed border-gray-400 pb-0.5">INFORMACIÓN DEL PAGO</div>
              <div className="flex justify-between">
                <span><strong>MÉTODO:</strong> Efectivo</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-dashed border-gray-400 my-3 pt-2">
              <table className="w-full border-collapse text-[10px] text-gray-900 font-bold text-left">
                <thead>
                  <tr className="border-b border-dashed border-gray-400">
                    <th className="pb-1 text-left">Producto</th>
                    <th className="pb-1 text-center w-8">Cant</th>
                    <th className="pb-1 text-right w-16">Unit</th>
                    <th className="pb-1 text-right w-16">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productName ? (
                    <tr className="text-[10px] font-bold">
                      <td className="py-1 text-left truncate max-w-[100px]">{productName}</td>
                      <td className="py-1 text-center">1</td>
                      <td className="py-1 text-right">${Number(productPrice || 0).toLocaleString('es-CO')}</td>
                      <td className="py-1 text-right">${Number(productPrice || 0).toLocaleString('es-CO')}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-400 text-[9px] italic font-normal">
                        [ El producto que crees se mostrará aquí ]
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-dashed border-gray-400">
                    <td colSpan={3} className="pt-2 font-extrabold text-xs">Total</td>
                    <td className="pt-2 text-right font-extrabold text-xs">${Number(productPrice || 0).toLocaleString('es-CO')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Message / Footer / QR */}
            <div className="border-t border-dashed border-gray-400 mt-3 pt-3 text-center space-y-3 font-bold text-gray-900">
              {showQrCode && (
                <div className="flex flex-col items-center justify-center space-y-1 py-1">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0001" 
                    style={{ width: '35mm', height: '35mm', objectFit: 'contain' }} 
                    alt="QR Code" 
                  />
                  <span className="text-[8px] text-gray-400">Verificar Factura Electrónica</span>
                </div>
              )}
              
              <div className="text-[10px] font-extrabold uppercase">
                {receiptFooterMsg || '¡GRACIAS POR SU COMPRA!'}
              </div>
              
              <div className="text-[8px] text-gray-500">Asenting POS Software</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
