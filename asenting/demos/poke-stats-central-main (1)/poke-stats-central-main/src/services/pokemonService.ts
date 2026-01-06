
// Tipos para la estructura de datos de Pokémon
export interface PokemonListItem {
  name: string;
  url: string;
  id: number;
  hasShiny?: boolean;
  hasMega?: boolean;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: {
    type: {
      name: string;
    }
  }[];
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny?: string;
      }
    }
    front_default: string;
    front_shiny: string;
  };
  stats: {
    base_stat: number;
    stat: {
      name: string;
    }
  }[];
  height: number;
  weight: number;
  abilities: {
    ability: {
      name: string;
    }
  }[];
  forms?: {
    name: string;
    url: string;
  }[];
  hasMega?: boolean;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  limit: number;
}

// Interfaz para IVs máximos
export interface MaxIVs {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

// IDs de Pokémon que tienen mega evoluciones
export const MEGA_EVOLUTION_POKEMON_IDS = [
  3, 6, 9, 65, 94, 115, 127, 130, 142, 150, 181, 212, 214, 229, 248, 
  254, 257, 260, 282, 303, 306, 308, 310, 354, 359, 380, 381, 445, 448, 460
];

// Función para obtener ID desde la URL
const getIdFromUrl = (url: string): number => {
  const urlParts = url.split('/');
  return parseInt(urlParts[urlParts.length - 2]);
};

// Obtener lista de Pokémon con paginación
export const getPokemonList = async (page: number = 1, limit: number = 20): Promise<{
  pokemons: PokemonListItem[],
  pagination: PaginationState
}> => {
  try {
    const offset = (page - 1) * limit;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar los Pokémon');
    }
    
    const data: PokemonListResponse = await response.json();
    
    // Calcular total de páginas
    const totalPages = Math.ceil(data.count / limit);
    
    // Mapear los resultados para incluir el ID y determinar si tiene mega evolución
    const pokemons = data.results.map(pokemon => {
      const id = getIdFromUrl(pokemon.url);
      return {
        ...pokemon,
        id,
        hasShiny: true, // Todos los Pokemon tienen versión shiny
        hasMega: MEGA_EVOLUTION_POKEMON_IDS.includes(id)
      };
    });
    
    return {
      pokemons,
      pagination: {
        currentPage: page,
        totalPages,
        limit
      }
    };
  } catch (error) {
    console.error('Error en getPokemonList:', error);
    throw error;
  }
};

// Obtener detalles de un Pokémon específico
export const getPokemonDetail = async (idOrName: string | number): Promise<PokemonDetail> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    
    if (!response.ok) {
      throw new Error(`Error al cargar los detalles de Pokémon ${idOrName}`);
    }
    
    const data: PokemonDetail = await response.json();
    
    // Verificar si tiene mega evolución
    const id = typeof idOrName === 'string' ? parseInt(idOrName) : idOrName;
    data.hasMega = MEGA_EVOLUTION_POKEMON_IDS.includes(id);
    
    return data;
  } catch (error) {
    console.error(`Error en getPokemonDetail para ${idOrName}:`, error);
    throw error;
  }
};

// Buscar Pokémon por nombre
export const searchPokemon = async (query: string): Promise<PokemonListItem[]> => {
  try {
    // Obtener una lista más grande para hacer búsqueda local
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    
    if (!response.ok) {
      throw new Error('Error al buscar Pokémon');
    }
    
    const data: PokemonListResponse = await response.json();
    
    // Filtrar por nombre basado en la consulta
    const filteredResults = data.results
      .filter(pokemon => pokemon.name.toLowerCase().includes(query.toLowerCase()))
      .map(pokemon => {
        const id = getIdFromUrl(pokemon.url);
        return {
          ...pokemon,
          id,
          hasShiny: true,
          hasMega: MEGA_EVOLUTION_POKEMON_IDS.includes(id)
        };
      });
    
    return filteredResults;
  } catch (error) {
    console.error('Error en searchPokemon:', error);
    throw error;
  }
};

// Obtener lista de Pokémon con mega evoluciones
export const getMegaEvolutionPokemonList = async (): Promise<PokemonListItem[]> => {
  try {
    // Obtener los primeros 1000 Pokemon (cubren todos los que tienen mega evolución)
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    
    if (!response.ok) {
      throw new Error('Error al cargar los Pokémon con mega evolución');
    }
    
    const data: PokemonListResponse = await response.json();
    
    // Filtrar solo los Pokémon con mega evolución
    const megaPokemons = data.results
      .map(pokemon => {
        const id = getIdFromUrl(pokemon.url);
        return {
          ...pokemon,
          id,
          hasShiny: true,
          hasMega: MEGA_EVOLUTION_POKEMON_IDS.includes(id)
        };
      })
      .filter(pokemon => pokemon.hasMega);
    
    return megaPokemons;
  } catch (error) {
    console.error('Error en getMegaEvolutionPokemonList:', error);
    throw error;
  }
};

// Obtener lista de Pokémon shiny (todos los Pokémon tienen versión shiny)
export const getShinyPokemonList = async (page: number = 1, limit: number = 20): Promise<{
  pokemons: PokemonListItem[],
  pagination: PaginationState
}> => {
  try {
    const offset = (page - 1) * limit;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar los Pokémon shiny');
    }
    
    const data: PokemonListResponse = await response.json();
    
    // Calcular total de páginas
    const totalPages = Math.ceil(data.count / limit);
    
    // Mapear los resultados para incluir el ID
    const pokemons = data.results.map(pokemon => {
      const id = getIdFromUrl(pokemon.url);
      return {
        ...pokemon,
        id,
        hasShiny: true,
        hasMega: MEGA_EVOLUTION_POKEMON_IDS.includes(id)
      };
    });
    
    return {
      pokemons,
      pagination: {
        currentPage: page,
        totalPages,
        limit
      }
    };
  } catch (error) {
    console.error('Error en getShinyPokemonList:', error);
    throw error;
  }
};

// Obtener el color del tipo de Pokémon para las gráficas
export const getStatColor = (statName: string): string => {
  const colors: Record<string, string> = {
    'hp': '#FF0000',
    'attack': '#F08030',
    'defense': '#F8D030',
    'special-attack': '#6890F0',
    'special-defense': '#78C850',
    'speed': '#F85888'
  };
  
  return colors[statName] || '#A8A878'; // Color predeterminado
};

// Calcular IVs máximos para un Pokémon
export const calculateMaxIVs = (basePokemon: PokemonDetail): MaxIVs => {
  // En Pokémon, el IV máximo es 31 para cada stat
  // La fórmula para calcular el stat máximo al nivel 100 es:
  // HP: (Base + IV + (EV/4)) * 2 + 110
  // Otros: ((Base + IV + (EV/4)) * 2 + 5) * Naturaleza
  
  // Para simplificar, asumiremos naturaleza neutra y EVs máximos (252)
  const maxEVContribution = Math.floor(252 / 4); // 63
  const maxIV = 31;
  
  const maxStats: MaxIVs = {
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0
  };
  
  basePokemon.stats.forEach(stat => {
    const statName = stat.stat.name as keyof MaxIVs;
    if (statName === 'hp') {
      maxStats[statName] = Math.floor((stat.base_stat + maxIV + maxEVContribution) * 2) + 110;
    } else {
      maxStats[statName] = Math.floor(((stat.base_stat + maxIV + maxEVContribution) * 2 + 5));
    }
  });
  
  return maxStats;
};
