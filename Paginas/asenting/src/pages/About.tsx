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
          <div className="glass-card p-8 md:p-12 rounded-2xl border border-border/50 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestra Historia</h2>
            
            {/* Timeline */}
            <div className="space-y-12">
              {/* 2022 - El Problema */}
              <div className="relative pl-8 border-l-2 border-primary/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                <div className="mb-2">
                  <span className="text-sm font-semibold text-primary">2022</span>
                  <h3 className="text-xl font-bold mt-1">El Problema que Nos Unió</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Todo comenzó en un pequeño café en Bogotá. Carlos Mendoza, entonces consultor de software, 
                  observaba cómo su hermano luchaba por gestionar su tienda de ropa con múltiples hojas de Excel 
                  desorganizadas. "¿Por qué no existe una solución simple y asequible para negocios como el tuyo?" 
                  se preguntó. Esa misma semana, reunió a tres amigos desarrolladores y nació la idea de Asenting.
                </p>
              </div>

              {/* 2023 - Los Primeros Pasos */}
              <div className="relative pl-8 border-l-2 border-primary/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                <div className="mb-2">
                  <span className="text-sm font-semibold text-primary">Enero 2023</span>
                  <h3 className="text-xl font-bold mt-1">Construyendo el Fundamento</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Durante seis meses, el equipo trabajó desde el garaje de Carlos, codificando día y noche. 
                  María García, recién llegada de Silicon Valley, aportó su experiencia en arquitectura de sistemas 
                  escalables. Andrés López diseñó más de 50 prototipos hasta encontrar la interfaz perfecta. 
                  Queríamos algo que cualquier persona pudiera usar sin manual de instrucciones.
                </p>
              </div>

              {/* 2023 - Primer Cliente */}
              <div className="relative pl-8 border-l-2 border-primary/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent" />
                <div className="mb-2">
                  <span className="text-sm font-semibold text-accent">Agosto 2023</span>
                  <h3 className="text-xl font-bold mt-1">El Primer Cliente y el Momento "Eureka"</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  La tienda de ropa del hermano de Carlos fue nuestro primer cliente. Cuando vimos cómo 
                  redujo su tiempo de gestión de 4 horas diarias a solo 30 minutos, supimos que estábamos 
                  creando algo especial. "Esto me ha devuelto mi vida", nos dijo. Esa frase se convirtió 
                  en nuestro mantra.
                </p>
              </div>

              {/* 2024 - Crecimiento */}
              <div className="relative pl-8 border-l-2 border-primary/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                <div className="mb-2">
                  <span className="text-sm font-semibold text-primary">2024</span>
                  <h3 className="text-xl font-bold mt-1">De 1 a 500 Negocios</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  El crecimiento fue orgánico. Cada cliente satisfecho recomendaba a otro. En marzo de 2024 
                  alcanzamos los 100 negocios. Para diciembre, superamos los 500. Contratamos a Laura Martínez 
                  como Lead Developer y ampliamos nuestra infraestructura para soportar miles de transacciones 
                  diarias. Pasamos de ser 4 amigos a un equipo de 15 personas apasionadas.
                </p>
              </div>

              {/* 2025 - Presente */}
              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
                <div className="mb-2">
                  <span className="text-sm font-semibold text-primary">Hoy</span>
                  <h3 className="text-xl font-bold mt-1">Una Comunidad en Crecimiento</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Asenting ya no es solo un software; es una comunidad de emprendedores que creen en el poder 
                  de la tecnología para transformar negocios. Hemos procesado más de 10 millones de transacciones 
                  y ahorrado a nuestros clientes colectivamente más de 100,000 horas de trabajo manual. 
                  Pero lo más importante: seguimos escuchando. Cada función nueva nace de las conversaciones 
                  con nuestros usuarios.
                </p>
              </div>
            </div>

            {/* Vision Statement */}
            <div className="mt-12 p-8 bg-primary/5 rounded-xl border border-primary/20">
              <h3 className="text-xl font-bold mb-4 text-center">Nuestra Visión para el Futuro</h3>
              <p className="text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
                Soñamos con un mundo donde cualquier persona con una idea de negocio pueda competir 
                en igualdad de condiciones con las grandes corporaciones. Queremos democratizar el acceso 
                a herramientas de gestión de clase mundial, eliminando barreras tecnológicas y económicas. 
                Para 2027, aspiramos a ser el aliado tecnológico de 10,000 negocios en Latinoamérica, 
                impulsando la economía local y empoderando a una nueva generación de emprendedores.
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
