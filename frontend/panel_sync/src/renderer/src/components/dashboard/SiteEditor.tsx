import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Layout, Type, Image as ImageIcon, Palette, Globe, Monitor, Smartphone, ChevronDown, ChevronRight, Plus, Trash, Edit } from 'lucide-react';
import axios from 'axios';

interface SiteEditorProps {
  token: string;
  siteUrl: string;
  apiBase: string;
  templateId?: number;
  onClose: () => void;
}

interface AppSettings {
  id?: number;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  company_name: string;
  company_description: string;
  receipt_footer: string;
  logo?: string | null;
  page_content?: Record<string, string>;
}

interface Banner {
  id: number;
  title: string;
  active: boolean;
  position: number;
  image?: string | null;
}

const SiteEditor: React.FC<SiteEditorProps> = ({ token, siteUrl, apiBase, templateId, onClose }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastSavedContent, setLastSavedContent] = useState<Record<string, string> | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Load initial data
  useEffect(() => {
    loadData();

    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'CONTENT_CHANGED') {
            const newContent = event.data.payload;
            setSettings(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    page_content: {
                        ...prev.page_content,
                        ...newContent
                    }
                };
            });
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (settings?.page_content && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ 
            type: 'INITIAL_CONTENT', 
            payload: settings.page_content 
        }, '*');
    }
  }, [settings]);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [settingsRes, bannersRes] = await Promise.all([
        axios.get(`${apiBase}/webconfig/settings/`, { headers }),
        axios.get(`${apiBase}/webconfig/banners/`, { headers })
      ]);
      
      let initialSettings = settingsRes.data;

      if (templateId) {
         try {
           const templateRes = await axios.get(`${apiBase}/webconfig/templates/${templateId}/`, { headers });
           if (templateRes.data && templateRes.data.page_content) {
             initialSettings = {
                 ...initialSettings,
                 page_content: templateRes.data.page_content
               };
               setLastSavedContent(templateRes.data.page_content);
             }
           } catch (e) {
             console.error('Error loading template content:', e);
         }
      }

      setSettings(initialSettings);
      setBanners(bannersRes.data.results || []);
    } catch (error) {
      console.error('Error loading editor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', file.name.split('.')[0]);
    formData.append('active', 'true');
    formData.append('position', '0');

    try {
      setSaving(true);
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };
      await axios.post(`${apiBase}/webconfig/banners/`, formData, { headers });
      setRefreshKey(prev => prev + 1);
      
      const bannersRes = await axios.get(`${apiBase}/webconfig/banners/`, { headers: { Authorization: `Bearer ${token}` } });
      setBanners(bannersRes.data.results || []);
    } catch (error) {
      console.error('Error uploading banner:', error);
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteBanner = async (id: number) => {
    if (!confirm('¿Eliminar banner?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiBase}/webconfig/banners/${id}/`, { headers });
      setBanners(prev => prev.filter(b => b.id !== id));
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Save settings
      // Si estamos editando una plantilla personal, NO guardar el contenido en la configuración global
      const settingsPayload = { ...settings };
      if (templateId) {
        delete settingsPayload.page_content;
      }

      await axios.put(`${apiBase}/webconfig/settings/`, settingsPayload, { headers });
      
      // Save to template draft if templateId is present
      if (templateId) {
        const currentContentStr = JSON.stringify(settings.page_content || {});
        const lastSavedContentStr = JSON.stringify(lastSavedContent || {});
        
        if (currentContentStr !== lastSavedContentStr) {
            try {
              await axios.patch(`${apiBase}/webconfig/templates/${templateId}/`, {
                page_content: settings.page_content
              }, { headers });
              console.log('Template draft saved');
              setLastSavedContent(settings.page_content || {});
            } catch (templateError) {
              console.error('Error saving template draft:', templateError);
            }
        } else {
            console.log('No content changes to save for template draft');
        }
      }

      // Refresh iframe
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return `http://${url}`;
    }
    return `https://${url}`;
  };

  const fullUrl = getFullUrl(siteUrl);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-white font-medium text-sm">Editor del Sitio</h1>
            <span className="text-xs text-gray-500">{siteUrl}</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button 
            onClick={() => setPreviewDevice('desktop')}
            className={`p-2 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setPreviewDevice('mobile')}
            className={`p-2 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Smartphone size={18} />
          </button>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Guardar</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
          
          {/* Section: General */}
          <div className="border-b border-gray-800">
            <button 
              onClick={() => setActiveSection(activeSection === 'general' ? null : 'general')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-white font-medium text-sm">
                <Layout size={18} className="text-blue-400" />
                <span>Información General</span>
              </div>
              {activeSection === 'general' ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
            </button>
            
            {activeSection === 'general' && settings && (
              <div className="p-4 space-y-4 bg-gray-900/50 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre del Negocio</label>
                  <input 
                    type="text" 
                    value={settings.company_name}
                    onChange={(e) => updateSetting('company_name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Descripción</label>
                  <textarea 
                    value={settings.company_description}
                    onChange={(e) => updateSetting('company_description', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Colors & Style */}
          <div className="border-b border-gray-800">
            <button 
              onClick={() => setActiveSection(activeSection === 'colors' ? null : 'colors')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-white font-medium text-sm">
                <Palette size={18} className="text-emerald-400" />
                <span>Colores y Estilo</span>
              </div>
              {activeSection === 'colors' ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
            </button>
            
            {activeSection === 'colors' && settings && (
              <div className="p-4 space-y-4 bg-gray-900/50 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Color Principal</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="h-9 w-9 rounded-lg bg-transparent border border-gray-700 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Color Secundario</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="h-9 w-9 rounded-lg bg-transparent border border-gray-700 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Fuente</label>
                  <select 
                    value={settings.font_family}
                    onChange={(e) => updateSetting('font_family', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>
              </div>
            )}
          </div>

           {/* Section: Banners */}
           <div className="border-b border-gray-800">
            <button 
              onClick={() => setActiveSection(activeSection === 'banners' ? null : 'banners')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-white font-medium text-sm">
                <ImageIcon size={18} className="text-amber-400" />
                <span>Banners</span>
              </div>
              {activeSection === 'banners' ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
            </button>
            
            {activeSection === 'banners' && (
              <div className="p-4 space-y-4 bg-gray-900/50 animate-in slide-in-from-top-2 duration-200">
                {banners.map(banner => (
                  <div key={banner.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 group relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-700 rounded-md overflow-hidden">
                        {banner.image ? <img src={banner.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto mt-2.5 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{banner.title || 'Sin título'}</p>
                        <p className="text-xs text-gray-500">{banner.active ? 'Activo' : 'Inactivo'}</p>
                      </div>
                      <button 
                        onClick={() => deleteBanner(banner.id)}
                        className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleBannerUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Agregar Banner</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-950 flex items-center justify-center relative p-8">
          <div 
            className={`transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden ${
              previewDevice === 'mobile' 
                ? 'w-[375px] h-[667px] rounded-[2rem] border-[8px] border-gray-800' 
                : 'w-full h-full rounded-xl border border-gray-800'
            }`}
          >
            {fullUrl ? (
              <iframe 
                ref={iframeRef}
                key={refreshKey}
                src={fullUrl}
                className="w-full h-full border-none"
                title="Site Preview"
                onLoad={() => {
                   if (iframeRef.current?.contentWindow) {
                       // Send initial content
                       if (settings?.page_content) {
                           iframeRef.current.contentWindow.postMessage({ 
                               type: 'INITIAL_CONTENT', 
                               payload: settings.page_content 
                           }, '*');
                       }
                   }
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <Globe size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-900">No hay URL configurada</p>
                <p className="text-sm">Configura tu dominio en la pestaña "URLs de Usuario"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteEditor;
