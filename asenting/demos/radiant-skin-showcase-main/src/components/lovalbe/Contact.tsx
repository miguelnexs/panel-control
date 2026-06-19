import { useState } from "react";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Mensaje enviado!",
      description: "Gracias por contactarnos. Te responderemos pronto.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contacto" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-lovalbe-rose/10 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-accent font-medium tracking-widest text-sm uppercase">
            Estamos aquí para ti
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mt-4 mb-6">
            Contáctanos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            ¿Tienes alguna pregunta? Estaremos encantados de ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className={isVisible ? "animate-fade-in-left" : "opacity-0"}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nombre completo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-card/50 border-border/50 rounded-xl h-12 focus:border-accent focus:ring-accent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-card/50 border-border/50 rounded-xl h-12 focus:border-accent focus:ring-accent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-card/50 border-border/50 rounded-xl min-h-[150px] resize-none focus:border-accent focus:ring-accent"
                  required
                />
              </div>
              
              <Button type="submit" className="btn-gold w-full text-base py-4 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Enviar mensaje
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className={`space-y-8 ${isVisible ? "animate-fade-in-right" : "opacity-0"}`}>
            {/* Info Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-soft">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">hola@lovalbe.com</p>
                  <p className="text-muted-foreground">soporte@lovalbe.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-soft">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                  <p className="text-muted-foreground">+34 900 123 456</p>
                  <p className="text-sm text-muted-foreground/70">Lun - Vie, 9:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-soft">
                <div className="w-12 h-12 bg-lovalbe-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-lovalbe-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ubicación</h3>
                  <p className="text-muted-foreground">Barcelona, España</p>
                  <p className="text-sm text-muted-foreground/70">Envíos a toda Europa</p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="p-6 bg-gradient-to-br from-lovalbe-rose/20 to-lovalbe-gold-light/20 border border-border/30 rounded-2xl">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Únete a nuestra newsletter
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Recibe ofertas exclusivas, consejos de belleza y novedades directamente en tu correo.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="bg-background/80 border-border/50 rounded-xl h-11 flex-1"
                />
                <Button className="btn-gold px-6">
                  Suscribir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
