import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  Palette, 
  Rocket, 
  Check, 
  ShoppingCart, 
  Monitor, 
  Smartphone,
  ChevronRight,
  Upload,
  Layers,
  Search,
  MessageSquare,
  Send,
  Bot
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number | string;
  image?: string;
  category?: { id: number; name: string };
  active?: boolean;
  sku?: string;
  total_stock?: number;
  inventory_qty?: number;
}

interface StoreConfig {
  name: string;
  category: string;
  logo: string;
  primaryColor: string;
  layout: "grid" | "list";
  selectedProducts: number[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface LovableManagerProps {
  products: Product[];
  apiBase: string;
}

const LovableManager: React.FC<LovableManagerProps> = ({ products, apiBase }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: '¡Hola! Soy tu asistente de diseño. ¿Cómo te gustaría que se vea tu tienda hoy? Puedes pedirme cambiar colores, disposición o estilo.' }
  ]);
  const [config, setConfig] = useState<StoreConfig>({
    name: "",
    category: "",
    logo: "",
    primaryColor: "#3b82f6",
    layout: "grid",
    selectedProducts: []
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsProcessing(true);
    
    // Simple AI simulation logic
    const input = chatInput.toLowerCase();
    let responseText = "Entendido, aplicaré esos cambios.";
    let updatedConfig = { ...config };

    if (input.includes("rojo") || input.includes("red")) {
      updatedConfig.primaryColor = "#ef4444";
      responseText = "He cambiado el color principal a rojo intenso.";
    } else if (input.includes("azul") || input.includes("blue")) {
      updatedConfig.primaryColor = "#3b82f6";
      responseText = "He cambiado el color principal a azul corporativo.";
    } else if (input.includes("verde") || input.includes("green")) {
      updatedConfig.primaryColor = "#10b981";
      responseText = "He cambiado el color principal a verde esmeralda.";
    } else if (input.includes("naranja") || input.includes("orange")) {
      updatedConfig.primaryColor = "#f59e0b";
      responseText = "He cambiado el color principal a naranja vibrante.";
    } else if (input.includes("morado") || input.includes("purple")) {
      updatedConfig.primaryColor = "#8b5cf6";
      responseText = "He cambiado el color principal a morado creativo.";
    } else if (input.includes("rosa") || input.includes("pink")) {
      updatedConfig.primaryColor = "#ec4899";
      responseText = "He cambiado el color principal a rosa moderno.";
    }

    if (input.includes("lista") || input.includes("list")) {
      updatedConfig.layout = "list";
      responseText += " Y he cambiado la disposición a lista detallada.";
    } else if (input.includes("cuadrícula") || input.includes("grid") || input.includes("cuadricula")) {
      updatedConfig.layout = "grid";
      responseText += " Y he cambiado la disposición a cuadrícula visual.";
    }

    setTimeout(() => {
      setConfig(updatedConfig);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText }]);
      setIsProcessing(false);
    }, 1500);
  };

  const mediaUrl = (p?: string | null) => (p && p.startsWith('http')) ? p : `${apiBase}${p || ''}`;

  const handleNext = (nextTab: string) => {
    setActiveTab(nextTab);
  };

  const toggleProduct = (id: number) => {
    setConfig(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(id)
        ? prev.selectedProducts.filter(p => p !== id)
        : [...prev.selectedProducts, id]
    }));
  };

  const steps = [
    { id: "create", label: "Detalles", icon: Store },
    { id: "products", label: "Productos", icon: ShoppingCart },
    { id: "design", label: "Diseño", icon: Palette },
    { id: "deploy", label: "Publicar", icon: Rocket },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      {/* Main Configuration Area */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
        {/* Progress Stepper */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const isActive = activeTab === step.id;
              const isCompleted = steps.findIndex(s => s.id === activeTab) > index;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 scale-110' : 
                      isCompleted ? 'bg-emerald-500 text-white' : 
                      'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-[2px] -z-10 bg-gray-800">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          {/* Step 1: Create */}
          {activeTab === "create" && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Configura tu Tienda</h2>
                <p className="text-gray-400">Comencemos con los detalles básicos de tu nuevo comercio.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Nombre de la Tienda</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Mi Tienda Genial" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Categoría Principal</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Tecnología", "Moda", "Hogar", "Deportes"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setConfig({...config, category: cat})}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          config.category === cat 
                            ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => handleNext("products")}
                    disabled={!config.name || !config.category}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Products */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Selecciona tus Productos</h2>
                  <p className="text-gray-400 text-sm">Elige qué productos quieres mostrar en tu tienda.</p>
                </div>
                <div className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                  {config.selectedProducts.length} seleccionados
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all ${
                      config.selectedProducts.includes(product.id)
                        ? 'border-blue-500 bg-blue-600/5 ring-1 ring-blue-500'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                      {product.image ? (
                        <img src={mediaUrl(product.image)} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                      {config.selectedProducts.includes(product.id) && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-medium truncate">{product.name}</h3>
                      <p className="text-gray-400 text-sm">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setActiveTab("create")}
                  className="text-gray-400 hover:text-white px-4 py-2"
                >
                  Atrás
                </button>
                <button 
                  onClick={() => handleNext("design")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Design with Chat */}
          {activeTab === "design" && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Diseña con IA</h2>
                <p className="text-gray-400">Chatea con Lovable para personalizar tu tienda al instante.</p>
              </div>

              {/* Chat Interface */}
              <div className="flex-1 bg-gray-950/50 rounded-2xl border border-gray-800 flex flex-col overflow-hidden mb-6">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                          {msg.role === 'assistant' && <Bot className="w-3 h-3" />}
                          <span className="capitalize">{msg.role === 'user' ? 'Tú' : 'Lovable AI'}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 text-gray-200 rounded-2xl rounded-bl-none border border-gray-700 px-4 py-3 flex items-center gap-2">
                        <Bot className="w-3 h-3" />
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ej: 'Cambia el color a rojo' o 'Usa diseño de lista'..." 
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Manual Controls Toggle (Optional/Secondary) */}
              <div className="space-y-4 bg-gray-800/30 p-4 rounded-xl border border-gray-800/50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Controles Manuales Rápidos</p>
                <div className="flex gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    {["#3b82f6", "#ef4444", "#10b981", "#f59e0b"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setConfig({...config, primaryColor: color})}
                        className={`w-6 h-6 rounded-full border ${
                          config.primaryColor === color ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                    <button
                      onClick={() => setConfig({...config, layout: 'grid'})}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        config.layout === 'grid' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setConfig({...config, layout: 'list'})}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        config.layout === 'list' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Lista
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setActiveTab("products")}
                  className="text-gray-400 hover:text-white px-4 py-2"
                >
                  Atrás
                </button>
                <button 
                  onClick={() => handleNext("deploy")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Deploy */}
          {activeTab === "deploy" && (
            <div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-900/40">
                <Rocket className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">¡Todo listo!</h2>
                <p className="text-gray-400">Tu tienda está lista para ser generada y desplegada.</p>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nombre:</span>
                  <span className="text-white font-medium">{config.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Categoría:</span>
                  <span className="text-white font-medium">{config.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Productos:</span>
                  <span className="text-white font-medium">{config.selectedProducts.length} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tema:</span>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                </div>
              </div>

              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                onClick={() => alert("¡Desplegando tienda!")}
              >
                <Sparkles className="w-5 h-5" />
                Lanzar Tienda Ahora
              </button>
              
              <button 
                onClick={() => setActiveTab("design")}
                className="text-gray-500 hover:text-white text-sm"
              >
                Volver a editar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Sidebar */}
      <div className="w-full lg:w-96 shrink-0 hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Vista Previa
            </h3>
            <div className="flex gap-2">
               <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ONLINE</span>
            </div>
          </div>

          <div className="border border-gray-700 rounded-[2rem] overflow-hidden shadow-2xl bg-white h-[600px] flex flex-col relative ring-8 ring-gray-900">
            {/* Mock Browser Header */}
            <div className="bg-slate-100 border-b p-3 flex items-center gap-2 sticky top-0 z-10">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded-md text-[10px] px-2 py-1 text-center text-slate-400 truncate shadow-sm">
                {config.name ? `https://${config.name.toLowerCase().replace(/\s/g, '-')}.lovable.app` : 'https://tu-tienda.lovable.app'}
              </div>
            </div>

            {/* Store Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar-light">
              {/* Header */}
              <div className="p-4 bg-white shadow-sm sticky top-0 z-10 transition-colors duration-300" style={{ borderTop: `4px solid ${config.primaryColor}` }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                      <Store className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm truncate max-w-[120px]">{config.name || "Nombre Tienda"}</span>
                  </div>
                  <ShoppingCart className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Banner */}
              <div className="bg-slate-200 h-32 flex items-center justify-center text-slate-400">
                <span className="text-xs uppercase tracking-widest font-medium">Banner Principal</span>
              </div>

              {/* Products Grid */}
              <div className="p-4">
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Destacados</h4>
                <div className={`grid gap-3 ${config.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {config.selectedProducts.length > 0 ? (
                    config.selectedProducts.map(id => {
                      const product = products.find(p => p.id === id);
                      return product ? (
                        <div key={id} className={`bg-white rounded-lg shadow-sm overflow-hidden group ${config.layout === 'list' ? 'flex' : ''}`}>
                          <div className={`${config.layout === 'list' ? 'w-20 h-20' : 'aspect-square'} bg-slate-100 relative`}>
                            {product.image ? (
                              <img src={mediaUrl(product.image)} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="font-medium text-slate-800 text-xs mb-1 truncate">{product.name}</div>
                            <div className="text-emerald-600 font-bold text-xs">${product.price}</div>
                            <button 
                              className="mt-2 w-full py-1 rounded text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: config.primaryColor }}
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      ) : null;
                    })
                  ) : (
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white rounded-lg p-2 shadow-sm opacity-50">
                        <div className="aspect-square bg-slate-100 rounded mb-2"></div>
                        <div className="h-3 bg-slate-100 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Vista móvil optimizada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LovableManager;
