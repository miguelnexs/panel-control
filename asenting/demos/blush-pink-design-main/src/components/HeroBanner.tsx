
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, Heart } from "lucide-react";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      {/* Background Model Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=800&fit=crop')"
        }}
      ></div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/40"></div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-pastel/40 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-pink-medium/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-dark/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Sparkle icons */}
      <Sparkles className="absolute top-1/4 right-1/4 w-8 h-8 text-pink-medium/60 animate-pulse" />
      <Star className="absolute bottom-1/3 left-1/6 w-6 h-6 text-pink-dark/50 animate-bounce" />
      <Heart className="absolute top-1/3 right-1/6 w-7 h-7 text-pink-medium/70 animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-4 animate-fade-in drop-shadow-lg">
            CG by
            <span className="block text-gradient animate-pulse drop-shadow-md">Caro González</span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-heading font-semibold text-foreground/90 mb-6 animate-fade-in drop-shadow-md" style={{ animationDelay: '0.2s' }}>
            Bolsos de Mujer Únicos y Elegantes
          </h2>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 font-medium animate-fade-in max-w-3xl mx-auto drop-shadow-sm" style={{ animationDelay: '0.4s' }}>
            Descubre nuestra exclusiva colección de bolsos diseñados especialmente para la mujer moderna. 
            Cada pieza refleja elegancia, funcionalidad y un estilo único que te acompañará en cada momento especial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in mb-16" style={{ animationDelay: '0.6s' }}>
            <button 
              onClick={() => navigate("/catalog")}
              className="btn-primary text-lg px-8 py-4 group"
            >
              <span className="mr-2">Explora la Colección</span>
              <Sparkles className="w-5 h-5 inline group-hover:animate-spin transition-transform" />
            </button>
            <div className="flex items-center text-primary font-bold bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border-2 border-pink-medium/20">
              <span className="text-3xl font-bold mr-2 text-gradient">30% OFF</span>
              <span className="text-sm font-semibold text-foreground">en tu primer bolso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background pattern with logo colors */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <svg width="200" height="200" viewBox="0 0 200 200" className="text-pink-dark animate-float">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <svg width="150" height="150" viewBox="0 0 150 150" className="text-pink-medium animate-float" style={{ animationDelay: '1s' }}>
            <circle cx="75" cy="75" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
