import "server-only";

import { markOrderPaid } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

/**
 * Fulfills a Checkout Session once it's paid. Safe to call repeatedly: it
 * returns the order only on the call that marked it paid, and null otherwise,
 * including while a delayed payment method is still unpaid.
 */
export async function fulfillCheckout(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "unpaid") return null;

  const shipping = session.collected_information?.shipping_details;
  return markOrderPaid({
    sessionId,
    email: session.customer_details?.email ?? null,
    shippingCents: session.total_details?.amount_shipping ?? null,
    taxCents: session.total_details?.amount_tax ?? null,
    totalCents: session.amount_total,
    shippingDetails: shipping
      ? {
          name: shipping.name,
          address: {
            line1: shipping.address.line1,
            line2: shipping.address.line2,
            city: shipping.address.city,
            postalCode: shipping.address.postal_code,
            state: shipping.address.state,
            country: shipping.address.country,
          },
        }
      : null,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
  });
}
