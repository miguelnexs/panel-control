
import React from 'react';
import Navbar from '@/components/Navbar';
import { poemas } from '@/data/poemas';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Autores = () => {
  // Obtener autores únicos
  const autoresUnicos = [...new Set(poemas.map(poema => poema.author))];
  
  // Agrupar poemas por autor
  const poemasPorAutor = autoresUnicos.map(autor => {
    const poemasDelAutor = poemas.filter(poema => poema.author === autor);
    return {
      nombre: autor,
      poemas: poemasDelAutor
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      
      <header className="bg-white py-12 border-b border-amber-100 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-amber-500 mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-amber-800">Autores</h1>
          <p className="text-amber-600 mt-2">Voces poéticas que dan vida a nuestras páginas</p>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4"></div>
        </div>
      </header>
      
      <main className="container mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {poemasPorAutor.map((autor) => (
            <Card key={autor.nombre} className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-0">
              <div className="border-l-4 border-amber-500 pl-4">
                <h2 className="font-playfair text-2xl font-semibold mb-4 text-amber-800">{autor.nombre}</h2>
                <p className="text-amber-600 mb-4">Obras en nuestra colección: {autor.poemas.length}</p>
              </div>
              <ul className="space-y-2 mt-6">
                {autor.poemas.map(poema => (
                  <li key={poema.id} className="transition-all hover:pl-2 duration-200">
                    <a 
                      href={`/poema/${poema.id}`} 
                      className="text-amber-600 hover:text-amber-900 hover:underline flex items-center"
                    >
                      <BookOpen className="h-3 w-3 mr-2 text-amber-500" />
                      {poema.title} <span className="text-amber-400 ml-2">({poema.date})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
      
      <footer className="bg-white border-t border-amber-100 py-8 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-amber-800 font-playfair font-semibold">Versos del Alma Libre</span>
          </div>
          <p className="text-amber-600">© 2025 Versos del Alma Libre</p>
        </div>
      </footer>
    </div>
  );
};

export default Autores;
