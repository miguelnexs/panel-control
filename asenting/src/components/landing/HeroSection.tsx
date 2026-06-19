import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import dashboardMockup from "@/assets/dashboard-mockup.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Animated Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" 
      />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto mb-20">
          {/* Premium Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 border border-primary/20 shadow-lg shadow-primary/5"
          >
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nueva Versión v1.2.0 disponible
            </span>
          </motion.div>

          {/* Title with Gradient */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            El futuro del <br />
            <span className="gradient-text drop-shadow-sm">Control Total</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Potencia tu negocio con el dashboard más avanzado. 
            Estadísticas en tiempo real, gestión inteligente de clientes y 
            automatización completa en un solo lugar.
          </motion.p>

          {/* Enhanced CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link to="/auth?mode=register">
              <Button variant="hero" size="xl" className="px-10 py-7 text-lg rounded-2xl group shadow-2xl shadow-primary/20">
                Empezar gratis ahora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="px-10 py-7 text-lg rounded-2xl glass-card border-white/10 hover:bg-white/5">
              <Play className="w-5 h-5 mr-2 fill-current" />
              Ver Demo Live
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground/60 font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Sin contratos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Setup en 5 min</span>
            </div>
          </motion.div>
        </div>

        {/* 3D Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="relative max-w-6xl mx-auto"
          style={{ perspective: "1000px" }}
        >
          {/* Glow Behind */}
          <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[40px] blur-[100px] opacity-50" />
          
          <div className="relative rounded-3xl overflow-hidden glass-card p-4 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <img
              src={dashboardMockup}
              alt="Asenting Dashboard Preview"
              className="w-full h-auto rounded-2xl shadow-inner"
            />
          </div>

          {/* Floating dynamic elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-8 top-1/4 glass-card p-6 rounded-2xl border border-white/10 shadow-xl hidden lg:block backdrop-blur-xl"
          >
            <div className="text-3xl font-bold gradient-text">+127%</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Crecimiento Mensual</div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-8 bottom-1/4 glass-card p-6 rounded-2xl border border-white/10 shadow-xl hidden lg:block backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div className="text-lg font-bold">Live Stats</div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">99.9% Uptime Server</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
