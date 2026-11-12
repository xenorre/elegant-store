import { revalidateTag } from "next/cache";
import { after } from "next/server";
import type Stripe from "stripe";

import { cartTag } from "@/lib/cart";
import { fulfillCheckout, sendOrderConfirmation } from "@/lib/checkout";
import { ordersTag, releaseOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

// Fulfillment runs here, not on the return page: shoppers aren't guaranteed to
// get back to the site after paying. Stripe retries any non-2xx response, and
// every handler below is idempotent, so retries and duplicates are safe.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    // A delayed payment method completes the session while still unpaid;
    // fulfillCheckout skips it until async_payment_succeeded arrives.
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const order = await fulfillCheckout(event.data.object.id);
      if (order) {
        if (order.cartId) revalidateTag(cartTag(order.cartId), { expire: 0 });
        if (order.userId) revalidateTag(ordersTag(order.userId), { expire: 0 });
        after(() => sendOrderConfirmation(event.data.object.id));
      }
      break;
    }
    case "checkout.session.async_payment_failed":
      await releaseOrder({ sessionId: event.data.object.id }, "payment_failed");
      revalidateTag("products", { expire: 0 });
      break;
    case "checkout.session.expired":
      await releaseOrder({ sessionId: event.data.object.id }, "expired");
      revalidateTag("products", { expire: 0 });
      break;
  }

  return Response.json({ received: true });
}
