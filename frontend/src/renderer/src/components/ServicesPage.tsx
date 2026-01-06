import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  CheckCircle, 
  Clock,
  User,
  DollarSign,
  FileText,
  Briefcase,
  X
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  thirdPartyProvider?: string;
  value: number;
  clientId: number;
  clientName: string;
  status: 'recibido' | 'entregado';
  createdAt: string;
}

interface Client {
  id: number;
  full_name: string;
  cedula: string;
}

interface ServicesPageProps {
  token: string | null;
  apiBase: string;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ token, apiBase }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thirdPartyProvider: '',
    value: '',
    clientId: '',
    status: 'recibido' as 'recibido' | 'entregado'
  });

  const authHeaders = (tkn: string | null) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  // Load clients for the dropdown
  useEffect(() => {
    const loadClients = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBase}/clients/?page_size=100`, { headers: authHeaders(token) });
        const data = await res.json();
        if (res.ok && Array.isArray(data.results)) {
          setClients(data.results);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };
    loadClients();
  }, [token, apiBase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.value || !formData.clientId) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    const selectedClient = clients.find(c => c.id === Number(formData.clientId));
    
    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      thirdPartyProvider: formData.thirdPartyProvider,
      value: Number(formData.value),
      clientId: Number(formData.clientId),
      clientName: selectedClient ? selectedClient.full_name : 'Cliente Desconocido',
      status: formData.status,
      createdAt: new Date().toISOString()
    };

    setServices(prev => [newService, ...prev]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      thirdPartyProvider: '',
      value: '',
      clientId: '',
      status: 'recibido'
    });
  };

  const toggleStatus = (id: string) => {
    setServices(prev => prev.map(service => {
      if (service.id === id) {
        return {
          ...service,
          status: service.status === 'recibido' ? 'entregado' : 'recibido'
        };
      }
      return service;
    }));
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-pink-500" />
            Gestión de Servicios
          </h1>
          <p className="text-gray-400 text-sm mt-1">Administra los servicios ofrecidos a tus clientes</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar servicio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500/50 focus:outline-none placeholder:text-gray-600"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-pink-900/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Servicio</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Tercero</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{service.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-3 h-3 text-gray-500" />
                        {service.clientName}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-400 text-sm">
                        {service.thirdPartyProvider || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">
                        ${service.value.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(service.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          service.status === 'entregado' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {service.status === 'entregado' ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Entregado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Recibido
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="bg-gray-800 p-4 rounded-full mb-3">
                        <Briefcase className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-lg font-medium text-gray-400">No hay servicios registrados</p>
                      <p className="text-sm mt-1">Comienza agregando un nuevo servicio para tus clientes.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h2 className="text-xl font-bold text-white">Nuevo Servicio</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Nombre del Servicio</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej. Reparación de PC"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-pink-500/50 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Descripción</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detalles del servicio..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-pink-500/50 focus:outline-none transition-all resize-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Cliente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-pink-500/50 focus:outline-none appearance-none transition-all"
                      required
                    >
                      <option value="">Seleccionar Cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Valor</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="number" 
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-pink-500/50 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Realizado por Tercero (Opcional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="thirdPartyProvider"
                      value={formData.thirdPartyProvider}
                      onChange={handleInputChange}
                      placeholder="Nombre del técnico o empresa externa"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-pink-500/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-pink-900/20 transition-all"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;