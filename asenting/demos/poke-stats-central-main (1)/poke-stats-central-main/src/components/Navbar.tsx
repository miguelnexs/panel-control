
import { Link } from "react-router-dom";
import PokemonSearch from "./PokemonSearch";
import { ArrowLeftRight, Star } from "lucide-react";
import ItemsMenu from "./ItemsMenu";

const Navbar = () => {
  return (
    <header className="bg-gradient-to-r from-pokemon-red to-pokemon-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <div className="flex items-center">
            <ItemsMenu />
            <Link to="/" className="flex items-center group">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-white rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
                <img 
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                  alt="Logo" 
                  className="h-10 w-10 relative z-10 drop-shadow-md transition-transform group-hover:rotate-12"
                />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-300">PokeStats Central</h1>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Link to="/compare" className="flex items-center hover:text-yellow-300 transition-colors group">
              <ArrowLeftRight className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Comparar</span>
            </Link>
            <Link to="/shinies" className="flex items-center hover:text-yellow-300 transition-colors group">
              <Star className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Shinies</span>
            </Link>
          </nav>
        </div>
        
        <div className="md:w-1/2">
          <PokemonSearch />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
