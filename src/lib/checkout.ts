import "server-only";

import { orderConfirmationEmail, sendEmail } from "@/lib/email";
import { formatCents } from "@/lib/format";
import { getOrderBySession, markOrderPaid, orderReference } from "@/lib/orders";
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

/** Emails the order confirmation. Call once, after fulfillCheckout returns an order. */
export async function sendOrderConfirmation(sessionId: string) {
  const order = await getOrderBySession(sessionId);
  if (!order?.email) return;

  const items = order.items.map((item) =>
    [item.quantity > 1 ? `${item.quantity} × ${item.name}` : item.name, item.size]
      .filter(Boolean)
      .join(", size "),
  );
  await sendEmail(
    orderConfirmationEmail(
      order.email,
      {
        reference: orderReference(order.id),
        total: formatCents(order.totalCents ?? order.subtotalCents, order.currency),
        items,
      },
      process.env.NEXT_PUBLIC_APP_URL ?? "",
    ),
  );
}
