import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Zap, Crown, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Plan {
    id: number;
    name: string;
    slug: string; // code from backend
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
    icon: any;
}

const Pricing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  useEffect(() => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      fetchPlans();
  }, []);

  const fetchPlans = async () => {
      try {
          const res = await fetch(`${API_BASE}/users/api/subscriptions/plans/`);
          if (!res.ok) throw new Error("Error fetching plans");
          const data = await res.json();
          
          const formattedPlans = data.map((plan: any) => {
              const features = [];
              if (plan.max_users === -1) features.push("Usuarios ilimitados");
              else features.push(`${plan.max_users} usuario${plan.max_users > 1 ? 's' : ''}`);

              if (plan.max_products === -1) features.push("Productos ilimitados");
              else features.push(`Hasta ${plan.max_products} productos`);

              if (plan.max_categories === -1) features.push("Categorías ilimitadas");
              else features.push(`Hasta ${plan.max_categories} categorías`);

              if (plan.max_transactions_per_month === -1) features.push("Transacciones ilimitadas");
              else features.push(`Hasta ${plan.max_transactions_per_month} transacciones/mes`);

              if (plan.enable_basic_stats) features.push("Métricas básicas");
              if (plan.enable_user_management) features.push("Gestión de usuarios");
              
              if (plan.enable_advanced_sales_analysis) features.push("Métricas avanzadas");
              if (plan.enable_inventory_management) features.push("Gestión de inventario");
              if (plan.enable_detailed_reports) features.push("Reportes detallados");
              if (plan.enable_supplier_management) features.push("Gestión de proveedores");
              if (plan.enable_daily_backups) features.push("Copias de seguridad diarias");
              
              if (plan.enable_priority_support) features.push("Soporte prioritario");
              else features.push("Soporte por email");

              if (plan.enable_api_access) features.push("API acceso completo");
              if (plan.enable_web_store) features.push("Tienda Web");
              if (plan.enable_custom_domain) features.push("Dominio personalizado");
              if (plan.enable_marketing_tools) features.push("Herramientas de Marketing");
              if (plan.enable_whatsapp_notifications) features.push("Notificaciones WhatsApp");
              if (plan.enable_electronic_invoicing) features.push("Facturación Electrónica");
              if (plan.enable_third_party_integrations) features.push("Integraciones de terceros");

              let icon = Zap;
              if (plan.code === 'medium') icon = Crown;
              if (plan.code === 'advanced') icon = Rocket;

              const isFree = parseFloat(plan.price) === 0;

              return {
                  id: plan.id,
                  name: plan.name,
                  slug: plan.code,
                  price: isFree ? "Gratis" : `$${parseInt(plan.price).toLocaleString('es-CO')}`,
                  period: isFree ? "" : "/mes",
                  description: plan.description,
                  features: features,
                  cta: isFree ? "Empezar gratis" : (plan.code === 'medium' ? "Comenzar prueba" : "Contactar ventas"),
                  popular: plan.code === 'medium',
                  icon: icon
              };
          });
          setPlans(formattedPlans);
      } catch (error) {
          console.error("Error loading plans:", error);
          toast.error("No se pudieron cargar los planes actualizados");
      } finally {
          setLoading(false);
      }
  };

  const handleSubscribe = async (planSlug: string, planPriceString: string, planName: string) => {
      // planSlug is now the backend code (basic, medium, advanced)
      const planCode = planSlug; 
      
      if (!isLoggedIn) {
          toast.error("Debes iniciar sesión para suscribirte");
          navigate(`/auth?mode=register&plan=${planCode}`); // Pass plan code directly
          return;
      }

      // Convertir precio string "$0" -> number 0
      const price = parseInt(planPriceString.replace(/[^0-9]/g, '')) || 0;

      // Navigate to payment page
      navigate(`/payment?plan=${planCode}&price=${price}&name=${encodeURIComponent(planName)}`);
  };

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
          {loading ? (
             <div className="flex justify-center items-center h-64">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
             </div>
          ) : (
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
                    onClick={() => {
                        if (isLoggedIn) {
                            handleSubscribe(plan.slug, plan.price, plan.name);
                        } else {
                            // Redirect to register with selected plan
                            navigate(`/auth?mode=register&plan=${plan.slug}`);
                        }
                    }}
                  >
                    <span className="relative z-10">
                      {isLoggedIn ? 'Suscribirse' : plan.cta}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>
          )}
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
