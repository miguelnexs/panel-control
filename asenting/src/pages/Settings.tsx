import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Settings, Layout } from "lucide-react";
import TemplatesGrid from "@/components/TemplatesGrid";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground">Gestiona tus preferencias y personaliza tu experiencia</p>
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Mis Plantillas</h2>
            </div>
            
            <div className="p-6 border rounded-2xl bg-card/50">
              <TemplatesGrid />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
