
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSection: React.FC = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // In a real application, you would send the form data to a server
    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarme. Te responderé lo antes posible.",
    });
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };
  
  return (
    <section id="contact" className="py-24 bg-background relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-theme-cyan/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in">Hablemos de tu <span className="text-gradient">Proyecto</span></h2>
          <p className="text-gray-300 opacity-0 animate-fade-in delay-100">
            Estoy listo para ayudarte a convertir tus ideas en realidad. Contáctame para discutir tu próximo proyecto.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="space-y-8 opacity-0 animate-fade-in delay-200">
            <h3 className="text-2xl font-semibold">Información de Contacto</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">contacto@tudominio.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Teléfono</p>
                  <p className="text-white">+00 123 456 789</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ubicación</p>
                  <p className="text-white">Tu Ciudad, País</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-lg font-medium mb-4">Sígueme en</h4>
              <div className="flex space-x-4">
                {["github", "twitter", "linkedin", "instagram"].map((social) => (
                  <a 
                    key={social}
                    href={`#${social}`}
                    className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-8 border border-white/10 opacity-0 animate-fade-in delay-300">
            <h3 className="text-2xl font-semibold mb-6">Envíame un mensaje</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm text-gray-400">Nombre</label>
                  <Input 
                    id="name" 
                    placeholder="Tu nombre" 
                    required 
                    className="bg-muted border-white/10 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-gray-400">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    required 
                    className="bg-muted border-white/10 focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm text-gray-400">Asunto</label>
                <Input 
                  id="subject" 
                  placeholder="Asunto del mensaje" 
                  required 
                  className="bg-muted border-white/10 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm text-gray-400">Mensaje</label>
                <Textarea 
                  id="message" 
                  placeholder="Describe tu proyecto o consulta..." 
                  required 
                  className="bg-muted border-white/10 focus:border-primary min-h-[120px]"
                />
              </div>
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white">
                Enviar mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
