import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-20 pb-10 px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Number */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-primary/10">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold gradient-text">404</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Página no encontrada
            </h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="gap-2">
                <Home className="w-5 h-5" />
                Volver al inicio
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
              Ir atrás
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">¿Necesitas ayuda? <Link to="/contacto" className="text-primary hover:underline">Contáctanos</Link></span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
