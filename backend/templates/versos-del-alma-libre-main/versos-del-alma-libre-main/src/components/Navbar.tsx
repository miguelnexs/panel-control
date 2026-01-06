
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="py-4 px-6 border-b border-amber-100 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-playfair font-semibold flex items-center text-amber-800">
          <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
          Versos del Alma Libre
        </Link>
        <div className="space-x-6">
          <Link to="/" className="font-playfair text-amber-700 hover:text-amber-900 hover:underline transition-colors">Inicio</Link>
          <Link to="/poemas" className="font-playfair text-amber-700 hover:text-amber-900 hover:underline transition-colors">Poemas</Link>
          <Link to="/autores" className="font-playfair text-amber-700 hover:text-amber-900 hover:underline transition-colors">Autores</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
