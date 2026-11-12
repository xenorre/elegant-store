// Writes the initial catalogue to the database: `pnpm db:seed`.
// Safe to re-run: categories and products are upserted by slug and each seeded
// product's stock rows are replaced with the seed values.
//
// Builds its own client rather than importing `./index`, which is server-only.

import { config } from "dotenv";
import { inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { categories, products, stock } from "./schema";
import { seedCategories, seedProducts } from "./seed-data";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(process.env.DATABASE_URL, { schema });

// Update every column from the incoming row on a slug conflict.
function excluded(columns: string[]) {
  return Object.fromEntries(
    columns.map((column) => [column, sql.raw(`excluded.${column}`)]),
  );
}

async function main() {
  const categoryRows = await db
    .insert(categories)
    .values(seedCategories.map((category, index) => ({ ...category, position: index })))
    .onConflictDoUpdate({
      target: categories.slug,
      set: { ...excluded(["name", "position"]), updatedAt: new Date() },
    })
    .returning({ id: categories.id, slug: categories.slug });
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const productRows = await db
    .insert(products)
    .values(
      seedProducts.map((product) => {
        const categoryId = categoryIds.get(product.category);
        if (!categoryId) {
          throw new Error(`Unknown category "${product.category}" on ${product.slug}`);
        }
        return {
          slug: product.slug,
          categoryId,
          name: product.name,
          detail: product.detail,
          description: product.description,
          details: product.details,
          priceCents: Math.round(product.price * 100),
          department: product.department,
          image: product.image,
          imageAlt: product.imageAlt,
          gallery: product.gallery,
          badge: product.badge ?? null,
        };
      }),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        ...excluded([
          "category_id",
          "name",
          "detail",
          "description",
          "details",
          "price_cents",
          "department",
          "image",
          "image_alt",
          "gallery",
          "badge",
        ]),
        updatedAt: new Date(),
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productIds = new Map(productRows.map((row) => [row.slug, row.id]));

  const stockRows = seedProducts.flatMap((product): (typeof stock.$inferInsert)[] => {
    const productId = productIds.get(product.slug)!;
    return product.sizes
      ? product.sizes.map((size, index) => ({
          productId,
          size: size.label,
          quantity: size.stock,
          position: index,
        }))
      : [{ productId, size: null, quantity: product.stock, position: 0 }];
  });

  // neon-http runs a batch as one transaction, so stock is never half-replaced.
  await db.batch([
    db.delete(stock).where(inArray(stock.productId, [...productIds.values()])),
    db.insert(stock).values(stockRows),
  ]);

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${stockRows.length} stock rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
