import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './Toast';
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
  Grid
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

  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    client_type: 'person' as 'person' | 'company',
    full_name: '',
    cedula: '',
    phone: '',
    email: '',
    address: ''
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

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        const [clientsRes, employeesRes, catalogRes] = await Promise.all([
          fetch(`${apiBase}/clients/?page_size=100`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/api/users/?scope=tenant`, { headers: authHeaders(token) }),
          fetch(`${apiBase}/services/definitions/`, { headers: authHeaders(token) })
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          if (Array.isArray(data.results)) setClients(data.results);
        }

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

  const addServiceItem = () => {
    setServiceItems(prev => [...prev, { id: String(Date.now()), name: '', description: '', value: '', third_party_provider: '', third_party_cost: '', worker: '' }]);
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
          updateServiceItem(emptyItem.id, 'value', String(catItem.price));
          showToast(`Agregado: ${catItem.name}`, 'success');
      } else {
          setServiceItems(prev => [...prev, {
              id: String(Date.now()),
              name: catItem.name,
              description: catItem.description,
              value: String(catItem.price),
              third_party_provider: '',
              third_party_cost: '',
              worker: ''
          }]);
          showToast(`Agregado: ${catItem.name}`, 'success');
      }
  };

  const handleSubmit = async () => {
      if (!token) return;

      if (!isNewClient && !formData.clientId) {
        showToast("Seleccione un cliente", 'error');
        return;
      }

      if (isNewClient) {
          if (!newClientData.full_name || !newClientData.cedula) {
              showToast("Nombre y Cédula son obligatorios para el nuevo cliente", 'error');
              return;
          }
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
        const promises = serviceItems.map(item => {
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

          if (isNewClient) {
              payload.client_type = newClientData.client_type;
              payload.client_full_name = newClientData.full_name;
              payload.client_cedula = newClientData.cedula;
              payload.client_phone = newClientData.phone;
              payload.client_email = newClientData.email;
              payload.client_address = newClientData.address;
          } else {
              payload.client = Number(formData.clientId);
          }

          return fetch(`${apiBase}/services/`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(payload),
          }).then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Error creando servicio');
            return data;
          });
        });

        await Promise.all(promises);
        
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
                <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* Client Selection */}
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-400" />
                                Información del Cliente
                            </h2>
                            <button 
                                onClick={() => setIsNewClient(!isNewClient)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    isNewClient 
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                                }`}
                            >
                                {isNewClient ? (
                                    <> <ArrowLeft className="w-3.5 h-3.5" /> Seleccionar Existente </>
                                ) : (
                                    <> <Plus className="w-3.5 h-3.5" /> Nuevo Cliente </>
                                )}
                            </button>
                        </div>
                        
                        {!isNewClient ? (
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Seleccionar Cliente</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <select 
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none appearance-none transition-all"
                                    >
                                        <option value="">Buscar cliente...</option>
                                        {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.full_name} - {client.cedula}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Client Type Selector */}
                                <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setNewClientData(prev => ({ ...prev, client_type: 'person' }))}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${newClientData.client_type === 'person' ? 'bg-gray-800 text-indigo-400 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Persona Natural
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewClientData(prev => ({ ...prev, client_type: 'company' }))}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${newClientData.client_type === 'company' ? 'bg-gray-800 text-indigo-400 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Empresa (NIT)
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                            {newClientData.client_type === 'person' ? 'Nombre Completo *' : 'Razón Social *'}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={newClientData.full_name}
                                            onChange={(e) => setNewClientData({...newClientData, full_name: e.target.value})}
                                            placeholder={newClientData.client_type === 'person' ? "Ej. Juan Pérez" : "Ej. Mi Empresa S.A.S"}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                            {newClientData.client_type === 'person' ? 'Cédula *' : 'NIT *'}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={newClientData.cedula}
                                            onChange={(e) => {
                                                setNewClientData({...newClientData, cedula: e.target.value});
                                            }}
                                            placeholder={newClientData.client_type === 'person' ? "Ej. 123456789" : "Ej. 900123456-1"}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Teléfono</label>
                                        <input 
                                            type="text" 
                                            value={newClientData.phone}
                                            onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                                            placeholder="Ej. 3001234567"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                                        <input 
                                            type="email" 
                                            value={newClientData.email}
                                            onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                                            placeholder="Ej. juan@correo.com"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Dirección</label>
                                        <input 
                                            type="text" 
                                            value={newClientData.address}
                                            onChange={(e) => setNewClientData({...newClientData, address: e.target.value})}
                                            placeholder="Ej. Calle 123 #45-67"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Items */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-400" />
                                Servicios a Realizar
                            </h2>
                            <button 
                                onClick={addServiceItem}
                                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Agregar otro ítem
                            </button>
                        </div>

                        {serviceItems.map((item, index) => (
                            <div key={item.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 relative group animate-in slide-in-from-bottom-4 duration-300">
                                {serviceItems.length > 1 && (
                                    <button 
                                        onClick={() => removeServiceItem(item.id)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                )}
                                
                                <div className="mb-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Ítem #{index + 1}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre del Servicio</label>
                                        <input 
                                            type="text" 
                                            value={item.name}
                                            onChange={(e) => updateServiceItem(item.id, 'name', e.target.value)}
                                            placeholder="Ej. Reparación General"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Descripción Detallada</label>
                                        <textarea 
                                            value={item.description}
                                            onChange={(e) => updateServiceItem(item.id, 'description', e.target.value)}
                                            placeholder="Describe el trabajo a realizar..."
                                            rows={3}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Valor Estimado</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input 
                                                type="number" 
                                                value={item.value}
                                                onChange={(e) => updateServiceItem(item.id, 'value', e.target.value)}
                                                placeholder="0.00"
                                                min="0"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Asignar Empleado</label>
                                        <select 
                                            value={item.worker}
                                            onChange={(e) => updateServiceItem(item.id, 'worker', e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none appearance-none"
                                        >
                                            <option value="">Sin Asignar</option>
                                            {employees.map(emp => {
                                                const name = emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.username;
                                                return <option key={emp.id} value={emp.id}>{name}</option>;
                                            })}
                                        </select>
                                    </div>
                                    
                                    {/* Advanced/Optional Fields Toggle could go here, keeping it simple for now */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Proveedor Externo (Opcional)</label>
                                        <input 
                                            type="text" 
                                            value={item.third_party_provider}
                                            onChange={(e) => updateServiceItem(item.id, 'third_party_provider', e.target.value)}
                                            placeholder="Nombre del tercero"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                        />
                                    </div>
                                    
                                    {item.third_party_provider && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Costo Tercero</label>
                                            <input 
                                                type="number" 
                                                value={item.third_party_cost}
                                                onChange={(e) => updateServiceItem(item.id, 'third_party_cost', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                                            />
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Catalog Quick Access */}
            <div className="w-full lg:w-96 border-l border-gray-800 bg-gray-900/50 p-6 overflow-hidden flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                        <Grid className="w-5 h-5 text-indigo-400" />
                        Catálogo Rápido
                    </h3>
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
                                    <div className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                                        ${Number(catItem.price).toLocaleString()}
                                    </div>
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
    </div>
  );
};

export default FullServiceFormPage;
