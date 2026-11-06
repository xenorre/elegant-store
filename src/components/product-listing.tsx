import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";

type ProductListingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Breadcrumb trail between Home and the current page. */
  crumbs?: { name: string; href: string }[];
  products: Product[];
  emptyMessage: string;
};

// Listing page body: breadcrumb, centred editorial header, piece count and
// the product grid. Shared by New Arrivals and the category collections.
export function ProductListing({
  eyebrow,
  title,
  intro,
  crumbs = [],
  products,
  emptyMessage,
}: ProductListingProps) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="container-wide py-5">
        <ol className="flex flex-wrap items-center gap-2 text-micro text-muted uppercase">
          {[{ name: "Home", href: "/" }, ...crumbs].map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <Link href={crumb.href} className="link-muted">
                {crumb.name}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
          ))}
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <header className="container-reading flex flex-col items-center gap-4 pt-8 pb-12 text-center lg:pt-12 lg:pb-16">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="text-display">{title}</h1>
        {intro && (
          <p className="font-display text-title text-muted italic">{intro}</p>
        )}
      </header>

      <section aria-labelledby="listing-count" className="container-wide pb-section">
        <p
          id="listing-count"
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
            <p className="text-body-lg text-muted">{emptyMessage}</p>
            <Link href="/" className="btn btn-secondary">
              Back to the house
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

// Mirrors the listing layout with neutral blocks so the page doesn't shift
// when the content streams in.
export function ProductListingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="animate-pulse">
      <div className="container-wide py-5">
        <div className="h-4 w-48 bg-surface" />
      </div>
      <div className="container-reading flex flex-col items-center gap-4 pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="h-4 w-24 bg-surface" />
        <div className="h-14 w-2/3 bg-surface" />
        <div className="h-6 w-1/2 bg-surface" />
      </div>
      <div className="container-wide pb-section">
        <div className="mb-6 border-b border-line pb-4">
          <div className="h-4 w-20 bg-surface" />
        </div>
        <div className="product-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="media" />
          ))}
        </div>
      </div>
    </div>
  );
}
