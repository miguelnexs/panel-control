import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

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
              <span className="text-sm text-primary font-medium">Empieza hoy mismo</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              ¿Listo para transformar tu{" "}
              <span className="gradient-text">gestión empresarial</span>?
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Únete a cientos de empresas que ya optimizan sus operaciones con Asenting Dashboard. 
              Sin tarjeta de crédito requerida.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-6">
              <Link to="/auth?mode=register">
                <Button variant="hero" size="xl" className="px-12 py-6 text-lg">
                  Registrarse ahora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Seguro y confiable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>500+ empresas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Configuración en minutos</span>
                </div>
              </div>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Tecnologías que impulsan Asenting</p>
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
