
import Header from "../components/Header";
import ProductsGrid from "../components/ProductsGrid";
import Footer from "../components/Footer";
import { Filter, Search, Grid, List } from "lucide-react";
import { useState } from "react";

const Catalog = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos los Bolsos');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Todos los Precios');

  const categories = [
    "Todos los Bolsos",
    "Bandoleras",
    "Bolsos de Mano",
    "Clutches",
    "Tote Bags",
    "Mini Bags"
  ];

  const priceRanges = [
    "Todos los Precios",
    "$0 - $50",
    "$50 - $100",
    "$100 - $150",
    "$150+"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Nuestro <span className="text-gradient">Catálogo</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Explora toda nuestra colección de bolsos elegantes y minimalistas. 
              Cada pieza está cuidadosamente diseñada para la mujer moderna que busca estilo y funcionalidad.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-medium to-pink-dark mx-auto rounded-full"></div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar bolsos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full lg:w-auto">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full lg:w-48 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="w-full lg:w-auto">
                <select 
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full lg:w-48 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-accent rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== 'Todos los Bolsos' || selectedPriceRange !== 'Todos los Precios') && (
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {searchTerm && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  Búsqueda: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'Todos los Bolsos' && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {selectedCategory}
                </span>
              )}
              {selectedPriceRange !== 'Todos los Precios' && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {selectedPriceRange}
                </span>
              )}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todos los Bolsos');
                  setSelectedPriceRange('Todos los Precios');
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Featured Collections */}
          <div className="mb-12">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
              Colecciones Destacadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                <img 
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop" 
                  alt="Colección Elegante"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-heading font-bold">Colección Elegante</h3>
                  <p className="text-sm opacity-90">Para ocasiones especiales</p>
                </div>
              </div>
              <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                <img 
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop" 
                  alt="Colección Casual"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-heading font-bold">Colección Casual</h3>
                  <p className="text-sm opacity-90">Para el día a día</p>
                </div>
              </div>
              <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                <img 
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop" 
                  alt="Colección Premium"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-heading font-bold">Colección Premium</h3>
                  <p className="text-sm opacity-90">Lujo y sofisticación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <ProductsGrid 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedPriceRange={selectedPriceRange}
            viewMode={viewMode}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
