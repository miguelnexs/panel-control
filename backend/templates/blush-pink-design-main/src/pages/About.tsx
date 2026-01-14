
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, Users, Award, Sparkles, Star, Crown } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              <span className="text-gradient">Conoce a Caro González</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              La diseñadora detrás de CG by Caro González, creando bolsos únicos que empoderan a la mujer moderna
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-medium to-pink-dark mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop" 
                alt="Caro González en su taller"
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-pink-medium/20">
                <Star className="w-6 h-6 text-pink-medium mb-2" />
                <p className="text-sm font-semibold text-foreground">5+ años de experiencia</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
                Mi Historia
              </h2>
              <p className="text-muted-foreground mb-4">
                Mi nombre es Carolina González, pero todos me conocen como Caro. Desde pequeña, siempre tuve una 
                pasión especial por la moda y los accesorios que hacen que una mujer se sienta única y poderosa.
              </p>
              <p className="text-muted-foreground mb-4">
                En 2019, decidí convertir mi sueño en realidad y fundé CG by Caro González. Lo que comenzó como 
                un pequeño emprendimiento desde mi hogar, se ha convertido en una marca reconocida por la calidad 
                y el diseño exclusivo de nuestros bolsos.
              </p>
              <p className="text-muted-foreground mb-6">
                Cada bolso que diseño nace de mi experiencia como mujer: entiendo las necesidades reales de 
                funcionalidad sin sacrificar el estilo. Por eso, mis creaciones no solo son hermosas, 
                sino también prácticas para el día a día de la mujer moderna.
              </p>
              <div className="bg-pink-pastel/20 rounded-lg p-4 border-l-4 border-pink-medium">
                <p className="text-foreground font-medium italic">
                  "Mi misión es que cada mujer se sienta segura, elegante y empoderada con mis bolsos"
                </p>
                <p className="text-sm text-muted-foreground mt-2">- Caro González</p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
              Lo Que Me Inspira
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 card-elegant">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Pasión Genuina
                </h3>
                <p className="text-muted-foreground">
                  Cada diseño surge de mi amor auténtico por crear piezas que realmente marquen la diferencia 
                  en la vida de las mujeres.
                </p>
              </div>

              <div className="text-center p-6 card-elegant">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Empoderamiento Femenino
                </h3>
                <p className="text-muted-foreground">
                  Creo firmemente que los accesorios correctos pueden transformar no solo un outfit, 
                  sino también la confianza de una mujer.
                </p>
              </div>

              <div className="text-center p-6 card-elegant">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Innovación Constante
                </h3>
                <p className="text-muted-foreground">
                  Siempre estoy buscando nuevas formas de mejorar, nuevos materiales y diseños que 
                  superen las expectativas de mis clientas.
                </p>
              </div>
            </div>
          </div>

          {/* Process Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
              Mi Proceso Creativo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-pink-pastel/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-dark">1</span>
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Inspiración</h4>
                <p className="text-sm text-muted-foreground">Busco inspiración en las necesidades reales de las mujeres</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-pastel/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-dark">2</span>
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Diseño</h4>
                <p className="text-sm text-muted-foreground">Creo bocetos detallados priorizando funcionalidad y estilo</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-pastel/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-dark">3</span>
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Materiales</h4>
                <p className="text-sm text-muted-foreground">Selecciono cuidadosamente los mejores materiales disponibles</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-pastel/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-dark">4</span>
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Perfección</h4>
                <p className="text-sm text-muted-foreground">Superviso cada detalle hasta lograr la pieza perfecta</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-pink-pastel/20 to-pink-light/40 rounded-xl p-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
              ¿Lista para Encontrar Tu Bolso Perfecto?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Te invito a explorar mi colección y encontrar esa pieza especial que te acompañe 
              en todos tus momentos importantes.
            </p>
            <button className="btn-primary text-lg px-8 py-4">
              Explorar Colección
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
