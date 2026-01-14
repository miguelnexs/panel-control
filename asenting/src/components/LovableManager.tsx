import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, ShoppingCart, LayoutTemplate, Store, Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// Mock Data
const MOCK_PRODUCTS = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: `Producto ${i + 1}`,
  price: (Math.random() * 100).toFixed(2),
  category: i % 2 === 0 ? "Ropa" : "Accesorios",
  image: `https://placehold.co/100?text=Prod+${i + 1}`
}));

interface StoreConfig {
  name: string;
  category: string;
  logo: string;
  primaryColor: string;
  layout: "grid" | "list";
  selectedProducts: number[];
}

export default function LovableManager() {
  const [activeTab, setActiveTab] = useState("create");
  const [config, setConfig] = useState<StoreConfig>({
    name: "",
    category: "",
    logo: "",
    primaryColor: "#3b82f6",
    layout: "grid",
    selectedProducts: []
  });

  const handleNext = (nextTab: string) => {
    setActiveTab(nextTab);
  };

  const handleDeploy = () => {
    toast.success("¡Tienda creada con éxito!", {
      description: "Tu tienda ha sido desplegada y está lista para recibir pedidos."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Creador de Tiendas Virtuales Lovable</h2>
        <p className="text-muted-foreground">
          Configura, personaliza y lanza tu tienda en minutos.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create">1. Detalles</TabsTrigger>
              <TabsTrigger value="products">2. Productos</TabsTrigger>
              <TabsTrigger value="design">3. Diseño</TabsTrigger>
              <TabsTrigger value="deploy">4. Publicar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Tienda</CardTitle>
                  <CardDescription>Comencemos con lo básico.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Tienda</Label>
                    <Input 
                      id="name" 
                      placeholder="Ej. Moda Urbana" 
                      value={config.name}
                      onChange={(e) => setConfig({...config, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría Principal</Label>
                    <Input 
                      id="category" 
                      placeholder="Ej. Ropa, Electrónica" 
                      value={config.category}
                      onChange={(e) => setConfig({...config, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">URL del Logo (Opcional)</Label>
                    <Input 
                      id="logo" 
                      placeholder="https://..." 
                      value={config.logo}
                      onChange={(e) => setConfig({...config, logo: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleNext("products")} className="w-full">
                    Siguiente: Seleccionar Productos
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Catálogo de Productos</CardTitle>
                  <CardDescription>Selecciona los productos que quieres mostrar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <Label>Seleccionar Todos</Label>
                            <Switch 
                                checked={config.selectedProducts.length === MOCK_PRODUCTS.length}
                                onCheckedChange={(checked) => {
                                    if (checked) setConfig({...config, selectedProducts: MOCK_PRODUCTS.map(p => p.id)});
                                    else setConfig({...config, selectedProducts: []});
                                }}
                            />
                        </div>
                        {MOCK_PRODUCTS.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Checkbox 
                                        checked={config.selectedProducts.includes(product.id)}
                                        onCheckedChange={(checked) => {
                                            const newSelected = checked 
                                                ? [...config.selectedProducts, product.id]
                                                : config.selectedProducts.filter(id => id !== product.id);
                                            setConfig({...config, selectedProducts: newSelected});
                                        }}
                                    />
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                                        <Store className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">${product.price}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{product.category}</Badge>
                            </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleNext("create")}>Atrás</Button>
                  <Button onClick={() => handleNext("design")}>Siguiente: Diseño</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalización</CardTitle>
                  <CardDescription>Define la apariencia de tu tienda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Diseño de Cuadrícula</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                className={`border-2 rounded-lg p-4 cursor-pointer hover:border-primary transition-all ${config.layout === 'grid' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => setConfig({...config, layout: 'grid'})}
                            >
                                <LayoutTemplate className="h-6 w-6 mb-2" />
                                <span className="font-medium">Grid</span>
                            </div>
                            <div 
                                className={`border-2 rounded-lg p-4 cursor-pointer hover:border-primary transition-all ${config.layout === 'list' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => setConfig({...config, layout: 'list'})}
                            >
                                <Store className="h-6 w-6 mb-2" />
                                <span className="font-medium">Lista</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Color Principal</Label>
                        <div className="flex gap-3">
                            {['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b'].map((color) => (
                                <button
                                    key={color}
                                    className={`w-8 h-8 rounded-full transition-all ${config.primaryColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setConfig({...config, primaryColor: color})}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleNext("products")}>Atrás</Button>
                  <Button onClick={() => handleNext("deploy")}>Siguiente: Publicar</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="deploy" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen y Publicación</CardTitle>
                        <CardDescription>Revisa que todo esté correcto antes de lanzar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nombre:</span>
                                <span className="font-medium">{config.name || "Sin nombre"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Categoría:</span>
                                <span className="font-medium">{config.category || "Sin categoría"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Productos:</span>
                                <span className="font-medium">{config.selectedProducts.length} seleccionados</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Layout:</span>
                                <span className="font-medium capitalize">{config.layout}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => handleNext("design")}>Atrás</Button>
                        <Button onClick={handleDeploy} className="gap-2 bg-green-600 hover:bg-green-700">
                            <Rocket className="h-4 w-4" /> Publicar Tienda
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-5">
            <div className="sticky top-32">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vista Previa en Vivo</h3>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>
                </div>
                <div className="border rounded-xl overflow-hidden shadow-xl bg-white text-slate-900 h-[600px] flex flex-col relative">
                    {/* Mock Browser Header */}
                    <div className="bg-slate-100 border-b p-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 bg-white rounded text-[10px] px-2 py-0.5 text-center text-slate-400 truncate">
                            {config.name ? `https://${config.name.toLowerCase().replace(/\s/g, '-')}.lovable.app` : 'https://tu-tienda.lovable.app'}
                        </div>
                    </div>

                    {/* Store Content */}
                    <div className="flex-1 overflow-auto bg-slate-50">
                        {/* Header */}
                        <div className="p-4 bg-white shadow-sm" style={{ borderTop: `4px solid ${config.primaryColor}` }}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {config.logo ? (
                                        <img src={config.logo} alt="Logo" className="w-8 h-8 object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                                            <Store className="w-4 h-4 text-slate-500" />
                                        </div>
                                    )}
                                    <span className="font-bold text-lg">{config.name || "Nombre Tienda"}</span>
                                </div>
                                <ShoppingCart className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>

                        {/* Banner */}
                        <div className="h-32 bg-slate-200 flex items-center justify-center text-slate-400 mb-4">
                            Banner Hero
                        </div>

                        {/* Products */}
                        <div className="p-4">
                            <h3 className="font-bold mb-3 text-slate-800">Productos Destacados</h3>
                            <div className={`grid gap-3 ${config.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {MOCK_PRODUCTS.filter(p => config.selectedProducts.includes(p.id)).length > 0 ? (
                                    MOCK_PRODUCTS.filter(p => config.selectedProducts.includes(p.id)).map(p => (
                                        <div key={p.id} className={`bg-white p-2 rounded shadow-sm flex ${config.layout === 'list' ? 'flex-row gap-3' : 'flex-col'}`}>
                                            <div className={`bg-slate-100 rounded flex items-center justify-center ${config.layout === 'list' ? 'w-16 h-16' : 'aspect-square'}`}>
                                                <Package className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div className="mt-2">
                                                <p className="font-medium text-xs line-clamp-1">{p.name}</p>
                                                <p className="text-xs font-bold mt-1" style={{ color: config.primaryColor }}>${p.price}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center text-slate-400 text-sm">
                                        Selecciona productos para verlos aquí
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
