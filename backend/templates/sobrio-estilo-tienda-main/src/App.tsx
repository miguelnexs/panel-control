import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import BolsosGrandes from "./pages/BolsosGrandes";
import BolsosPequenos from "./pages/BolsosPequenos";
import Canguros from "./pages/Canguros";
import Billeteras from "./pages/Billeteras";
import Complementos from "./pages/Complementos";
import Carpetas from "./pages/Carpetas";
import PasaporteGuarda from "./pages/PasaporteGuarda";
import Cosmeteria from "./pages/Cosmeteria";
import Ventas from "./pages/Ventas";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import ProductoDetalle from "./pages/ProductoDetalle";
import TodosProductos from "./pages/TodosProductos";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bolsos-grandes" element={<BolsosGrandes />} />
            <Route path="/bolsos-pequenos" element={<BolsosPequenos />} />
            <Route path="/canguros" element={<Canguros />} />
            <Route path="/billeteras" element={<Billeteras />} />
            <Route path="/complementos" element={<Complementos />} />
            <Route path="/carpetas" element={<Carpetas />} />
            <Route path="/pasaporte-guarda" element={<PasaporteGuarda />} />
            <Route path="/cosmeteria" element={<Cosmeteria />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/todos-productos" element={<TodosProductos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
            <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
