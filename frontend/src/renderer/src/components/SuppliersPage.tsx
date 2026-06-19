import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, Plus, Edit, Trash, RefreshCw, MapPin, Mail, Phone, Building2, CheckCircle, AlertTriangle, X
} from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
}

interface SupplierForm {
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface SuppliersPageProps {
  token: string;
  apiBase: string;
}

const SuppliersPage: React.FC<SuppliersPageProps> = ({ token, apiBase }) => {
  const [items, setItems] = useState<Supplier[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SupplierForm>({ name: '', contact_name: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const authHeaders = (tkn: string) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadSuppliers = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/suppliers/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) {
        setItems(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []));
      } else {
        throw new Error('Error al cargar proveedores');
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadSuppliers(); }, [token]);

  const filteredItems = useMemo(() => {
    return items.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.contact_name && s.contact_name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const withEmail = items.filter(s => s.email && s.email.trim() !== '').length;
    const withPhone = items.filter(s => s.phone && s.phone.trim() !== '').length;
    return { total, withEmail, withPhone };
  }, [items]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Nombre de empresa obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const url = editingSupplier 
        ? `${apiBase}/products/suppliers/${editingSupplier.id}/` 
        : `${apiBase}/products/suppliers/`;
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, 
        body: JSON.stringify(form) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo guardar el proveedor');
      
      setMsg({ type: 'success', text: editingSupplier ? 'Proveedor actualizado' : 'Proveedor registrado' });
      closeModal();
      loadSuppliers();
    } catch (e2: any) {
      setMsg({ type: 'error', text: e2.message });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingSupplier) return;
    try {
      const res = await fetch(`${apiBase}/products/suppliers/${deletingSupplier.id}/`, { method: 'DELETE', headers: authHeaders(token) });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Proveedor eliminado' });
        loadSuppliers();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setDeletingSupplier(null);
    }
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({ name: s.name, contact_name: s.contact_name || '', phone: s.phone || '', email: s.email || '', address: s.address || '' });
    setErrors({});
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingSupplier(null);
    setForm({ name: '', contact_name: '', phone: '', email: '', address: '' });
    setErrors({});
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-1">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Total Proveedores</span>
          </div>
          <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-1">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Con Teléfono</span>
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.withPhone}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Con Correo</span>
          </div>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.withEmail}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Directorio de Proveedores</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar proveedor..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-2">
              <button onClick={loadSuppliers} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Recargar">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Proveedor</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredItems.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold border border-gray-300 dark:border-gray-600">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                        {s.contact_name && <div className="text-xs text-gray-500">{s.contact_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {s.email && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {s.email}
                        </div>
                      )}
                      {s.phone && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {s.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {s.address && (
                      <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <span className="truncate max-w-[200px]">{s.address}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(s)}
                        className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/10 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingSupplier(s)}
                        className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="w-12 h-12 mb-3 opacity-20" />
                      <p>No se encontraron proveedores</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Registra los datos de tu proveedor</p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Empresa / Razón Social *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border ${errors.name ? 'border-rose-500' : 'border-gray-100 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600`}
                  placeholder="Nombre legal o comercial"
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Persona de Contacto</label>
                <input 
                  type="text" 
                  value={form.contact_name} 
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })} 
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="Nombre de quien atiende"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Email</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Teléfono</label>
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Ej. +57 300 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Dirección</label>
                <textarea 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                  placeholder="Dirección física"
                  rows={2}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-6 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : (editingSupplier ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar proveedor?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Estás a punto de eliminar al proveedor <span className="font-bold text-gray-900 dark:text-white">{deletingSupplier.name}</span>. 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingSupplier(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-900/20 transition-all transform hover:scale-[1.02]"
                >
                  Eliminar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
