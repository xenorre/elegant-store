import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PlusIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductRail } from "@/components/product-rail";
import { SectionHeading } from "@/components/section-heading";
import { formatPrice, getProductStock, services, type Product } from "@/lib/catalog";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/products";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [{ url: product.image, alt: product.imageAlt }] },
  };
}

// `params` is URL data, so everything that reads it sits behind Suspense. The
// skeleton is the static shell shown instantly on client navigations; the
// pre-rendered products still ship as complete HTML on a direct visit.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <main className="flex-1">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetail({
  params,
}: {
  params: PageProps<"/products/[slug]">["params"];
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.category.name;
  const categoryHref = `/collections/${product.category.slug}`;
  const relatedProducts = await getRelatedProducts(product);
  const stock = getProductStock(product);
  const images = [{ src: product.image, alt: product.imageAlt }, ...product.gallery];

  return (
    <>
      <ProductJsonLd product={product} stock={stock} />

      <nav aria-label="Breadcrumb" className="container-wide py-5">
        <ol className="flex flex-wrap items-center gap-2 text-micro text-muted uppercase">
          <li>
            <Link href="/" className="link-muted">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={categoryHref} className="link-muted">
              {category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="container-wide grid gap-y-10 pb-section lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-12 xl:gap-x-20">
        <ProductGallery images={images} />

        <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start lg:py-6">
          <div className="flex flex-col gap-3">
            <Link href={categoryHref} className="eyebrow link-reveal self-start text-muted">
              {category}
            </Link>
            <h1 className="text-heading">{product.name}</h1>
            <p className="text-body text-muted">{product.detail}</p>
            <p className="mt-2 text-title">{formatPrice(product.price)}</p>
          </div>

          <ProductPurchase sizes={product.sizes} stock={stock} />

          <div className="flex flex-col">
            <ProductSection title="Description" defaultOpen>
              <p className="text-body-lg text-muted">{product.description}</p>
            </ProductSection>
            <ProductSection title="Details & care">
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-body text-muted">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </ProductSection>
            <ProductSection title="Delivery & returns">
              <ul className="flex flex-col gap-4">
                {services.slice(0, 3).map((service) => (
                  <li key={service.title} className="flex flex-col gap-1">
                    <span className="text-body">{service.title}</span>
                    <span className="text-body-sm text-muted">{service.body}</span>
                  </li>
                ))}
              </ul>
            </ProductSection>
          </div>
        </div>
      </div>

      <section className="pb-section">
        <div className="container-wide">
          <SectionHeading
            eyebrow="You may also like"
            title="Complete the look"
            href={categoryHref}
            cta={`Shop ${category}`}
          />
        </div>
        <ProductRail label="Related products">
          {relatedProducts.map((related) => (
            <li key={related.slug} className="w-[72%] sm:w-[44%] md:w-[31%] xl:w-[23%]">
              <ProductCard
                product={related}
                sizes="(min-width: 1280px) 23vw, (min-width: 768px) 31vw, (min-width: 640px) 44vw, 72vw"
              />
            </li>
          ))}
        </ProductRail>
      </section>
    </>
  );
}

// Mirrors the product layout with neutral blocks so the page doesn't shift
// when the content streams in.
function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="animate-pulse">
      <div className="container-wide py-5">
        <div className="h-4 w-56 bg-surface" />
      </div>
      <div className="container-wide grid gap-y-10 pb-section lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-12 xl:gap-x-20">
        <div className="max-lg:-mx-gutter">
          <div className="media" />
        </div>
        <div className="flex flex-col gap-8 lg:py-6">
          <div className="flex flex-col gap-3">
            <div className="h-4 w-24 bg-surface" />
            <div className="h-10 w-3/4 bg-surface" />
            <div className="h-5 w-40 bg-surface" />
            <div className="mt-2 h-7 w-28 bg-surface" />
          </div>
          <div className="h-11 bg-surface" />
          <div className="h-14 bg-surface" />
          <div className="flex flex-col gap-4 border-t border-line pt-5">
            <div className="h-4 w-28 bg-surface" />
            <div className="h-4 bg-surface" />
            <div className="h-4 w-5/6 bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-t border-line last:border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 eyebrow [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon className="size-4 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

function ProductJsonLd({ product, stock }: { product: Product; stock: number }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image, ...product.gallery.map((image) => image.src)],
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EUR",
      availability:
        stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
