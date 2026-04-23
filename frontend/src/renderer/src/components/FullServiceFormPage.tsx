import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './Toast';
import ClientFormModal from './ClientFormModal';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash, 
  User, 
  Briefcase, 
  FileText, 
  DollarSign, 
  CheckCircle,
  Search,
  Grid,
  X,
  Clock,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Printer
} from 'lucide-react';

interface FullServiceFormPageProps {
  token: string | null;
  apiBase: string;
  onCancel: () => void;
  onSaved: () => void;
  initialData?: any; // For editing mode if needed later
}

interface ServiceDefinition {
  id: number;
  name: string;
  description: string;
  image: string | null;
  price: number;
  estimated_duration: string;
  active: boolean;
}

interface Client {
  id: number;
  full_name: string;
  cedula: string;
}

const FullServiceFormPage: React.FC<FullServiceFormPageProps> = ({ token, apiBase, onCancel, onSaved, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<ServiceDefinition[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  
  const [formData, setFormData] = useState({
    clientId: '',
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogFormData, setCatalogFormData] = useState({
    name: '',
    description: '',
    price: '0',
    estimated_duration: '',
    image: null as File | null
  });

  const [serviceItems, setServiceItems] = useState<Array<{ id: string, name: string, description: string, value: string, third_party_provider: string, third_party_cost: string, worker: string }>>([
    { id: String(Date.now()), name: '', description: '', value: '', third_party_provider: '', third_party_cost: '', worker: '' }
  ]);

  const [toast, setToast] = useState<{message: string, type: ToastType, isVisible: boolean}>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const authHeaders = (tkn: string | null) => ({ 'Content-Type': 'application/json', ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadClients = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/clients/?page_size=100`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) setClients(data.results);
      }
    } catch (e) {
      console.error("Error loading clients", e);
    }
  };

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        const [employeesRes, catalogRes] = await Promise.all([
          fetch(`${apiBase}/users/api/users/?scope=tenant`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/services/definitions/`, { headers: authHeaders(token) })
        ]);

        await loadClients();

        if (employeesRes.ok) {
          const data = await employeesRes.json();
          if (Array.isArray(data)) setEmployees(data);
        }

        if (catalogRes.ok) {
          const data = await catalogRes.json();
          const arr = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
          setCatalog(arr);
        }

      } catch (error) {
        console.error("Error loading initial data", error);
        showToast("Error cargando datos iniciales", 'error');
      }
    };
    loadData();
  }, [token, apiBase]);

  const loadCatalog = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/services/definitions/`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setCatalog(arr);
      }
    } catch (e) {
      console.error("Error loading catalog", e);
    }
  };

  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!catalogFormData.name || !catalogFormData.description) {
      showToast('Nombre y descripción son obligatorios', 'error');
      return;
    }

    showToast('Guardando en catálogo...', 'loading');

    try {
      const fd = new FormData();
      fd.append('name', catalogFormData.name);
      fd.append('description', catalogFormData.description);
      fd.append('price', catalogFormData.price);
      fd.append('estimated_duration', catalogFormData.estimated_duration);
      if (catalogFormData.image) {
        fd.append('image', catalogFormData.image);
      }

      const res = await fetch(`${apiBase}/services/definitions/`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd
      });

      if (!res.ok) throw new Error('Error al guardar en catálogo');
      
      await loadCatalog();
      setIsCatalogModalOpen(false);
      setCatalogFormData({ name: '', description: '', price: '0', estimated_duration: '', image: null });
      showToast('Servicio agregado al catálogo', 'success');
      
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };


  const addServiceItem = () => {
    setServiceItems(prev => [...prev, { id: String(Date.now()), name: '', description: '', value: '0', third_party_provider: '', third_party_cost: '', worker: '' }]);
  };

  const removeServiceItem = (id: string) => {
    if (serviceItems.length > 1) {
      setServiceItems(prev => prev.filter(item => item.id !== id));
    } else {
        showToast("Debe haber al menos un servicio", 'error');
    }
  };

  const updateServiceItem = (id: string, field: string, value: string) => {
    setServiceItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addFromCatalog = (catItem: ServiceDefinition) => {
      // Find the first empty item or add a new one
      const emptyItem = serviceItems.find(i => !i.name && !i.description);
      
      if (emptyItem) {
          updateServiceItem(emptyItem.id, 'name', catItem.name);
          updateServiceItem(emptyItem.id, 'description', catItem.description);
          updateServiceItem(emptyItem.id, 'value', '0');
          showToast(`Agregado: ${catItem.name}`, 'success');
      } else {
          setServiceItems(prev => [...prev, {
              id: String(Date.now()),
              name: catItem.name,
              description: catItem.description,
              value: '0',
              third_party_provider: '',
              third_party_cost: '',
              worker: ''
          }]);
          showToast(`Agregado: ${catItem.name}`, 'success');
      }
  };

  const handleSubmit = async () => {
      if (!token) return;

      if (!formData.clientId) {
        showToast("Seleccione un cliente", 'warning');
        return;
      }

      for (const item of serviceItems) {
        if (!item.name || !item.description) {
          showToast("Complete los campos obligatorios de todos los servicios", 'error');
          return;
        }
      }

      setLoading(true);
      showToast('Creando servicios...', 'loading');

      try {
        if (!formData.clientId) {
          showToast('Por favor seleccione un cliente antes de continuar', 'warning');
          return;
        }

        const savePromises = serviceItems.map(item => {
          const payload: any = {
            name: item.name,
            description: item.description,
            third_party_provider: item.third_party_provider || '',
            third_party_cost: item.third_party_cost ? Number(item.third_party_cost) : 0,
            value: Number(item.value),
            worker: item.worker ? Number(item.worker) : null,
            status: 'recibido',
            entry_date: new Date().toISOString().split('T')[0],
          };

          payload.client = Number(formData.clientId);

          return fetch(`${apiBase}/services/`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(payload),
          }).then(async res => {
            if (!res.ok) {
              let errorMsg = `Error ${res.status}: ${res.statusText}`;
              try {
                const data = await res.json();
                errorMsg = data.detail || data.message || errorMsg;
              } catch (e) {
                // If not JSON, get text
                try {
                  const text = await res.text();
                  if (text && text.length < 500) errorMsg = text;
                } catch(e2) {}
              }
              throw new Error(errorMsg);
            }
            return res.json();
          });
        });

        await Promise.all(savePromises);
        
        showToast('Servicios creados correctamente', 'success');
        setTimeout(() => {
            onSaved();
        }, 1000);
        
      } catch (error: any) {
        showToast(error.message || 'Error al crear servicios', 'error');
        setLoading(false);
      }
  };

  const filteredCatalog = catalog.filter(c => c.name.toLowerCase().includes(catalogSearch.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-gray-900 animate-in fade-in duration-300">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Nuevo Servicio</h1>
            <p className="text-gray-400 text-sm">Registra la recepción de equipos o servicios</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-brand px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                Guardar Servicios
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
            
            {/* Left Column: Form */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 border-r border-gray-800">
                <div className="space-y-8">
                    
                    {/* Client Selection */}
                    <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10">
                                    <User className="w-6 h-6 text-indigo-400" />
                                </div>
                                Información del Cliente
                            </h2>
                            <button 
                                onClick={() => setIsClientModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo Cliente
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Seleccionar Cliente Existente</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <select 
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-2xl pl-12 pr-12 py-4 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none appearance-none transition-all shadow-inner font-medium"
                                    >
                                        <option value="">Busca un cliente por nombre o documento...</option>
                                        {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.full_name} — {client.cedula}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Search className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Items */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10">
                                    <Briefcase className="w-6 h-6 text-indigo-400" />
                                </div>
                                Servicios a Realizar
                            </h2>
                            <button 
                                onClick={addServiceItem}
                                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/30 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Agregar otro ítem
                            </button>
                        </div>

                        {serviceItems.map((item, index) => (
                            <div key={item.id} className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700/50 relative group animate-in slide-in-from-bottom-4 duration-300">
                                {serviceItems.length > 1 && (
                                    <button 
                                        onClick={() => removeServiceItem(item.id)}
                                        className="absolute top-6 right-6 text-gray-500 hover:text-rose-400 p-2.5 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                )}
                                
                                <div className="mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm font-black">
                                        {index + 1}
                                    </span>
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Configuración del Servicio</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Name - 8 cols */}
                                    <div className="md:col-span-8">
                                        <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Nombre del Servicio</label>
                                        <input 
                                            type="text" 
                                            value={item.name}
                                            onChange={(e) => updateServiceItem(item.id, 'name', e.target.value)}
                                            placeholder="Ej. Reparación de Monitor"
                                            className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>

                                    {/* Worker - 4 cols */}
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Asignar Empleado</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <select 
                                                value={item.worker}
                                                onChange={(e) => updateServiceItem(item.id, 'worker', e.target.value)}
                                                className="w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-10 pr-10 py-3.5 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none appearance-none transition-all"
                                            >
                                                <option value="">Sin Asignar</option>
                                                {employees.map(emp => {
                                                    const name = emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.username;
                                                    return <option key={emp.id} value={emp.id}>{name}</option>;
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description - Full Width */}
                                    <div className="md:col-span-12">
                                        <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Descripción Detallada y Notas</label>
                                        <textarea 
                                            value={item.description}
                                            onChange={(e) => updateServiceItem(item.id, 'description', e.target.value)}
                                            placeholder="Especifica el problema, piezas a cambiar o detalles técnicos..."
                                            rows={3}
                                            className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-4 py-4 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none placeholder:text-gray-700 shadow-inner"
                                        />
                                    </div>

                                    {/* Advanced/Third Party - Conditional Section */}
                                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-800/50">
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Proveedor Externo (Si aplica)</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    value={item.third_party_provider}
                                                    onChange={(e) => updateServiceItem(item.id, 'third_party_provider', e.target.value)}
                                                    placeholder="Nombre del taller o proveedor externo"
                                                    className="w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                                                />
                                            </div>
                                        </div>
                                        
                                        {item.third_party_provider && (
                                            <div className="animate-in slide-in-from-right-4 duration-300">
                                                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Costo de Tercero</label>
                                                <div className="relative group">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
                                                    <input 
                                                        type="number" 
                                                        value={item.third_party_cost}
                                                        onChange={(e) => updateServiceItem(item.id, 'third_party_cost', e.target.value)}
                                                        placeholder="Costo para el negocio"
                                                        className="w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/50 focus:outline-none transition-all placeholder:text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Catalog Quick Access */}
            <div className="w-full lg:w-96 border-l border-gray-800 bg-gray-900/50 p-6 overflow-hidden flex flex-col">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Grid className="w-5 h-5 text-indigo-400" />
                            Catálogo Rápido
                        </h3>
                        <button 
                            onClick={() => setIsCatalogModalOpen(true)}
                            className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all active:scale-90"
                            title="Nuevo servicio al catálogo"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Haz clic para agregar servicios predefinidos al formulario.</p>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar en catálogo..." 
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredCatalog.length > 0 ? (
                        filteredCatalog.map(catItem => (
                            <button 
                                key={catItem.id}
                                onClick={() => addFromCatalog(catItem)}
                                className="w-full text-left p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-750 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">{catItem.name}</div>
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-2">{catItem.description}</div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No se encontraron servicios</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Reusable Client Modal */}
      <ClientFormModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        token={token}
        apiBase={apiBase}
        themeColor="indigo"
        onSuccess={(newClient) => {
          setClients(prev => [newClient, ...prev]);
          setFormData(prev => ({ ...prev, clientId: String(newClient.id) }));
          showToast('Cliente registrado exitosamente', 'success');
        }}
      />

      {/* Modal Nuevo Servicio en Catálogo */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Nuevo al Catálogo</h2>
                  <p className="text-sm text-gray-400 font-medium">Define un servicio reutilizable</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCatalogModalOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCatalogSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Nombre del Servicio</label>
                <input 
                  type="text" 
                  value={catalogFormData.name}
                  onChange={(e) => setCatalogFormData({...catalogFormData, name: e.target.value})}
                  placeholder="Ej. Limpieza Química de Placa"
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Descripción</label>
                <textarea 
                  value={catalogFormData.description}
                  onChange={(e) => setCatalogFormData({...catalogFormData, description: e.target.value})}
                  placeholder="Describe en qué consiste el servicio..."
                  rows={3}
                  className="w-full bg-white/5 border border-gray-800 rounded-2xl px-4 py-4 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none placeholder:text-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Duración Estimada</label>
                  <input 
                    type="text" 
                    value={catalogFormData.estimated_duration}
                    onChange={(e) => setCatalogFormData({...catalogFormData, estimated_duration: e.target.value})}
                    placeholder="Ej. 2 horas"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
                <div>
                   <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Imagen (Opcional)</label>
                   <input 
                     type="file" 
                     onChange={(e) => setCatalogFormData({...catalogFormData, image: e.target.files?.[0] || null})}
                     className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 transition-all cursor-pointer"
                   />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-gray-800 rounded-2xl text-sm font-bold text-gray-500 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FullServiceFormPage;
