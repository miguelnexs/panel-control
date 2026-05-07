import { Shield, Zap, Compass } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Durabilidad Premium",
    description:
      "Materiales de alta calidad seleccionados para resistir el uso diario intenso. Garantía de satisfacción en cada producto.",
  },
  {
    icon: Zap,
    title: "Funcionalidad Inteligente",
    description:
      "Compartimentos estratégicos, acceso rápido y organización pensada para el ritmo de vida moderno.",
  },
  {
    icon: Compass,
    title: "Estilo Urbano",
    description:
      "Diseños minimalistas que complementan cualquier outfit. Del trabajo a la aventura sin cambiar de bolso.",
  },
];

const ValueProposition = () => {
  return (
    <section id="nosotros" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
                alt="Urban lifestyle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-primary text-primary-foreground p-6 rounded-lg shadow-urban-lg">
              <div className="text-3xl font-bold">+3</div>
              <div className="text-sm opacity-90">Años de Experiencia</div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">
              Nuestra Filosofía
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              DISEÑADO PARA LA
              <br />
              <span className="text-primary">VIDA REAL</span>
            </h2>
            <p className="text-muted-foreground mb-8 lg:text-lg">
              En URBAN CARRY creemos que un buen bolso es más que un accesorio. 
              Es tu compañero de aventuras diarias, tu organizador personal y 
              una extensión de tu estilo. Por eso cada producto está diseñado 
              pensando en ti.
            </p>

            {/* Values */}
            <div className="space-y-6">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="flex gap-4 p-4 rounded-lg bg-background/50 border border-border hover:border-primary/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
