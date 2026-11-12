// Seasonal and editorial collections served at /collections/[slug] by the
// template in src/components/editorial-collection.tsx. To launch a new one,
// add an entry here and link to `/collections/<slug>`. Products are resolved
// from the database by slug, in the order given; unknown slugs are skipped.
// A slug here takes precedence over a category with the same slug.

import { hero, unsplash, type ProductImage } from "@/lib/catalog";

export type EditorialImage = ProductImage & {
  /** CSS object-position for the crop, e.g. "50% 20%". Defaults to centre. */
  position?: string;
};

export type EditorialChapter = {
  eyebrow: string;
  title: string;
  body: string;
  image: EditorialImage;
};

export type EditorialCollection = {
  slug: string;
  /** Small label above the title, usually the season. */
  eyebrow: string;
  title: string;
  /** One line under the hero title. */
  tagline: string;
  /** Meta description for search and sharing. */
  description: string;
  /** One full-width image, or two side by side from tablet up. */
  heroImages: [EditorialImage] | [EditorialImage, EditorialImage];
  /** Centred italic statement that opens the story. */
  statement: string;
  /** Alternating image and text sections. */
  chapters: EditorialChapter[];
  productSlugs: string[];
};

export const editorialCollections: EditorialCollection[] = [
  {
    slug: "autumn-winter-2026",
    eyebrow: hero.eyebrow,
    title: hero.title,
    tagline: "Soft tailoring, honest materials and the patience of the hand.",
    description:
      "The Quiet Season: Elegant's Autumn–Winter 2026 collection of soft tailoring, leather and knitwear.",
    heroImages: [
      { ...hero.images[0], position: "50% 30%" },
      hero.images[1],
    ],
    statement:
      "A season for staying in and going out slowly. We cut fewer pieces and spent longer on each: coats that soften with wear, leather that keeps its shape, knits you reach for without thinking.",
    chapters: [
      {
        eyebrow: "Chapter I",
        title: "Outerwear, softened",
        body: "Shoulders relaxed, collars turned up against the cold. Our coats are cut from double-faced wool and lined in cupro, so they move with you from the first wear.",
        image: {
          src: unsplash("1483985988355-763728e1935b", 1600),
          alt: "Woman in a burgundy wool coat and sunglasses carrying shopping bags",
          position: "50% 25%",
        },
      },
      {
        eyebrow: "Chapter II",
        title: "The texture of warmth",
        body: "Cable, rib and brushed mohair in undyed neutrals. Each knit is finished by hand in our Florence atelier, the seams linked stitch by stitch.",
        image: {
          src: unsplash("1558769132-cb1aea458c5e", 1600),
          alt: "Cream and camel knitwear hanging on a wooden rail beside dried pampas grass",
        },
      },
      {
        eyebrow: "Chapter III",
        title: "Leather, lived in",
        body: "Nappa and calfskin chosen to age, not to stay new. A biker that breaks in like a favourite jacket, and shoes made to be resoled for years.",
        image: {
          src: unsplash("1520975954732-35dd22299614", 1600),
          alt: "Man in a black leather biker jacket crouching on a rooftop ledge",
          position: "50% 35%",
        },
      },
    ],
    productSlugs: [
      "biker-jacket-nappa",
      "bomber-jacket-silk",
      "fringed-poncho-cotton",
      "cargo-trousers-satin",
      "top-handle-bag-calfskin",
      "brogue-suede",
      "derby-shoe-calf",
      "crescent-pendant",
    ],
  },
];

export function getEditorialCollection(slug: string) {
  return editorialCollections.find((collection) => collection.slug === slug);
}
