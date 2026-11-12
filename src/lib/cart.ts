import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/db";
import { cartItems, stock } from "@/db/schema";

export const CART_COOKIE = "cart_id";
/** Most of one item a shopper can put in their bag. */
export const MAX_LINE_QUANTITY = 5;

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  detail: string;
  image: string;
  imageAlt: string;
  size: string | null;
  quantity: number;
  /** Unit price in euros, matching `Product.price`. */
  price: number;
  /** Units currently in stock for this product and size. */
  available: number;
};

export type Cart = {
  lines: CartLine[];
  count: number;
  /** Subtotal in euros. */
  subtotal: number;
};

const emptyCart: Cart = { lines: [], count: 0, subtotal: 0 };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The cart id from the cookie, or null when there is none or it's malformed. */
export async function getCartId(): Promise<string | null> {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  return id && uuidPattern.test(id) ? id : null;
}

/** Cache tag for one cart's contents; cart actions expire it with updateTag. */
export function cartTag(cartId: string) {
  return `cart-${cartId}`;
}

// Reads the cookie, so callers must render inside <Suspense>. The lookup itself
// is cached per cart id: the header renders in every prefetched App Shell, and
// uncached I/O there is abandoned mid-flight when the prefetch render ends.
export async function getCart(): Promise<Cart> {
  const cartId = await getCartId();
  return cartId ? getCartContents(cartId) : emptyCart;
}

// Tagged "products" too, so stock changes refresh availability.
async function getCartContents(cartId: string): Promise<Cart> {
  "use cache";
  cacheLife("minutes");
  cacheTag(cartTag(cartId), "products");

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: { product: true },
    orderBy: [asc(cartItems.createdAt)],
  });
  if (rows.length === 0) return emptyCart;

  const stockRows = await db
    .select({ productId: stock.productId, size: stock.size, quantity: stock.quantity })
    .from(stock)
    .where(inArray(stock.productId, [...new Set(rows.map((row) => row.productId))]));
  const availability = new Map(
    stockRows.map((row) => [`${row.productId}:${row.size ?? ""}`, row.quantity]),
  );

  const lines = rows.map((row) => ({
    id: row.id,
    slug: row.product.slug,
    name: row.product.name,
    detail: row.product.detail,
    image: row.product.image,
    imageAlt: row.product.imageAlt,
    size: row.size,
    quantity: row.quantity,
    price: row.product.priceCents / 100,
    // Archived or drafted pieces stay in the bag but show as unavailable.
    available:
      row.product.status === "active"
        ? (availability.get(`${row.productId}:${row.size ?? ""}`) ?? 0)
        : 0,
  }));

  return {
    lines,
    count: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: rows.reduce((total, row) => total + row.product.priceCents * row.quantity, 0) / 100,
  };
}
