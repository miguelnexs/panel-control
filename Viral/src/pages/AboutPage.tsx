import Header from "@/components/landing/Header";
import ValueProposition from "@/components/landing/ValueProposition";
import Footer from "@/components/landing/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-8">Sobre Nosotros</h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                En UrbanCarry, nos dedicamos a fusionar estilo y funcionalidad para el explorador urbano moderno. 
                Nuestra misión es crear accesorios que no solo complementen tu look, sino que mejoren tu día a día.
            </p>
        </div>
        <ValueProposition />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
