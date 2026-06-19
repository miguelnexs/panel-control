
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-6xl font-heading font-bold text-gradient mb-4">404</h1>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
              Página no encontrada
            </h2>
            <p className="text-muted-foreground mb-8">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <Link to="/" className="btn-primary">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
