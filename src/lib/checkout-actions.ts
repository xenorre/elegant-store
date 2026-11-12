"use server";

import { and, asc, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItems, orders } from "@/db/schema";
import { cartTag, getCartId } from "@/lib/cart";
import {
  CHECKOUT_HOLD_MINUTES,
  CHECKOUT_INTEGRATION_ID,
  SHIPPING_COUNTRIES,
  SHIPPING_RATES,
} from "@/lib/checkout-config";
import { createPendingOrder, releaseOrder, type OrderLine } from "@/lib/orders";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

export type StartCheckoutResult =
  | { ok: true; clientSecret: string }
  | { ok: false; error: string };

/**
 * Prices the bag from the database, holds its stock and opens a Checkout
 * Session for the embedded form. Reopening checkout with an unchanged bag
 * reuses the open session instead of holding stock again.
 */
export async function startCheckout(): Promise<StartCheckoutResult> {
  const cartId = await getCartId();
  if (!cartId) return { ok: false, error: "Your bag is empty." };

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: { product: true },
    orderBy: [asc(cartItems.createdAt)],
  });
  if (rows.length === 0) return { ok: false, error: "Your bag is empty." };
  if (rows.some((row) => row.product.status !== "active")) {
    return {
      ok: false,
      error: "Some pieces in your bag are no longer available. Please review your bag.",
    };
  }

  const lines: OrderLine[] = rows.map((row) => ({
    productId: row.productId,
    slug: row.product.slug,
    name: row.product.name,
    image: row.product.image,
    size: row.size,
    unitPriceCents: row.product.priceCents,
    quantity: row.quantity,
  }));

  const existing = await settlePendingOrders(cartId, lines);
  if (existing) return existing;

  const user = await getCurrentUser();
  const order = await createPendingOrder({
    cartId,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    lines,
  });
  updateTag("products");
  updateTag(cartTag(cartId));
  if (!order) {
    return {
      ok: false,
      error: "Some pieces in your bag are no longer available. Please review your bag.",
    };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ui_mode: "embedded_page",
        line_items: lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "eur",
            unit_amount: line.unitPriceCents,
            product_data: {
              name: line.name,
              description: line.size ? `Size ${line.size}` : undefined,
              images: [line.image],
              metadata: { slug: line.slug, size: line.size ?? "" },
            },
          },
        })),
        shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
        shipping_options: SHIPPING_RATES.map((rate) => ({
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: rate.name,
            fixed_amount: { amount: rate.amountCents, currency: "eur" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: rate.minDays },
              maximum: { unit: "business_day", value: rate.maxDays },
            },
          },
        })),
        customer_email: user?.email,
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        payment_intent_data: { metadata: { orderId: order.id } },
        // Stripe requires at least 30 minutes; the extra minute absorbs clock skew.
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_HOLD_MINUTES * 60 + 60,
        return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        integration_identifier: CHECKOUT_INTEGRATION_ID,
      },
      { idempotencyKey: `checkout-${order.id}` },
    );

    await db
      .update(orders)
      .set({ stripeCheckoutSessionId: session.id })
      .where(eq(orders.id, order.id));
    return { ok: true, clientSecret: session.client_secret! };
  } catch (error) {
    console.error("Failed to create Checkout Session", error);
    await releaseOrder({ orderId: order.id }, "expired");
    updateTag("products");
    return { ok: false, error: "We couldn't start checkout. Please try again." };
  }
}

// Deals with orders this bag already has in progress. An open session for the
// same lines is reused. Anything else is expired and its stock returned, which
// also covers sessions whose expiry webhook never arrived.
async function settlePendingOrders(
  cartId: string,
  lines: OrderLine[],
): Promise<StartCheckoutResult | null> {
  const pending = await db.query.orders.findMany({
    where: and(eq(orders.cartId, cartId), eq(orders.status, "pending")),
    with: { items: true },
  });

  let reusable: StartCheckoutResult | null = null;
  for (const order of pending) {
    const session = order.stripeCheckoutSessionId
      ? await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId)
      : null;

    // Paid, or a delayed payment in progress: the webhook will settle it.
    if (session?.status === "complete") {
      return { ok: false, error: "This order has already been placed." };
    }
    if (!reusable && session?.status === "open" && sameLines(order.items, lines)) {
      reusable = { ok: true, clientSecret: session.client_secret! };
      continue;
    }
    if (session?.status === "open") {
      await stripe.checkout.sessions.expire(session.id);
    }
    await releaseOrder({ orderId: order.id }, "expired");
    updateTag("products");
  }
  return reusable;
}

type LineKey = Pick<OrderLine, "size" | "quantity" | "unitPriceCents"> & {
  productId: string | null;
};

function sameLines(items: LineKey[], lines: OrderLine[]) {
  const key = (line: LineKey) =>
    `${line.productId}:${line.size ?? ""}:${line.quantity}:${line.unitPriceCents}`;
  const current = new Set(lines.map(key));
  return items.length === lines.length && items.every((item) => current.has(key(item)));
}
