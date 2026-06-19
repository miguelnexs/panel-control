import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api.config';
import { Check, X, Edit, Save, AlertTriangle, Info, Users, TrendingUp, Package } from 'lucide-react';

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
  enable_basic_dashboard: boolean;
  enable_basic_sales: boolean;
  enable_basic_stats: boolean;
  enable_user_management: boolean;
  enable_advanced_sales_analysis: boolean;
  enable_inventory_management: boolean;
  enable_detailed_reports: boolean;
  enable_third_party_integrations: boolean;
  enable_supplier_management: boolean;
  enable_daily_backups: boolean;
  enable_web_store: boolean;
  enable_custom_domain: boolean;
  enable_marketing_tools: boolean;
  enable_api_access: boolean;
  enable_priority_support: boolean;
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
  trial_end_date?: string | null;
  has_paid?: boolean;
  is_trial_active?: boolean;
}

const PlansManager: React.FC<PlansManagerProps> = ({ token, role }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  } | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };
  
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

  const handleAssign = (adminId: number, planId: string) => {
    const isDeactivating = planId === '';
    const confirmMsg = isDeactivating 
      ? 'Esta acción revocará la suscripción del usuario. No podrá acceder a las funciones premium de su tienda.' 
      : 'Se le otorgará al usuario acceso a los límites y características del plan seleccionado.';
      
    setConfirmDialog({
      isOpen: true,
      title: isDeactivating ? '¿Desactivar suscripción?' : '¿Confirmar asignación de plan?',
      message: confirmMsg,
      isDanger: isDeactivating,
      onConfirm: async () => {
        setConfirmDialog(null);
        setAssigning(true);
        try {
          const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
          
          let res;
          if (isDeactivating) {
            res = await fetch(`${apiBase}/users/api/subscriptions/tenants/${adminId}/deactivate/`, {
              method: 'POST',
              headers
            });
          } else {
            res = await fetch(`${apiBase}/users/api/subscriptions/plans/${planId}/assign/`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ user_id: adminId })
            });
          }
          
          if (res.ok) {
            showNotification(isDeactivating ? 'Plan desactivado con éxito' : 'Plan asignado con éxito', 'success');
            await loadData();
          } else {
            showNotification(isDeactivating ? 'Error desactivando el plan' : 'Error asignando el plan', 'error');
          }
        } catch {
          showNotification('Error de conexión', 'error');
        } finally {
          setAssigning(false);
        }
      }
    });
  };

  const handleUpdateTrial = async (adminId: number, days: number | null, hasPaid: boolean | null = null) => {
    setAssigning(true);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const body: any = {};
      if (days !== null) body.days = days;
      if (hasPaid !== null) body.has_paid = hasPaid;

      const res = await fetch(`${apiBase}/users/api/subscriptions/tenants/${adminId}/update-trial/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (res.ok) {
        showNotification('Período de prueba/suscripción actualizado con éxito', 'success');
        await loadData();
      } else {
        showNotification('Error actualizando período de prueba', 'error');
      }
    } catch {
      showNotification('Error de conexión', 'error');
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
        showNotification('Plan actualizado correctamente', 'success');
        await loadData();
      } else {
        showNotification('Error actualizando el plan', 'error');
      }
    } catch {
      showNotification('Error de conexión', 'error');
    }
  };

  const handleEditChange = (field: keyof Plan, value: any) => {
    setEditingPlan(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  if (loading) return <div className="p-8 text-center text-gray-700 dark:text-white">Cargando planes...</div>;

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
                relative flex flex-col p-8 rounded-2xl border transition-all duration-300 group backdrop-blur-md
                ${isPopular 
                  ? 'bg-white border-indigo-200 shadow-xl md:-translate-y-2 dark:bg-slate-900/60 dark:border-indigo-500/40 dark:shadow-[0_0_30px_rgba(99,102,241,0.08)] dark:md:-translate-y-4' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-slate-900/20 dark:border-slate-800/60 dark:hover:border-slate-700/80 dark:hover:bg-slate-900/40 hover:shadow-lg'
                }
              `}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg tracking-wide uppercase">
                  Más Popular
                </div>
              )}

              {role === 'super_admin' && (
                <button 
                  onClick={() => setEditingPlan(plan)}
                  className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Editar Plan"
                >
                  <Edit size={16} />
                </button>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(plan.price)}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm font-medium">/mes</span>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                {/* Limits Section */}
                <div className="space-y-3 pb-6 border-b border-gray-200 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Usuarios</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{plan.max_users === -1 ? 'Ilimitados' : plan.max_users}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Productos</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{plan.max_products === -1 ? 'Ilimitados' : plan.max_products}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-455">Categorías</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{plan.max_categories === -1 ? 'Ilimitadas' : plan.max_categories}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Transacciones</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{plan.max_transactions_per_month === -1 ? 'Ilimitadas' : plan.max_transactions_per_month}/mes</span>
                  </div>
                </div>
                
                {/* Features List */}
                <div className="space-y-3 pt-2">
                    {[
                      { key: 'enable_basic_dashboard', label: 'Panel Básico' },
                      { key: 'enable_basic_sales', label: 'Ventas Básicas' },
                      { key: 'enable_basic_stats', label: 'Métricas Básicas' },
                      { key: 'enable_user_management', label: 'Gestión de Usuarios' },
                      { key: 'enable_advanced_sales_analysis', label: 'Análisis Avanzado' },
                      { key: 'enable_inventory_management', label: 'Inventario Avanzado' },
                      { key: 'enable_detailed_reports', label: 'Reportes Detallados' },
                      { key: 'enable_third_party_integrations', label: 'Integraciones de Terceros' },
                      { key: 'enable_supplier_management', label: 'Gestión de Proveedores' },
                      { key: 'enable_daily_backups', label: 'Copias de Seguridad' },
                      { key: 'enable_web_store', label: 'Tienda Virtual' },
                      { key: 'enable_custom_domain', label: 'Dominio Personalizado' },
                      { key: 'enable_marketing_tools', label: 'Herramientas de Marketing' },
                      { key: 'enable_api_access', label: 'Acceso a API' },
                      { key: 'enable_priority_support', label: 'Soporte Prioritario' },
                      { key: 'enable_whatsapp_notifications', label: 'Notif. WhatsApp' },
                      { key: 'enable_electronic_invoicing', label: 'Facturación Electrónica' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-start gap-3 text-sm group/item">
                        <div className={`mt-0.5 p-0.5 rounded-full ${plan[feature.key as keyof Plan] ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' : 'text-gray-400 bg-gray-150 dark:text-slate-600 dark:bg-slate-800'}`}>
                          {plan[feature.key as keyof Plan] ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                        </div>
                        <span className={`${plan[feature.key as keyof Plan] ? 'text-gray-750 dark:text-gray-300' : 'text-gray-400 dark:text-slate-500 line-through'}`}>
                          {feature.label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              <button className={`
                w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg
                ${isPopular 
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-indigo-100 dark:shadow-indigo-500/20' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700'
                }
              `}>
                Seleccionar Plan
              </button>
            </div>
          );
        })}
      </div>

      {/* Assignment Section */}
      <div className="pt-8 border-t border-gray-200 dark:border-slate-800">
        {/* Banner informativo premium */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Solo yo escojo el tiempo de cada persona</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Como Super Administrador, puedes conceder acceso ilimitado o elegir los días exactos de prueba de cada cliente.</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
          Asignación de Planes
        </h3>
        <div className="bg-white rounded-2xl border border-gray-250 shadow-sm overflow-hidden dark:bg-slate-900/30 dark:border-slate-800/80 dark:shadow-2xl">
          <table className="w-full text-left text-gray-700 dark:text-gray-350">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 dark:bg-slate-950/60 dark:text-slate-400 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-5">Administrador</th>
                <th className="p-5">Email</th>
                <th className="p-5">Estadísticas</th>
                <th className="p-5">Plan Actual</th>
                <th className="p-5">Prueba / Duración</th>
                <th className="p-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-slate-850/50">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-900/40 transition-colors duration-200">
                  <td className="p-5 font-semibold text-gray-900 dark:text-white">{tenant.username}</td>
                  <td className="p-5 text-gray-500 dark:text-gray-400 text-sm">{tenant.email}</td>
                  <td className="p-5">
                    <div className="flex flex-col space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users size={14} className="text-indigo-500 dark:text-indigo-400" />
                        <span><strong className="text-gray-900 dark:text-white font-medium">{tenant.clients_count || 0}</strong> Clientes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <TrendingUp size={14} className="text-violet-500 dark:text-violet-400" />
                        <span><strong className="text-gray-900 dark:text-white font-medium">{tenant.sales_count || 0}</strong> Ventas</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Package size={14} className="text-pink-500 dark:text-pink-400" />
                        <span><strong className="text-gray-900 dark:text-white font-medium">{tenant.products_count || 0}</strong> Productos</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      !tenant.plan_name || tenant.plan_name === 'Sin Plan' || tenant.plan_name === 'Plan Desactivado'
                        ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20'
                        : tenant.plan_name.includes('Básico') ? 'bg-blue-105 text-blue-750 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                        tenant.plan_name.includes('Medio') ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20' :
                        'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                    }`}>
                      {tenant.plan_name || 'Plan Desactivado'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {tenant.has_paid ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            Pago Confirmado
                          </span>
                        ) : (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            tenant.is_trial_active 
                              ? 'text-amber-500 bg-amber-500/10' 
                              : 'text-rose-500 bg-rose-500/10'
                          }`}>
                            {tenant.is_trial_active ? 'Prueba Activa' : 'Prueba Expirada'}
                          </span>
                        )}
                        {tenant.trial_end_date && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            Expira: {new Date(tenant.trial_end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateTrial(tenant.admin_id, null, !tenant.has_paid)}
                          disabled={assigning}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                            tenant.has_paid
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                          }`}
                          title={tenant.has_paid ? 'Remueve el estado de pago y permite reactivar la prueba gratis' : 'Marca al usuario como pagado y remueve el límite de días de prueba gratis'}
                        >
                          {tenant.has_paid ? 'Poner en Prueba' : 'Marcar como Pagado (Quitar Prueba)'}
                        </button>
                        <select
                          className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value !== "") {
                              handleUpdateTrial(tenant.admin_id, parseInt(e.target.value), false);
                              e.target.value = "";
                            }
                          }}
                          disabled={assigning}
                        >
                          <option value="">Ajustar prueba...</option>
                          <option value="15">15 Días</option>
                          <option value="30">30 Días</option>
                          <option value="90">90 Días</option>
                          <option value="0">Expirar ya</option>
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <select 
                      className={`bg-white border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 px-3 py-2 outline-none transition-all dark:bg-slate-950 ${
                        !tenant.plan_id
                          ? 'border-red-400 text-red-600 font-semibold dark:border-red-500/30 dark:text-red-400'
                          : 'border-gray-300 text-gray-700 dark:border-slate-800 dark:text-gray-250'
                      }`}
                      value={tenant.plan_id || ''}
                      onChange={(e) => handleAssign(tenant.admin_id, e.target.value)}
                      disabled={assigning}
                    >
                      <option value="" className="text-red-500 font-semibold bg-white dark:bg-slate-950">🔴 Plan Desactivado</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id} className="bg-white text-gray-700 dark:bg-slate-950 dark:text-white">{p.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">No hay administradores registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B0D14] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden relative animate-scale-up">
            <div className="p-6 border-b border-gray-250 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Editar {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePlan} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={editingPlan.name} 
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Precio ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingPlan.price} 
                    onChange={(e) => handleEditChange('price', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</label>
                <textarea 
                  value={editingPlan.description} 
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-20 resize-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Máx. Usuarios (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_users} 
                    onChange={(e) => handleEditChange('max_users', parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Máx. Transacciones (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_transactions_per_month} 
                    onChange={(e) => handleEditChange('max_transactions_per_month', parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Máx. Productos (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_products} 
                    onChange={(e) => handleEditChange('max_products', parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-555 dark:text-gray-400 mb-1">Máx. Categorías (-1 ilim.)</label>
                  <input 
                    type="number" 
                    value={editingPlan.max_categories} 
                    onChange={(e) => handleEditChange('max_categories', parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-250 dark:border-slate-800">
                <h4 className="font-medium text-gray-905 dark:text-white">Funcionalidades</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'enable_basic_dashboard', label: 'Panel Básico' },
                    { key: 'enable_basic_sales', label: 'Ventas Básicas' },
                    { key: 'enable_basic_stats', label: 'Métricas Básicas' },
                    { key: 'enable_user_management', label: 'Gestión de Usuarios' },
                    { key: 'enable_advanced_sales_analysis', label: 'Análisis Avanzado' },
                    { key: 'enable_inventory_management', label: 'Inventario Avanzado' },
                    { key: 'enable_detailed_reports', label: 'Reportes Detallados' },
                    { key: 'enable_third_party_integrations', label: 'Integraciones de Terceros' },
                    { key: 'enable_supplier_management', label: 'Gestión de Proveedores' },
                    { key: 'enable_daily_backups', label: 'Copias de Seguridad' },
                    { key: 'enable_web_store', label: 'Tienda Virtual' },
                    { key: 'enable_custom_domain', label: 'Dominio Personalizado' },
                    { key: 'enable_marketing_tools', label: 'Herramientas de Marketing' },
                    { key: 'enable_api_access', label: 'Acceso a API' },
                    { key: 'enable_priority_support', label: 'Soporte Prioritario' },
                    { key: 'enable_whatsapp_notifications', label: 'Notif. WhatsApp' },
                    { key: 'enable_electronic_invoicing', label: 'Facturación Electrónica' },
                  ].map((feature) => (
                    <label key={feature.key} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={editingPlan[feature.key as keyof Plan] as boolean} 
                        onChange={(e) => handleEditChange(feature.key as keyof Plan, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-800 text-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-250 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-250 bg-white hover:bg-gray-50 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-gray-300 font-medium transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20 transition-all"
                >
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B0D14] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
            {/* Top decorative glow */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${confirmDialog.isDanger ? 'from-red-500 to-pink-500' : 'from-indigo-500 to-violet-600'}`}></div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${confirmDialog.isDanger ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  {confirmDialog.isDanger ? <AlertTriangle size={24} /> : <Check size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{confirmDialog.title}</h3>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-250 bg-white hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-850 text-gray-700 dark:text-gray-350 font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-2 text-sm rounded-xl text-white font-semibold shadow-lg transition-all ${
                    confirmDialog.isDanger 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 shadow-red-950/20' 
                      : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-950/20'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[120] flex items-center gap-3 bg-white dark:bg-[#0B0D14] border border-gray-200 dark:border-slate-800 px-5 py-4 rounded-xl shadow-2xl animate-slide-in-right max-w-sm">
          <div className={`p-2 rounded-full ${
            notification.type === 'success' ? 'bg-indigo-500/10 text-indigo-455' :
            notification.type === 'error' ? 'bg-red-500/10 text-red-400' :
            'bg-blue-500/10 text-blue-400'
          }`}>
            {notification.type === 'success' ? <Check size={18} /> :
             notification.type === 'error' ? <AlertTriangle size={18} /> :
             <Info size={18} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PlansManager;
