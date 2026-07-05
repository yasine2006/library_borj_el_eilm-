// Données de test pour le frontend
// À remplacer par des appels API vers PostgreSQL

export const categories = [
  { id: 1, name: "Arts & Crafts", slug: "arts-crafts", color: "bg-orange-500", icon: "🎨" },
  { id: 2, name: "Binders & Folders", slug: "binders-folders", color: "bg-green-600", icon: "📁" },
  { id: 3, name: "Calculators", slug: "calculators", color: "bg-blue-600", icon: "🧮" },
  { id: 4, name: "Classroom", slug: "classroom", color: "bg-yellow-500", icon: "🏫" },
  { id: 5, name: "Creative Play", slug: "creative-play", color: "bg-red-500", icon: "🧸" },
  { id: 6, name: "Livres", slug: "livres", color: "bg-purple-600", icon: "📖" },
  { id: 7, name: "Cahiers", slug: "cahiers", color: "bg-pink-500", icon: "📓" },
  { id: 8, name: "Stylos", slug: "stylos", color: "bg-teal-500", icon: "✏️" },
];

export const banners = [
  {
    id: 1,
    title: "Find the best educational products for kids",
    subtitle: "Discover our wide range of school supplies, books, and educational materials for every student in Morocco.",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200",
    cta: "Shop Now",
    color: "from-blue-900/80"
  },
  {
    id: 2,
    title: "Back to School Collection 2026",
    subtitle: "Get ready for the new school year with our premium collection of supplies and accessories.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
    cta: "Explore",
    color: "from-red-900/80"
  },
  {
    id: 3,
    title: "Wholesale Prices for Professionals",
    subtitle: "Special discounts for bulk orders. Register as a wholesale client today!",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200",
    cta: "Learn More",
    color: "from-green-900/80"
  }
];

export const promoBanners = [
  {
    id: 1,
    title: "Meeting all your educational needs",
    subtitle: "Get up to 25% off educational supplies",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    bgColor: "bg-amber-800",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Super Sale",
    subtitle: "Limited time offer - Up to 40% off",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    bgColor: "bg-slate-700",
    textColor: "text-white"
  }
];

export const categoryShowcase = [
  {
    id: 1,
    title: "Classroom & Office",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    color: "bg-yellow-600",
    count: 245
  },
  {
    id: 2,
    title: "Children's Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    color: "bg-blue-800",
    count: 189
  },
  {
    id: 3,
    title: "Language Arts",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    color: "bg-red-600",
    count: 156
  }
];

export const products = [
  {
    id: 1,
    name: "Premium Ballpoint Pens Set",
    description: "Set of 12 high-quality ballpoint pens with smooth ink flow and comfortable grip.",
    price: 14.99,
    wholesalePrice: 9.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Stylos",
    brand: "Parker",
    stock: 50,
    minStock: 10,
    barcode: "1234567890123",
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: "Heavy Duty Stapler",
    description: "Professional stapler capable of stapling up to 50 sheets at once.",
    price: 16.99,
    wholesalePrice: 11.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Fournitures",
    brand: "Swingline",
    stock: 30,
    minStock: 5,
    barcode: "1234567890124",
    rating: 4.6,
    reviews: 89
  },
  {
    id: 3,
    name: "Highlighter Markers Pack",
    description: "Pack of 8 fluorescent highlighters in assorted colors.",
    price: 8.99,
    wholesalePrice: 5.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Stylos",
    brand: "Sharpie",
    stock: 100,
    minStock: 20,
    barcode: "1234567890125",
    rating: 4.7,
    reviews: 256
  },
  {
    id: 4,
    name: "Desktop Hole Punch",
    description: "3-hole punch for standard binders, adjustable for different paper sizes.",
    price: 12.99,
    wholesalePrice: 8.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Fournitures",
    brand: "Bostitch",
    stock: 15,
    minStock: 5,
    barcode: "1234567890126",
    rating: 4.5,
    reviews: 67
  },
  {
    id: 5,
    name: "Mechanical Pencils Set",
    description: "Set of 5 mechanical pencils with 0.5mm lead and eraser refills.",
    price: 9.99,
    wholesalePrice: 6.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Stylos",
    brand: "Pentel",
    stock: 0,
    minStock: 10,
    barcode: "1234567890127",
    rating: 4.9,
    reviews: 312
  },
  {
    id: 6,
    name: "Tablet Stand Adjustable",
    description: "Adjustable aluminum tablet stand compatible with all tablet sizes.",
    price: 24.99,
    wholesalePrice: 16.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Accessoires",
    brand: "Lamicall",
    stock: 25,
    minStock: 5,
    barcode: "1234567890128",
    rating: 4.4,
    reviews: 178
  },
  {
    id: 7,
    name: "Notebook Premium A4",
    description: "Hardcover A4 notebook with 200 pages of premium quality paper.",
    price: 7.99,
    wholesalePrice: 4.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Cahiers",
    brand: "Moleskine",
    stock: 80,
    minStock: 15,
    barcode: "1234567890129",
    rating: 4.8,
    reviews: 445
  },
  {
    id: 8,
    name: "Color Gel Pens Pack",
    description: "Pack of 20 gel pens in vibrant colors for art and writing.",
    price: 11.99,
    wholesalePrice: 7.99,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Stylos",
    brand: "Sakura",
    stock: 60,
    minStock: 12,
    barcode: "1234567890130",
    rating: 4.7,
    reviews: 203
  }
];

export const suppliers = [
  { id: 1, name: "Papeterie du Maroc", phone: "+212 522-123456", email: "contact@papeterie.ma", city: "Casablanca", address: "123 Blvd Mohammed V" },
  { id: 2, name: "Librairie Centrale", phone: "+212 522-789012", email: "info@librairie-centrale.ma", city: "Rabat", address: "45 Ave Hassan II" },
  { id: 3, name: "Fournitures Pro", phone: "+212 522-345678", email: "pro@fournitures.ma", city: "Marrakech", address: "78 Rue de la Liberté" }
];

export const footerLinks = {
  information: [
    { label: "About Us", href: "#" },
    { label: "Customer Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Sitemap", href: "#" },
    { label: "Contact Us", href: "#" }
  ],
  whyBuy: [
    { label: "Shipping & Returns", href: "#" },
    { label: "Secure Shopping", href: "#" },
    { label: "International Shipping", href: "#" },
    { label: "Affiliates", href: "#" },
    { label: "Group Sales", href: "#" }
  ],
  myAccount: [
    { label: "Sign In", href: "#" },
    { label: "View Cart", href: "#" },
    { label: "My Wishlist", href: "#" },
    { label: "Order History", href: "#" },
    { label: "Help", href: "#" }
  ]
};

// Helper functions
export const getStockStatus = (stock, minStock) => {
  if (stock === 0) return { 
    label: 'Rupture de stock', 
    color: 'text-red-600', 
    bg: 'bg-red-100',
    badge: 'bg-red-500'
  };
  if (stock <= minStock) return { 
    label: 'Stock faible', 
    color: 'text-orange-600', 
    bg: 'bg-orange-100',
    badge: 'bg-orange-500'
  };
  return { 
    label: 'En stock', 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    badge: 'bg-green-500'
  };
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(price * 10);
};
