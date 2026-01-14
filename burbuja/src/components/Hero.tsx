import { ArrowRight, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-tech.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen bg-hero-gradient overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-highlight/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,180,252,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,180,252,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[calc(100vh-5rem)] gap-12 py-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-accent/30 mb-6">
              <Shield className="w-4 h-4 text-highlight" />
              <span className="text-sm text-navy-foreground/80">Expertos en Tecnología</span>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-navy-foreground leading-tight mb-6">
              Soluciones Tech
              <br />
              <span className="text-gradient">Para Tu Negocio</span>
            </h1>
            
            <p className="text-lg md:text-xl text-navy-foreground/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Servicio técnico profesional, venta de equipos y accesorios de última generación. 
              Tu aliado tecnológico de confianza.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="cta" size="lg" className="group">
                Ver Productos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-accent/50 text-navy hover:text-navy hover:bg-accent/10 hover:border-accent">
                Solicitar Soporte
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-secondary/30">
              <div className="text-center lg:text-left">
                <p className="font-heading font-bold text-2xl md:text-3xl text-highlight">+500</p>
                <p className="text-sm text-navy-foreground/60">Clientes Satisfechos</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-heading font-bold text-2xl md:text-3xl text-highlight">10+</p>
                <p className="text-sm text-navy-foreground/60">Años de Experiencia</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-heading font-bold text-2xl md:text-3xl text-highlight">24/7</p>
                <p className="text-sm text-navy-foreground/60">Soporte Técnico</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-1 relative animate-slide-up">
            <div className="relative py-8 px-4">
              {/* Main Device Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-accent/20">
                <img 
                  src={heroImage} 
                  alt="Setup gaming profesional con laptop, teclado y mouse RGB" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-navy-foreground font-heading font-bold text-xl">Hardware Premium</p>
                  <p className="text-navy-foreground/80 text-sm mt-1">Equipos de alto rendimiento</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute top-0 right-0 lg:-right-2 bg-card rounded-xl p-3 lg:p-4 shadow-hover animate-float border border-border z-20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
                    <Headphones className="w-4 h-4 lg:w-5 lg:h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-xs lg:text-sm">Soporte 24/7</p>
                    <p className="text-xs text-muted-foreground hidden lg:block">Siempre disponibles</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 lg:-left-2 bg-card rounded-xl p-3 lg:p-4 shadow-hover animate-float border border-border z-20" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-button-gradient flex items-center justify-center">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-xs lg:text-sm">Garantía Total</p>
                    <p className="text-xs text-muted-foreground hidden lg:block">Protección completa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
