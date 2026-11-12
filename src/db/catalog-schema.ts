import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import type { Department, ProductImage } from "../lib/catalog";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    detail: text("detail").notNull(),
    description: text("description").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    priceCents: integer("price_cents").notNull(),
    department: text("department").$type<Department>().notNull().default("unisex"),
    image: text("image").notNull(),
    imageAlt: text("image_alt").notNull(),
    /** Additional images shown after the primary one, in order. */
    gallery: jsonb("gallery").$type<ProductImage[]>().notNull().default([]),
    badge: text("badge"),
    ...timestamps,
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_department_idx").on(table.department),
    check("products_price_cents_check", sql`${table.priceCents} >= 0`),
    check(
      "products_department_check",
      sql`${table.department} in ('women', 'men', 'unisex')`,
    ),
  ],
);

// One row per size, or a single row with a null size for one-size products.
export const stock = pgTable(
  "stock",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size"),
    quantity: integer("quantity").notNull().default(0),
    position: integer("position").notNull().default(0),
    updatedAt: timestamps.updatedAt,
  },
  (table) => [
    unique("stock_product_id_size_unique")
      .on(table.productId, table.size)
      .nullsNotDistinct(),
    check("stock_quantity_check", sql`${table.quantity} >= 0`),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stock: many(stock),
}));

export const stockRelations = relations(stock, ({ one }) => ({
  product: one(products, {
    fields: [stock.productId],
    references: [products.id],
  }),
}));
