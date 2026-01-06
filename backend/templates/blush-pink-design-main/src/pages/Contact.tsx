
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MapPin, Phone, Instagram, Clock, Mail, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              <span className="text-gradient">Contáctanos</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Contáctanos para cualquier consulta sobre nuestros bolsos o para asesoría personalizada.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-medium to-pink-dark mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Información de Contacto
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-pastel/30 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-pink-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Dirección</h3>
                      <p className="text-muted-foreground">
                        Cra 7 # 15 57 local 101<br />
                        Edificio Londoño<br />
                        Pereira, Risaralda
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-pastel/30 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-pink-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                      <p className="text-muted-foreground">314 743 5305</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-pastel/30 p-3 rounded-full">
                      <Instagram className="w-6 h-6 text-pink-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Instagram</h3>
                      <p className="text-muted-foreground">@cgbycarogonzalez</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-pastel/30 p-3 rounded-full">
                      <Clock className="w-6 h-6 text-pink-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Horarios de Atención</h3>
                      <div className="text-muted-foreground">
                        <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                        <p>Sábados: 9:00 AM - 4:00 PM</p>
                        <p>Domingos: Cerrado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-r from-pink-pastel/20 to-pink-light/40 rounded-xl p-8">
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">
                  Contacto Rápido
                </h3>
                <div className="space-y-4">
                  <a 
                    href="tel:3147435305" 
                    className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-pink-dark" />
                    <span className="font-medium text-foreground">Llamar Ahora</span>
                  </a>
                  <a 
                    href="https://wa.me/573147435305" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-pink-dark" />
                    <span className="font-medium text-foreground">WhatsApp</span>
                  </a>
                  <a 
                    href="https://instagram.com/cgbycarogonzalez" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-pink-dark" />
                    <span className="font-medium text-foreground">Síguenos en Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tu teléfono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Asunto
                  </label>
                  <select className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Consulta sobre productos</option>
                    <option>Asesoría personalizada</option>
                    <option>Información de pedidos</option>
                    <option>Colaboraciones</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>

          {/* Google Maps */}
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-center text-foreground mb-8">
              Encuéntranos
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.6648738830835!2d-75.6972488!3d4.8088146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3877452e0e9f6b%3A0x7e123456789abcde!2sCarrera%207%20%2315-57%2C%20Pereira%2C%20Risaralda%2C%20Colombia!5e0!3m2!1ses!2sco!4v1635763611526!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación CG by Caro González"
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Cra 7 # 15 57 local 101, Edificio Londoño, Pereira, Risaralda
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
