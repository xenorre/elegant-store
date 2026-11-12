"use server";

import { and, eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import { CART_COOKIE, MAX_LINE_QUANTITY, cartTag, getCartId } from "@/lib/cart";
import { getCurrentUser } from "@/lib/session";

export type CartActionResult = { ok: true } | { ok: false; error: string };

const CART_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/** Adds one unit of a product (in a size, for sized products) to the bag. */
export async function addToBag(slug: string, size: string | null): Promise<CartActionResult> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { stock: true },
  });
  if (!product || product.status !== "active") {
    return { ok: false, error: "This piece is no longer available." };
  }

  const entry = product.stock.find((row) => row.size === size);
  if (!entry) return { ok: false, error: "Please select a size." };
  if (entry.quantity === 0) return { ok: false, error: "This size is sold out." };

  const cartId = await getOrCreateCartId();
  const existing = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.cartId, cartId),
      eq(cartItems.productId, product.id),
      size === null ? sql`${cartItems.size} is null` : eq(cartItems.size, size),
    ),
  });

  const limit = Math.min(entry.quantity, MAX_LINE_QUANTITY);
  const quantity = (existing?.quantity ?? 0) + 1;
  if (quantity > limit) {
    return { ok: false, error: `Your bag already holds the most available (${limit}).` };
  }

  await db
    .insert(cartItems)
    .values({ cartId, productId: product.id, size, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId, cartItems.size],
      set: { quantity },
    });

  updateTag(cartTag(cartId));
  return { ok: true };
}

export async function updateBagQuantity(
  lineId: string,
  quantity: number,
): Promise<CartActionResult> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
    return { ok: false, error: "Please choose a valid quantity." };
  }
  const cartId = await getCartId();
  if (!cartId) return { ok: false, error: "Your bag has expired. Please refresh the page." };

  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, lineId), eq(cartItems.cartId, cartId)));

  updateTag(cartTag(cartId));
  return { ok: true };
}

export async function removeFromBag(lineId: string): Promise<CartActionResult> {
  const cartId = await getCartId();
  if (!cartId) return { ok: true };

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, lineId), eq(cartItems.cartId, cartId)));

  updateTag(cartTag(cartId));
  return { ok: true };
}

// Reuses the cart from the cookie while it still exists, otherwise starts a new
// one and sets the cookie.
async function getOrCreateCartId(): Promise<string> {
  const cookieId = await getCartId();
  if (cookieId) {
    const cart = await db.query.carts.findFirst({ where: eq(carts.id, cookieId) });
    if (cart) return cart.id;
  }

  const user = await getCurrentUser();
  const [cart] = await db
    .insert(carts)
    .values({ userId: user?.id })
    .returning({ id: carts.id });

  (await cookies()).set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
  return cart.id;
}
