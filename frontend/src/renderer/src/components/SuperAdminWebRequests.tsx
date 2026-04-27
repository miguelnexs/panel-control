import React, { useEffect, useState } from 'react';
import { Globe, Calendar, User, Building2, Palette, Link as LinkIcon, MessageSquare, Loader2, CheckCircle2, Clock, Send, Upload, HelpCircle, FileText, Layout, Trash, Eye, X, Plus } from 'lucide-react';
import Icon from './dashboard/Icon';

interface Template {
  id: number;
  name: string;
  description: string;
  demo_url: string;
  image: string;
}

interface WebsiteRequest {
  id: number;
  business_name: string;
  business_type: string;
  primary_colors: string;
  preferred_subdomain: string;
  additional_notes: string;
  proposals: string[];
  files: { name: string; url: string }[];
  questions: string[];
  answers: Record<string, string>;
  status: string;
  live_url: string;
  created_at: string;
  tenant_admin: string;
  tenant_name: string;
  enable_web_advertising: boolean;
  enable_web_sync: boolean;
  stats: {
    products: number;
    sales: number;
    clients: number;
  };
}

interface Props {
  apiBase: string;
  token: string | null;
}

const SuperAdminWebRequests: React.FC<Props> = ({ apiBase, token }) => {
  const [requests, setRequests] = useState<WebsiteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  
  // Plantillas State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', zip: null as File | null });
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${apiBase}/webconfig/templates/`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.results || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.zip) return;
    setSavingTemplate(true);
    const formData = new FormData();
    formData.append('name', newTemplate.name);
    formData.append('description', newTemplate.description);
    formData.append('zip_file', newTemplate.zip);

    try {
      const res = await fetch(`${apiBase}/webconfig/templates/`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      if (res.ok) {
        setNewTemplate({ name: '', description: '', zip: null });
        setShowTemplateForm(false);
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
    try {
      const res = await fetch(`${apiBase}/webconfig/templates/${id}/`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/webconfig/website-request/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (id: number, data: any, isFormData = false) => {
    try {
      let body;
      let headers: any = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      if (isFormData) {
        body = data;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ id, ...data });
      }

      const res = await fetch(`${apiBase}/webconfig/website-request/`, {
        method: 'PATCH',
        headers,
        body
      });
      if (res.ok) {
        fetchRequests();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleFileUpload = async (id: number, file: File) => {
    setUploadingId(id);
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('file', file);
    await updateRequest(id, formData, true);
    setUploadingId(null);
  };

  const addQuestion = async (id: number, currentQuestions: string[], text: string) => {
    if (!text.trim()) return;
    const questions = [...(currentQuestions || []), text];
    await updateRequest(id, { questions });
  };

  const addProposal = async (id: number, currentProposals: string[], text: string) => {
    if (!text.trim()) return;
    const proposals = [...(currentProposals || []), text];
    await updateRequest(id, { proposals });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'in_progress':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase"><Loader2 className="w-3 h-3 animate-spin" /> En Proceso</span>;
      case 'completed':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Completado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 text-xs font-bold uppercase">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando solicitudes de clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" /> Centro de Despliegue Web
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona archivos, propuestas y comunicación directa con tus clientes.</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all font-black text-sm uppercase tracking-wider"
        >
          Sincronizar
        </button>
      </div>

      {/* Gestión de Plantillas Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Layout className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestión de Plantillas Globales</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sube nuevos diseños (.zip) para que tus clientes puedan verlos como propuestas.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTemplateForm(!showTemplateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
          >
            {showTemplateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showTemplateForm ? 'Cerrar' : 'Nueva Plantilla'}
          </button>
        </div>

        {showTemplateForm && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nombre de la Plantilla</label>
                  <input 
                    type="text" 
                    value={newTemplate.name}
                    onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Ej: Elegancia Moderna"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Descripción Corta</label>
                  <textarea 
                    value={newTemplate.description}
                    onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Describe los beneficios de este diseño..."
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl relative group">
                {newTemplate.zip ? (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{newTemplate.zip.name}</p>
                    <button onClick={() => setNewTemplate({...newTemplate, zip: null})} className="mt-2 text-[10px] text-red-500 font-bold uppercase underline">Cambiar archivo</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-300 mb-2 group-hover:text-orange-500 transition-colors" />
                    <p className="text-xs text-gray-500 font-medium text-center">Arrastra o selecciona el archivo <span className="font-bold">.zip</span> del diseño</p>
                    <input 
                      type="file" 
                      accept=".zip"
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={e => setNewTemplate({...newTemplate, zip: e.target.files?.[0] || null})}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleCreateTemplate}
                disabled={savingTemplate || !newTemplate.name || !newTemplate.zip}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-orange-500/20"
              >
                {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar Plantilla
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {templates.map(tpl => (
             <div key={tpl.id} className="group p-4 bg-gray-50 dark:bg-black/20 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Layout className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                   </div>
                   <div className="overflow-hidden">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase truncate">{tpl.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate tracking-tight">ID: {tpl.id}</p>
                   </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => window.open(`${apiBase}${tpl.demo_url}`, '_blank')}
                     className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-blue-500"
                     title="Ver Previa"
                   >
                     <Eye className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => deleteTemplate(tpl.id)}
                     className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-red-500"
                     title="Eliminar"
                   >
                     <Trash className="w-4 h-4" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {requests.map((req) => (
          <div key={req.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-blue-500/5 transition-all group border-t-8 border-t-blue-500">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Building2 className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{req.business_name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-blue-500 font-bold">{req.business_type}</span>
                       <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                       <span className="text-xs text-gray-400 font-mono underline uppercase tracking-tighter">ID: {req.tenant_name}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(req.status)}
                <div className="px-4 py-2 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 text-xs text-gray-500">
                  Solicitado: <span className="font-bold text-gray-900 dark:text-white">{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actividad Web Stats */}
              <div className="mt-4 flex flex-wrap gap-4 px-2 mb-8">
                 <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                   <Icon name="products" className="w-3.5 h-3.5 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{(req.stats?.products || 0)} Productos</span>
                 </div>
                 <div className="flex items-center gap-2 bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10">
                   <Icon name="sales" className="w-3.5 h-3.5 text-blue-500" />
                   <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{(req.stats?.sales || 0)} Ventas</span>
                 </div>
                 <div className="flex items-center gap-2 bg-purple-500/5 px-3 py-1.5 rounded-full border border-purple-500/10">
                   <Icon name="clients" className="w-3.5 h-3.5 text-purple-500" />
                   <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">{(req.stats?.clients || 0)} Clientes</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                   <div className="bg-orange-500/5 rounded-3xl p-6 border border-orange-500/10">
                      <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <HelpCircle className="w-3 h-3" /> Controles Avanzados
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-500 font-bold">Publicidad Web:</span>
                           <button 
                             onClick={() => updateRequest(req.id, { enable_web_advertising: !req.enable_web_advertising })}
                             className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${req.enable_web_advertising ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}
                           >
                             {req.enable_web_advertising ? 'Activada' : 'Desactivada'}
                           </button>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-500 font-bold">Sincronización:</span>
                           <button 
                             onClick={() => updateRequest(req.id, { enable_web_sync: !req.enable_web_sync })}
                             className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${req.enable_web_sync ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
                           >
                             {req.enable_web_sync ? 'Activa' : 'Pausada'}
                           </button>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-orange-500/10">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Link de la Web (Prevista):</span>
                            <div className="relative group">
                              <input 
                                type="text" 
                                defaultValue={req.live_url || ''}
                                placeholder="https://tu-tienda.com"
                                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-500 transition-all pr-10"
                                onBlur={(e) => updateRequest(req.id, { live_url: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateRequest(req.id, { live_url: (e.target as HTMLInputElement).value });
                                    (e.target as any).blur();
                                  }
                                }}
                              />
                              <LinkIcon className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500" />
                            </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-gray-50 dark:bg-black/20 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Preferencias
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Colores:</p>
                          <p className="text-sm text-gray-900 dark:text-white font-bold">{req.primary_colors || 'Sin definir'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Subdominio:</p>
                          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black">
                            <LinkIcon className="w-3 h-3" />
                            <span>{req.preferred_subdomain || 'Auto'}.softwarebycg.shop</span>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-blue-500/5 rounded-3xl p-6 border border-blue-500/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                          <Upload className="w-3 h-3" /> Archivos
                        </h4>
                        <label className="cursor-pointer bg-blue-500 text-white p-1.5 rounded-lg hover:scale-110 transition-all shadow-lg shadow-blue-500/20">
                          <Upload className="w-3 h-3" />
                          <input 
                            type="file" className="hidden" 
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(req.id, e.target.files[0])}
                          />
                        </label>
                      </div>
                      <div className="space-y-2">
                        {(!req.files || req.files.length === 0) ? (
                          <p className="text-[10px] text-gray-400 italic">No hay archivos compartidos.</p>
                        ) : (
                          req.files.map((file, idx) => (
                            <a 
                              key={idx} href={file.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded-xl border border-gray-100 dark:border-white/5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <FileText className="w-3 h-3" /> {file.name}
                            </a>
                          ))
                        )}
                        {uploadingId === req.id && (
                          <div className="flex items-center gap-2 text-[10px] text-blue-500 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Subiendo archivo...
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-black/20 rounded-3xl p-6 border border-gray-100 dark:border-white/5 h-full">
                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Send className="w-3 h-3" /> Propuestas de Diseño
                    </h4>
                    <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto thin-scrollbar pr-2 text-left">
                      {(!req.proposals || req.proposals.length === 0) ? (
                        <p className="text-xs text-gray-400 italic">Esperando primera propuesta...</p>
                      ) : (
                        req.proposals.map((prop, idx) => (
                          <div key={idx} className="bg-indigo-50/50 dark:bg-indigo-500/5 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 text-sm text-gray-700 dark:text-gray-300 relative group">
                            <CheckCircle2 className="w-3 h-3 text-green-500 absolute -left-1 -top-1" />
                            <span className="break-all">{prop}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Escribe una propuesta..."
                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addProposal(req.id, req.proposals || [], (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          addProposal(req.id, req.proposals || [], input.value);
                          input.value = '';
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 text-white p-2 rounded-xl hover:bg-indigo-600 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-purple-500/5 rounded-3xl p-6 border border-purple-500/10 h-full flex flex-col">
                    <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <HelpCircle className="w-3 h-3" /> Preguntas al Cliente
                    </h4>
                    <div className="flex-1 space-y-4 mb-6 overflow-y-auto thin-scrollbar pr-2 text-left">
                      {(!req.questions || req.questions.length === 0) ? (
                        <p className="text-xs text-gray-400 italic">No has hecho preguntas aún.</p>
                      ) : (
                        req.questions.map((q, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="bg-purple-100 dark:bg-purple-500/10 p-3 rounded-2xl text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                              Q: {q}
                            </div>
                            {req.answers?.[q] ? (
                              <div className="bg-green-500/10 p-3 rounded-2xl text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 ml-4">
                                A: {req.answers[q]}
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400 italic ml-4">Esperando respuesta...</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="relative mt-auto">
                      <input 
                        type="text" 
                        placeholder="Haz una pregunta específica..."
                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addQuestion(req.id, req.questions || [], (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          addQuestion(req.id, req.questions || [], input.value);
                          input.value = '';
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600 transition-all"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 text-left">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Administrador:</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{req.tenant_admin}</span>
                </div>
                <div className="flex items-center gap-4">
                  {req.status === 'pending' && (
                    <button 
                      onClick={() => updateRequest(req.id, { status: 'in_progress' })}
                      className="px-6 py-3 text-sm font-black text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-all uppercase tracking-widest"
                    >
                      Marcar en Proceso
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (window.confirm('¿Confirmas que la web está lista? Esto activará todos los menús para el cliente.')) {
                        updateRequest(req.id, { status: 'completed' });
                      }
                    }}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-green-500/20 hover:scale-105 transition-all uppercase tracking-widest"
                  >
                    Finalizar y Activar Web
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminWebRequests;
