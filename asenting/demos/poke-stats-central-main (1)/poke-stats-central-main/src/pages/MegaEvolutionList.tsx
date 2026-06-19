
import { useState, useEffect } from "react";
import { getMegaEvolutionPokemonList, PokemonListItem } from "@/services/pokemonService";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const MegaEvolutionList = () => {
  const [megaPokemons, setMegaPokemons] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMegaEvolutions();
  }, []);

  const loadMegaEvolutions = async () => {
    setLoading(true);
    try {
      const data = await getMegaEvolutionPokemonList();
      setMegaPokemons(data);
    } catch (error) {
      console.error("Error cargando Pokémon con mega evolución:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los Pokémon con mega evolución. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Mega Evoluciones</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Explora todos los Pokémon que pueden alcanzar una mega evolución, aumentando su poder y cambiando su apariencia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 20 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="w-full h-[300px] flex flex-col items-center p-4">
                  <Skeleton className="h-40 w-40 rounded-lg" />
                  <div className="mt-4 w-full space-y-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                </Card>
              ))
            : megaPokemons.map((pokemon) => (
                <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`}>
                  <Card className="pokemon-card w-full h-full flex flex-col items-center p-4 overflow-hidden">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                      <div className="absolute w-32 h-32 bg-gradient-to-br from-pokemon-blue to-pokemon-red opacity-30 rounded-full animate-pulse" />
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                        alt={pokemon.name}
                        className="w-32 h-32 object-contain z-10 drop-shadow-md animate-bounce-slow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                        }}
                      />
                      {/* Indicador de mega evolución */}
                      <Badge className="absolute top-0 right-0 bg-pokemon-blue text-white">
                        Mega
                      </Badge>
                    </div>

                    <div className="text-center w-full">
                      <h3 className="text-lg font-bold capitalize mb-1">
                        {pokemon.name}
                      </h3>
                      <Badge variant="outline" className="bg-pokemon-blue bg-opacity-20 text-pokemon-blue border-pokemon-blue">
                        #{String(pokemon.id).padStart(3, '0')}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
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

export default MegaEvolutionList;
