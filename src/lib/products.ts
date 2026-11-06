import "server-only";

import { and, asc, desc, eq, inArray, ne, notInArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { categories, products, stock } from "@/db/schema";
import type { Category, Product } from "@/lib/catalog";

// Catalogue reads. Results are cached for a few minutes and tagged "products",
// so a future admin or order flow can refresh them with updateTag("products").

const withRelations = {
  category: true as const,
  stock: { orderBy: [asc(stock.position)] },
};

type ProductRow = typeof products.$inferSelect & {
  category: typeof categories.$inferSelect;
  stock: (typeof stock.$inferSelect)[];
};

function toProduct(row: ProductRow): Product {
  const info = {
    slug: row.slug,
    name: row.name,
    detail: row.detail,
    price: row.priceCents / 100,
    category: { slug: row.category.slug, name: row.category.name },
    description: row.description,
    details: row.details,
    image: row.image,
    imageAlt: row.imageAlt,
    gallery: row.gallery,
    badge: row.badge ?? undefined,
  };

  const [first] = row.stock;
  if (row.stock.length <= 1 && !first?.size) {
    return { ...info, stock: first?.quantity ?? 0 };
  }
  return {
    ...info,
    sizes: row.stock.map((entry) => ({
      label: entry.size ?? "One size",
      stock: entry.quantity,
    })),
  };
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: withRelations,
  });
  return row && toProduct(row);
}

/** Products for the given slugs, in the same order. Unknown slugs are skipped. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  if (slugs.length === 0) return [];
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    with: withRelations,
  });
  const bySlug = new Map(rows.map((row) => [row.slug, toProduct(row)]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

/** Most recently added products first; name breaks ties within a batch. */
export async function getNewArrivals(limit = 24): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db.query.products.findMany({
    with: withRelations,
    orderBy: [desc(products.createdAt), asc(products.name)],
    limit,
  });
  return rows.map(toProduct);
}

/** A category and its products, alphabetically. Undefined for unknown slugs. */
export async function getCategoryWithProducts(
  slug: string,
): Promise<{ category: Category; products: Product[] } | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
  if (!category) return undefined;

  const rows = await db.query.products.findMany({
    where: eq(products.categoryId, category.id),
    with: withRelations,
    orderBy: [asc(products.name)],
  });
  return {
    category: { slug: category.slug, name: category.name },
    products: rows.map(toProduct),
  };
}

export async function getCategorySlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select({ slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.position));
  return rows.map((row) => row.slug);
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .orderBy(asc(products.slug));
  return rows.map((row) => row.slug);
}

// Same-category pieces first, then the rest of the catalogue.
export function getRelatedProducts(product: Product, limit = 6) {
  return relatedProducts(product.slug, product.category.slug, limit);
}

async function relatedProducts(
  slug: string,
  categorySlug: string,
  limit: number,
): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const sameCategory = db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, categorySlug));

  const first = await db.query.products.findMany({
    where: and(ne(products.slug, slug), inArray(products.categoryId, sameCategory)),
    with: withRelations,
    orderBy: [asc(products.name)],
    limit,
  });
  const rest =
    first.length < limit
      ? await db.query.products.findMany({
          where: and(
            ne(products.slug, slug),
            notInArray(products.categoryId, sameCategory),
          ),
          with: withRelations,
          orderBy: [asc(products.name)],
          limit: limit - first.length,
        })
      : [];

  return [...first, ...rest].map(toProduct);
}
