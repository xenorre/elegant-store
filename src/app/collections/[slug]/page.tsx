import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EditorialCollection } from "@/components/editorial-collection";
import { ProductListing, ProductListingSkeleton } from "@/components/product-listing";
import { collections } from "@/lib/catalog";
import { editorialCollections, getEditorialCollection } from "@/lib/editorial-collections";
import { getCategorySlugs, getCategoryWithProducts } from "@/lib/products";

// Serves two kinds of collection: editorial ones (seasonal campaigns, defined
// in src/lib/editorial-collections.ts) and product categories from the
// database. An editorial slug wins if both exist.
export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return [...editorialCollections.map((collection) => collection.slug), ...slugs].map(
    (slug) => ({ slug }),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  const editorial = getEditorialCollection(slug);
  if (editorial) {
    return {
      title: editorial.title,
      description: editorial.description,
      openGraph: { images: [editorial.heroImages[0].src] },
    };
  }

  const result = await getCategoryWithProducts(slug);
  if (!result) return {};

  return {
    title: result.category.name,
    description: `Shop ${result.category.name} from Elegant.`,
  };
}

// `params` is URL data, so everything that reads it sits behind Suspense, as on
// the product page. Known collections are still pre-rendered as complete HTML.
export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <main className="flex-1">
      <Suspense fallback={<ProductListingSkeleton />}>
        <Collection params={params} />
      </Suspense>
    </main>
  );
}

async function Collection({
  params,
}: {
  params: PageProps<"/collections/[slug]">["params"];
}) {
  const { slug } = await params;

  const editorial = getEditorialCollection(slug);
  if (editorial) return <EditorialCollection collection={editorial} />;

  const result = await getCategoryWithProducts(slug);
  if (!result) notFound();

  const { category, products } = result;
  // Homepage collection tiles carry a tagline for most categories.
  const tagline = collections.find((collection) => collection.slug === slug)?.tagline;

  return (
    <ProductListing
      eyebrow="The Collection"
      title={category.name}
      intro={tagline}
      products={products}
      emptyMessage="This collection is being restocked. Please check back soon."
    />
  );
}
