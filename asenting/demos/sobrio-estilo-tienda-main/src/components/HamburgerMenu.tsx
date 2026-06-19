
import { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isComplementosOpen, setIsComplementosOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="p-0">
          <Menu className="w-6 h-6 text-neutral-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-white">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light text-neutral-900 tracking-wide">
                cgcaroGonzalez
              </h2>
              <Button variant="ghost" size="icon" onClick={closeMenu}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <nav className="flex-1 p-6">
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/bolsos-grandes" 
                  className="block py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Bolsos Grandes
                </Link>
              </li>
              <li>
                <Link 
                  to="/bolsos-pequenos" 
                  className="block py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Bolsos Pequeños
                </Link>
              </li>
              <li>
                <Link 
                  to="/canguros" 
                  className="block py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Canguros
                </Link>
              </li>
              <li>
                <Link 
                  to="/billeteras" 
                  className="block py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Billeteras
                </Link>
              </li>
              
              {/* Complementos con submenú */}
              <li>
                <div className="space-y-1">
                  <button
                    onClick={() => setIsComplementosOpen(!isComplementosOpen)}
                    className="w-full flex items-center justify-between py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    <span>Complementos</span>
                    {isComplementosOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {isComplementosOpen && (
                    <ul className="ml-4 space-y-1 border-l border-neutral-200 pl-4">
                      <li>
                        <Link 
                          to="/carpetas" 
                          className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                          onClick={closeMenu}
                        >
                          Carpetas
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/pasaporte-guarda" 
                          className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                          onClick={closeMenu}
                        >
                          Pasaporte Guarda
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/cosmeteria" 
                          className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                          onClick={closeMenu}
                        >
                          Cosmetería
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
              
              <li>
                <Link 
                  to="/ventas" 
                  className="block py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Ventas
                </Link>
              </li>
            </ul>
            
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/politicas-privacidad" 
                    className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terminos-condiciones" 
                    className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Términos y Condiciones
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
