import { Wrench, Monitor, Laptop, Wifi, HardDrive, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Wrench,
    title: "Reparación",
    description: "Diagnóstico y reparación de computadores de escritorio y portátiles con garantía.",
    color: "from-accent to-highlight",
  },
  {
    icon: Monitor,
    title: "Mantenimiento",
    description: "Mantenimiento preventivo y correctivo para optimizar el rendimiento de tus equipos.",
    color: "from-primary to-accent",
  },
  {
    icon: Laptop,
    title: "Formateo",
    description: "Instalación de sistemas operativos, drivers y software esencial para tu trabajo.",
    color: "from-secondary to-primary",
  },
  {
    icon: Wifi,
    title: "Soporte Remoto",
    description: "Asistencia técnica inmediata desde cualquier lugar mediante conexión remota.",
    color: "from-highlight to-accent",
  },
  {
    icon: HardDrive,
    title: "Recuperación de Datos",
    description: "Recuperamos información de discos dañados, memorias USB y dispositivos de almacenamiento.",
    color: "from-accent to-primary",
  },
  {
    icon: Settings,
    title: "Asesoría Tech",
    description: "Te ayudamos a elegir el equipo ideal según tus necesidades y presupuesto.",
    color: "from-primary to-secondary",
  },
];

const Services = () => {
  return (
    <section id="servicios" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Nuestros Servicios
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
            Soluciones Tecnológicas <span className="text-gradient">Integrales</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Ofrecemos servicios profesionales de reparación, mantenimiento y asesoría 
            para mantener tus equipos funcionando al máximo rendimiento.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 shadow-card hover:shadow-hover transition-all duration-500 border border-border hover:border-accent/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-7 h-7 text-navy" />
              </div>

              {/* Content */}
              <h3 className="font-heading font-bold text-xl text-card-foreground mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Link */}
              <a 
                href="#contacto" 
                className="inline-flex items-center text-primary font-medium text-sm group-hover:text-accent transition-colors"
              >
                Más información
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="cta" size="lg">
            Solicitar Servicio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
