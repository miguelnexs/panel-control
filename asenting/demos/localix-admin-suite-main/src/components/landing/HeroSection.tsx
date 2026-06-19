import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import dashboardMockup from "@/assets/dashboard-mockup.png";
import EditableText from "@/components/EditableText";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              <EditableText id="hero_badge" defaultText="Dashboard Administrativo v1.0" />
            </span>
          </div>
          
          {/* Title */}
          <h1 className="animate-fade-up-delay-1 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            <EditableText id="hero_title_1" defaultText="Dashboard Administrativo" />{" "}
            <span className="gradient-text">
              <EditableText id="hero_title_2" defaultText="todo-en-uno" />
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="animate-fade-up-delay-2 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            <EditableText 
              id="hero_subtitle" 
              defaultText="Centraliza estadísticas, ventas, clientes y productos en una sola pantalla. Métricas en tiempo real con actualización automática cada 3 segundos." 
            />
          </p>
          
          {/* CTAs */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              <EditableText id="hero_cta_primary" defaultText="Probar ahora" />
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="heroOutline" size="xl">
              <Play className="w-5 h-5 mr-2" />
              <EditableText id="hero_cta_secondary" defaultText="Ver demostración" />
            </Button>
          </div>
        </div>
        
        {/* Dashboard Mockup */}
        <div className="animate-scale-in relative max-w-6xl mx-auto">
          {/* Background glow effects */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-2xl opacity-60" />
          <div className="absolute -inset-2 bg-gradient-to-b from-primary/20 to-transparent rounded-3xl blur-xl" />
          
          <div className="relative rounded-2xl overflow-hidden glass-card p-3 border border-primary/20 shadow-2xl shadow-primary/20">
            <img 
              src={dashboardMockup} 
              alt="Localix Dashboard Preview" 
              className="w-full h-auto rounded-xl shadow-inner"
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none rounded-xl" />
          </div>
          
          {/* Floating stats */}
          <div className="absolute -left-4 top-1/4 glass-card p-4 rounded-xl animate-float hidden lg:block">
            <div className="text-2xl font-bold gradient-text">+127%</div>
            <div className="text-sm text-muted-foreground">Ventas este mes</div>
          </div>
          
          <div className="absolute -right-4 top-1/3 glass-card p-4 rounded-xl animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
            <div className="text-2xl font-bold text-accent">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoreo activo</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
