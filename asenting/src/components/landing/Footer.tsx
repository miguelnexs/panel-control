import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold">Localix</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link to="/terminos" className="hover:text-foreground transition-colors">Términos</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link to="/contacto" className="hover:text-foreground transition-colors">Contacto</Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 Localix. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
