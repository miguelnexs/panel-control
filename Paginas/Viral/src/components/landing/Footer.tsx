const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    productos: [
      { label: "Canguros", href: "#categorias" },
      { label: "Crossbody", href: "#categorias" },
      { label: "Sling Bags", href: "#categorias" },
      { label: "Funcionales", href: "#categorias" },
    ],
    empresa: [
      { label: "Sobre Nosotros", href: "#nosotros" },
      { label: "Contacto", href: "#contacto" },
      { label: "Blog", href: "#" },
      { label: "FAQ", href: "#" },
    ],
    legal: [
      { label: "Términos y Condiciones", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Envíos y Devoluciones", href: "#" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#inicio" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-wider text-foreground">
                URBAN<span className="text-primary">CARRY</span>
              </span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Bolsos urbanos premium diseñados para el hombre moderno. 
              Calidad, estilo y funcionalidad en cada producto.
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 uppercase tracking-wide text-sm">
              Productos
            </h4>
            <ul className="space-y-3">
              {footerLinks.productos.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 uppercase tracking-wide text-sm">
              Empresa
            </h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 uppercase tracking-wide text-sm">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} URBAN CARRY. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con ❤️ en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
