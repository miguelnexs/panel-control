
import { useState, useEffect } from "react";
import { getShinyPokemonList, PaginationState, PokemonListItem } from "@/services/pokemonService";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const ShinyPokemonList = () => {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadShinyPokemons(pagination.currentPage);
  }, [pagination.currentPage]);

  const loadShinyPokemons = async (page: number) => {
    setLoading(true);
    try {
      const data = await getShinyPokemonList(page, pagination.limit);
      setPokemons(data.pokemons);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error cargando Pokémon shiny:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los Pokémon shiny. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Star className="mr-2 h-8 w-8 text-pokemon-yellow" />
            <span>Pokémon Shiny</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Explora todos los Pokémon en su forma shiny con colores alternativos y únicos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: pagination.limit }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="w-full h-[300px] flex flex-col items-center p-4">
                  <Skeleton className="h-40 w-40 rounded-lg" />
                  <div className="mt-4 w-full space-y-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                </Card>
              ))
            : pokemons.map((pokemon) => (
                <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`}>
                  <Card className="pokemon-card w-full h-full flex flex-col items-center p-4 overflow-hidden">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                      <div className="absolute w-32 h-32 bg-gradient-to-br from-pokemon-yellow to-pokemon-blue opacity-30 rounded-full animate-pulse" />
                      {/* Imagen shiny */}
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`}
                        alt={`${pokemon.name} shiny`}
                        className="w-32 h-32 object-contain z-10 drop-shadow-md animate-bounce-slow"
                        onError={(e) => {
                          // Si falla, usar imagen por defecto
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                        }}
                      />
                      {/* Indicador shiny */}
                      <Star className="absolute top-0 right-0 h-6 w-6 text-pokemon-yellow" />
                    </div>

                    <div className="text-center w-full">
                      <h3 className="text-lg font-bold capitalize mb-1">
                        {pokemon.name}
                      </h3>
                      <Badge variant="outline" className="bg-pokemon-yellow bg-opacity-20 text-pokemon-yellow border-pokemon-yellow">
                        #{String(pokemon.id).padStart(3, '0')}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t mt-8">
          <div className="text-sm text-muted-foreground">
            Página {pagination.currentPage} de {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePreviousPage}
              disabled={pagination.currentPage <= 1 || loading}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={pagination.currentPage >= pagination.totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-pokemon-blue text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>PokeStats Central &copy; {new Date().getFullYear()}</p>
          <p className="text-xs mt-1 text-gray-300">Desarrollado con la PokeAPI</p>
        </div>
      </footer>
    </div>
  );
};

export default ShinyPokemonList;
