import Image from "next/image";
import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { SectionHeading } from "@/components/section-heading";
import {
  accessorySlugs,
  atelier,
  collections,
  departments,
  editorial,
  hero,
  newArrivalSlugs,
  services,
} from "@/lib/catalog";
import { getProductsBySlugs } from "@/lib/products";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Intro />
      <FeaturedCollections />
      <NewArrivals />
      <EditorialFeature />
      <Accessories />
      <AtelierBanner />
      <Departments />
      <Services />
      <Newsletter />
    </main>
  );
}

function Hero() {
  const [primary, secondary] = hero.images;

  return (
    <section className="relative h-[calc(100svh-var(--header-h))] min-h-[32rem] max-h-[64rem] overflow-hidden bg-surface text-paper">
      <div className="absolute inset-0 grid md:grid-cols-2 md:gap-1">
        <div className="relative">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            preload
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
        <div className="relative max-md:hidden">
          <Image
            src={secondary.src}
            alt={secondary.alt}
            fill
            preload
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-ink/10 to-transparent" />

      <div className="relative flex h-full flex-col items-center justify-end gap-5 px-gutter pb-14 text-center lg:pb-20">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 className="text-display">{hero.title}</h1>
        <Link href={hero.href} className="btn btn-inverse mt-3">
          {hero.cta}
        </Link>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="section container-reading text-center">
      <p className="font-display text-heading text-muted italic">
        A wardrobe built on restraint: considered silhouettes, exceptional
        materials and the patience of the hand. This season, we return to
        the essentials and make them last.
      </p>
    </section>
  );
}

function FeaturedCollections() {
  return (
    <section className="container-wide pb-section">
      <SectionHeading
        eyebrow="Featured Collections"
        title="Explore the House"
        href="/collections"
        cta="View all collections"
      />
      <ul className="grid grid-cols-2 gap-x-1 gap-y-8 lg:grid-cols-4">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link href={`/collections/${collection.slug}`} className="group block">
              <div className="media media-zoom aspect-portrait">
                <Image
                  src={collection.image}
                  alt={collection.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
              <div className="mt-4 flex flex-col gap-1 px-1">
                <h3 className="text-title group-hover:underline group-hover:underline-offset-4">
                  {collection.name}
                </h3>
                <p className="text-body-sm text-muted">{collection.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function NewArrivals() {
  const newArrivals = await getProductsBySlugs(newArrivalSlugs);

  return (
    <section className="container-wide pb-section">
      <SectionHeading
        eyebrow="Just In"
        title="New Arrivals"
        href="/new-in"
        cta="Shop new arrivals"
      />
      <ul className="grid grid-cols-2 gap-x-1 gap-y-10 lg:grid-cols-4">
        {newArrivals.map((product) => (
          <li key={product.slug}>
            <ProductCard
              product={product}
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function EditorialFeature() {
  return (
    <section className="split bg-surface">
      <div className="media aspect-portrait md:aspect-auto md:min-h-[44rem]">
        <Image
          src={editorial.image}
          alt={editorial.imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-[50%_20%]"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-6 px-gutter py-16 md:px-[max(var(--gutter),8%)]">
        <p className="eyebrow text-muted">{editorial.eyebrow}</p>
        <h2 className="max-w-md text-display">{editorial.title}</h2>
        <p className="max-w-sm text-body-lg text-muted">{editorial.body}</p>
        <Link href={editorial.href} className="btn btn-secondary mt-2">
          {editorial.cta}
        </Link>
      </div>
    </section>
  );
}

async function Accessories() {
  const accessories = await getProductsBySlugs(accessorySlugs);

  return (
    <section className="section">
      <div className="container-wide">
        <SectionHeading
          eyebrow="The Gift Edit"
          title="Leather Goods & Jewellery"
          href="/collections/accessories"
          cta="Shop accessories"
        />
      </div>
      <ProductRail label="Leather goods and jewellery">
        {accessories.map((product) => (
          <li key={product.slug} className="w-[72%] sm:w-[44%] md:w-[31%] xl:w-[23%]">
            <ProductCard
              product={product}
              sizes="(min-width: 1280px) 23vw, (min-width: 768px) 31vw, (min-width: 640px) 44vw, 72vw"
            />
          </li>
        ))}
      </ProductRail>
    </section>
  );
}

function AtelierBanner() {
  return (
    <section className="relative flex h-[80svh] min-h-[28rem] max-h-[52rem] items-center justify-center overflow-hidden text-paper">
      <Image
        src={atelier.image}
        alt={atelier.imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-overlay" />
      <div className="relative flex max-w-xl flex-col items-center gap-5 px-gutter text-center">
        <p className="eyebrow">{atelier.eyebrow}</p>
        <h2 className="text-display">{atelier.title}</h2>
        <p className="text-body-lg">{atelier.body}</p>
        <Link href={atelier.href} className="btn btn-inverse mt-3">
          {atelier.cta}
        </Link>
      </div>
    </section>
  );
}

function Departments() {
  return (
    <section className="section container-wide">
      <ul className="split">
        {departments.map((department) => (
          <li key={department.name}>
            <Link
              href={department.href}
              className="group media media-zoom relative block aspect-portrait text-paper"
            >
              <Image
                src={department.image}
                alt={department.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/50 to-transparent to-50%" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 pb-10 text-center">
                <h2 className="text-heading">{department.name}</h2>
                <span className="eyebrow link-reveal group-hover:bg-size-[100%_1px]">
                  Shop now
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Services() {
  return (
    <section className="container-wide">
      <ul className="grid gap-8 border-y border-line py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {services.map((service) => (
          <li key={service.title} className="flex flex-col gap-2 text-center">
            <h3 className="eyebrow">{service.title}</h3>
            <p className="text-body-sm text-muted">{service.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="section">
      <div className="mx-auto flex max-w-form flex-col gap-6 px-gutter text-center">
        <p className="eyebrow text-muted">Newsletter</p>
        <h2 className="text-heading">Letters from the House</h2>
        <p className="text-body text-muted">
          Collection previews, private events and stories from our ateliers,
          a few times each season.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
