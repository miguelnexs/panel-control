import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Layout, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: number;
  name: string;
  description: string;
  slug: string;
  image: string;
  zip_file: string | null;
  demo_url: string;
  color: string;
  tags: string[];
}

const TemplatesGrid = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/webconfig/templates/`);
      if (!res.ok) throw new Error("Error al cargar las plantillas");
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las plantillas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-20 glass-card rounded-2xl">
        <Layout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay plantillas disponibles</h3>
        <p className="text-muted-foreground">Vuelve pronto para ver nuevos diseños.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {templates.map((template) => (
        <div 
          key={template.id} 
          className="glass-card rounded-2xl overflow-hidden group hover:border-primary/50 transition-all duration-300 flex flex-col"
        >
          {/* Image Container */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            {template.image ? (
              <img 
                src={template.image.startsWith('http') ? template.image : `${API_BASE}${template.image}`} 
                alt={template.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${template.color || 'from-gray-700 to-gray-900'} flex items-center justify-center`}>
                <Layout className="w-16 h-16 text-white/20" />
              </div>
            )}
            
            {/* Tags overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {template.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 text-xs font-medium bg-black/50 backdrop-blur-md text-white rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold mb-2 text-left">{template.name}</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow text-left">
              {template.description}
            </p>

            <div className="flex gap-3 mt-auto">
              {template.demo_url && (
                <Button className="flex-1 gap-2" variant="outline" asChild>
                  <a 
                    href={template.demo_url.startsWith('http') ? template.demo_url : `${API_BASE}${template.demo_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Demo
                  </a>
                </Button>
              )}
              {template.zip_file && (
                <Button className="flex-1 gap-2" asChild>
                  <a 
                    href={template.zip_file.startsWith('http') ? template.zip_file : `${API_BASE}${template.zip_file}`} 
                    download
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesGrid;
