import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ProductGrid } from "@/components/product-listing";
import { SectionHeading } from "@/components/section-heading";
import { departments, hero, type Category } from "@/lib/catalog";
import { getDepartmentProducts } from "@/lib/products";

type Department = (typeof departments)[number];
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type DepartmentLandingProps = {
  slug: Department["slug"];
  searchParams: SearchParams;
};

// Department landing page (/women, /men): an image hero that prerenders into
// the static shell, then category filters and the product grid, which read
// `?category=` and so stream in behind Suspense.
export function DepartmentLanding({ slug, searchParams }: DepartmentLandingProps) {
  const department = departments.find((entry) => entry.slug === slug)!;

  return (
    <main className="flex-1">
      <DepartmentHero department={department} />
      <section id="shop" aria-label={`Shop ${department.name}`} className="section container-wide">
        <Suspense fallback={<DepartmentProductsSkeleton />}>
          <DepartmentProducts department={department} searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

function DepartmentHero({ department }: { department: Department }) {
  return (
    <section className="relative h-[70svh] min-h-[28rem] max-h-[48rem] overflow-hidden bg-surface text-paper">
      <Image
        src={department.heroImage}
        alt={department.imageAlt}
        fill
        preload
        sizes="100vw"
        className="object-cover object-[50%_25%]"
      />
      {/* Darker than the homepage hero: the copy is longer and can sit over light clothing. */}
      <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/30 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-xl flex-col items-center justify-end gap-5 px-gutter pb-14 text-center lg:pb-20">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 className="text-display">{department.name}</h1>
        <p className="text-body-lg">{department.intro}</p>
        <Link href="#shop" className="btn btn-inverse mt-3">
          Shop the collection
        </Link>
      </div>
    </section>
  );
}

async function DepartmentProducts({
  department,
  searchParams,
}: {
  department: Department;
  searchParams: SearchParams;
}) {
  const [products, params] = await Promise.all([
    getDepartmentProducts(department.slug),
    searchParams,
  ]);

  // Only categories that have pieces in this department get a filter.
  const categories = [
    ...new Map(products.map((product) => [product.category.slug, product.category])).values(),
  ];
  const active = categories.find((category) => category.slug === params.category);
  const visible = active
    ? products.filter((product) => product.category.slug === active.slug)
    : products;

  return (
    <>
      <SectionHeading eyebrow={department.name} title={active?.name ?? "All pieces"} />
      <CategoryFilter href={department.href} categories={categories} active={active} />
      <ProductGrid
        products={visible}
        emptyMessage="New pieces are on their way. Please check back soon."
      />
    </>
  );
}

function CategoryFilter({
  href,
  categories,
  active,
}: {
  href: string;
  categories: Category[];
  active?: Category;
}) {
  // "All" has no slug, so it's current exactly when no category is active.
  const options = [
    { name: "All", href, slug: undefined as string | undefined },
    ...categories.map((category) => ({
      name: category.name,
      href: `${href}?category=${category.slug}`,
      slug: category.slug,
    })),
  ];

  return (
    <nav aria-label="Filter by category" className="-mx-gutter mb-8 lg:mb-10">
      {/* scroll-px keeps the snapped first chip on the gutter, not the edge. */}
      <ul className="scroll-rail gap-2 px-gutter scroll-px-gutter">
        {options.map((option) => {
          const current = option.slug === active?.slug;
          return (
            <li key={option.href}>
              <Link
                href={option.href}
                scroll={false}
                aria-current={current ? "page" : undefined}
                className={`btn btn-sm ${current ? "btn-primary" : "btn-secondary [--btn-border:var(--line)]"}`}
              >
                {option.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Mirrors the heading, filters and grid so the page doesn't shift on stream-in.
function DepartmentProductsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="animate-pulse">
      <div className="mb-10 flex flex-col gap-3 lg:mb-14">
        <div className="h-4 w-20 bg-surface" />
        <div className="h-9 w-48 bg-surface" />
      </div>
      <div className="mb-8 flex gap-2 overflow-hidden lg:mb-10">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-9 w-28 shrink-0 bg-surface" />
        ))}
      </div>
      <div className="mb-6 border-b border-line pb-4">
        <div className="h-4 w-20 bg-surface" />
      </div>
      <div className="product-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="media" />
        ))}
      </div>
    </div>
  );
}
