import "server-only";

import { and, desc, eq, ilike, ne, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { orderItems, orders, type OrderStatus } from "@/db/schema";
import { escapeLike, isUuid } from "@/lib/admin/admin-products";
import { CHECKOUT_HOLD_MINUTES } from "@/lib/checkout-config";
import { assertAdmin } from "@/lib/session";

// Admin order reads. Uncached: order state changes from webhooks at any time.

export const orderFilters = ["open", "pending", "paid", "payment_failed", "expired", "all"] as const;
export type OrderFilter = (typeof orderFilters)[number];

export function isOrderFilter(value: unknown): value is OrderFilter {
  return orderFilters.includes(value as OrderFilter);
}

const PAGE_SIZE = 50;

// A pending order older than its Checkout Session should have expired: its
// webhook was probably missed, so its stock is still held.
const stuckHold = (table: Pick<typeof orders, "status" | "createdAt">) => sql<boolean>`(
  ${table.status} = 'pending'
  and ${table.createdAt} < now() - make_interval(mins => ${CHECKOUT_HOLD_MINUTES + 5})
)`;

/** The status to show, with stuck pending orders called out. */
export function displayStatus(order: { status: OrderStatus; stuck: boolean }) {
  return order.stuck ? ("stuck" as const) : order.status;
}

/**
 * Newest first, keyset-paginated: `cursor` is the last row's `createdAt|id`.
 * "open" hides expired sessions, which are most abandoned checkouts.
 */
export async function listAdminOrders(input: {
  filter: OrderFilter;
  query?: string;
  cursor?: string;
}) {
  await assertAdmin();

  const conditions: (SQL | undefined)[] = [
    input.filter === "open"
      ? ne(orders.status, "expired")
      : input.filter === "all"
        ? undefined
        : eq(orders.status, input.filter),
    searchCondition(input.query?.trim()),
    cursorCondition(input.cursor),
  ];

  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      email: orders.email,
      userId: orders.userId,
      currency: orders.currency,
      subtotalCents: orders.subtotalCents,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      stuck: stuckHold(orders),
      items: sql<number>`(
        select coalesce(sum(${orderItems.quantity}), 0)::int from ${orderItems}
        where ${orderItems.orderId} = ${orders.id}
      )`,
    })
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(PAGE_SIZE + 1);

  const page = rows.slice(0, PAGE_SIZE);
  const last = page.at(-1);
  return {
    orders: page,
    nextCursor:
      rows.length > PAGE_SIZE && last ? `${last.createdAt.toISOString()}|${last.id}` : null,
  };
}

// Matches what an admin is likely to paste: an order reference, an email, or a
// Stripe Checkout Session or PaymentIntent id.
function searchCondition(query: string | undefined) {
  if (!query) return undefined;
  if (query.startsWith("cs_")) return eq(orders.stripeCheckoutSessionId, query);
  if (query.startsWith("pi_")) return eq(orders.stripePaymentIntentId, query);
  if (isUuid(query)) return eq(orders.id, query);
  if (/^[0-9a-f]{4,8}$/i.test(query)) {
    return sql`${orders.id}::text like ${`${query.toLowerCase()}%`}`;
  }
  return ilike(orders.email, `%${escapeLike(query)}%`);
}

function cursorCondition(cursor: string | undefined) {
  if (!cursor) return undefined;
  const [createdAt, id] = cursor.split("|");
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime()) || !id || !isUuid(id)) return undefined;
  return sql`(${orders.createdAt}, ${orders.id}) < (${date.toISOString()}::timestamptz, ${id}::uuid)`;
}

export async function getAdminOrder(id: string) {
  await assertAdmin();
  if (!isUuid(id)) return undefined;

  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
    extras: (table) => ({ stuck: stuckHold(table).as("stuck") }),
  });
}

export type AdminOrder = NonNullable<Awaited<ReturnType<typeof getAdminOrder>>>;
