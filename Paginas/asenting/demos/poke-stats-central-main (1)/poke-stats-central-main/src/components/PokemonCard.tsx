
import { PokemonListItem } from "../services/pokemonService";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface PokemonCardProps {
  pokemon: PokemonListItem;
  loading?: boolean;
}

const PokemonCard = ({ pokemon, loading = false }: PokemonCardProps) => {
  if (loading) {
    return (
      <Card className="pokemon-card w-full h-[320px] flex flex-col items-center p-4 overflow-hidden border-2 border-transparent">
        <Skeleton className="h-44 w-44 rounded-full" />
        <div className="mt-6 w-full space-y-2">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </Card>
    );
  }

  // La imagen oficial del Pokémon
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <Link to={`/pokemon/${pokemon.id}`}>
      <Card className="pokemon-card w-full h-full flex flex-col items-center p-4 overflow-hidden border-2 border-transparent hover:border-pokemon-yellow dark:hover:border-pokemon-yellow relative bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
        {/* Background decorative circles */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500 opacity-10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-blue-500 opacity-10 rounded-full"></div>
        
        <div className="relative w-44 h-44 flex items-center justify-center mb-4 group">
          <div className="absolute w-36 h-36 bg-gradient-to-br from-pokemon-red/20 to-pokemon-blue/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img 
            src={imageUrl}
            alt={pokemon.name}
            className="w-36 h-36 object-contain z-10 drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2"
            onError={(e) => {
              // Si falla, usar imagen por defecto
              (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
            }}
          />
        </div>
        
        <div className="text-center w-full relative z-10">
          <h3 className="text-xl font-bold capitalize mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pokemon-dark to-pokemon-blue dark:from-gray-100 dark:to-white">
            {pokemon.name}
          </h3>
          <Badge variant="outline" className="bg-pokemon-red bg-opacity-10 text-pokemon-red border-pokemon-red px-3 py-1 text-sm font-mono shadow-inner">
            #{String(pokemon.id).padStart(3, '0')}
          </Badge>
        </div>
      </Card>
    </Link>
  );
};

export default PokemonCard;
