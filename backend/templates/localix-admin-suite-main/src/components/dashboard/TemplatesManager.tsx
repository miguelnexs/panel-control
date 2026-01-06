import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Layout, Eye, X, Maximize2, Loader, Download } from 'lucide-react';
import axios from 'axios';

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
}

const TemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/webconfig/templates/');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handlePreview = (template: Template) => {
    if (template.demo_url) {
      setPreviewTemplate(template);
      setIsLoadingPreview(true);
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
          <h2 className="text-2xl font-bold text-white mb-2">Galería de Plantillas</h2>
          <p className="text-gray-400">Selecciona una plantilla para tu sitio web</p>
        </div>
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
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                  {template.name}
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {template.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 text-xs border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800 mt-auto">
                <button 
                  onClick={() => handleOpenLink(template.zip_file)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-gray-700 group/btn"
                >
                  <Download size={16} />
                  <span>Descargar</span>
                </button>
                <button 
                  onClick={() => handlePreview(template)}
                  disabled={!template.demo_url}
                  className={`flex-1 ${template.demo_url ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-gray-700 cursor-not-allowed opacity-50'} text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg flex items-center justify-center gap-2`}
                >
                  <Eye size={16} />
                  <span>{template.demo_url ? 'Ver Demo' : 'Sin Demo'}</span>
                </button>
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
    </div>
  );
};

export default TemplatesManager;
