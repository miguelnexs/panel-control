
import { useState, useEffect } from "react";
import { PokemonListItem, PaginationState, getPokemonList } from "../services/pokemonService";
import PokemonCard from "./PokemonCard";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PokemonList = () => {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPokemons(pagination.currentPage);
  }, [pagination.currentPage]);

  const loadPokemons = async (page: number) => {
    setLoading(true);
    try {
      const data = await getPokemonList(page, pagination.limit);
      setPokemons(data.pokemons);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error cargando la lista de Pokémon:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los Pokémon. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: pagination.limit }).map((_, index) => (
              <PokemonCard key={`skeleton-${index}`} pokemon={{} as PokemonListItem} loading={true} />
            ))
          : pokemons.map(pokemon => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <div className="bg-pokemon-blue text-white px-4 py-2 rounded-lg shadow-md">
          <span className="font-bold text-lg">{pagination.currentPage}</span>
          <span className="text-sm"> de {pagination.totalPages}</span>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handlePreviousPage}
            disabled={pagination.currentPage <= 1 || loading}
            variant="outline"
            className="group"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Anterior
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={pagination.currentPage >= pagination.totalPages || loading}
            className="bg-gradient-to-r from-pokemon-red to-pokemon-blue group"
          >
            Siguiente
            <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PokemonList;
