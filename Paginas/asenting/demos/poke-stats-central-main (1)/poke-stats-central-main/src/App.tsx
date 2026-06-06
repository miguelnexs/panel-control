
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PokemonDetail from "./pages/PokemonDetail";
import NotFound from "./pages/NotFound";
import PokemonComparison from "./pages/PokemonComparison";
import ShinyPokemonList from "./pages/ShinyPokemonList";
import MegaEvolutionList from "./pages/MegaEvolutionList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/compare" element={<PokemonComparison />} />
          <Route path="/shinies" element={<ShinyPokemonList />} />
          <Route path="/mega-evolutions" element={<MegaEvolutionList />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
