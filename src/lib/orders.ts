import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { cartItems, orderItems, orders, type OrderStatus } from "@/db/schema";

// Order lifecycle. A pending order holds its stock until it's paid, or until
// its Checkout Session expires or its payment fails. Every transition is a
// conditional update on `status = 'pending'`, so webhooks, retries and the
// checkout action can all call these safely, even concurrently.

export type OrderLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string | null;
  unitPriceCents: number;
  quantity: number;
};

/**
 * Creates a pending order and holds its stock in one go. Returns null, with
 * nothing held, when any line no longer has enough stock.
 */
export async function createPendingOrder(input: {
  cartId: string;
  userId: string | null;
  email: string | null;
  lines: OrderLine[];
}): Promise<{ id: string } | null> {
  const id = crypto.randomUUID();
  const subtotalCents = input.lines.reduce(
    (total, line) => total + line.unitPriceCents * line.quantity,
    0,
  );

  await db.batch([
    db.insert(orders).values({
      id,
      cartId: input.cartId,
      userId: input.userId,
      email: input.email,
      subtotalCents,
    }),
    db.insert(orderItems).values(input.lines.map((line) => ({ orderId: id, ...line }))),
  ]);

  if (await holdStock(id, input.lines.length)) return { id };

  await db.delete(orders).where(eq(orders.id, id));
  return null;
}

// Takes every line's quantity out of stock, or nothing if any line falls short.
// A concurrent hold can still pass the availability check on a stale snapshot,
// so the stock_quantity_check constraint is the backstop: it fails the whole
// statement rather than let stock go negative.
async function holdStock(orderId: string, lineCount: number): Promise<boolean> {
  try {
    const { rows } = await db.execute(sql`
      with requested as (
        select product_id, size, quantity from order_items where order_id = ${orderId}
      ),
      available as (
        select count(*)::int as lines
        from requested r
        join stock s on s.product_id = r.product_id
          and s.size is not distinct from r.size
          and s.quantity >= r.quantity
      )
      update stock s
      set quantity = s.quantity - r.quantity, updated_at = now()
      from requested r
      where s.product_id = r.product_id
        and s.size is not distinct from r.size
        and (select lines from available) = ${lineCount}
      returning s.id
    `);
    return rows.length === lineCount;
  } catch (error) {
    if (isCheckViolation(error)) return false;
    throw error;
  }
}

function isCheckViolation(error: unknown) {
  const cause = error instanceof Error ? (error.cause as { code?: string } | undefined) : undefined;
  return cause?.code === "23514";
}

/** Marks a pending order expired or failed and returns its stock. */
export async function releaseOrder(
  where: { orderId: string } | { sessionId: string },
  status: Extract<OrderStatus, "expired" | "payment_failed">,
) {
  const match =
    "orderId" in where
      ? sql`id = ${where.orderId}`
      : sql`stripe_checkout_session_id = ${where.sessionId}`;

  // The stock update only sees an order this statement moved out of pending,
  // so stock is never returned twice.
  await db.execute(sql`
    with released as (
      update orders set status = ${status}, updated_at = now()
      where ${match} and status = 'pending'
      returning id
    )
    update stock s
    set quantity = s.quantity + oi.quantity, updated_at = now()
    from order_items oi
    join released r on r.id = oi.order_id
    where s.product_id = oi.product_id and s.size is not distinct from oi.size
  `);
}

/**
 * Marks the order for a paid Checkout Session as paid and removes the ordered
 * lines from the shopper's bag. Returns the order only for the call that made
 * the transition, so side effects such as emails run once.
 */
export async function markOrderPaid(input: {
  sessionId: string;
  email: string | null;
  shippingCents: number | null;
  taxCents: number | null;
  totalCents: number | null;
  shippingDetails: (typeof orders.$inferInsert)["shippingDetails"];
  paymentIntentId: string | null;
}) {
  const [order] = await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: new Date(),
      email: input.email,
      shippingCents: input.shippingCents,
      taxCents: input.taxCents,
      totalCents: input.totalCents,
      shippingDetails: input.shippingDetails,
      stripePaymentIntentId: input.paymentIntentId,
    })
    .where(and(eq(orders.stripeCheckoutSessionId, input.sessionId), eq(orders.status, "pending")))
    .returning();
  if (!order) return null;

  if (order.cartId) {
    await db.delete(cartItems).where(
      and(
        eq(cartItems.cartId, order.cartId),
        sql`exists (
          select 1 from ${orderItems}
          where ${orderItems.orderId} = ${order.id}
            and ${orderItems.productId} = ${cartItems.productId}
            and ${orderItems.size} is not distinct from ${cartItems.size}
        )`,
      ),
    );
  }
  return order;
}

export async function getOrderBySession(sessionId: string) {
  return db.query.orders.findFirst({
    where: eq(orders.stripeCheckoutSessionId, sessionId),
    with: { items: true },
  });
}

/** Short reference shown to customers, e.g. "7F3A9C21". */
export function orderReference(orderId: string) {
  return orderId.slice(0, 8).toUpperCase();
}
