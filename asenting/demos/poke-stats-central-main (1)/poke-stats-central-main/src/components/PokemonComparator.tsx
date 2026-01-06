
import { useState } from 'react';
import { PokemonDetail, calculateMaxIVs, MaxIVs } from '@/services/pokemonService';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { X, Plus, Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PokemonComparatorProps {
  selectedPokemons: PokemonDetail[];
  onRemove: (id: number) => void;
}

const PokemonComparator = ({ selectedPokemons, onRemove }: PokemonComparatorProps) => {
  const [showMaxIVs, setShowMaxIVs] = useState(false);
  
  if (selectedPokemons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
          alt="Pokeball" 
          className="w-16 h-16 mb-4 opacity-50"
        />
        <h3 className="text-xl font-medium mb-2">Sin Pokémon seleccionados</h3>
        <p className="text-gray-500">
          Utiliza el buscador para añadir Pokémon a la comparación
        </p>
      </div>
    );
  }

  // Preparar datos para la comparación
  const comparisonData = selectedPokemons.map(pokemon => {
    const maxIVs = calculateMaxIVs(pokemon);
    
    return {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.other['official-artwork'].front_default,
      types: pokemon.types,
      baseStats: pokemon.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {} as Record<string, number>),
      maxIVs
    };
  });
  
  // Obtener nombres de estadísticas para el encabezado
  const statNames = [
    { id: 'hp', label: 'HP' },
    { id: 'attack', label: 'Ataque' },
    { id: 'defense', label: 'Defensa' },
    { id: 'special-attack', label: 'At. Esp.' },
    { id: 'special-defense', label: 'Def. Esp.' },
    { id: 'speed', label: 'Velocidad' }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="bg-pokemon-blue text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Comparación de Pokémon</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMaxIVs(!showMaxIVs)}
            className="bg-white text-pokemon-blue hover:bg-gray-100"
          >
            {showMaxIVs ? 'Ver Stats Base' : 'Ver IVs Máximos'}
            <Info className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Pokémon</TableHead>
              {statNames.map(stat => (
                <TableHead key={stat.id} className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{stat.label}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {stat.label === 'HP' ? 'Puntos de Vida' : 
                          stat.id === 'attack' ? 'Ataque' :
                          stat.id === 'defense' ? 'Defensa' :
                          stat.id === 'special-attack' ? 'Ataque Especial' :
                          stat.id === 'special-defense' ? 'Defensa Especial' :
                          'Velocidad'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {comparisonData.map(pokemon => (
              <TableRow key={pokemon.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col items-center">
                    <img 
                      src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-16 h-16 object-contain"
                    />
                    <span className="capitalize mt-1 text-sm">{pokemon.name}</span>
                    <div className="flex gap-1 mt-1">
                      {pokemon.types.map((type, index) => (
                        <Badge 
                          key={index}
                          className={`type-${type.type.name} text-[10px] px-1`}
                        >
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                
                {statNames.map(stat => {
                  const baseStat = pokemon.baseStats[stat.id] || 0;
                  const maxStat = pokemon.maxIVs[stat.id as keyof MaxIVs] || 0;
                  const value = showMaxIVs ? maxStat : baseStat;
                  
                  // Calcular color basado en el valor (para stats base)
                  const getStatColorClass = (val: number): string => {
                    if (!showMaxIVs) {
                      if (val < 50) return 'bg-red-100 text-red-800';
                      if (val < 80) return 'bg-yellow-100 text-yellow-800';
                      if (val < 100) return 'bg-blue-100 text-blue-800';
                      return 'bg-green-100 text-green-800';
                    }
                    return '';
                  };
                  
                  return (
                    <TableCell 
                      key={stat.id} 
                      className={`text-center font-mono ${getStatColorClass(baseStat)}`}
                    >
                      {value}
                      {showMaxIVs && (
                        <Check className="inline ml-1 h-3 w-3 text-green-600" />
                      )}
                    </TableCell>
                  );
                })}
                
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(pokemon.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PokemonComparator;
