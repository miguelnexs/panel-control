
import { Instagram, Facebook, Share2, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border" id="contacto">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
            Mantente al día con las últimas tendencias
          </h3>
          <p className="text-muted-foreground mb-6">
            Suscríbete a nuestro newsletter y recibe un 10% de descuento en tu primera compra
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
            <button className="btn-primary">
              Enviar
            </button>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h4 className="text-xl font-heading font-bold text-gradient mb-4">
              Bolsos Elegantes
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Diseños únicos y minimalistas para la mujer moderna. 
              Calidad premium en cada detalle.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h5 className="font-semibold text-foreground mb-4">Información de Contacto</h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground">
                  <p>Cra 7 # 15 57 local 101</p>
                  <p>Edificio Londoño</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href="tel:3147435305" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  314 743 5305
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href="https://instagram.com/cgbycarogonzalez" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  @cgbycarogonzalez
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold text-foreground mb-4">Enlaces Rápidos</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link to="/specialties" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Especialidades
                </Link>
              </li>
              <li>
                <a href="#contacto" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service & Social Media */}
          <div>
            <h5 className="font-semibold text-foreground mb-4">Síguenos</h5>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://instagram.com/cgbycarogonzalez"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-accent hover:bg-primary text-foreground hover:text-primary-foreground rounded-full transition-all duration-200 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-accent hover:bg-primary text-foreground hover:text-primary-foreground rounded-full transition-all duration-200 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-accent hover:bg-primary text-foreground hover:text-primary-foreground rounded-full transition-all duration-200 hover:scale-110"
              >
                <Share2 className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              ¡Comparte tu estilo con #BolsosElegantes!
            </p>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Políticas de Devolución</p>
              <p>Preguntas Frecuentes</p>
              <p>Guía de Tallas</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Bolsos Elegantes. Todos los derechos reservados. | Diseñado con ❤️ para mujeres elegantes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
