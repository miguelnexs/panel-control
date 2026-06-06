import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Layout, Sparkles, Lock } from "lucide-react";
import TemplatesGrid from "@/components/TemplatesGrid";
import LovableManager from "@/components/LovableManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Templates = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Layout className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Galería de Diseños</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Plantillas <span className="gradient-text">Premium</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el diseño perfecto para tu negocio o crea uno nuevo con nuestra IA.
            </p>
          </div>

          <Tabs defaultValue="templates" className="w-full">
            <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                    <TabsTrigger value="lovable" className="gap-2"><Sparkles className="w-4 h-4 text-purple-500" /> Lovable AI</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="templates">
                <TemplatesGrid />
            </TabsContent>

            <TabsContent value="lovable">
                {isLoggedIn ? (
                    <LovableManager />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl p-8 max-w-2xl mx-auto">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
                            <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Acceso Restringido</h3>
                        <p className="text-muted-foreground mb-8 max-w-md">
                            La creación de tiendas con Lovable AI es una funcionalidad exclusiva para usuarios registrados. Inicia sesión para acceder a esta potente herramienta.
                        </p>
                        <Button asChild size="lg">
                            <Link to="/auth?mode=login">Iniciar Sesión</Link>
                        </Button>
                    </div>
                )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Templates;
