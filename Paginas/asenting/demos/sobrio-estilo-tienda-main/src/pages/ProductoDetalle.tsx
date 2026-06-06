import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import FreeShippingBar from "@/components/FreeShippingBar";
import CartDropdown from "@/components/CartDropdown";
import { allProducts } from '@/data/products';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);


  const product = allProducts.find(p => p.id === parseInt(id || '0'));

  // Initialize selected color when product loads
  React.useEffect(() => {
    if (product && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-neutral-900 mb-4">Producto no encontrado</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const selectedColorData = product.colors.find(c => c.name === selectedColor) || product.colors[0];
  const currentImages = selectedColorData.images;

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast({
        title: "Selecciona un color",
        description: "Por favor selecciona un color antes de agregar al carrito",
        variant: "destructive"
      });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      priceNumber: product.priceNumber,
      image: currentImages[0],
      color: selectedColor
    });

    toast({
      title: "Producto agregado al carrito",
      description: `${product.name} en ${selectedColor} agregado al carrito`,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header simple */}
      <div className="bg-white border-b border-neutral-200 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-xl font-light tracking-wide text-neutral-900">
            cgcaroGonzalez
          </h1>
          <CartDropdown />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <FreeShippingBar />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
              <img 
                src={currentImages[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-neutral-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-neutral-900' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-light text-neutral-900 tracking-wide mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">(24 reseñas)</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900 mb-6">
                {product.price}
              </p>
            </div>

            {/* Selector de colores */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedImage(0);
                    }}
                    className={`px-4 py-2 rounded-md border-2 transition-colors ${
                      selectedColor === color.name
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-500'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Descripción</h3>
              <p className="text-neutral-600 leading-relaxed">
                Elegante {product.name.toLowerCase()} diseñado con materiales premium de la más alta calidad. 
                Perfecto para el uso diario con un estilo minimalista y sofisticado que complementa cualquier outfit.
                Fabricado artesanalmente con atención a cada detalle.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Características</h3>
              <ul className="space-y-2 text-neutral-600">
                <li>• Material: Cuero genuino premium</li>
                <li>• Forro interior de alta calidad</li>
                <li>• Herrajes en acabado mate</li>
                <li>• Diseño minimalista y elegante</li>
                <li>• Garantía de 2 años</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-neutral-900">Cantidad:</label>
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-neutral-300">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3"
                  disabled={!selectedColor}
                >
                  Agregar al carrito - {product.price}
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Favoritos
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>

            {/* Información de envío */}
            <Card className="border-neutral-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Envío gratuito</p>
                    <p className="text-sm text-neutral-600">En pedidos superiores a €300</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Garantía extendida</p>
                    <p className="text-sm text-neutral-600">2 años de garantía incluida</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Devoluciones fáciles</p>
                    <p className="text-sm text-neutral-600">30 días para devoluciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
