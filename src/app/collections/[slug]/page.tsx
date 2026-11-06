import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductListing, ProductListingSkeleton } from "@/components/product-listing";
import { collections } from "@/lib/catalog";
import { getCategorySlugs, getCategoryWithProducts } from "@/lib/products";

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryWithProducts(slug);
  if (!result) return {};

  return {
    title: result.category.name,
    description: `Shop ${result.category.name} from Elegant.`,
  };
}

// `params` is URL data, so everything that reads it sits behind Suspense, as on
// the product page. Known categories are still pre-rendered as complete HTML.
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
