import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-foreground transform skew-x-12 translate-x-1/4" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="opacity-0 animate-fade-up">
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
                Nueva Colección 2024
              </span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none opacity-0 animate-fade-up stagger-1">
              ESTILO
              <br />
              <span className="text-accent">URBANO</span>
              <br />
              SIN LÍMITES
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md opacity-0 animate-fade-up stagger-2">
              Descubre nuestra colección de bolsos y cangureras diseñados para el hombre moderno. 
              Funcionalidad y estilo en cada detalle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-up stagger-3">
              <Button variant="hero" size="xl">
                Ver Colección
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="heroOutline" size="xl">
                Más Vendidos
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 opacity-0 animate-fade-up stagger-4">
              <div>
                <span className="font-display text-4xl text-foreground">500+</span>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Productos</p>
              </div>
              <div>
                <span className="font-display text-4xl text-accent">15K+</span>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Clientes</p>
              </div>
              <div>
                <span className="font-display text-4xl text-foreground">4.9</span>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative opacity-0 animate-fade-up stagger-2">
            <div className="absolute -inset-4 bg-accent/20 blur-3xl" />
            <div className="relative aspect-square bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
                alt="Cangurera premium negra"
                className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
              />
              {/* Price Tag */}
              <div className="absolute bottom-8 right-8 bg-accent text-accent-foreground px-6 py-3">
                <span className="text-sm uppercase tracking-wider">Desde</span>
                <span className="font-display text-3xl block">$899</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-up stagger-5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
