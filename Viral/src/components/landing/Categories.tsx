import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, buildMediaUrl, getPublicParams } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  image?: string;
  description?: string;
  products_count?: number; // Optional count from API if available
}

const Categories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('webconfig/public/categories/') + getPublicParams());
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      return response.json();
    }
  });

  const categoryList: Category[] = Array.isArray(categories) ? categories : (categories?.results || []);

  if (isLoading) {
     return (
       <section className="py-20 lg:py-32 bg-card">
         <div className="container mx-auto px-4 text-center">
            <p>Cargando categorías...</p>
         </div>
       </section>
     );
  }

  if (error || !categories || categoryList.length === 0) {
    return null; 
  }

  return (
    <section id="categorias" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">
            Explora
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            NUESTRAS CATEGORÍAS
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Encuentra el producto perfecto para cada ocasión. Desde el uso diario 
            hasta aventuras urbanas.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryList.map((category, index) => (
            <a
              key={category.id}
              href="#productos"
              className="group relative overflow-hidden rounded-lg aspect-[3/4] animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${category.image ? buildMediaUrl(category.image) : "/placeholder.svg"}')` }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Red accent line on hover */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                  {category.products_count !== undefined && (
                    <span className="text-xs text-primary font-semibold mb-2 block">
                      {category.products_count} productos
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                    {category.description || `Descubre nuestra colección de ${category.name}`}
                  </p>
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Ver productos
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
