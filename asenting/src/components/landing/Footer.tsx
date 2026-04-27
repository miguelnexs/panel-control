import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Github, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-20 border-t border-white/5 bg-background relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <img 
                  src="/src/assets/logo.png" 
                  alt="Asenting Logo" 
                  className="h-7 w-7 rounded object-contain bg-white/10" 
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">Asenting</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-6">
              La plataforma definitiva para la gestión de negocios modernos. 
              Inteligencia, velocidad y control en un solo lugar.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Producto</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link to="/funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</Link></li>
              <li><Link to="/precios" className="hover:text-primary transition-colors">Precios</Link></li>
              <li><Link to="/download" className="hover:text-primary transition-colors">Descargas</Link></li>
              <li><Link to="/templates" className="hover:text-primary transition-colors">Plantillas</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Soporte</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link to="/nosotros" className="hover:text-primary transition-colors">Documentación</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guías de Inicio</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Estado del Sistema</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos de Servicio</Link></li>
              <li><Link to="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Política de Cookies</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>Español (Latinoamérica)</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {currentYear} Asenting Technologies S.A. Todos los derechos reservados.
          </p>
          
          <div className="flex items-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-20 grayscale hover:opacity-50 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-20 grayscale hover:opacity-50 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-20 grayscale hover:opacity-50 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
    </footer>
  );
};

export default Footer;
