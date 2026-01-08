import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Layout, Eye, X, Maximize2, Loader, Download, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api.config';

interface Template {
  id: number;
  name: string;
  description: string;
  slug: string;
  image: string;
  zip_file: string;
  demo_url: string;
  color: string;
  tags: string[];
  is_personal?: boolean;
}

interface TemplatesManagerProps {
  personal?: boolean;
  token?: string;
  onOpenEditor?: (url?: string, templateId?: number) => void;
}

const TemplatesManager: React.FC<TemplatesManagerProps> = ({ personal = false, token, onOpenEditor }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; color: string; tags: string; zip?: File | null }>({ name: '', description: '', color: '', tags: '', zip: null });
  const [saving, setSaving] = useState(false);
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [personal, token]);

  const fetchTemplates = async () => {
    try {
      const url = personal ? `${API_BASE_URL}/webconfig/templates/my/` : `${API_BASE_URL}/webconfig/templates/`;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await axios.get(url, { headers });
      const data = response.data.map((t: Template) => ({
        ...t,
        image: t.image ? (t.image.startsWith('http') ? t.image : `${API_BASE_URL}${t.image}`) : t.image,
        demo_url: t.demo_url ? (t.demo_url.startsWith('http') ? t.demo_url : `${API_BASE_URL}${t.demo_url}`) : t.demo_url
      }));
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePersonalize = async (template: Template) => {
    if (!onOpenEditor) return;
    
    // If it's already a personal template, just open it
    if (template.is_personal) {
      onOpenEditor(template.demo_url, template.id);
      return;
    }

    if (!token) {
        onOpenEditor(template.demo_url, template.id);
        return;
    }

    setSaving(true);
    try {
        const response = await axios.post(
            `${API_BASE_URL}/webconfig/templates/${template.id}/clone/`, 
            {}, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const newTemplate = response.data;
        await fetchTemplates(); 
        
        // Ensure the URL is absolute before passing to editor
        const fullUrl = newTemplate.demo_url 
          ? (newTemplate.demo_url.startsWith('http') 
              ? newTemplate.demo_url 
              : `${API_BASE_URL}${newTemplate.demo_url}`)
          : newTemplate.demo_url;
          
        onOpenEditor(fullUrl, newTemplate.id);
    } catch (error) {
        console.error('Error cloning template:', error);
        onOpenEditor(template.demo_url, template.id);
    } finally {
        setSaving(false);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDelete = async (template: Template) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) return;
    
    try {
        await axios.delete(`${API_BASE_URL}/webconfig/templates/my/${template.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await fetchTemplates();
    } catch (error) {
        console.error('Error deleting template:', error);
    }
  };

  const handlePreview = (template: Template) => {
    if (template.demo_url) {
      setPreviewTemplate(template);
      setIsLoadingPreview(true);
    }
  };

  const openEdit = (t?: Template) => {
    const target = t || templates[0] || null;
    if (!target && personal) {
      setEditingTemplate({ id: 0, name: '', description: '', slug: '', image: '', zip_file: '', demo_url: '', color: '', tags: [], is_personal: true });
      setForm({ name: '', description: '', color: '', tags: '', zip: null });
      return;
    }
    if (target) {
      setEditingTemplate(target);
      setForm({ name: target.name || '', description: target.description || '', color: target.color || '', tags: (target.tags || []).join(','), zip: null });
    }
  };
  const startInlineEdit = (t: Template) => {
    setInlineEditId(t.id);
    setForm({ name: t.name || '', description: t.description || '', color: t.color || '', tags: (t.tags || []).join(','), zip: null });
  };
  const saveInlineEdit = async (t: Template) => {
    if (!token) return;
    setSaving(true);
    try {
      const url = `${API_BASE_URL}/webconfig/templates/${t.id}/`;
      const data = { name: form.name, description: form.description, color: form.color, tags: (form.tags || '').split(',').map(s => s.trim()).filter(Boolean) };
      await axios.put(url, data, { headers: { Authorization: `Bearer ${token}` } });
      setInlineEditId(null);
      await fetchTemplates();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  const cancelInlineEdit = () => {
    setInlineEditId(null);
  };

  const saveEdit = async () => {
    if (!personal) return;
    setSaving(true);
    try {
      const isCreate = editingTemplate && editingTemplate.id === 0;
      const url = isCreate ? `${API_BASE_URL}/webconfig/templates/my/` : `${API_BASE_URL}/webconfig/templates/my/${editingTemplate?.id}/`;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const data = new FormData();
      data.append('name', form.name || '');
      data.append('description', form.description || '');
      data.append('color', form.color || '');
      data.append('tags', JSON.stringify((form.tags || '').split(',').map(s => s.trim()).filter(Boolean)));
      if (form.zip) data.append('zip_file', form.zip);
      const method = isCreate ? 'post' : 'put';
      await axios[method](url, data, { headers });
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {personal ? 'Mi Plantilla Personal' : 'Galería de Plantillas'}
          </h2>
          <p className="text-gray-400">
            {personal ? 'Configura y visualiza tu plantilla personalizada' : 'Selecciona una plantilla para tu sitio web'}
          </p>
        </div>
        {personal && (
          <button
            onClick={() => openEdit(templates[0])}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-900/20"
          >
            {templates.length ? 'Editar Plantilla' : 'Crear Plantilla'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col"
          >
            {/* Browser Window Style Preview Header */}
            <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              <div className="ml-2 flex-1 h-4 bg-gray-700/50 rounded-full text-[10px] text-gray-500 flex items-center justify-center font-mono">
                {template.demo_url ? (() => { try { return new URL(template.demo_url).hostname } catch { return 'demo.local' } })() : 'demo.local'}
              </div>
            </div>

            <div className={`h-48 w-full bg-gradient-to-br ${template.color} p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
              {template.image && (
                <img
                  src={template.image}
                  alt={template.name}
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                {template.demo_url && (
                  <button
                    onClick={() => handlePreview(template)}
                    className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-gray-100 shadow-xl"
                  >
                    <Eye size={16} />
                    Vista Previa
                  </button>
                )}
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
                <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20 shadow-lg">
                  Plantilla Premium
                </div>
                <Layout className="text-white/80 w-12 h-12 mb-2" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                {inlineEditId === template.id ? (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveInlineEdit(template); if (e.key === 'Escape') cancelInlineEdit(); }}
                    className="text-xl font-bold text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-2/3"
                    placeholder="Nombre"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                )}
              </div>
              {inlineEditId === template.id ? (
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Escape') cancelInlineEdit(); }}
                  className="text-gray-200 text-sm mb-6 flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  placeholder="Descripción"
                />
              ) : (
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                  {template.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-6">
                {inlineEditId === template.id ? (
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs"
                    placeholder="Tags separados por coma"
                  />
                ) : (
                  template.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 text-xs border border-gray-700">
                      {tag}
                    </span>
                  ))
                )}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800 mt-auto">
                <button 
                  onClick={() => handlePreview(template)}
                  disabled={!template.demo_url}
                  className={`flex-1 ${template.demo_url ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-gray-700 cursor-not-allowed opacity-50'} text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg flex items-center justify-center gap-2`}
                >
                  <Eye size={16} />
                  <span>{template.demo_url ? 'Ver Demo' : 'Sin Demo'}</span>
                </button>
                {onOpenEditor && (
                  <button 
                    onClick={() => handlePersonalize(template)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Personalizar</span>
                  </button>
                )}
                {personal && (
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg flex items-center justify-center"
                    title="Eliminar plantilla"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 animate-in fade-in duration-200">
          {/* Toolbar */}
          <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div>
                <h3 className="text-white font-medium text-sm">{previewTemplate.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Vista previa en vivo
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center bg-gray-950 rounded-lg border border-gray-800 px-3 py-1.5 text-xs text-gray-400 font-mono w-64 truncate">
                 {previewTemplate.demo_url}
               </div>
               <button 
                onClick={() => handleOpenLink(previewTemplate.demo_url || '')}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Abrir en navegador"
              >
                <ExternalLink size={18} />
              </button>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="flex-1 relative bg-white">
            {isLoadingPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-gray-500 text-sm font-medium">Cargando vista previa...</p>
                </div>
              </div>
            )}
            <iframe 
              src={previewTemplate.demo_url}
              className="w-full h-full border-none"
              title={`Preview of ${previewTemplate.name}`}
              onLoad={() => setIsLoadingPreview(false)}
            />
          </div>
        </div>
      )}
      
      {personal && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{editingTemplate.id ? 'Editar Plantilla' : 'Crear Plantilla'}</h3>
              <button onClick={() => setEditingTemplate(null)} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Color (clase Tailwind)" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags separados por coma" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              <input type="file" accept=".zip" onChange={(e) => setForm({ ...form, zip: e.target.files?.[0] || null })} className="w-full text-gray-300" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300">Cancelar</button>
              <button onClick={saveEdit} disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesManager;
