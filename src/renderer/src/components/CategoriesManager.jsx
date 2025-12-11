import React, { useEffect, useMemo, useState } from 'react';
import { Shapes, CheckCircle, Image as ImageIcon, ImageOff, Plus } from 'lucide-react';

const CategoriesManager = ({ token, apiBase, role }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const authHeaders = (tkn) => ({ ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

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
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadCategories(); }, [token, page, pageSize, search, ordering]);

  const StatCard = ({ label, value, tone = 'blue', IconCmp }) => {
    const toneBg = tone === 'emerald'
      ? 'bg-emerald-600/20 text-emerald-300'
      : tone === 'indigo'
      ? 'bg-indigo-600/20 text-indigo-300'
      : tone === 'violet'
      ? 'bg-violet-600/20 text-violet-300'
      : tone === 'rose'
      ? 'bg-rose-600/20 text-rose-300'
      : tone === 'cyan'
      ? 'bg-cyan-600/20 text-cyan-300'
      : 'bg-blue-600/20 text-blue-300';
    return (
      <div className="group relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition shadow-sm hover:shadow-md">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 to-transparent transition" />
        <div className="p-4 flex items-center gap-3">
          <div className={`w-10 h-9 rounded-lg flex items-center justify-center ${toneBg}`}>
            {IconCmp ? <IconCmp className="w-5 h-5" /> : null}
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400">{label}</div>
            <div className="text-2xl font-semibold text-white">{value}</div>
          </div>
        </div>
      </div>
    );
  };

  const validateClient = () => {
    const errs = {};
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

  const createCategory = async (e) => {
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
      setMsg({ type: 'success', text: 'Categoría creada' });
      setOpen(false);
      setName('');
      setDescription('');
      setActive(true);
      setImageFile(null);
      loadCategories();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setActive(Boolean(cat.active));
    setImageFile(null);
    setOpen(true);
  };

  const updateCategory = async (e) => {
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
      setMsg({ type: 'success', text: 'Categoría actualizada' });
      setOpen(false);
      setEditing(null);
      setName('');
      setDescription('');
      setActive(true);
      setImageFile(null);
      loadCategories();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const removeCategory = async (id) => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/products/categories/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'No se pudo eliminar');
      }
      setMsg({ type: 'success', text: 'Categoría eliminada' });
      loadCategories();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const mediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    if (path.startsWith('media/')) return `${apiBase}/${path}`;
    return `${apiBase}/media/${path}`;
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const statsTotal = items.length;
  const statsActive = items.filter((c) => !!c.active).length;
  const statsWithImage = items.filter((c) => !!c.image).length;
  const statsWithoutImage = items.filter((c) => !c.image).length;

  return (
    <div className="space-y-6 relative">
      {/* loading overlay removido */}
      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>
      )}
      <div className={`opacity-100`}>
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total categorías" value={statsTotal} IconCmp={Shapes} tone="cyan" />
            <StatCard label="Activas" value={statsActive} IconCmp={CheckCircle} tone="emerald" />
            <StatCard label="Con imagen" value={statsWithImage} IconCmp={ImageIcon} tone="indigo" />
            <StatCard label="Sin imagen" value={statsWithoutImage} IconCmp={ImageOff} tone="violet" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">Categorías</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Buscar..."
                className="px-2 py-2 text-xs rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="px-2 py-2 text-xs rounded bg-gray-700 text-white border border-gray-600"
              >
                <option value="-created_at">Más recientes</option>
                <option value="name">Nombre A-Z</option>
                <option value="-name">Nombre Z-A</option>
                <option value="active">Estado</option>
              </select>
              <button onClick={() => setOpen(true)} disabled={role !== 'admin' && role !== 'super_admin'} className="px-3 py-2 text-xs rounded bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white disabled:opacity-50 flex items-center gap-1"><Plus size={14}/> Nueva</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-800 text-gray-200">
                <tr>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Imagen</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-gray-700 hover:bg-gray-800/30">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">
                      {c.image ? (
                        <img src={mediaUrl(c.image)} alt={c.name} className="w-12 h-12 object-cover rounded border border-gray-600" />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center text-gray-500 border border-dashed border-gray-600 rounded text-[10px]">Sin</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-pre-wrap">{c.description || ''}</td>
                    <td className="px-3 py-2">
                      {c.active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full border border-white/10 bg-emerald-600/15 text-emerald-300 text-xs">Activo</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full border border-white/10 bg-rose-600/15 text-rose-300 text-xs">Inactivo</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(c)} disabled={role !== 'admin' && role !== 'super_admin'} className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">Editar</button>
                        <button onClick={() => removeCategory(c.id)} disabled={role !== 'admin' && role !== 'super_admin'} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-center text-gray-400" colSpan={5}>No hay categorías.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3 text-gray-300">
            <div>
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Anterior</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white">Siguiente</button>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600">
                {[10,20,50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
              </select>
            </div>
          </div>
        </div>

        
      </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded p-4 w-full max-w-lg">
            <div className="text-white font-medium mb-3">{editing ? 'Editar categoría' : 'Nueva categoría'}</div>
            <form onSubmit={editing ? updateCategory : createCategory} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className={`px-3 py-2 rounded bg-gray-700 text-white border ${errors.name ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2`}
                placeholder="Nombre de la categoría"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className={`px-3 py-2 rounded bg-gray-700 text-white border ${errors.description ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2`}
                placeholder="Descripción"
                rows={4}
              />
              <label className="flex items-center gap-2 text-gray-200">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Activa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                className={`px-3 py-2 rounded bg-gray-700 text-white border ${errors.image ? 'border-red-600' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2`}
              />
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="md:col-span-2 w-32 h-32 object-cover rounded border border-gray-600" />
              )}
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
                <button type="submit" className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar</button>
              </div>
              {Object.values(errors).length > 0 && (
                <div className="md:col-span-2 text-red-300 text-sm">Revise los errores marcados en el formulario.</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
