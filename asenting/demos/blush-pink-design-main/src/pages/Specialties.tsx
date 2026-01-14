
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Palette, Zap, Shield, Sparkles } from "lucide-react";

const Specialties = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 transform transition-all duration-700 hover:scale-105">
              En qué nos <span className="text-gradient animate-pulse">Especializamos</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto transform transition-all duration-500 hover:text-foreground">
              Nuestra experiencia y pasión se refleja en cada área de especialización
            </p>
          </div>

          {/* Main Specialties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="card-elegant p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in group" style={{ animationDelay: '0.2s' }}>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-6">
                <Palette className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4 transition-colors duration-300 group-hover:text-primary">
                Diseño Minimalista
              </h2>
              <p className="text-muted-foreground mb-4 transition-all duration-300 group-hover:text-foreground">
                Creamos piezas que combinan simplicidad y sofisticación. Nuestro enfoque minimalista 
                se centra en líneas limpias, formas elegantes y una paleta de colores cuidadosamente 
                seleccionada que complementa cualquier guardarropa.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
                  Líneas geométricas puras
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:text-primary" style={{ transitionDelay: '0.1s' }}>
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  Colores neutros y pasteles
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:text-primary" style={{ transitionDelay: '0.2s' }}>
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  Funcionalidad elegante
                </li>
              </ul>
            </div>

            <div className="card-elegant p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in group" style={{ animationDelay: '0.4s' }}>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-6">
                <Shield className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4 transition-colors duration-300 group-hover:text-primary">
                Materiales Premium
              </h2>
              <p className="text-muted-foreground mb-4 transition-all duration-300 group-hover:text-foreground">
                Seleccionamos únicamente los mejores materiales: cuero genuino, forros de alta calidad 
                y herrajes duraderos. Cada material pasa por un riguroso proceso de selección para 
                garantizar durabilidad y belleza.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
                  Cuero 100% genuino
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:text-primary" style={{ transitionDelay: '0.1s' }}>
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  Herrajes antioxidantes
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:text-primary" style={{ transitionDelay: '0.2s' }}>
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  Forros resistentes
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Specialties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="text-center p-6 card-elegant group transform transition-all duration-500 hover:scale-105 hover:shadow-xl animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-12">
                <Zap className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                Producción Artesanal
              </h3>
              <p className="text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                Cada bolso es elaborado a mano por artesanos experimentados que dominan técnicas 
                tradicionales de marroquinería, garantizando acabados perfectos en cada pieza.
              </p>
            </div>

            <div className="text-center p-6 card-elegant group transform transition-all duration-500 hover:scale-105 hover:shadow-xl animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-12">
                <Sparkles className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                Personalización
              </h3>
              <p className="text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                Ofrecemos servicios de personalización para hacer que cada bolso sea único: 
                grabados, iniciales, colores especiales y modificaciones de diseño.
              </p>
            </div>
          </div>

          {/* Process Section */}
          <div className="bg-gradient-to-r from-pink-light/50 to-pink-pastel/50 rounded-xl p-8 mb-16 transform transition-all duration-700 hover:shadow-xl animate-fade-in" style={{ animationDelay: '1s' }}>
            <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12 animate-bounce-gentle">
              Nuestro Proceso Creativo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center group transform transition-all duration-500 hover:scale-110">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 shadow-lg group-hover:shadow-xl">
                  1
                </div>
                <h4 className="font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">Inspiración</h4>
                <p className="text-sm text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                  Investigamos tendencias y necesidades de la mujer moderna
                </p>
              </div>
              <div className="text-center group transform transition-all duration-500 hover:scale-110" style={{ transitionDelay: '0.1s' }}>
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 shadow-lg group-hover:shadow-xl">
                  2
                </div>
                <h4 className="font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">Diseño</h4>
                <p className="text-sm text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                  Creamos bocetos y prototipos con atención al detalle
                </p>
              </div>
              <div className="text-center group transform transition-all duration-500 hover:scale-110" style={{ transitionDelay: '0.2s' }}>
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 shadow-lg group-hover:shadow-xl">
                  3
                </div>
                <h4 className="font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">Producción</h4>
                <p className="text-sm text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                  Elaboración artesanal con los mejores materiales
                </p>
              </div>
              <div className="text-center group transform transition-all duration-500 hover:scale-110" style={{ transitionDelay: '0.3s' }}>
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 shadow-lg group-hover:shadow-xl">
                  4
                </div>
                <h4 className="font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">Entrega</h4>
                <p className="text-sm text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                  Control de calidad y empaquetado premium
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4 transform transition-all duration-500 hover:scale-105">
              ¿Lista para descubrir la diferencia?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto transition-all duration-300 hover:text-foreground">
              Experimenta la calidad y elegancia que nos distingue. Cada bolso viene con garantía de satisfacción.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn-primary transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1">
                Ver Colección
              </button>
              <button className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg px-6 py-3 font-medium transform hover:scale-105 hover:shadow-lg hover:-translate-y-0.5">
                Contactar Equipo
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Specialties;
