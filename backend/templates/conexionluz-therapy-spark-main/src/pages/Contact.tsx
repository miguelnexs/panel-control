
import React, { useState } from 'react';
import Header from '../components/Header';
import WhatsAppFloat from '../components/WhatsAppFloat';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, User, Calendar } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Teléfono",
      info: "+57 301 331 7868",
      description: "Lunes a Viernes: 8:00 AM - 6:00 PM",
      action: "tel:+573013317868"
    },
    {
      icon: Mail,
      title: "Email",
      info: "contacto@conexionluz.com",
      description: "Respuesta en 24 horas",
      action: "mailto:contacto@conexionluz.com"
    },
    {
      icon: MapPin,
      title: "Ubicación",
      info: "Pereira, Colombia",
      description: "Consultas presenciales y virtuales",
      action: "#ubicacion"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      info: "Chat directo",
      description: "Respuesta inmediata",
      action: "https://wa.me/573013317868"
    }
  ];

  const faqs = [
    {
      question: "¿Cuánto dura una sesión de terapia?",
      answer: "Las sesiones individuales duran 50 minutos, las de pareja 60 minutos y las familiares también 60 minutos."
    },
    {
      question: "¿Ofrecen terapia virtual?",
      answer: "Sí, ofrecemos sesiones virtuales a través de plataformas seguras para mayor comodidad y accesibilidad."
    },
    {
      question: "¿Cuál es el costo de las sesiones?",
      answer: "Los costos varían según el tipo de terapia. Contáctanos para información detallada sobre tarifas."
    },
    {
      question: "¿Cómo elijo el terapeuta adecuado?",
      answer: "Nuestro equipo te ayudará a encontrar al profesional ideal según tus necesidades específicas."
    },
    {
      question: "¿Ofrecen consultas de emergencia?",
      answer: "Sí, contamos con disponibilidad para situaciones de crisis y emergencias emocionales."
    }
  ];

  const scheduleOptions = [
    { time: "8:00 AM - 12:00 PM", description: "Sesiones matutinas" },
    { time: "2:00 PM - 6:00 PM", description: "Sesiones vespertinas" },
    { time: "Fines de semana", description: "Horarios especiales disponibles" },
    { time: "Sesiones virtuales", description: "Disponibles 24/7" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <WhatsAppFloat />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/10 via-white to-accent/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-16 w-24 h-24 bg-accent/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Contáctanos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Estamos aquí para ayudarte en tu camino hacia el bienestar. Contáctanos de la forma que prefieras
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.action}
                className="group bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <contact.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{contact.title}</h3>
                <p className="text-primary font-semibold mb-1">{contact.info}</p>
                <p className="text-gray-600 text-sm">{contact.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Schedule */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Envíanos un Mensaje</h2>
              
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-green-700">Gracias por contactarnos. Te responderemos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Asunto</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="consulta-general">Consulta General</option>
                        <option value="agendar-cita">Agendar Cita</option>
                        <option value="informacion-terapeutas">Información sobre Terapeutas</option>
                        <option value="emergencia">Situación de Emergencia</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Mensaje</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Preferencia de Contacto</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-2">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-2">Teléfono</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="whatsapp"
                          checked={formData.preferredContact === 'whatsapp'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-2">WhatsApp</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Enviar Mensaje</span>
                  </button>
                </form>
              )}
            </div>

            {/* Schedule and Quick Actions */}
            <div className="space-y-8">
              
              {/* Horarios */}
              <div className="bg-white rounded-xl p-8 shadow-lg animate-fade-in">
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                  <h3 className="text-2xl font-bold text-gray-800">Horarios de Atención</h3>
                </div>
                
                <div className="space-y-4">
                  {scheduleOptions.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-semibold text-gray-800">{schedule.time}</p>
                        <p className="text-gray-600 text-sm">{schedule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href="/agenda"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Agendar Cita</span>
                  </a>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-8 text-white animate-fade-in">
                <h3 className="text-2xl font-bold mb-4">¿Necesitas Ayuda Inmediata?</h3>
                <p className="mb-6 opacity-90">
                  Si tienes una emergencia emocional o necesitas hablar con alguien de inmediato, contáctanos:
                </p>
                
                <div className="space-y-3">
                  <a
                    href="tel:+573013317868"
                    className="block bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Phone className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">Llamada Directa</p>
                        <p className="text-sm opacity-90">+57 301 331 7868</p>
                      </div>
                    </div>
                  </a>
                  
                  <a
                    href="https://wa.me/573013317868"
                    className="block bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">WhatsApp</p>
                        <p className="text-sm opacity-90">Chat inmediato</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre nuestros servicios
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 stagger-animation">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
