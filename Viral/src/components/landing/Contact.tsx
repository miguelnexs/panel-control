import { useState } from "react";
import { Send, MessageCircle, Instagram, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
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
      description: "Te responderemos pronto. Gracias por contactarnos.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "+57 301 864 5967",
      href: "https://wa.me/573018645967",
      color: "hover:text-green-500",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@urbancarry.co",
      href: "https://instagram.com/urbancarry.co",
      color: "hover:text-pink-500",
    },
    {
      icon: Mail,
      label: "Email",
      value: "hola@urbancarry.co",
      href: "mailto:hola@urbancarry.co",
      color: "hover:text-primary",
    },
  ];

  return (
    <section id="contacto" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">
            Contáctanos
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            HABLEMOS
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte. 
            Escríbenos y te responderemos lo antes posible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card p-6 lg:p-8 rounded-lg border border-border animate-fade-in">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Envíanos un mensaje
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nombre
                </label>
                <Input
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-background border-border focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-background border-border focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Mensaje
                </label>
                <Textarea
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="bg-background border-border focus:border-primary min-h-[120px]"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Enviar Mensaje
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Contact Methods */}
          <div className="flex flex-col justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-bold text-foreground mb-6">
              O contáctanos directamente
            </h3>
            <div className="space-y-4">
              {contactMethods.map((method) => (
                <a
                  key={method.label}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-all group ${method.color}`}
                >
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <method.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {method.label}
                    </div>
                    <div className="font-medium text-foreground">
                      {method.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Call to action */}
            <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">
                  Respuesta Rápida
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Por WhatsApp te respondemos en menos de 2 horas durante 
                horario de atención (9am - 6pm).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
