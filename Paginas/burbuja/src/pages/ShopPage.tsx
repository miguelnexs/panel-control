import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, getPublicParams } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, ShoppingCart, Zap, SlidersHorizontal, ArrowUpDown, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { slugify } from "@/lib/utils";

// Tipos
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image?: string;
  category?: number;
  category_name?: string;
  is_new?: boolean;
  is_sale?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [ordering, setOrdering] = useState<string>(searchParams.get("ordering") || "newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sincronizar URL con estados (opcional, pero buena práctica)
  useEffect(() => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (ordering !== "newest") params.ordering = ordering;
    setSearchParams(params);
  }, [searchTerm, selectedCategory, ordering]);

  // Fetch Categorías
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('webconfig/public/categories/') + getPublicParams());
      if (!response.ok) throw new Error('Error al cargar categorías');
      return response.json();
    }
  });

  // Fetch Productos con filtros
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, ordering, priceRange], // Refetch cuando cambien estos
    queryFn: async () => {
      let url = buildApiUrl('webconfig/public/products/') + getPublicParams();
      
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedCategory !== "all") url += `&category=${selectedCategory}`;
      if (ordering) url += `&ordering=${ordering}`;
      // if (priceRange[0] > 0) url += `&min_price=${priceRange[0]}`; // Descomentar si backend soporta
      // if (priceRange[1] < 10000000) url += `&max_price=${priceRange[1]}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar productos');
      return response.json();
    }
  });

  const productList: Product[] = Array.isArray(products) ? products : (products?.results || []);
  const categoryList: Category[] = Array.isArray(categories) ? categories : (categories?.results || []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.is_sale && product.sale_price ? product.sale_price : product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  // Componente de Filtros (Reutilizable para Desktop y Mobile)
  const FiltersContent = () => (
    <div className="space-y-8">
      {/* Búsqueda */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Buscar</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar productos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Categorías</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="cat-all" 
              checked={selectedCategory === "all"}
              onCheckedChange={() => setSelectedCategory("all")}
            />
            <label htmlFor="cat-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
              Todas las categorías
            </label>
          </div>
          {categoryList.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${cat.id}`} 
                checked={selectedCategory === String(cat.id)}
                onCheckedChange={() => setSelectedCategory(String(cat.id))}
              />
              <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Precio (Mock visual por ahora, backend necesita soporte completo) */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Precio</h3>
        <Slider 
          defaultValue={[0, 100]} 
          max={100} 
          step={1} 
          className="py-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Min: $0</span>
          <span>Max: $$$</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-16 md:pt-24 pb-16">
        <div className="container mx-auto px-4">
          
          {/* Header de la Tienda */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Tienda</h1>
              <p className="text-muted-foreground mt-1">
                Mostrando {productList.length} productos
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Botón Filtros Móvil */}
              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden flex-1">
                    <Filter className="mr-2 h-4 w-4" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <FiltersContent />
                </SheetContent>
              </Sheet>

              {/* Ordenamiento */}
              <Select value={ordering} onValueChange={setOrdering}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price_asc">Menor precio</SelectItem>
                  <SelectItem value="price_desc">Mayor precio</SelectItem>
                  <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block space-y-8 sticky top-24 h-fit">
              <FiltersContent />
            </aside>

            {/* Grid de Productos */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : productList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productList.map((product, index) => (
                    <Link 
                      to={`/product/${product.id}/${slugify(product.name)}`}
                      key={product.id}
                      className="group block h-full bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted/20">
                        <img 
                          src={product.image || "/placeholder.svg"} 
                          alt={product.name}
                          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Badges */}
                        {(product.is_sale || product.is_new) && (
                          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {product.is_sale && <Badge variant="destructive" className="shadow-sm">Oferta</Badge>}
                            {product.is_new && <Badge variant="secondary" className="bg-blue-500 text-white shadow-sm hover:bg-blue-600">Nuevo</Badge>}
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button 
                          onClick={(e) => handleToggleWishlist(e, product.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm transition-all hover:scale-110 z-10 ${
                            isInWishlist(product.id) ? "text-red-500 border-red-200" : "text-muted-foreground border-transparent hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                      
                      <div className="p-5">
                        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          {product.category_name || "General"}
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-col">
                            {product.is_sale && product.sale_price ? (
                              <>
                                <span className="font-bold text-xl text-primary">{formatPrice(product.sale_price)}</span>
                                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-xl text-primary">{formatPrice(product.price)}</span>
                            )}
                          </div>
                          <Button 
                            size="icon" 
                            className="rounded-full h-10 w-10 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-md"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed">
                  <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No se encontraron productos</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Intenta ajustar tus filtros de búsqueda o categoría para encontrar lo que buscas.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setOrdering("newest");
                  }}>
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopPage;
