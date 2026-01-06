import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    shop: [
      { name: "Cangureras", href: "#" },
      { name: "Mochilas", href: "#" },
      { name: "Bolsos Cruzados", href: "#" },
      { name: "Accesorios", href: "#" },
      { name: "Ofertas", href: "#" },
    ],
    info: [
      { name: "Sobre Nosotros", href: "#" },
      { name: "Envíos", href: "#" },
      { name: "Devoluciones", href: "#" },
      { name: "Garantía", href: "#" },
      { name: "FAQ", href: "#" },
    ],
    legal: [
      { name: "Términos y Condiciones", href: "#" },
      { name: "Política de Privacidad", href: "#" },
      { name: "Cookies", href: "#" },
    ],
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-block">
              <span className="font-display text-3xl tracking-wider text-foreground">
                URBAN<span className="text-accent">CARRY</span>
              </span>
            </a>
            <p className="text-muted-foreground mt-4 max-w-sm">
              Diseñamos bolsos y cangureras para el hombre moderno que busca 
              funcionalidad sin sacrificar el estilo.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-xl text-foreground mb-4">TIENDA</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-xl text-foreground mb-4">INFORMACIÓN</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-xl text-foreground mb-4">CONTACTO</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  Av. Reforma 123, CDMX
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="tel:+525512345678" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                  +52 55 1234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="mailto:info@urbancarry.com" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                  info@urbancarry.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 UrbanCarry. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-accent transition-colors text-xs"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
