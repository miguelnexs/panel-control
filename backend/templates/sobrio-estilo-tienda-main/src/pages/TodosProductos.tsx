import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Search, Filter, Grid, LayoutList, ShoppingBag, Menu } from 'lucide-react';
import HamburgerMenu from '@/components/HamburgerMenu';
import CartDropdown from '@/components/CartDropdown';
import FreeShippingBar from '@/components/FreeShippingBar';
import { allProducts, categories, colors, Product } from '@/data/products';

export default function TodosProductos() {
  const navigate = useNavigate();
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get min and max prices for slider
  const minPrice = Math.min(...allProducts.map(p => p.priceNumber));
  const maxPrice = Math.max(...allProducts.map(p => p.priceNumber));
  
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesColor = selectedColor === 'Todos' || 
        product.colors.some(color => color.name === selectedColor);
      const matchesPrice = product.priceNumber >= priceRange[0] && product.priceNumber <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesColor && matchesPrice;
    });
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceNumber - b.priceNumber;
        case 'price-high':
          return b.priceNumber - a.priceNumber;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [searchTerm, selectedCategory, selectedColor, priceRange, sortBy]);
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setSelectedColor('Todos');
    setPriceRange([minPrice, maxPrice]);
    setSortBy('name');
  };
  
  const ProductCard = ({ product }: { product: Product }) => {
    const mainImage = product.colors[0]?.images[0];
    
    if (viewMode === 'list') {
      return (
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 mb-4" 
              onClick={() => navigate(`/producto/${product.id}`)}>
          <CardContent className="p-4 flex items-center gap-4">
            <img 
              src={mainImage} 
              alt={product.name}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-muted-foreground mb-2">{product.category}</p>
              <div className="flex items-center gap-2 mb-2">
                {product.colors.map((color, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {color.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xl font-bold text-primary">{product.price}</p>
            </div>
            <Button variant="outline" size="sm">
              Ver Producto
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group" 
            onClick={() => navigate(`/producto/${product.id}`)}>
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img 
              src={mainImage} 
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{product.category}</Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              {product.colors.map((color, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {color.name}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-primary">{product.price}</p>
              <Button variant="outline" size="sm">
                Ver
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <FreeShippingBar />
      
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HamburgerMenu />
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </div>
          <h1 className="text-xl font-bold">Todos los Productos</h1>
          <CartDropdown />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                  </h2>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </div>
                
                {/* Search */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Color Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rango de Precio: €{priceRange[0]} - €{priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      min={minPrice}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Products Section */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-muted-foreground mb-4">
                  Prueba ajustando tus filtros o términos de búsqueda
                </p>
                <Button onClick={clearFilters}>Limpiar filtros</Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}