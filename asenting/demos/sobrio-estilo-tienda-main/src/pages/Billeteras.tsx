
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HamburgerMenu from "@/components/HamburgerMenu";

const Billeteras = () => {
  const navigate = useNavigate();
  
  const products = [
    { id: 10, name: "Classic", price: "€35", image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop" },
    { id: 11, name: "Slim", price: "€40", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop" },
    { id: 12, name: "Executive", price: "€55", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop" },
    { id: 17, name: "Premium", price: "€65", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop" },
    { id: 18, name: "Business", price: "€70", image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 py-4 px-6">
        <div className="flex items-center justify-between">
          <HamburgerMenu />
          
          <div className="flex-1 text-center">
            <Link to="/">
              <h1 className="text-2xl font-light tracking-wide text-neutral-900 hover:text-neutral-700 transition-colors">
                cgcaroGonzalez
              </h1>
            </Link>
          </div>
          
          <ShoppingBag className="w-6 h-6 text-neutral-600 cursor-pointer hover:text-neutral-900 transition-colors" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-neutral-900 tracking-wide mb-4">
            Billeteras
          </h1>
          <div className="w-24 h-px bg-neutral-300 mx-auto"></div>
          <p className="text-neutral-600 mt-4">
            Diseños sofisticados para el día a día
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link 
              key={product.id}
              to={`/producto/${product.id}`}
              className="group block"
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square bg-neutral-100 mb-4 overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="space-y-1 text-center">
                      <h3 className="text-lg font-medium text-neutral-900 tracking-wide group-hover:text-neutral-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">
                        Billeteras
                      </p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {product.price}
                      </p>
                    </div>
                    <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white transition-colors">
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Billeteras;
