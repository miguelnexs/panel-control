import { MessageCircle, Phone, Mail, Clock, CheckCircle, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const supportFeatures = [
  {
    icon: Clock,
    title: "Respuesta Rápida",
    description: "Atención inmediata en menos de 2 horas",
  },
  {
    icon: CheckCircle,
    title: "Garantía Total",
    description: "Respaldamos todos nuestros servicios",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte 24/7",
    description: "Disponibles cuando nos necesites",
  },
];

const Support = () => {
  return (
    <section id="soporte" className="py-20 md:py-28 bg-dark-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-highlight/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Contact Information */}
          <div className="space-y-12 animate-slide-up">
            <div>
              <h2 className="font-heading font-bold text-3xl text-navy-foreground mb-6">
                Estamos Aquí para Ayudarte
              </h2>
              <p className="text-navy-foreground/70 text-lg mb-8 leading-relaxed">
                ¿Tienes problemas con tu equipo? Nuestro equipo de expertos está listo para brindarte 
                la mejor solución. Visítanos en nuestra tienda o contáctanos por nuestros canales digitales.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: CheckCircle,
                  title: "Ubicación",
                  description: "Cra 6 # 16- 34, Centro Comercial Pasarela Local 58",
                },
                {
                  icon: Phone,
                  title: "Llámanos",
                  description: "+57 301 864 5967",
                },
                {
                  icon: Mail,
                  title: "Correo Electrónico",
                  description: "laburbujatecnologica@gmail.com",
                },
                {
                  icon: Clock,
                  title: "Horario de Atención",
                  description: "Lunes a Sábado: 9:00 AM - 5:00 PM",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-highlight" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy-foreground text-lg mb-1">{feature.title}</h4>
                    <p className="text-navy-foreground/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-2xl border border-border animate-slide-up">
            <h3 className="font-heading font-bold text-2xl text-card-foreground mb-6 text-center">
              Solicitar Soporte
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground"
                  placeholder="Tu nombre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tipo de Problema
                </label>
                <select className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground">
                  <option>Selecciona una opción</option>
                  <option>Reparación de equipo</option>
                  <option>Problema de software</option>
                  <option>Consulta de compra</option>
                  <option>Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none text-foreground"
                  placeholder="Describe tu problema..."
                />
              </div>
              
              <Button variant="cta" className="w-full" size="lg">
                <Mail className="w-5 h-5 mr-2" />
                Enviar Solicitud
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Support;
