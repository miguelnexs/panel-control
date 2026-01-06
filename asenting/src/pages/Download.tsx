
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const DownloadPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-20 pb-10 px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-xl text-muted-foreground">
              Tu suscripción está activa. Ya puedes descargar Localix Admin Suite y empezar a gestionar tu negocio.
            </p>
          </div>

          <div className="p-8 border rounded-2xl bg-card shadow-lg space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Versión de Escritorio</h2>
              <p className="text-sm text-muted-foreground">Versión 0.8.6 • Windows 10/11 • 64-bit</p>
            </div>
            
            <a href="/LocalixDashboardSetup-0.8.6.exe" download className="block w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 text-lg px-8 py-6 h-auto">
                <Download className="h-6 w-6" />
                Descargar para Windows
              </Button>
            </a>

            <div className="pt-4 text-xs text-muted-foreground">
              <p>¿Necesitas ayuda con la instalación? <Link to="/contact" className="underline hover:text-primary">Contáctanos</Link></p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
             <Link to="/">
                <Button variant="ghost" className="gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180" /> Volver al inicio
                </Button>
             </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DownloadPage;
