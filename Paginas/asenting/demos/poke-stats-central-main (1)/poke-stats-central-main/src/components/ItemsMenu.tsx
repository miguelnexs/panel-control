
import React from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pokemon items organized by categories
const pokemonItems = {
  pokeballs: [
    { name: "Poké Ball", quality: "Basic", description: "A device for catching wild Pokémon." },
    { name: "Great Ball", quality: "Good", description: "A good, high-performance Poké Ball." },
    { name: "Ultra Ball", quality: "Better", description: "A very high-performance Poké Ball." },
    { name: "Master Ball", quality: "Best", description: "The best Poké Ball with the highest catch rate." }
  ],
  healing: [
    { name: "Potion", quality: "Basic", description: "Restores 20 HP." },
    { name: "Super Potion", quality: "Good", description: "Restores 50 HP." },
    { name: "Hyper Potion", quality: "Better", description: "Restores 200 HP." },
    { name: "Max Potion", quality: "Best", description: "Fully restores HP." },
    { name: "Full Restore", quality: "Best", description: "Fully restores HP and status." }
  ],
  battleItems: [
    { name: "X Attack", quality: "Good", description: "Raises Attack stat in battle." },
    { name: "X Defense", quality: "Good", description: "Raises Defense stat in battle." },
    { name: "X Speed", quality: "Good", description: "Raises Speed stat in battle." }
  ],
  heldItems: [
    { name: "Leftovers", quality: "Best", description: "Restores HP gradually during battle." },
    { name: "Choice Band", quality: "Best", description: "Boosts Attack but limits to one move." },
    { name: "Choice Specs", quality: "Best", description: "Boosts Sp. Atk but limits to one move." },
    { name: "Life Orb", quality: "Better", description: "Powers up moves but costs some HP." }
  ],
  evolutionItems: [
    { name: "Fire Stone", quality: "Good", description: "Evolves certain Pokémon." },
    { name: "Water Stone", quality: "Good", description: "Evolves certain Pokémon." },
    { name: "Thunder Stone", quality: "Good", description: "Evolves certain Pokémon." },
    { name: "Leaf Stone", quality: "Good", description: "Evolves certain Pokémon." },
    { name: "Moon Stone", quality: "Good", description: "Evolves certain Pokémon." }
  ]
};

// Quality colors mapping
const qualityColors = {
  Basic: "bg-gray-100 text-gray-800",
  Good: "bg-green-100 text-green-800",
  Better: "bg-blue-100 text-blue-800",
  Best: "bg-purple-100 text-purple-800"
};

// Item Category component to display items of a specific category
const ItemCategory = ({ title, items }: { title: string, items: any[] }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="border rounded-md mb-2 shadow-sm hover:shadow transition-shadow"
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <span className="font-medium">{title} ({items.length})</span>
          <span className="transition-transform transform">{isOpen ? '▲' : '▼'}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-2 space-y-2 animate-accordion-down">
        <div className="grid grid-cols-1 gap-2">
          {items.map((item) => (
            <div 
              key={item.name} 
              className="p-3 border rounded-md flex flex-col bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">{item.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${qualityColors[item.quality as keyof typeof qualityColors]}`}>
                  {item.quality}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Items view by category
const CategoryView = () => (
  <div className="space-y-2 p-2">
    {Object.entries(pokemonItems).map(([category, items]) => (
      <ItemCategory 
        key={category} 
        title={category.charAt(0).toUpperCase() + category.slice(1)} 
        items={items} 
      />
    ))}
  </div>
);

// Items view by quality
const QualityView = () => {
  // Group items by quality
  const qualities = ["Best", "Better", "Good", "Basic"];
  const itemsByQuality: Record<string, any[]> = {};
  
  qualities.forEach(quality => {
    itemsByQuality[quality] = [];
    Object.values(pokemonItems).forEach(categoryItems => {
      itemsByQuality[quality] = [
        ...itemsByQuality[quality],
        ...categoryItems.filter(item => item.quality === quality)
      ];
    });
  });

  return (
    <div className="space-y-2 p-2">
      {qualities.map(quality => (
        itemsByQuality[quality].length > 0 && (
          <ItemCategory 
            key={quality} 
            title={`${quality} Items`} 
            items={itemsByQuality[quality]} 
          />
        )
      ))}
    </div>
  );
};

// Main ItemsMenu component
const ItemsMenu = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-white/20 transition-colors">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <DrawerHeader className="text-center border-b pb-4">
          <DrawerTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pokemon-red to-pokemon-blue">Pokémon Items</DrawerTitle>
        </DrawerHeader>
        <Tabs defaultValue="category" className="w-full px-4">
          <TabsList className="grid w-full grid-cols-2 mb-4 mt-4 bg-gray-200 dark:bg-gray-800">
            <TabsTrigger value="category" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">By Category</TabsTrigger>
            <TabsTrigger value="quality" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">By Quality</TabsTrigger>
          </TabsList>
          <TabsContent value="category" className="animate-fade-in">
            <CategoryView />
          </TabsContent>
          <TabsContent value="quality" className="animate-fade-in">
            <QualityView />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
};

export default ItemsMenu;
