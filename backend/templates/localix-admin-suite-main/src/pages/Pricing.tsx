import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Perfecto para comenzar y probar el dashboard",
    features: [
      "1 usuario",
      "Hasta 100 productos",
      "Métricas básicas",
      "Soporte por email",
      "Actualizaciones incluidas"
    ],
    cta: "Empezar gratis",
    popular: false,
    icon: Zap
  },
  {
    name: "Professional",
    price: "$119.000",
    period: "/mes",
    description: "Para negocios en crecimiento que necesitan más",
    features: [
      "5 usuarios",
      "Productos ilimitados",
      "Métricas avanzadas",
      "Notificaciones en tiempo real",
      "Soporte prioritario",
      "Branding personalizado",
      "API acceso completo"
    ],
    cta: "Comenzar prueba",
    popular: true,
    icon: Crown
  },
  {
    name: "Enterprise",
    price: "$399.000",
    period: "/mes",
    description: "Solución completa para grandes operaciones",
    features: [
      "Usuarios ilimitados",
      "Todo de Professional",
      "SSO / SAML",
      "Servidor dedicado",
      "SLA garantizado",
      "Soporte 24/7",
      "Onboarding personalizado",
      "Integraciones custom"
    ],
    cta: "Contactar ventas",
    popular: false,
    icon: Rocket
  }
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              Precios en Pesos Colombianos
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Precios <span className="gradient-text">Simples y Transparentes</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Elige el plan que mejor se adapte a tu negocio. Sin costos ocultos, 
              cancela cuando quieras.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={index}
                  className={`group relative glass-card p-8 rounded-2xl border transition-all duration-500 hover:-translate-y-2 animate-fade-up ${
                    plan.popular 
                      ? "border-primary glow-primary md:scale-105" 
                      : "border-border/50 hover:border-primary/50 hover:glow-primary"
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Background gradient effect */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    plan.popular ? "bg-gradient-to-br from-primary/10 via-transparent to-accent/10" : "bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                  }`} />
                  
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-lg animate-pulse">
                        <Sparkles className="w-4 h-4" />
                        Más popular
                      </span>
                    </div>
                  )}
                  
                  <div className="relative text-center mb-8">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${
                      plan.popular 
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" 
                        : "bg-primary/10 text-primary"
                    }`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className={`text-4xl font-bold transition-all duration-300 ${
                        plan.popular ? "gradient-text" : "group-hover:text-primary"
                      }`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="relative space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1"
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className={`relative w-full overflow-hidden transition-all duration-300 ${
                      !plan.popular && "group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    <span className="relative z-10">{plan.cta}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 animate-fade-up">
              Preguntas <span className="gradient-text">Frecuentes</span>
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "¿Puedo cambiar de plan después?",
                  a: "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se ajusta el cobro proporcional."
                },
                {
                  q: "¿Hay período de prueba?",
                  a: "Todos los planes de pago incluyen 14 días de prueba gratis sin necesidad de tarjeta de crédito."
                },
                {
                  q: "¿Qué métodos de pago aceptan?",
                  a: "Aceptamos todas las tarjetas de crédito y débito principales, PSE, Nequi y transferencia bancaria para planes Enterprise."
                },
                {
                  q: "¿Mis datos están seguros?",
                  a: "Absolutamente. Utilizamos encriptación de nivel bancario y cumplimos con las regulaciones de protección de datos colombianas."
                }
              ].map((faq, index) => (
                <div 
                  key={index} 
                  className="group glass-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
