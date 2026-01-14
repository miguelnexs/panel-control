
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { poemas } from '@/data/poemas';
import { AspectRatio } from "@/components/ui/aspect-ratio";

const PoemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const poema = poemas.find(p => p.id === id);

  if (!poema) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="font-playfair text-2xl mb-4 text-amber-800">Poema no encontrado</h2>
        <Link to="/"><Button className="bg-amber-600 hover:bg-amber-700">Volver al inicio</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl animate-fade-in">
      <Link to="/" className="inline-flex items-center text-amber-600 mb-8 hover:text-amber-800 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Link>
      
      <article className="prose prose-lg mx-auto">
        <div className="text-center mb-8">
          <BookOpen className="h-8 w-8 mx-auto text-amber-500 mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4 text-amber-800">{poema.title}</h1>
          <div className="flex items-center justify-center text-amber-600 mb-2">
            <p>Por {poema.author}</p>
            <span className="mx-2">•</span>
            <p>{poema.date}</p>
          </div>
          <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
        </div>
        
        <div className="mb-8 overflow-hidden rounded-lg shadow-md">
          <AspectRatio ratio={16 / 9}>
            <img 
              src={poema.imageUrl} 
              alt={`Ilustración para ${poema.title}`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
        
        <div className="poem-text leading-relaxed whitespace-pre-line bg-white p-8 rounded-lg shadow-md border-l-4 border-amber-500 font-lora text-lg">
          {poema.content}
        </div>
      </article>
    </div>
  );
};

export default PoemDetail;
