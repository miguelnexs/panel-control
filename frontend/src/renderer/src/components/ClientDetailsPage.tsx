import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Briefcase, 
  Calendar,
  Clock,
  Phone,
  Building2,
  FileText,
  Tag
} from 'lucide-react';

interface Client {
  id: number;
  full_name: string;
  cedula?: string;
  email?: string;
  address?: string;
  phone?: string;
  client_type?: 'person' | 'company';
  identification_type?: string;
  tax_regime?: string;
  city?: string;
  department?: string;
  created_at?: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: number | string;
  items: {
    product: string;
    color?: string;
    quantity: number;
  }[];
}

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  value: number;
  entry_date: string;
  third_party_provider?: string;
}

interface ClientDetailsPageProps {
  token: string | null;
  apiBase: string;
  client: Client;
  onBack: () => void;
}

const InfoBadge = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-800/40 border border-gray-800 rounded-xl">
      <div className="mt-0.5 text-blue-400 shrink-0">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{label}</div>
        <div className="text-sm text-gray-200 font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
};

const ClientDetailsPage: React.FC<ClientDetailsPageProps> = ({ token, apiBase, client, onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'services'>('orders');

  const authHeaders = (tkn: string | null) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        const resOrders = await fetch(`${apiBase}/clients/orders/${client.id}/`, { headers: authHeaders(token) });
        const dataOrders = await resOrders.json();
        if (resOrders.ok) {
          setOrders(dataOrders.orders || []);
        }

        // Fetch Services
        const resServices = await fetch(`${apiBase}/services/?client=${client.id}&page_size=20`, { headers: authHeaders(token) });
        const dataServices = await resServices.json();
        if (resServices.ok) {
          const results = Array.isArray(dataServices.results) ? dataServices.results : (Array.isArray(dataServices) ? dataServices : []);
          setServices(results);
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client.id, token, apiBase]);

  const taxRegimeLabel = (regime?: string) => {
    if (!regime) return undefined;
    if (regime === 'O-99' || regime.toLowerCase().includes('simplificado')) return 'Régimen Simplificado (O-99)';
    if (regime === 'O-47' || regime.toLowerCase().includes('comun') || regime.toLowerCase().includes('común')) return 'Régimen Común (O-47)';
    return regime;
  };

  const clientTypeLabel = client.client_type === 'company' ? 'Empresa' : 'Persona Natural';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header / Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Detalle del Cliente</h1>
      </div>

      {/* Client Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-gray-800 shadow-xl">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              client.client_type === 'company' 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {clientTypeLabel}
            </span>
          </div>

          {/* Name + Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white truncate">{client.full_name}</h2>
                {client.created_at && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Cliente desde {new Date(client.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="text-center px-5 py-2.5 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="text-xl font-bold text-white">{orders.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Pedidos</div>
                </div>
                <div className="text-center px-5 py-2.5 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="text-xl font-bold text-white">{services.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Servicios</div>
                </div>
              </div>
            </div>

            {/* Contact & Info Grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBadge icon={<Mail className="w-4 h-4" />} label="Correo Electrónico" value={client.email || 'Sin correo'} />
              <InfoBadge icon={<Phone className="w-4 h-4" />} label="Teléfono" value={client.phone || 'Sin teléfono'} />
              <InfoBadge icon={<CreditCard className="w-4 h-4" />} label={client.client_type === 'company' ? 'NIT' : 'Cédula / Documento'} value={client.cedula || 'Sin identificación'} />
              <InfoBadge icon={<Tag className="w-4 h-4" />} label="Tipo de Documento" value={client.identification_type || 'CC'} />
              <InfoBadge icon={<MapPin className="w-4 h-4" />} label="Dirección" value={client.address || 'Sin dirección'} />
              <InfoBadge icon={<Building2 className="w-4 h-4" />} label="Ciudad / Departamento" value={[client.city, client.department].filter(Boolean).join(', ') || undefined} />
              <InfoBadge icon={<FileText className="w-4 h-4" />} label="Régimen Fiscal (DIAN)" value={taxRegimeLabel(client.tax_regime)} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'orders' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Historial de Pedidos
          </div>
          {activeTab === 'orders' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'services' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Historial de Servicios
          </div>
          {activeTab === 'services' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Cargando información...</p>
          </div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <div className="grid grid-cols-1 gap-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-white font-medium flex items-center gap-2">
                              Pedido #{order.order_number}
                              <span className={`px-2 py-0.5 text-[10px] rounded-full border ${
                                order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-gray-700 text-gray-300 border-gray-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                              <Clock className="w-3 h-3 ml-1" />
                              {new Date(order.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {Number(order.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                              <span>{item.quantity}x {item.product}</span>
                              {item.color && <span className="text-gray-500 text-xs">({item.color})</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed text-gray-500">
                    <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                    <p>No hay pedidos registrados</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div key={service.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{service.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Entrada: {service.entry_date}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          service.status === 'entregado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 bg-gray-800/50 p-3 rounded-lg">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {service.third_party_provider && (
                            <>
                              <User className="w-3 h-3" />
                              <span>{service.third_party_provider}</span>
                            </>
                          )}
                        </div>
                        <div className="text-lg font-bold text-white">
                          {service.status === 'entregado' ? (
                            Number(service.value).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                          ) : (
                            <span className="text-amber-500 text-sm">Pendiente</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed text-gray-500">
                    <Briefcase className="w-12 h-12 mb-3 opacity-20" />
                    <p>No hay servicios registrados</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsPage;