
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import PokemonList from "@/components/PokemonList";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pokemon-red to-pokemon-blue">
            ¡Bienvenido a PokeStats Central!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Explora el mundo Pokémon y descubre estadísticas detalladas de todos tus Pokémon favoritos.
            Utiliza la búsqueda para encontrar Pokémon específicos o navega por la lista.
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                alt="Loading" 
                className="h-16 w-16 animate-spin"
              />
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
            </div>
            <p className="ml-4 text-xl font-semibold text-gray-600">Cargando Pokémon...</p>
          </div>
        }>
          <PokemonList />
        </Suspense>
      </main>
      
      <footer className="bg-gradient-to-r from-pokemon-blue to-pokemon-dark text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-3">
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
              alt="Logo" 
              className="h-8 w-8 mr-2"
            />
          </div>
          <p className="font-bold">PokeStats Central &copy; {new Date().getFullYear()}</p>
          <p className="text-sm mt-1 text-gray-300">Desarrollado con la PokeAPI</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-pokemon-yellow transition-colors">Acerca de</a>
            <a href="#" className="hover:text-pokemon-yellow transition-colors">API</a>
            <a href="#" className="hover:text-pokemon-yellow transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
