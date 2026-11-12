import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/product-listing";
import { SectionHeading } from "@/components/section-heading";
import type { EditorialCollection as Collection } from "@/lib/editorial-collections";
import { getProductsBySlugs } from "@/lib/products";

// Template for seasonal and editorial collections: hero, opening statement,
// alternating chapters, then the shoppable pieces. Content comes from
// src/lib/editorial-collections.ts.
export async function EditorialCollection({ collection }: { collection: Collection }) {
  const products = await getProductsBySlugs(collection.productSlugs);

  return (
    <>
      <CollectionHero collection={collection} />

      <section className="section container-reading text-center">
        <p className="font-display text-heading text-muted italic">{collection.statement}</p>
      </section>

      {collection.chapters.length > 0 && (
        <div className="flex flex-col gap-1">
          {collection.chapters.map((chapter, index) => (
            <section key={chapter.title} className="split bg-surface">
              {/* Images alternate sides from tablet up; on mobile they always lead. */}
              <div
                className={`media aspect-portrait md:aspect-auto md:min-h-[44rem] ${index % 2 === 1 ? "md:order-last" : ""}`}
              >
                <Image
                  src={chapter.image.src}
                  alt={chapter.image.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  style={{ objectPosition: chapter.image.position }}
                />
              </div>
              <div className="flex flex-col items-start justify-center gap-6 px-gutter py-16 md:px-[max(var(--gutter),8%)]">
                <p className="eyebrow text-muted">{chapter.eyebrow}</p>
                <h2 className="max-w-md text-display">{chapter.title}</h2>
                <p className="max-w-sm text-body-lg text-muted">{chapter.body}</p>
              </div>
            </section>
          ))}
        </div>
      )}

      <section id="shop" aria-labelledby="listing-count" className="section container-wide">
        <SectionHeading eyebrow="Shop the collection" title={collection.title} />
        <ProductGrid
          products={products}
          emptyMessage="The collection arrives soon. Please check back."
        />
      </section>
    </>
  );
}

function CollectionHero({ collection }: { collection: Collection }) {
  const [primary, secondary] = collection.heroImages;

  return (
    <section className="relative h-[calc(100svh-var(--header-h))] min-h-[32rem] max-h-[64rem] overflow-hidden bg-surface text-paper">
      <div className={`absolute inset-0 grid ${secondary ? "md:grid-cols-2 md:gap-1" : ""}`}>
        <div className="relative">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            preload
            sizes={secondary ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
            className="object-cover"
            style={{ objectPosition: primary.position }}
          />
        </div>
        {secondary && (
          <div className="relative max-md:hidden">
            <Image
              src={secondary.src}
              alt={secondary.alt}
              fill
              preload
              sizes="50vw"
              className="object-cover"
              style={{ objectPosition: secondary.position }}
            />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/20 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-xl flex-col items-center justify-end gap-5 px-gutter pb-14 text-center lg:pb-20">
        <p className="eyebrow">{collection.eyebrow}</p>
        <h1 className="text-display">{collection.title}</h1>
        <p className="text-body-lg">{collection.tagline}</p>
        <Link href="#shop" className="btn btn-inverse mt-3">
          Shop the collection
        </Link>
      </div>
    </section>
  );
}
