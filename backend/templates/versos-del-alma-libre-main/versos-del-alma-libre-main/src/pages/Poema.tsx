
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PoemDetail from '@/components/PoemDetail';
import PoemForm from '@/components/PoemForm';
import { BookOpen, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Poema = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Sheet>
          <div className="flex justify-end mb-6">
            <SheetTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Subir Poema
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-amber-800 font-playfair text-xl">Comparte tu poema</SheetTitle>
            </SheetHeader>
            <PoemForm />
          </SheetContent>
        </Sheet>
        
        <PoemDetail />
      </div>
      
      <footer className="bg-white border-t border-amber-100 py-8 mt-12 shadow-inner">
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

export default Poema;
