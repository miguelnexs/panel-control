
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PokemonDetail, getPokemonDetail } from "@/services/pokemonService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import StatsChart from "@/components/StatsChart";
import { ChartBar } from "lucide-react";

const PokemonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPokemonDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getPokemonDetail(id);
        setPokemon(data);
      } catch (error) {
        console.error(`Error cargando detalles del Pokémon ${id}:`, error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los detalles del Pokémon",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPokemonDetail();
  }, [id, toast]);

  if (loading || !pokemon) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-3xl">
              <CardHeader className="skeleton-pulse">
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <Skeleton className="h-64 w-64 rounded-xl mx-auto" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Conseguir la imagen oficial del Pokémon
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default;

  // Helper para formatear medidas
  const formatHeight = (height: number) => {
    const meters = height / 10;
    return `${meters.toFixed(1)} m`;
  };

  const formatWeight = (weight: number) => {
    const kg = weight / 10;
    return `${kg.toFixed(1)} kg`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/">
            &larr; Volver a la lista
          </Link>
        </Button>
        
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-pokemon-red to-pokemon-blue text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl capitalize">
                {pokemon.name}
              </CardTitle>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                #{String(pokemon.id).padStart(3, '0')}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Imagen y tipos */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <img
                    src={imageUrl || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'}
                    alt={pokemon.name}
                    className="w-full h-auto object-contain drop-shadow-xl"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap justify-center">
                  {pokemon.types.map((typeInfo, index) => (
                    <Badge
                      key={index}
                      className={`text-sm px-3 py-1 capitalize type-${typeInfo.type.name}`}
                    >
                      {typeInfo.type.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Información y estadísticas */}
              <div className="md:w-2/3">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-1">Altura</h3>
                    <p className="text-lg font-semibold">{formatHeight(pokemon.height)}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-1">Peso</h3>
                    <p className="text-lg font-semibold">{formatWeight(pokemon.weight)}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <ChartBar className="mr-2 h-5 w-5" />
                    Estadísticas base
                  </h3>
                  <StatsChart pokemon={pokemon} />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((abilityInfo, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {abilityInfo.ability.name.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

export default PokemonDetailPage;
