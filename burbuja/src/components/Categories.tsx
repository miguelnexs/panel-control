import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, buildMediaUrl, getPublicParams } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  image?: string;
  description?: string;
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

  if (isLoading || error || !categories || categories.length === 0) {
    return null; // Ocultar si no hay categorías o error
  }

  const categoryList: Category[] = Array.isArray(categories) ? categories : (categories?.results || []);

  return (
    <section id="categorias" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl text-foreground mb-4">
            Explora por <span className="text-gradient">Categorías</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {categoryList.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              {category.image && (
                <img 
                  src={buildMediaUrl(category.image)} 
                  alt={category.name}
                  className="w-12 h-12 object-contain mb-2"
                />
              )}
              <span className="font-medium text-lg">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
