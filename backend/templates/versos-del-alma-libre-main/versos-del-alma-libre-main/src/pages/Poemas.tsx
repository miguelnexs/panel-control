
import React from 'react';
import Navbar from '@/components/Navbar';
import PoemCard from '@/components/PoemCard';
import { poemas } from '@/data/poemas';
import { BookOpen } from 'lucide-react';

const Poemas = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      
      <header className="bg-white py-12 border-b border-amber-100 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-amber-500 mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-amber-800">Todos los Poemas</h1>
          <p className="text-amber-600 mt-2 font-lora">Explora nuestra colección de poesía en español</p>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4"></div>
        </div>
      </header>
      
      <main className="container mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {poemas.map((poema) => (
            <PoemCard
              key={poema.id}
              id={poema.id}
              title={poema.title}
              excerpt={poema.excerpt}
              author={poema.author}
              date={poema.date}
              imageUrl={poema.imageUrl}
            />
          ))}
        </div>
      </main>
      
      <footer className="bg-white border-t border-amber-100 py-8 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-amber-800 font-playfair font-semibold">Versos del Alma Libre</span>
          </div>
          <p className="text-amber-600 font-lora">© 2025 Versos del Alma Libre</p>
        </div>
      </footer>
    </div>
  );
};

export default Poemas;
