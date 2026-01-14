
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import MainLayout from "./components/MainLayout";
import Index from "./pages/Index";
import Terapeutas from "./pages/Terapeutas";
import Pacientes from "./pages/Pacientes";
import Sesiones from "./pages/Sesiones";
import Estadisticas from "./pages/Estadisticas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <MainLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/terapeutas" element={<Terapeutas />} />
                <Route path="/pacientes" element={<Pacientes />} />
                <Route path="/sesiones" element={<Sesiones />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
