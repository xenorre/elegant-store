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

import { user } from "./auth-schema";
import { products } from "./catalog-schema";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// A shopping bag, identified by an httpOnly cookie holding its id. Guests have
// no user; signed-in shoppers can be linked to theirs.
export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  ...timestamps,
});

// Items point at a product and size rather than a stock row, because
// `pnpm db:seed --reset` replaces stock rows. A null size means a one-size product.
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size"),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    unique("cart_items_cart_id_product_id_size_unique")
      .on(table.cartId, table.productId, table.size)
      .nullsNotDistinct(),
    check("cart_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);

export type OrderStatus = "pending" | "paid" | "payment_failed" | "expired";

export type ShippingDetails = {
  name: string;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    postalCode: string | null;
    state: string | null;
    country: string | null;
  };
};

// One row per Checkout Session. Stock is held while an order is pending and
// released when it expires or its payment fails.
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    cartId: uuid("cart_id").references(() => carts.id, { onDelete: "set null" }),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    email: text("email"),
    currency: text("currency").notNull().default("eur"),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents"),
    taxCents: integer("tax_cents"),
    totalCents: integer("total_cents"),
    shippingDetails: jsonb("shipping_details").$type<ShippingDetails>(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    // For the admin order list and search.
    index("orders_status_created_at_idx").on(table.status, table.createdAt.desc()),
    index("orders_created_at_idx").on(table.createdAt.desc()),
    index("orders_stripe_payment_intent_id_idx").on(table.stripePaymentIntentId),
    index("orders_email_idx").on(table.email),
    check(
      "orders_status_check",
      sql`${table.status} in ('pending', 'paid', 'payment_failed', 'expired')`,
    ),
  ],
);

// A snapshot of each line at the time of purchase, so later catalogue changes
// don't rewrite past orders.
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    image: text("image").notNull(),
    size: text("size"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
