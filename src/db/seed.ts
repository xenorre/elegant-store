// Writes the initial catalogue to the database: `pnpm db:seed`.
// Insert-only by default, so it's safe to re-run once admins edit the
// catalogue: existing categories and products (matched by slug) are left alone,
// and stock is only added for products this run creates.
//
// `pnpm db:seed --reset` overwrites seeded categories and products with the
// seed values and replaces their stock rows. That discards admin edits and
// ignores stock held by pending orders, so use it in development only.
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
const reset = process.argv.includes("--reset");

// Update every column from the incoming row on a slug conflict.
function excluded(columns: string[]) {
  return Object.fromEntries(
    columns.map((column) => [column, sql.raw(`excluded.${column}`)]),
  );
}

async function main() {
  if (reset) {
    console.warn("--reset: overwriting seeded products and categories, and replacing their stock.");
  }

  const categoryInsert = db
    .insert(categories)
    .values(seedCategories.map((category, index) => ({ ...category, position: index })));
  const insertedCategories = await (reset
    ? categoryInsert.onConflictDoUpdate({
        target: categories.slug,
        set: { ...excluded(["name", "position"]), updatedAt: new Date() },
      })
    : categoryInsert.onConflictDoNothing({ target: categories.slug })
  ).returning({ id: categories.id });

  // Without --reset, existing rows aren't returned, so look the ids up.
  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(inArray(categories.slug, seedCategories.map((category) => category.slug)));
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const productInsert = db.insert(products).values(
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
  );
  const productRows = await (reset
    ? productInsert.onConflictDoUpdate({
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
    : productInsert.onConflictDoNothing({ target: products.slug })
  ).returning({ id: products.id, slug: products.slug });
  // With --reset, every seeded product; otherwise only the ones just created.
  const productIds = new Map(productRows.map((row) => [row.slug, row.id]));

  const stockRows = seedProducts.flatMap((product): (typeof stock.$inferInsert)[] => {
    const productId = productIds.get(product.slug);
    if (!productId) return [];
    return product.sizes
      ? product.sizes.map((size, index) => ({
          productId,
          size: size.label,
          quantity: size.stock,
          position: index,
        }))
      : [{ productId, size: null, quantity: product.stock, position: 0 }];
  });

  if (stockRows.length > 0) {
    // neon-http runs a batch as one transaction, so stock is never half-replaced.
    await db.batch([
      db.delete(stock).where(inArray(stock.productId, [...productIds.values()])),
      db.insert(stock).values(stockRows),
    ]);
  }

  console.log(
    reset
      ? `Reset ${insertedCategories.length} categories, ${productRows.length} products, ${stockRows.length} stock rows.`
      : `Added ${insertedCategories.length} categories, ${productRows.length} products, ${stockRows.length} stock rows; existing rows were left alone.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
