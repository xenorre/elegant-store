import "server-only";

import { asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { categories, products, stock } from "@/db/schema";
import { getHeldStock, sizeKey } from "@/lib/admin/inventory";
import type { ProductStatus } from "@/lib/catalog";
import { assertAdmin } from "@/lib/session";

// Admin catalogue reads. Uncached on purpose: admins need the current state,
// including drafts and archived products, which public reads never return.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID.test(value);
}

export const productStatuses = ["draft", "active", "archived"] as const satisfies ProductStatus[];

export function isProductStatus(value: unknown): value is ProductStatus {
  return productStatuses.includes(value as ProductStatus);
}

export async function listAdminProducts(filter: { status?: ProductStatus; query?: string }) {
  await assertAdmin();

  const query = filter.query?.trim();
  const rows = await db.query.products.findMany({
    where: (table, { and }) =>
      and(
        filter.status ? eq(table.status, filter.status) : undefined,
        query
          ? or(ilike(table.name, `%${escapeLike(query)}%`), ilike(table.slug, `%${escapeLike(query)}%`))
          : undefined,
      ),
    with: { category: true, stock: true },
    orderBy: [desc(products.updatedAt)],
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    status: row.status,
    priceCents: row.priceCents,
    category: row.category.name,
    department: row.department,
    available: row.stock.reduce((total, entry) => total + entry.quantity, 0),
    sizes: row.stock.length,
    updatedAt: row.updatedAt,
  }));
}

export async function getAdminProduct(id: string) {
  await assertAdmin();
  if (!isUuid(id)) return undefined;

  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true, stock: { orderBy: [asc(stock.position)] } },
  });
  if (!row) return undefined;

  const held = await getHeldStock(id);
  return {
    ...row,
    stock: row.stock.map((entry) => {
      const heldUnits = held.get(sizeKey(entry.size)) ?? 0;
      return { ...entry, held: heldUnits, onHand: entry.quantity + heldUnits };
    }),
  };
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;

/** Categories in catalogue order, with how many products use each. */
export async function listAdminCategories() {
  await assertAdmin();

  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      position: categories.position,
      products: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.position), asc(categories.name));
}

export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}
