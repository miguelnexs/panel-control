import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api.config';
import { Check, X, Edit, Save } from 'lucide-react';

interface PlansManagerProps {
  token: string | null;
  role?: string;
}

interface Plan {
  id: number;
  name: string;
  price: number | string;
  description: string;
  max_users: number;
  max_products: number;
  max_categories: number;
  max_transactions_per_month: number;
  enable_user_management: boolean;
  enable_web_store: boolean;
  enable_inventory_management: boolean;
  enable_marketing_tools: boolean;
  enable_advanced_sales_analysis: boolean;
  enable_supplier_management: boolean;
  enable_daily_backups: boolean;
  enable_whatsapp_notifications: boolean;
  enable_electronic_invoicing: boolean;
}

interface Tenant {
  id: number;
  username: string;
  email: string;
  admin_id: number;
  clients_count: number;
  sales_count: number;
  products_count: number;
  plan_name: string | null;
  plan_id: number | null;
}

const PlansManager: React.FC<PlansManagerProps> = ({ token, role }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  const apiBase = API_BASE_URL;

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(value));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      
      const promises = [fetch(`${apiBase}/users/api/subscriptions/plans/`, { headers })];
      if (role === 'super_admin') {
        promises.push(fetch(`${apiBase}/users/api/subscriptions/tenants/`, { headers }));
      }
      
      const [pRes, tRes] = await Promise.all(promises);
      
      if (pRes && pRes.ok) {
        const pData = await pRes.json();
        setPlans(Array.isArray(pData) ? pData : (pData.results || []));
      }
      
      if (tRes && tRes.ok) {
        const tData = await tRes.json();
        setTenants(Array.isArray(tData) ? tData : (tData.results || []));
      }
    } catch (e) {
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAssign = async (adminId: number, planId: string) => {
    if (!confirm('¿Estás seguro de asignar este plan?')) return;
    setAssigning(true);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const res = await fetch(`${apiBase}/users/api/subscriptions/plans/${planId}/assign/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: adminId })
      });
      if (res.ok) {
        await loadData();
      } else {
        alert('Error asignando plan');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const res = await fetch(`${apiBase}/users/api/subscriptions/plans/${editingPlan.id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(editingPlan)
      });
      
      if (res.ok) {
        setEditingPlan(null);
        await loadData();
      } else {
        alert('Error actualizando el plan');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleEditChange = (field: keyof Plan, value: any) => {
    setEditingPlan(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  if (loading) return <div className="p-8 text-center text-white">Cargando planes...</div>;

  return (
    <div className="space-y-10 relative animate-fade-in">
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isPopular = plan.name.toLowerCase().includes('professional') || plan.name.toLowerCase().includes('medio');
          return (
            <div 
              key={plan.id} 
              className={`
                relative flex flex-col p-8 rounded-2xl border transition-all duration-300 group
                ${isPopular 
                  ? 'bg-gradient-to-b from-gray-800/80 to-gray-900/80 border-emerald-500/50 shadow-2xl shadow-emerald-900/20 transform md:-translate-y-4' 
                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'
                }
              `}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg tracking-wide uppercase">
                  Más Popular
                </div>
              )}

              {role === 'super_admin' && (
                <button 
                  onClick={() => setEditingPlan(plan)}
                  className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Editar Plan"
                >
                  <Edit size={16} />
                </button>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline">
                <span className="text-4xl font-bold text-white tracking-tight">{formatCurrency(plan.price)}</span>
                <span className="text-gray-500 ml-2 text-sm font-medium">/mes</span>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                {/* Limits Section */}
                <div className="space-y-3 pb-6 border-b border-gray-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Usuarios</span>
                    <span className="font-semibold text-white">{plan.max_users === -1 ? 'Ilimitados' : plan.max_users}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Productos</span>
                    <span className="font-semibold text-white">{plan.max_products === -1 ? 'Ilimitados' : plan.max_products}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Categorías</span>
                    <span className="font-semibold text-white">{plan.max_categories === -1 ? 'Ilimitadas' : plan.max_categories}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Transacciones</span>
                    <span className="font-semibold text-white">{plan.max_transactions_per_month === -1 ? 'Ilimitadas' : plan.max_transactions_per_month}/mes</span>
                  </div>
                </div>
                
                {/* Features List */}
                <div className="space-y-3 pt-2">
                    {[
                      { key: 'enable_user_management', label: 'Gestión de Usuarios' },
                      { key: 'enable_web_store', label: 'Tienda Virtual' },
                      { key: 'enable_inventory_management', label: 'Inventario Avanzado' },
                      { key: 'enable_marketing_tools', label: 'Herramientas de Marketing' },
                      { key: 'enable_advanced_sales_analysis', label: 'Análisis Avanzado' },
                      { key: 'enable_supplier_management', label: 'Gestión de Proveedores' },
                      { key: 'enable_daily_backups', label: 'Copias de Seguridad' },
                      { key: 'enable_whatsapp_notifications', label: 'Notif. WhatsApp' },
                      { key: 'enable_electronic_invoicing', label: 'Facturación Electrónica' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-start gap-3 text-sm group/item">
                        <div className={`mt-0.5 p-0.5 rounded-full ${plan[feature.key as keyof Plan] ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-600 bg-gray-800'}`}>
                          {plan[feature.key as keyof Plan] ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                        </div>
                        <span className={`${plan[feature.key as keyof Plan] ? 'text-gray-300' : 'text-gray-600 line-through'}`}>
                          {feature.label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              <button className={`
                w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg
                ${isPopular 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-900/20' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white hover:text-white border border-gray-700'
                }
              `}>
                Seleccionar Plan
              </button>
            </div>
          );
        })}
      </div>

      {/* Assignment Section */}
      <div className="pt-8 border-t border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
          Asignación de Planes
        </h3>
        <div className="bg-gray-900/40 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="p-4">Administrador</th>
                <th className="p-4">Email</th>
                <th className="p-4">Estadísticas</th>
                <th className="p-4">Plan Actual</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-750">
                  <td className="p-4 font-medium text-white">{tenant.username}</td>
                  <td className="p-4">{tenant.email}</td>
                  <td className="p-4">
                  <div className="flex flex-col space-y-1 text-xs text-gray-400">
                    <div><span className="text-white font-medium">{tenant.clients_count || 0}</span> Clientes</div>
                    <div><span className="text-white font-medium">{tenant.sales_count || 0}</span> Ventas</div>
                    <div><span className="text-white font-medium">{tenant.products_count || 0}</span> Productos</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    !tenant.plan_name ? 'bg-gray-700 text-gray-400' :
                    tenant.plan_name.includes('Básico') ? 'bg-blue-900 text-blue-300' :
                    tenant.plan_name.includes('Medio') ? 'bg-purple-900 text-purple-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {tenant.plan_name || 'Sin Plan'}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    className="bg-gray-700 border-none rounded text-sm text-white focus:ring-2 focus:ring-blue-500"
                    value={tenant.plan_id || ''}
                    onChange={(e) => handleAssign(tenant.admin_id, e.target.value)}
                    disabled={assigning}
                  >
                    <option value="">Seleccionar plan...</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No hay administradores registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
              <h3 className="text-xl font-bold text-white">Editar {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={editingPlan.name} 
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Precio ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingPlan.price} 
                    onChange={(e) => handleEditChange('price', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                <textarea 
                  value={editingPlan.description} 
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Usuarios (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_users} 
                    onChange={(e) => handleEditChange('max_users', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Transacciones (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_transactions_per_month} 
                    onChange={(e) => handleEditChange('max_transactions_per_month', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Productos (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_products} 
                    onChange={(e) => handleEditChange('max_products', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Categorías (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_categories} 
                    onChange={(e) => handleEditChange('max_categories', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <h4 className="font-medium text-white">Funcionalidades</h4>
                
                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_user_management} 
                    onChange={(e) => handleEditChange('enable_user_management', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Gestión de Usuarios</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_web_store} 
                    onChange={(e) => handleEditChange('enable_web_store', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Tienda Virtual</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_inventory_management} 
                    onChange={(e) => handleEditChange('enable_inventory_management', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Inventario Avanzado</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_marketing_tools} 
                    onChange={(e) => handleEditChange('enable_marketing_tools', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Herramientas de Marketing</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_advanced_sales_analysis} 
                    onChange={(e) => handleEditChange('enable_advanced_sales_analysis', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Análisis Avanzado</span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_supplier_management} 
                    onChange={(e) => handleEditChange('enable_supplier_management', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Gestión de Proveedores</span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_daily_backups} 
                    onChange={(e) => handleEditChange('enable_daily_backups', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Copias de Seguridad</span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_whatsapp_notifications} 
                    onChange={(e) => handleEditChange('enable_whatsapp_notifications', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Notificaciones WhatsApp</span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPlan.enable_electronic_invoicing} 
                    onChange={(e) => handleEditChange('enable_electronic_invoicing', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Habilitar Facturación Electrónica</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2">
                <button 
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                >
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansManager;
