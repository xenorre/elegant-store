import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getNewArrivals } from "@/lib/products";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "The latest ready-to-wear, leather goods and fine jewellery from Elegant.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <main className="flex-1">
      <nav aria-label="Breadcrumb" className="container-wide py-5">
        <ol className="flex flex-wrap items-center gap-2 text-micro text-muted uppercase">
          <li>
            <Link href="/" className="link-muted">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            New Arrivals
          </li>
        </ol>
      </nav>

      <header className="container-reading flex flex-col items-center gap-4 pt-8 pb-12 text-center lg:pt-12 lg:pb-16">
        <p className="eyebrow text-muted">Just In</p>
        <h1 className="text-display">New Arrivals</h1>
        <p className="font-display text-title text-muted italic">
          The latest pieces from our ateliers, as they arrive.
        </p>
      </header>

      <section aria-labelledby="new-arrivals-count" className="container-wide pb-section">
        <p
          id="new-arrivals-count"
          className="mb-6 border-b border-line pb-4 text-micro text-muted uppercase"
        >
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>

        {products.length > 0 ? (
          <ul className="product-grid">
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard
                  product={product}
                  sizes="(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <p className="text-body-lg text-muted">
              New pieces are on their way. Please check back soon.
            </p>
            <Link href="/" className="btn btn-secondary">
              Back to the house
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
