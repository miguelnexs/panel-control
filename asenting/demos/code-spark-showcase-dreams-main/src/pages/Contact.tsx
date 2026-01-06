
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    document.title = "Contacto | App Web Soluciones";
    
    // Mostrar el mapa después de un pequeño retraso para la animación
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      
      <main>
        <div className="pt-24 pb-10 md:pt-28 bg-card">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Contacto</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8">
              ¿Tiene un proyecto en mente? ¡Conversemos! Nuestro equipo está disponible para discutir cómo podemos ayudarle a alcanzar sus objetivos digitales.
            </p>
          </div>
        </div>
        
        <ContactSection />
        
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-primary">Ubicación</h3>
                    <p className="text-gray-300">Pereira, Colombia</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary">Email</h3>
                    <p className="text-gray-300">miguelangelvalencia25@gmail.com</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary">Teléfono</h3>
                    <p className="text-gray-300">+57 324 828 3866</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary">Horario de Atención</h3>
                    <p className="text-gray-300">Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-primary mb-3">Síguenos en redes sociales</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className={`h-[450px] bg-card relative overflow-hidden rounded-lg border border-white/10 ${showMap ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254508.516089379!2d-75.8946!3d4.8133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38653255610b7b%3A0x6284bba670ab8b2b!2sPereira%2C%20Risaralda%2C%20Colombia!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Contact;
