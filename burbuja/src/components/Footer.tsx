import { Monitor, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube, CreditCard, ShieldCheck } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-navy pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-secondary/30">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
                <Monitor className="w-6 h-6 text-navy" />
              </div>
              <span className="font-heading font-bold text-xl text-navy-foreground">
                Tech<span className="text-highlight">Store</span>
              </span>
            </a>
            <p className="text-navy-foreground/70 mb-6 leading-relaxed">
              Tu aliado tecnológico de confianza. Más de 10 años brindando soluciones 
              informáticas profesionales.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-navy-foreground/70 hover:bg-accent hover:text-navy transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg text-navy-foreground mb-6">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              {["Inicio", "Servicios", "Tienda", "Soporte", "Contacto", "Blog"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-navy-foreground/70 hover:text-highlight transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-bold text-lg text-navy-foreground mb-6">
              Servicios
            </h4>
            <ul className="space-y-3">
              {[
                "Reparación de Equipos",
                "Mantenimiento Preventivo",
                "Soporte Remoto",
                "Recuperación de Datos",
                "Venta de Hardware",
                "Asesoría Técnica",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#servicios"
                    className="text-navy-foreground/70 hover:text-highlight transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-bold text-lg text-navy-foreground mb-6">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
                <span className="text-navy-foreground/70">
                  Calle 123 #45-67, Centro Comercial Tech Plaza, Local 101
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-highlight flex-shrink-0" />
                <a href="tel:+573001234567" className="text-navy-foreground/70 hover:text-highlight transition-colors">
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-highlight flex-shrink-0" />
                <a href="mailto:info@techstore.com" className="text-navy-foreground/70 hover:text-highlight transition-colors">
                  info@techstore.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-highlight flex-shrink-0" />
                <span className="text-navy-foreground/70">
                  Lun - Sáb: 8:00 AM - 7:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Trust */}
        <div className="py-8 border-b border-secondary/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-navy-foreground/70 text-sm font-medium">Métodos de Pago:</span>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-secondary/30 rounded-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <span className="text-navy-foreground/80 text-sm">PSE</span>
                </div>
                <div className="px-4 py-2 bg-secondary/30 rounded-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-highlight" />
                  <span className="text-navy-foreground/80 text-sm">Mercado Pago</span>
                </div>
                <div className="px-4 py-2 bg-secondary/30 rounded-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-navy-foreground/80 text-sm">Tarjetas</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-navy-foreground/70">
              <ShieldCheck className="w-5 h-5 text-highlight" />
              <span className="text-sm">Compra 100% Segura</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-navy-foreground/50 text-sm">
            © {currentYear} TechStore. Todos los derechos reservados. 
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-highlight transition-colors">Política de Privacidad</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-highlight transition-colors">Términos y Condiciones</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
