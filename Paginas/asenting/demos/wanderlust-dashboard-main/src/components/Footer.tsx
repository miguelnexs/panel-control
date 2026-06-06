import { Globe, Plane } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ocean">
              <Globe className="h-4 w-4 text-ocean-foreground" />
              <Plane className="absolute -right-0.5 -top-0.5 h-3 w-3 text-gold" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              GlobeTrek Travel
            </span>
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Agencia de Viajes · Diseño conceptual
          </p>

          {/* Decorative text */}
          <p className="font-display text-sm italic text-muted-foreground">
            "El mundo es un libro..."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
