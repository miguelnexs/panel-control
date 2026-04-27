import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
      
      <div className="container relative px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="glass-card p-8 md:p-20 rounded-[3rem] text-center relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Animated accent line */}
            <motion.div 
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" 
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-10"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-bold tracking-wide uppercase">Comienza la Revolución</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight"
            >
              ¿Listo para dominar tu{" "}
              <span className="gradient-text">negocio</span>?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Únete a la nueva generación de empresarios que ya optimizan sus operaciones con 
              la inteligencia y velocidad de Asenting. Tu éxito comienza con un clic.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-8"
            >
              <Link to="/auth?mode=register">
                <Button variant="hero" size="xl" className="px-14 py-8 text-xl rounded-2xl group shadow-2xl shadow-primary/30">
                  Crear cuenta gratuita
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-medium text-muted-foreground/80">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span>Cifrado de Punto a Punto</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>500+ Líderes confían</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Activación Instantánea</span>
                </div>
              </div>
            </motion.div>
            
            {/* Tech stack badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-20 pt-10 border-t border-white/5"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Built with cutting-edge tech</p>
              <div className="flex items-center justify-center gap-10 flex-wrap grayscale contrast-125">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-6 opacity-50" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/Django_logo.svg" alt="Django" className="h-6 opacity-50 filter brightness-200" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind" className="h-6 opacity-50" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" alt="Node" className="h-8 opacity-50" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
