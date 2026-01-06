import { Mountain, Waves, Building2, TreePine, Palmtree, Castle, Sun, Compass } from "lucide-react";

// Import gallery images
import beachImg from "@/assets/gallery/beach.jpg";
import mountainsImg from "@/assets/gallery/mountains.jpg";
import cityImg from "@/assets/gallery/city.jpg";
import natureImg from "@/assets/gallery/nature.jpg";
import tropicalImg from "@/assets/gallery/tropical.jpg";
import historyImg from "@/assets/gallery/history.jpg";
import summerImg from "@/assets/gallery/summer.jpg";
import adventureImg from "@/assets/gallery/adventure.jpg";

const galleryItems = [
  { icon: <Waves className="h-8 w-8" />, label: "Playas", image: beachImg },
  { icon: <Mountain className="h-8 w-8" />, label: "Montañas", image: mountainsImg },
  { icon: <Building2 className="h-8 w-8" />, label: "Ciudades", image: cityImg },
  { icon: <TreePine className="h-8 w-8" />, label: "Naturaleza", image: natureImg },
  { icon: <Palmtree className="h-8 w-8" />, label: "Tropical", image: tropicalImg },
  { icon: <Castle className="h-8 w-8" />, label: "Historia", image: historyImg },
  { icon: <Sun className="h-8 w-8" />, label: "Verano", image: summerImg },
  { icon: <Compass className="h-8 w-8" />, label: "Aventura", image: adventureImg },
];

const GallerySection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="mb-8 text-center md:mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Galería de experiencias
          </h2>
          <p className="mt-2 text-muted-foreground">
            Encuentra la inspiración para tu próximo destino
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={item.label}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-travel transition-all duration-500 hover:shadow-travel-lg hover:scale-[1.02] opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Background image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent transition-opacity duration-300" />

              {/* Content */}
              <div className="relative flex h-full flex-col items-center justify-end p-4 pb-6">
                <div className="mb-2 text-primary-foreground drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="font-display text-lg font-semibold text-primary-foreground drop-shadow-lg">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
