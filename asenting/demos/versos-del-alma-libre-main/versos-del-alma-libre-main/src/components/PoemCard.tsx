
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PoemCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
}

const PoemCard: React.FC<PoemCardProps> = ({ id, title, excerpt, author, date, imageUrl }) => {
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all bg-white hover:translate-y-[-5px] duration-300">
      <div className="overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <img 
            src={imageUrl} 
            alt={`Ilustración para ${title}`} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </AspectRatio>
      </div>
      <CardContent className="p-6 border-l-4 border-amber-500">
        <h3 className="font-playfair text-xl font-semibold mb-2 text-amber-800">{title}</h3>
        <p className="text-amber-700 italic mb-4 font-lora">{excerpt}...</p>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-amber-50 flex justify-between items-center">
        <span className="text-sm text-amber-600 font-medium font-lora">Por {author}</span>
        <Link 
          to={`/poema/${id}`} 
          className="text-sm font-medium flex items-center hover:underline text-amber-700 hover:text-amber-900"
        >
          <span>Leer más</span>
          <BookOpen className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PoemCard;
