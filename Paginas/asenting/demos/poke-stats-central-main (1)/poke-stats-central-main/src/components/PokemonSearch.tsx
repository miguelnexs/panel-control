
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PokemonListItem, searchPokemon } from "../services/pokemonService";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useToast } from "./ui/use-toast";

const PokemonSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Cerrar el dropdown cuando se hace clic fuera
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const searchResults = await searchPokemon(query);
      setResults(searchResults);
      setShowDropdown(true);
      
      if (searchResults.length === 0) {
        toast({
          title: "Sin resultados",
          description: `No se encontraron Pokémon con el nombre "${query}"`,
        });
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      toast({
        title: "Error",
        description: "Ocurrió un problema al buscar. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPokemon = (id: number) => {
    navigate(`/pokemon/${id}`);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="search"
          placeholder="Buscar Pokémon..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-gray-800/70 text-white placeholder:text-gray-300 border-gray-700 focus-within:bg-gray-800 transition-colors shadow-inner"
        />
        <Button 
          type="submit" 
          disabled={searching || !query.trim()}
          className="bg-pokemon-yellow text-pokemon-dark hover:bg-pokemon-yellow/90 shadow-md"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </form>

      {showDropdown && results.length > 0 && (
        <div className="absolute mt-1 w-full bg-gray-800 dark:bg-gray-900 rounded-md shadow-lg z-10 max-h-60 overflow-auto border border-gray-700 animate-fade-in">
          <ul className="py-1">
            {results.slice(0, 8).map((pokemon) => (
              <li 
                key={pokemon.id}
                className="px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-800 cursor-pointer capitalize flex justify-between items-center text-white group transition-all"
                onClick={() => handleSelectPokemon(pokemon.id)}
              >
                <span className="group-hover:translate-x-1 transition-transform">{pokemon.name}</span>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">#{pokemon.id}</span>
              </li>
            ))}
            {results.length > 8 && (
              <li className="px-4 py-2 text-sm text-center text-gray-400">
                ...y {results.length - 8} más
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PokemonSearch;
