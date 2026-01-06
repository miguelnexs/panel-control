import React, { useEffect, useMemo, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  Image as ImageIcon, 
  MoreHorizontal, 
  X, 
  Check, 
  AlertCircle,
  FolderOpen,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface CategoriesManagerProps {
  token: string | null;
  apiBase: string;
  role: string;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({ token, apiBase, role }) => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const authHeaders = (tkn: string | null): Record<string, string> => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadCategories = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (ordering) params.set('ordering', ordering);
      const res = await fetch(`${apiBase}/products/categories/?${params.toString()}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar categorías');
      setItems(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.count || 0));
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadCategories(); }, [token, page, pageSize, search, ordering]);

  const validateClient = () => {
    const errs: any = {};
    const nameOk = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\-\s]{1,100}$/.test(name);
    if (!nameOk) errs.name = 'Nombre requerido, máx 100 y sin caracteres inválidos.';
    if (description.length > 500) errs.description = 'Descripción máximo 500 caracteres.';
    if (imageFile) {
      const okType = ['image/jpeg','image/png','image/webp'].includes(imageFile.type);
      const okSize = imageFile.size <= 5 * 1024 * 1024;
      if (!okType) errs.image = 'Formato de imagen inválido (jpeg, png, webp).';
      if (!okSize) errs.image = 'Imagen supera 5MB.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validateClient()) return;
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('active', active ? 'true' : 'false');
      if (imageFile) fd.append('image', imageFile);
      const res = await fetch(`${apiBase}/products/categories/`, { method: 'POST', headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo crear la categoría');
      setMsg({ type: 'success', text: 'Categoría creada exitosamente' });
      setOpen(false);
      setName('');
      setDescription('');
      setActive(true);
      setImageFile(null);
      loadCategories();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const startEdit = (cat: any) => {
    setEditing(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setActive(Boolean(cat.active));
    setImageFile(null);
    setOpen(true);
  };

  const updateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validateClient()) return;
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('active', active ? 'true' : 'false');
      if (imageFile) fd.append('image', imageFile);
      const res = await fetch(`${apiBase}/products/categories/${editing.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo actualizar la categoría');
      setMsg({ type: 'success', text: 'Categoría actualizada exitosamente' });
      setOpen(false);
      setEditing(null);
      setName('');
      setDescription('');
      setActive(true);
      setImageFile(null);
      loadCategories();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const removeCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/products/categories/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'No se pudo eliminar');
      }
      setMsg({ type: 'success', text: 'Categoría eliminada' });
      loadCategories();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const mediaUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-700 transition-all">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-white font-medium">Cargando datos...</div>
          </div>
        </div>
      )}

      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Categorías" 
          value={items.length} 
          icon={FolderOpen} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          label="Activas" 
          value={items.filter((c) => !!c.active).length} 
          icon={CheckCircle2} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
        />
        <StatCard 
          label="Con Imagen" 
          value={items.filter((c) => !!c.image).length} 
          icon={ImageIcon} 
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} 
        />
        <StatCard 
          label="Sin Imagen" 
          value={items.filter((c) => !c.image).length} 
          icon={AlertCircle} 
          color={{ bg: 'bg-amber-500', text: 'text-amber-500' }} 
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Layers className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Gestión de Categorías</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Buscar categoría..."
                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full sm:w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 cursor-pointer hover:bg-gray-750 transition-colors"
                >
                  <option value="-created_at">Más recientes</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="-name">Nombre Z-A</option>
                  <option value="active">Estado</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>

              <button 
                onClick={() => setOpen(true)} 
                disabled={role !== 'admin' && role !== 'super_admin'} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Imagen</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 font-bold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400 max-w-xs truncate">{c.description || 'Sin descripción'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-700 relative group/img">
                        <img src={mediaUrl(c.image)} alt={c.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(c)} 
                        disabled={role !== 'admin' && role !== 'super_admin'}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeCategory(c.id)} 
                        disabled={role !== 'admin' && role !== 'super_admin'}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
                      <p>No se encontraron categorías</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="text-sm text-gray-500">
            Mostrando página <span className="font-medium text-white">{page}</span> de <span className="font-medium text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => { setOpen(false); setEditing(null); }} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={editing ? updateCategory : createCategory} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    className={`w-full px-4 py-2.5 bg-gray-800 border ${errors.name ? 'border-rose-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                    placeholder="Ej. Electrónica"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className={`w-full px-4 py-2.5 bg-gray-800 border ${errors.description ? 'border-rose-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none`}
                    placeholder="Breve descripción de la categoría..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Imagen</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                        id="cat-image-upload"
                      />
                      <label 
                        htmlFor="cat-image-upload" 
                        className="flex items-center justify-center w-full px-4 py-2.5 bg-gray-800 border border-gray-700 border-dashed rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-all"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {imageFile ? imageFile.name : 'Subir imagen'}
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? 'bg-blue-600' : 'bg-gray-700'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${active ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Activa</span>
                      <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="hidden" />
                    </label>
                  </div>
                </div>

                {(imageFile || (editing && editing.image)) && (
                  <div className="mt-2 relative w-full h-32 bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : mediaUrl(editing.image)} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setOpen(false); setEditing(null); }} 
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02]"
                >
                  {editing ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
