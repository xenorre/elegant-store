// Initial catalogue content, written to the database by `pnpm db:seed`.

import { detailShot, unsplash, type SeedProduct } from "../lib/catalog";

export const seedCategories = [
  { slug: "ready-to-wear", name: "Ready-to-Wear" },
  { slug: "leather-goods", name: "Leather Goods" },
  { slug: "jewellery", name: "Fine Jewellery" },
  { slug: "footwear", name: "Footwear" },
  { slug: "accessories", name: "Accessories" },
];

export const seedProducts: SeedProduct[] = [
  {
    slug: "biker-jacket-nappa",
    name: "Biker Jacket",
    detail: "Black nappa leather",
    price: 2450,
    category: "ready-to-wear",
    department: "women",
    image: unsplash("1551028719-00167b16eac5"),
    imageAlt: "Black leather biker jacket laid flat on white linen",
    gallery: [
      {
        src: detailShot("1551028719-00167b16eac5", 0.6, 0.7, 2.5),
        alt: "Close-up of the asymmetric zip and lapel of the biker jacket",
      },
    ],
    badge: "New",
    description:
      "Our signature biker, cut from supple lamb nappa with a softly structured shoulder. Asymmetric zip fastening, notched lapels and zipped cuffs give it an easy, lived-in attitude from the first wear.",
    details: [
      "100% lamb nappa leather",
      "Lining: 100% cupro",
      "Asymmetric silver-tone zip fastening",
      "Two zipped front pockets",
      "Specialist leather clean only",
      "Made in Italy",
    ],
    sizes: [
      { label: "XS", stock: 0 },
      { label: "S", stock: 2 },
      { label: "M", stock: 4 },
      { label: "L", stock: 1 },
      { label: "XL", stock: 0 },
    ],
  },
  {
    slug: "bomber-jacket-silk",
    name: "Bomber Jacket",
    detail: "Rust silk twill",
    price: 1890,
    category: "ready-to-wear",
    department: "women",
    image: unsplash("1591047139829-d91aecb6caea"),
    imageAlt: "Rust bomber jacket held up on a hanger",
    gallery: [
      {
        src: detailShot("1591047139829-d91aecb6caea", 0.45, 0.25, 2.2),
        alt: "Ribbed collar and centre zip of the rust bomber jacket",
      },
      {
        src: detailShot("1591047139829-d91aecb6caea", 0.35, 0.75, 2.5),
        alt: "Welt pocket and ribbed cuff of the rust bomber jacket",
      },
    ],
    badge: "New",
    description:
      "A lightweight bomber in fluid silk twill with a subtle sheen. Ribbed collar, cuffs and hem frame a relaxed body that layers over knitwear in autumn and stands alone in spring.",
    details: [
      "100% silk twill",
      "Rib: 95% wool, 5% elastane",
      "Two-way zip fastening",
      "Welt pockets",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: [
      { label: "XS", stock: 3 },
      { label: "S", stock: 5 },
      { label: "M", stock: 6 },
      { label: "L", stock: 2 },
      { label: "XL", stock: 1 },
    ],
  },
  {
    slug: "fringed-poncho-cotton",
    name: "Fringed Poncho",
    detail: "Ivory cotton crochet",
    price: 980,
    category: "ready-to-wear",
    department: "women",
    image: unsplash("1434389677669-e08b4cac3105"),
    imageAlt: "Ivory crochet poncho with fringe on a wooden hanger",
    gallery: [
      {
        src: detailShot("1434389677669-e08b4cac3105", 0.5, 0.35, 2),
        alt: "V-neckline and open crochet stitch of the ivory poncho",
      },
      {
        src: detailShot("1434389677669-e08b4cac3105", 0.5, 0.85, 2.5),
        alt: "Hand-knotted fringe along the hem of the ivory poncho",
      },
    ],
    description:
      "Hand-crocheted in an open stitch from organic cotton, finished with a hand-knotted fringe. A light layer for warm evenings, worn over a slip dress or simple knit.",
    details: [
      "100% organic cotton",
      "Hand-crocheted, hand-knotted fringe",
      "One size",
      "Hand wash cold, dry flat",
      "Made in Portugal",
    ],
    stock: 2,
  },
  {
    slug: "cargo-trousers-satin",
    name: "Cargo Trousers",
    detail: "Blush satin",
    price: 1150,
    category: "ready-to-wear",
    department: "women",
    image: unsplash("1594633312681-425c7b97ccd1"),
    imageAlt: "Model wearing blush satin cargo trousers and strappy sandals",
    gallery: [
      {
        src: detailShot("1594633312681-425c7b97ccd1", 0.4, 0.3, 2.2),
        alt: "Patch pocket and pleated waist of the blush satin trousers",
      },
      {
        src: detailShot("1594633312681-425c7b97ccd1", 0.55, 0.9, 2.5),
        alt: "Elasticated ankle cuff of the blush satin trousers",
      },
    ],
    description:
      "Utility, reconsidered. A relaxed cargo silhouette in heavy satin, with patch pockets, a softly pleated waist and gathered ankle cuffs that fall neatly over a heel or flat.",
    details: [
      "100% viscose satin",
      "Elasticated waist and cuffs",
      "Two front patch pockets",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: [
      { label: "34", stock: 0 },
      { label: "36", stock: 0 },
      { label: "38", stock: 1 },
      { label: "40", stock: 0 },
      { label: "42", stock: 0 },
    ],
  },
  {
    slug: "top-handle-bag-calfskin",
    name: "Top Handle Bag",
    detail: "Coral calfskin",
    price: 3200,
    category: "leather-goods",
    department: "women",
    image: unsplash("1584917865442-de89df76afd3"),
    imageAlt: "Coral leather top-handle bag on a display stand",
    gallery: [
      {
        src: detailShot("1584917865442-de89df76afd3", 0.5, 0.22, 2.5),
        alt: "Rolled top handle of the coral calfskin bag",
      },
      {
        src: detailShot("1584917865442-de89df76afd3", 0.75, 0.75, 2.2),
        alt: "Side gusset and base of the coral calfskin bag",
      },
    ],
    description:
      "A structured top-handle bag in polished calfskin, cut and assembled by a single artisan. The rolled handle and turn-lock closure are finished by hand, and a detachable strap lets it be worn across the body.",
    details: [
      "100% calfskin, lambskin lining",
      "Palladium-finish turn-lock closure",
      "Detachable, adjustable shoulder strap",
      "Interior slip pocket",
      "W 25 × H 19 × D 11 cm",
      "Made in Italy",
    ],
    stock: 4,
  },
  {
    slug: "crescent-pendant",
    name: "Crescent Pendant",
    detail: "18k gold, blue topaz",
    price: 1480,
    category: "jewellery",
    department: "women",
    image: unsplash("1599643478518-a784e5dc4c8f"),
    imageAlt: "Layered gold necklaces with a crescent and a blue stone pendant",
    gallery: [
      {
        src: detailShot("1599643478518-a784e5dc4c8f", 0.5, 0.8, 2),
        alt: "Crescent pendant set with small stones",
      },
      {
        src: detailShot("1599643478518-a784e5dc4c8f", 0.55, 0.15, 2.5),
        alt: "Faceted blue topaz pendant on a fine gold chain",
      },
    ],
    description:
      "Two pendants, worn layered: a pavé crescent and a faceted blue topaz, each suspended from a fine 18k gold chain. Sold as a set.",
    details: [
      "18k yellow gold",
      "Blue topaz, approx. 2.1 ct",
      "Chain lengths: 42 cm and 50 cm",
      "Lobster clasp",
      "Presented in a signature box",
    ],
    stock: 2,
  },
  {
    slug: "brogue-suede",
    name: "Wingtip Brogue",
    detail: "Sage suede",
    price: 890,
    category: "footwear",
    department: "women",
    image: unsplash("1560343090-f0409e92791a"),
    imageAlt: "Sage green suede wingtip brogue on a pastel plinth",
    gallery: [
      {
        src: detailShot("1560343090-f0409e92791a", 0.65, 0.6, 2.2),
        alt: "Perforated wingtip toe of the sage suede brogue",
      },
      {
        src: detailShot("1560343090-f0409e92791a", 0.25, 0.75, 2),
        alt: "Stacked leather heel of the sage suede brogue",
      },
    ],
    description:
      "A classic wingtip, softened in brushed sage suede. Goodyear-welted on a leather sole, with a stacked heel and hand-punched broguing.",
    details: [
      "Upper: 100% calf suede",
      "Leather sole, Goodyear welted",
      "Stacked leather heel, 2.5 cm",
      "Fits true to size",
      "Made in Spain",
    ],
    sizes: [
      { label: "40", stock: 1 },
      { label: "41", stock: 3 },
      { label: "42", stock: 4 },
      { label: "43", stock: 2 },
      { label: "44", stock: 0 },
      { label: "45", stock: 1 },
    ],
  },
  {
    slug: "knot-hoops",
    name: "Knot Hoops",
    detail: "Gold vermeil",
    price: 620,
    category: "jewellery",
    department: "women",
    image: unsplash("1617038220319-276d3cfab638"),
    imageAlt: "Pair of chunky gold knot hoop earrings on a pale stone",
    gallery: [
      {
        src: detailShot("1617038220319-276d3cfab638", 0.45, 0.62, 2.2),
        alt: "Twisted gold knot hoop earrings resting on a stone",
      },
      {
        src: detailShot("1617038220319-276d3cfab638", 0.35, 0.55, 3),
        alt: "Close-up of the twisted texture of a knot hoop earring",
      },
    ],
    description:
      "Sculptural hoops in a twisted knot, cast in recycled sterling silver and plated in a thick layer of 18k gold. Weighty enough to feel substantial, light enough for every day.",
    details: [
      "18k gold vermeil on recycled sterling silver",
      "Diameter: 2.2 cm",
      "Hinged snap closure",
      "Sold as a pair",
    ],
    stock: 12,
  },
  {
    slug: "round-sunglasses",
    name: "Round Sunglasses",
    detail: "Gold metal, green lenses",
    price: 450,
    category: "accessories",
    department: "unisex",
    image: unsplash("1511499767150-a48a237f0083"),
    imageAlt: "Round gold-rimmed sunglasses on a white surface",
    gallery: [
      {
        src: detailShot("1511499767150-a48a237f0083", 0.4, 0.5, 2),
        alt: "Green lenses and thin gold rims of the round sunglasses",
      },
      {
        src: detailShot("1511499767150-a48a237f0083", 0.75, 0.45, 2.5),
        alt: "Hinge and slender temple of the round sunglasses",
      },
    ],
    description:
      "A slender round frame in lightweight gold-finish metal with bottle-green mineral lenses. Adjustable nose pads and a fine temple keep it comfortable all day.",
    details: [
      "Gold-finish titanium frame",
      "Green mineral glass lenses, 100% UV protection",
      "Adjustable nose pads",
      "Lens width 48 mm, bridge 21 mm",
      "Includes leather case",
      "Made in Japan",
    ],
    stock: 8,
  },
  {
    slug: "tennis-bracelet",
    name: "Tennis Bracelet",
    detail: "Rose gold, white sapphires",
    price: 2100,
    category: "jewellery",
    department: "women",
    image: unsplash("1611591437281-460bfbe1220a"),
    imageAlt: "Rose gold bracelet set with stones on a blush background",
    gallery: [
      {
        src: detailShot("1611591437281-460bfbe1220a", 0.5, 0.62, 2),
        alt: "Interlaced links of the rose gold bracelet set with white sapphires",
      },
      {
        src: detailShot("1611591437281-460bfbe1220a", 0.35, 0.5, 3),
        alt: "Close-up of pavé white sapphires on the rose gold bracelet",
      },
    ],
    description:
      "Interlaced rose gold links, each pavé-set by hand with white sapphires. A soft, fluid line of light around the wrist.",
    details: [
      "18k rose gold",
      "White sapphires, approx. 3.4 ct total",
      "Length: 17.5 cm",
      "Box clasp with safety catch",
      "Presented in a signature box",
    ],
    stock: 0,
  },
  {
    slug: "derby-shoe-calf",
    name: "Derby Shoe",
    detail: "Chestnut polished calf",
    price: 760,
    category: "footwear",
    department: "men",
    image: unsplash("1614252235316-8c857d38b5f4"),
    imageAlt: "Pair of polished chestnut leather derby shoes",
    gallery: [
      {
        src: detailShot("1614252235316-8c857d38b5f4", 0.4, 0.4, 1.6),
        alt: "Waxed laces and textured vamp of the chestnut derby",
      },
      {
        src: detailShot("1614252235316-8c857d38b5f4", 0.75, 0.5, 2.5),
        alt: "Hand-burnished toe of the chestnut derby",
      },
    ],
    description:
      "An open-laced derby in calf leather, hand-burnished to a deep chestnut patina. Blake-stitched for a close, flexible fit from the first wear.",
    details: [
      "Upper: 100% calf leather",
      "Leather sole, Blake stitched",
      "Waxed cotton laces",
      "Fits true to size",
      "Made in Italy",
    ],
    sizes: [
      { label: "40", stock: 2 },
      { label: "41", stock: 0 },
      { label: "42", stock: 3 },
      { label: "43", stock: 1 },
      { label: "44", stock: 0 },
    ],
  },
];
