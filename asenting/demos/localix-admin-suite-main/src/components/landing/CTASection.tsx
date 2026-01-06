import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import EditableText from "@/components/EditableText";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
      
      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 rounded-3xl text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Empieza gratis hoy</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <EditableText id="cta_title_1" defaultText="¿Listo para transformar tu" />{" "}
              <span className="gradient-text"><EditableText id="cta_title_2" defaultText="gestión empresarial" /></span>?
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              <EditableText 
                id="cta_subtitle" 
                defaultText="Únete a cientos de empresas que ya optimizan sus operaciones con Localix Dashboard. Sin tarjeta de crédito requerida." 
              />
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl">
                <EditableText id="cta_btn_primary" defaultText="Registrarse gratis" />
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="heroOutline" size="xl">
                <Download className="w-5 h-5 mr-2" />
                <EditableText id="cta_btn_secondary" defaultText="Descargar Desktop" />
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Tecnologías que impulsan Localix</p>
              <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
                <span className="text-lg font-semibold">React</span>
                <span className="text-lg font-semibold">Django</span>
                <span className="text-lg font-semibold">Tailwind</span>
                <span className="text-lg font-semibold">JWT</span>
                <span className="text-lg font-semibold">REST API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
