export interface ProductColor {
  name: string;
  images: string[];
}

export interface Product {
  id: number;
  name: string;
  price: string;
  priceNumber: number;
  category: string;
  colors: ProductColor[];
}

export const allProducts: Product[] = [
  // Bolsos grandes
  { 
    id: 1, 
    name: "Caipe", 
    price: "€150", 
    priceNumber: 150,
    category: "Bolsos grandes", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Marrón", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Beige", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 2, 
    name: "Milano", 
    price: "€175", 
    priceNumber: 175,
    category: "Bolsos grandes", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cognac", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 3, 
    name: "Ventura", 
    price: "€195", 
    priceNumber: 195,
    category: "Bolsos grandes", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Bolsos pequeños
  { 
    id: 4, 
    name: "Pagaporte", 
    price: "€85", 
    priceNumber: 85,
    category: "Bolsos pequeños", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 5, 
    name: "Mini Clara", 
    price: "€65", 
    priceNumber: 65,
    category: "Bolsos pequeños", 
    colors: [
      { name: "Rosa", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] },
      { name: "Negro", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 6, 
    name: "Pocket", 
    price: "€75", 
    priceNumber: 75,
    category: "Bolsos pequeños", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Canguros
  { 
    id: 7, 
    name: "Sport", 
    price: "€45", 
    priceNumber: 45,
    category: "Canguros", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 8, 
    name: "Urban", 
    price: "€55", 
    priceNumber: 55,
    category: "Canguros", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 9, 
    name: "Travel", 
    price: "€65", 
    priceNumber: 65,
    category: "Canguros", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Billeteras
  { 
    id: 10, 
    name: "Classic", 
    price: "€35", 
    priceNumber: 35,
    category: "Billeteras", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 11, 
    name: "Slim", 
    price: "€40", 
    priceNumber: 40,
    category: "Billeteras", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 12, 
    name: "Executive", 
    price: "€55", 
    priceNumber: 55,
    category: "Billeteras", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Complementos
  { 
    id: 19, 
    name: "Canceuas", 
    price: "€120", 
    priceNumber: 120,
    category: "Complementos", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 20, 
    name: "Elegante", 
    price: "€95", 
    priceNumber: 95,
    category: "Complementos", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Carpetas
  { 
    id: 23, 
    name: "Executive", 
    price: "€45", 
    priceNumber: 45,
    category: "Carpetas", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 24, 
    name: "Professional", 
    price: "€55", 
    priceNumber: 55,
    category: "Carpetas", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Pasaporte/Guarda
  { 
    id: 26, 
    name: "Travel Pro", 
    price: "€25", 
    priceNumber: 25,
    category: "Pasaporte/Guarda", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 27, 
    name: "Secure", 
    price: "€30", 
    priceNumber: 30,
    category: "Pasaporte/Guarda", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Cosmetic
  { 
    id: 29, 
    name: "Beauty Case", 
    price: "€35", 
    priceNumber: 35,
    category: "Cosmeteria", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Rosa", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 30, 
    name: "Travel Kit", 
    price: "€42", 
    priceNumber: 42,
    category: "Cosmeteria", 
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Rosa", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  }
];

export const categories = [
  "Todos",
  "Bolsos grandes", 
  "Bolsos pequeños",
  "Canguros",
  "Billeteras", 
  "Complementos",
  "Carpetas",
  "Pasaporte/Guarda",
  "Cosmeteria"
];

export const colors = [
  "Todos",
  "Negro",
  "Cafe", 
  "Marrón",
  "Cognac",
  "Beige",
  "Rosa"
];