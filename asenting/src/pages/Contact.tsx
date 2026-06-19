import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensaje enviado",
      description: "Nos pondremos en contacto contigo pronto.",
    });
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contacto@asenting.cloud",
      description: "Respuesta en 24h"
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "314 329 1149",
      description: "Lun-Vie 9:00-19:00"
    },
    {
      icon: MapPin,
      title: "Oficina",
      value: "Colombia, Pereira",
      description: "Risaralda - Visitas con cita previa"
    },
    {
      icon: Clock,
      title: "Horario",
      value: "9:00 AM - 7:00 PM",
      description: "Soporte 24/7 para Enterprise"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Contáctanos</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              ¿Tienes preguntas? Estamos aquí para ayudarte. Escríbenos y te 
              responderemos lo antes posible.
            </p>
          </div>
        </section>

        <section className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="glass-card p-8 rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Empresa (opcional)</label>
                  <Input
                    placeholder="Nombre de tu empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mensaje</label>
                  <Textarea
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Información de contacto</h2>
              <div className="grid gap-4">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="glass-card p-6 rounded-xl border border-border/50 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{info.title}</h3>
                      <p className="text-foreground">{info.value}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="glass-card p-1 rounded-xl border border-border/50 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127406.85770380077!2d-75.7639576!3d4.8047987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e388748c0f7e6c3%3A0x7c2e3a3e5e5e5e5e!2sPereira%2C%20Risaralda%2C%20Colombia!5e0!3m2!1ses!2sco!4v1704067200000!5m2!1ses!2sco"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '0.75rem' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Asenting - Pereira, Risaralda"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
