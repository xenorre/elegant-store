// Sample storefront content. Replace with database-backed queries once the
// catalog schema exists.

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  imageAlt: string;
};

export type Product = {
  slug: string;
  name: string;
  detail: string;
  price: number;
  image: string;
  imageAlt: string;
  badge?: string;
};

export function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
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

export const newArrivals: Product[] = [
  {
    slug: "biker-jacket-nappa",
    name: "Biker Jacket",
    detail: "Black nappa leather",
    price: 2450,
    image: unsplash("1551028719-00167b16eac5", 1000),
    imageAlt: "Black leather biker jacket laid flat on white linen",
    badge: "New",
  },
  {
    slug: "bomber-jacket-silk",
    name: "Bomber Jacket",
    detail: "Rust silk twill",
    price: 1890,
    image: unsplash("1591047139829-d91aecb6caea", 1000),
    imageAlt: "Rust bomber jacket held up on a hanger",
    badge: "New",
  },
  {
    slug: "fringed-poncho-cotton",
    name: "Fringed Poncho",
    detail: "Ivory cotton crochet",
    price: 980,
    image: unsplash("1434389677669-e08b4cac3105", 1000),
    imageAlt: "Ivory crochet poncho with fringe on a wooden hanger",
  },
  {
    slug: "cargo-trousers-satin",
    name: "Cargo Trousers",
    detail: "Blush satin",
    price: 1150,
    image: unsplash("1594633312681-425c7b97ccd1", 1000),
    imageAlt: "Model wearing blush satin cargo trousers and strappy sandals",
  },
];

export const accessories: Product[] = [
  {
    slug: "top-handle-bag-calfskin",
    name: "Top Handle Bag",
    detail: "Coral calfskin",
    price: 3200,
    image: unsplash("1584917865442-de89df76afd3", 900),
    imageAlt: "Coral leather top-handle bag on a display stand",
  },
  {
    slug: "crescent-pendant",
    name: "Crescent Pendant",
    detail: "18k gold, blue topaz",
    price: 1480,
    image: unsplash("1599643478518-a784e5dc4c8f", 900),
    imageAlt: "Layered gold necklaces with a crescent and a blue stone pendant",
  },
  {
    slug: "brogue-suede",
    name: "Wingtip Brogue",
    detail: "Sage suede",
    price: 890,
    image: unsplash("1560343090-f0409e92791a", 900),
    imageAlt: "Sage green suede wingtip brogue on a pastel plinth",
  },
  {
    slug: "knot-hoops",
    name: "Knot Hoops",
    detail: "Gold vermeil",
    price: 620,
    image: unsplash("1617038220319-276d3cfab638", 900),
    imageAlt: "Pair of chunky gold knot hoop earrings on a pale stone",
  },
  {
    slug: "round-sunglasses",
    name: "Round Sunglasses",
    detail: "Gold metal, green lenses",
    price: 450,
    image: unsplash("1511499767150-a48a237f0083", 900),
    imageAlt: "Round gold-rimmed sunglasses on a white surface",
  },
  {
    slug: "tennis-bracelet",
    name: "Tennis Bracelet",
    detail: "Rose gold, white sapphires",
    price: 2100,
    image: unsplash("1611591437281-460bfbe1220a", 900),
    imageAlt: "Rose gold bracelet set with stones on a blush background",
  },
  {
    slug: "derby-shoe-calf",
    name: "Derby Shoe",
    detail: "Chestnut polished calf",
    price: 760,
    image: unsplash("1614252235316-8c857d38b5f4", 900),
    imageAlt: "Pair of polished chestnut leather derby shoes",
  },
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
    name: "Women",
    href: "/women",
    image: unsplash("1485968579580-b6d095142e6e", 1400),
    imageAlt: "Woman in a tailored check coat carrying a studded handbag",
  },
  {
    name: "Men",
    href: "/men",
    image: unsplash("1617137968427-85924c800a22", 1400),
    imageAlt: "Man in a navy suit and brown shoes outside a glass building",
  },
];

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
