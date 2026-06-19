import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-lotions.jpg";

const Hero = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-lovalbe-rose/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-lovalbe-gold-light/20 rounded-full blur-3xl animate-float delay-300" />

      {/* Floating Decorative Circles */}
      <div className="absolute top-32 right-20 w-4 h-4 bg-accent rounded-full animate-float delay-200" />
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-primary rounded-full animate-float delay-500" />
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-lovalbe-gold rounded-full animate-float delay-700" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 mb-8 animate-fade-in-down">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Nueva colección primavera 2025
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-semibold text-foreground mb-6 animate-fade-in-up leading-tight">
            LOVALBE
            <span className="block text-3xl md:text-4xl lg:text-5xl font-light text-muted-foreground mt-2">
              Belleza que se siente
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200 leading-relaxed">
            Lociones premium con ingredientes naturales para una piel suave y radiante. 
            Descubre el secreto de una hidratación profunda y duradera.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button className="btn-gold text-base px-8 py-4 flex items-center gap-2 group">
              Ver productos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-2 border-foreground/20 hover:border-accent hover:bg-accent/10 text-foreground px-8 py-4 rounded-full transition-all duration-300"
            >
              Colección especial
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mt-16 animate-fade-in-up delay-500">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-semibold text-foreground">50K+</p>
              <p className="text-sm text-muted-foreground">Clientes felices</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-semibold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Natural</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-semibold text-foreground">4.9</p>
              <p className="text-sm text-muted-foreground">Valoración</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
