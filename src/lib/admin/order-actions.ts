"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { isUuid } from "@/lib/admin/admin-products";
import { cartTag } from "@/lib/cart";
import { fulfillCheckout, sendOrderConfirmation } from "@/lib/checkout";
import { ordersTag, releaseOrder } from "@/lib/orders";
import { assertAdmin } from "@/lib/session";
import { stripe } from "@/lib/stripe";

/**
 * Settles a pending order whose webhook never arrived, by asking Stripe what
 * happened to its Checkout Session. It never sets a status directly: it runs
 * the same idempotent transitions as the webhook, so it's safe if the webhook
 * turns up at the same time.
 */
export async function resolvePendingOrder(orderId: string): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(orderId)) return { ok: false, error: "Invalid request." };

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return { ok: false, error: "This order no longer exists." };
  if (order.status !== "pending") {
    return { ok: true, message: "This order is no longer pending. Refresh the page." };
  }

  let message: string;
  const sessionId = order.stripeCheckoutSessionId;
  if (!sessionId) {
    // The Checkout Session was never created, so nothing can be paid.
    await releaseOrder({ orderId }, "expired");
    message = "Expired the order and returned its stock.";
  } else {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status === "complete") {
      const paid = await fulfillCheckout(sessionId);
      if (paid) after(() => sendOrderConfirmation(sessionId));
      message = paid
        ? "Stripe reports it as paid. Marked paid and emailed the customer."
        : "The customer completed checkout, but the payment is still processing. Stripe will confirm it later.";
    } else {
      // An open session is expired first, so it can't be paid after its stock returns.
      if (session.status === "open") {
        try {
          await stripe.checkout.sessions.expire(sessionId);
        } catch (error) {
          // Usually the customer finished paying a moment ago.
          console.error("Failed to expire Checkout Session", sessionId, error);
          return {
            ok: false,
            error: "Stripe couldn't expire this checkout. It may have just been paid; refresh and try again.",
          };
        }
      }
      await releaseOrder({ sessionId }, "expired");
      message = "Expired the checkout and returned its stock.";
    }
  }

  updateTag("products");
  if (order.userId) updateTag(ordersTag(order.userId));
  if (order.cartId) updateTag(cartTag(order.cartId));
  return { ok: true, message };
}
