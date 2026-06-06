import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Target, Heart, Zap, Users } from "lucide-react";

const team = [
  {
    name: "Carlos Mendoza",
    role: "CEO & Fundador",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "10+ años en desarrollo de software empresarial"
  },
  {
    name: "María García",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    bio: "Ex-ingeniera senior en startups de Silicon Valley"
  },
  {
    name: "Andrés López",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Especialista en UX y diseño de producto"
  },
  {
    name: "Laura Martínez",
    role: "Lead Developer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "Experta en React y arquitectura frontend"
  }
];

const values = [
  {
    icon: Target,
    title: "Misión",
    description: "Empoderar a negocios de todos los tamaños con herramientas de gestión accesibles y poderosas."
  },
  {
    icon: Heart,
    title: "Pasión",
    description: "Amamos lo que hacemos y eso se refleja en cada línea de código y cada interacción con nuestros clientes."
  },
  {
    icon: Zap,
    title: "Innovación",
    description: "Constantemente exploramos nuevas tecnologías para ofrecer la mejor experiencia posible."
  },
  {
    icon: Users,
    title: "Comunidad",
    description: "Construimos más que software, construimos relaciones duraderas con nuestros usuarios."
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre <span className="text-gradient">Nosotros</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Somos un equipo apasionado por crear soluciones que simplifican 
              la gestión empresarial y potencian el crecimiento de negocios.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20">
          <div className="glass-card p-8 md:p-12 rounded-2xl border border-border/50 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Nuestra Historia</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Localix nació en 2023 de una frustración común: la falta de herramientas de gestión 
                accesibles y modernas para pequeños y medianos negocios. Mientras las grandes empresas 
                tenían acceso a sofisticados sistemas ERP, los negocios más pequeños quedaban relegados 
                a hojas de cálculo y procesos manuales.
              </p>
              <p>
                Decidimos cambiar eso. Con un equipo de desarrolladores experimentados y una visión 
                clara, creamos un dashboard administrativo que combina la potencia de las soluciones 
                enterprise con la simplicidad que los negocios modernos necesitan.
              </p>
              <p>
                Hoy, más de 500 negocios confían en Localix para gestionar sus operaciones diarias, 
                y estamos apenas comenzando.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl border border-border/50 text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestro Equipo</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl border border-border/50 text-center group"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-border group-hover:ring-primary transition-colors">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="container px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 md:p-12 rounded-2xl border border-border/50">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: "500+", label: "Negocios activos" },
                { value: "50K+", label: "Transacciones diarias" },
                { value: "99.9%", label: "Uptime garantizado" },
                { value: "24/7", label: "Soporte disponible" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
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

export default About;
