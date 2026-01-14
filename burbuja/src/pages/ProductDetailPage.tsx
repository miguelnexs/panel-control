import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, getPublicParams } from "@/lib/api";
import { slugify } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Star, Check, AlertCircle, Truck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

const ProductDetailPage = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(buildApiUrl(`webconfig/public/products/${id}/`) + getPublicParams());
      if (!response.ok) {
        throw new Error('Producto no encontrado');
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (product && !isLoading) {
      const correctSlug = slugify(product.name);
      if (slug !== correctSlug) {
        navigate(`/product/${id}/${correctSlug}`, { replace: true });
      }
    }
  }, [product, isLoading, id, slug, navigate]);

  const handleAddToCart = () => {
    if (!product) return;

    // Obtener nombres de variantes/colores seleccionados
    const colorObj = product.colors?.find((c: any) => c.id === selectedColor);
    const variantObj = product.variants?.find((v: any) => v.id === selectedVariant);

    // Validar selecciones requeridas (si aplica)
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Por favor selecciona un color");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: selectedImage || mainImage,
      quantity: quantity,
      color: selectedColor || undefined,
      variant: selectedVariant || undefined,
      colorName: colorObj?.name,
      variantName: variantObj?.name
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira este producto increíble: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      // Fallback: Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center pt-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-8">El producto que buscas no existe o no está disponible.</p>
          <Button asChild>
            <Link to="/shop">Volver a la tienda</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Preparar imágenes
  const mainImage = product.image;
  let allImages = mainImage ? [mainImage] : [];
  
  if (product.colors) {
    product.colors.forEach((c: any) => {
      if (c.images) {
        c.images.forEach((img: any) => {
          if (img.image) allImages.push(img.image);
        });
      }
    });
  }

  // Filtrar duplicados
  allImages = [...new Set(allImages)];
  const currentImage = selectedImage || mainImage || "/placeholder.svg";

  // Calcular precio actual (considerando variantes)
  const basePrice = Number(product.price);
  const salePrice = product.is_sale && product.sale_price ? Number(product.sale_price) : null;
  
  let currentDisplayPrice = salePrice || basePrice;
  let currentOriginalPrice = basePrice;

  if (selectedVariant && product.variants) {
    const variant = product.variants.find((v: any) => v.id === selectedVariant);
    if (variant && variant.extra_price) {
      currentDisplayPrice += Number(variant.extra_price);
      currentOriginalPrice += Number(variant.extra_price);
    }
  }

  const stock = product.total_stock;
  const isAvailable = stock > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">Tienda</Link>
            <span className="mx-2">/</span>
            {product.category_name && (
              <>
                <Link to={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">{product.category_name}</Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Galería de Imágenes */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/30 group">
                <img 
                  src={currentImage} 
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />
                {product.is_sale && (
                  <Badge className="absolute top-4 right-4 bg-red-500">Oferta</Badge>
                )}
                {product.is_new && (
                  <Badge className="absolute top-4 left-4 bg-blue-500">Nuevo</Badge>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden bg-muted/30 ${
                        currentImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del Producto */}
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-yellow-500">
                    <Star className="fill-current w-4 h-4" />
                    <Star className="fill-current w-4 h-4" />
                    <Star className="fill-current w-4 h-4" />
                    <Star className="fill-current w-4 h-4" />
                    <Star className="fill-current w-4 h-4" />
                    <span className="text-muted-foreground text-sm ml-2">(4.8)</span>
                  </div>
                  <span className="text-muted-foreground text-sm">SKU: {product.sku || 'N/A'}</span>
                </div>
                
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-3xl font-bold text-primary">{formatPrice(currentDisplayPrice)}</span>
                  {salePrice && (
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(currentOriginalPrice)}</span>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {product.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <Separator className="mb-6" />

              {/* Selectores de Variantes */}
              <div className="space-y-6 mb-8">
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="block text-sm font-medium mb-3">Color:</span>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color: any) => (
                        <button
                          key={color.id}
                          onClick={() => {
                            setSelectedColor(color.id);
                            // Cambiar imagen si el color tiene imágenes
                            if (color.images && color.images.length > 0) {
                              setSelectedImage(color.images[0].image);
                            }
                          }}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedColor === color.id ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {selectedColor === color.id && <Check className={`w-4 h-4 ${['#ffffff', '#fff'].includes(color.hex.toLowerCase()) ? 'text-black' : 'text-white'}`} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.variants && product.variants.length > 0 && (
                  <div>
                    <span className="block text-sm font-medium mb-3">Opciones:</span>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant.id)}
                          className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                            selectedVariant === variant.id 
                              ? 'border-primary bg-primary/5 text-primary font-medium' 
                              : 'border-input hover:border-primary/50'
                          }`}
                        >
                          {variant.name} {Number(variant.extra_price) > 0 && `(+${formatPrice(Number(variant.extra_price))})`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cantidad */}
                <div>
                  <span className="block text-sm font-medium mb-3">Cantidad:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg bg-background">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted/50 transition-colors"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted/50 transition-colors"
                        disabled={!isAvailable}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {isAvailable ? `${stock} unidades disponibles` : 'Sin stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 mb-8">
                <Button 
                  className="flex-1 h-12 text-base rounded-xl" 
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isAvailable ? 'Añadir al Carrito' : 'Agotado'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`h-12 w-12 rounded-xl ${isInWishlist(Number(id)) ? "text-red-500 border-red-200 bg-red-50" : ""}`}
                  onClick={() => toggleWishlist(Number(id))}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(Number(id)) ? "fill-current" : ""}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Beneficios */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Envío a todo el país</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Garantía de calidad</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <span>Soporte 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas de Info */}
          <div className="mt-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="description" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3"
                >
                  Descripción
                </TabsTrigger>
                <TabsTrigger 
                  value="specs" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3"
                >
                  Especificaciones
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-8">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description || "No hay descripción detallada disponible para este producto."}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="specs" className="mt-8">
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <tbody className="divide-y">
                      {product.features && product.features.length > 0 ? (
                        product.features.map((feature: any) => (
                          <tr key={feature.id} className="hover:bg-muted/30">
                            <td className="p-4 font-medium w-1/3 bg-muted/10">{feature.name}</td>
                            <td className="p-4 text-muted-foreground">{feature.value || 'Sí'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-4 text-muted-foreground text-center">No hay especificaciones técnicas disponibles.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
