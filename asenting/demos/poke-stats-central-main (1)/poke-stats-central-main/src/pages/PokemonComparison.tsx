
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { searchPokemon, getPokemonDetail, PokemonDetail } from "@/services/pokemonService";
import PokemonComparator from "@/components/PokemonComparator";

const PokemonComparison = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedPokemons, setSelectedPokemons] = useState<PokemonDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Utilizar react-query para cargar los Pokémon seleccionados
  const { data: loadedPokemons, isLoading } = useQuery({
    queryKey: ['selectedPokemons'],
    queryFn: async () => {
      // Si no hay Pokémon seleccionados, no cargar nada
      if (selectedPokemons.length === 0) return [];
      
      // Si ya tenemos los datos de los Pokémon, devolverlos
      return selectedPokemons;
    },
    enabled: selectedPokemons.length > 0,
  });

  // Buscar Pokémon
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPokemon(searchQuery);
      setSearchResults(results.slice(0, 5)); // Limitar a 5 resultados
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados de búsqueda",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Agregar Pokémon a la comparación
  const addPokemon = async (id: number, name: string) => {
    // Verificar si ya está en la lista
    if (selectedPokemons.some(p => p.id === id)) {
      toast({
        title: "Pokémon ya añadido",
        description: `${name.charAt(0).toUpperCase() + name.slice(1)} ya está en la comparación`,
      });
      return;
    }
    
    // Limitar a máximo 4 Pokémon
    if (selectedPokemons.length >= 4) {
      toast({
        title: "Límite alcanzado",
        description: "Solo puedes comparar hasta 4 Pokémon a la vez",
        variant: "destructive",
      });
      return;
    }

    try {
      const pokemon = await getPokemonDetail(id);
      setSelectedPokemons(prev => [...prev, pokemon]);
      setSearchResults([]); // Limpiar resultados
      setSearchQuery(""); // Limpiar búsqueda
      
      toast({
        title: "Pokémon añadido",
        description: `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} añadido a la comparación`,
      });
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del Pokémon",
        variant: "destructive",
      });
    }
  };

  // Eliminar Pokémon de la comparación
  const removePokemon = (id: number) => {
    setSelectedPokemons(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-pokemon-blue">Comparador de Pokémon</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Compara estadísticas base e IVs máximos de hasta 4 Pokémon diferentes.
          </p>
        </div>
        
        <div className="mb-8">
          <div className="max-w-xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar Pokémon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <Card className="mt-2">
                <CardContent className="p-2">
                  <ul className="divide-y">
                    {searchResults.map((pokemon) => (
                      <li key={pokemon.id} className="py-2 px-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                              alt={pokemon.name}
                              className="w-10 h-10 mr-2"
                            />
                            <span className="capitalize">{pokemon.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addPokemon(pokemon.id, pokemon.name)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Añadir
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center p-8">Cargando Pokémon...</div>
          ) : (
            <PokemonComparator 
              selectedPokemons={selectedPokemons} 
              onRemove={removePokemon} 
            />
          )}
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

export default PokemonComparison;
