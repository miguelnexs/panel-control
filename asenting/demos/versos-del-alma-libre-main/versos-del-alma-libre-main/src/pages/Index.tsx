
import React from 'react';
import Navbar from '@/components/Navbar';
import PoemCard from '@/components/PoemCard';
import { poemas } from '@/data/poemas';
import { BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      
      <header className="bg-[url('https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80')] bg-cover bg-center py-24 border-b border-amber-100 relative">
        <div className="absolute inset-0 bg-amber-800/60"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <BookOpen className="h-16 w-16 mx-auto text-amber-200 mb-6" />
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 text-white">Versos del Alma Libre</h1>
          <p className="text-amber-100 max-w-2xl mx-auto text-lg">
            Un espacio para compartir y disfrutar del arte poético en español. 
            Descubre los versos que han conmovido generaciones y encontrado su lugar en la historia literaria.
          </p>
        </div>
      </header>
      
      <main className="container mx-auto py-16 px-4">
        <h2 className="font-playfair text-2xl font-semibold mb-2 text-amber-800 text-center">Poemas Destacados</h2>
        <div className="w-24 h-1 bg-amber-500 mx-auto mb-12"></div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p className="text-amber-600">© 2025 Versos del Alma Libre</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
