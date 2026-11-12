// Shared catalogue types and helpers, plus static marketing content. Products,
// categories and stock live in the database; see `src/lib/products.ts`.

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  imageAlt: string;
};

export type Category = {
  slug: string;
  name: string;
};

/** Unisex pieces appear in both the women's and men's departments. */
export type Department = "women" | "men" | "unisex";

export type ProductImage = {
  src: string;
  alt: string;
};

export type SizeOption = {
  label: string;
  stock: number;
};

export type ProductInfo = {
  slug: string;
  name: string;
  detail: string;
  price: number;
  department: Department;
  description: string;
  details: string[];
  /** Primary image, used on cards and as the first gallery image. */
  image: string;
  imageAlt: string;
  /** Additional images shown on the product page after the primary one. */
  gallery: ProductImage[];
  badge?: string;
};

export type ProductStock =
  | { sizes: SizeOption[]; stock?: never }
  | { stock: number; sizes?: never };

export type Product = ProductInfo & { category: Category } & ProductStock;

/** Product as written by the seed script, referencing its category by slug. */
export type SeedProduct = ProductInfo & { category: string } & ProductStock;

export type StockState = "in-stock" | "low-stock" | "sold-out";

const LOW_STOCK_THRESHOLD = 3;

export function getStockState(quantity: number): StockState {
  if (quantity <= 0) return "sold-out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export function getProductStock(product: Product) {
  return product.sizes
    ? product.sizes.reduce((total, size) => total + size.stock, 0)
    : product.stock;
}

export function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

// Zoomed crop of an Unsplash photo around a focal point (0 to 1 on each axis),
// used for product detail shots. Always 3:4 to match the product frame.
export function detailShot(id: string, x: number, y: number, zoom: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}&w=1200&h=1600&q=80`;
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const hero = {
  eyebrow: "Autumn–Winter 2026",
  title: "The Quiet Season",
  href: "/collections/autumn-winter-2026",
  cta: "Discover the collection",
  images: [
    {
      src: unsplash("1539533018447-63fcce2678e3", 2000),
      alt: "Model in a belted camel wool coat seated on stone steps",
    },
    {
      src: unsplash("1539109136881-3be0616acf4b", 2000),
      alt: "Model in a pale blue overcoat in front of a cathedral facade",
    },
  ],
};

export const collections: Collection[] = [
  {
    slug: "ready-to-wear",
    name: "Ready-to-Wear",
    tagline: "Silhouettes for the season",
    image: unsplash("1550614000-4895a10e1bfd", 1200),
    imageAlt: "Two models in embellished red evening dresses",
  },
  {
    slug: "leather-goods",
    name: "Leather Goods",
    tagline: "Crafted by hand",
    image: unsplash("1590874103328-eac38a683ce7", 1200),
    imageAlt: "Tan leather and woven basket top-handle bag in a window",
  },
  {
    slug: "jewellery",
    name: "Fine Jewellery",
    tagline: "Heirlooms in the making",
    image: unsplash("1535632066927-ab7c9ab60908", 1200),
    imageAlt: "Pair of crystal drop earrings resting on a green leaf",
  },
  {
    slug: "footwear",
    name: "Footwear",
    tagline: "From atelier to street",
    image: unsplash("1543163521-1bf539c55dd2", 1200),
    imageAlt: "Floral print stiletto pumps on a white plinth",
  },
];

// Curated homepage rails, resolved from the database in this order.
export const newArrivalSlugs = [
  "biker-jacket-nappa",
  "bomber-jacket-silk",
  "fringed-poncho-cotton",
  "cargo-trousers-satin",
];

export const accessorySlugs = [
  "top-handle-bag-calfskin",
  "crescent-pendant",
  "brogue-suede",
  "knot-hoops",
  "round-sunglasses",
  "tennis-bracelet",
  "derby-shoe-calf",
];

export const editorial = {
  eyebrow: "The Evening Edit",
  title: "After dark, in velvet and silk",
  body: "Sculpted necklines, liquid fabrics and jewellery that catches the light. A considered wardrobe for the season's evenings, cut in our Florence atelier.",
  href: "/collections/evening",
  cta: "Shop the edit",
  image: unsplash("1566174053879-31528523f8ae", 1600),
  imageAlt: "Model in an off-the-shoulder plum gown with statement earrings",
};

export const atelier = {
  eyebrow: "The House",
  title: "Made to be kept",
  body: "Every piece begins with a sketch and ends in the hands of an artisan. Discover the craft behind the collection.",
  href: "/the-house",
  cta: "Inside the atelier",
  image: unsplash("1490481651871-ab68de25d43d", 2400),
  imageAlt: "Neutral-toned garments hanging on a minimalist white rail",
};

export const departments = [
  {
    slug: "women",
    name: "Women",
    href: "/women",
    intro: "Tailoring, leather and fine jewellery for the season ahead.",
    image: unsplash("1485968579580-b6d095142e6e", 1400),
    heroImage: unsplash("1485968579580-b6d095142e6e", 2400),
    imageAlt: "Woman in a tailored check coat carrying a studded handbag",
  },
  {
    slug: "men",
    name: "Men",
    href: "/men",
    intro: "Considered tailoring and handmade shoes, built to last.",
    image: unsplash("1617137968427-85924c800a22", 1400),
    heroImage: unsplash("1617137968427-85924c800a22", 2400),
    imageAlt: "Man in a navy suit and brown shoes outside a glass building",
  },
] satisfies {
  slug: Exclude<Department, "unisex">;
  name: string;
  href: string;
  intro: string;
  image: string;
  heroImage: string;
  imageAlt: string;
}[];

export const services = [
  {
    title: "Complimentary Delivery",
    body: "On all orders, with signature packaging.",
  },
  {
    title: "Returns & Exchanges",
    body: "Free returns within 30 days of delivery.",
  },
  {
    title: "Gift Wrapping",
    body: "Every order wrapped by hand, with a personal note.",
  },
  {
    title: "Client Advisors",
    body: "Personal styling by phone, chat or appointment.",
  },
];

export const navigation = [
  { name: "New In", href: "/new-in" },
  { name: "Women", href: "/women" },
  { name: "Men", href: "/men" },
  { name: "Bags", href: "/collections/leather-goods" },
  { name: "Jewellery", href: "/collections/jewellery" },
  { name: "The House", href: "/the-house" },
];
