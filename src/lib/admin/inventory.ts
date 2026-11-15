import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";

// `stock.quantity` is what can still be sold: checkout subtracts units while an
// order is pending. Held units are added back to show what's physically on hand.

/** Key for a product's size, matching one-size rows (null) too. */
export function sizeKey(size: string | null) {
  return size ?? "";
}

/** Units held by pending orders for one product, keyed by sizeKey(). */
export async function getHeldStock(productId: string): Promise<Map<string, number>> {
  const rows = await db
    .select({
      size: orderItems.size,
      held: sql<number>`sum(${orderItems.quantity})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orderItems.productId, productId), eq(orders.status, "pending")))
    .groupBy(orderItems.size);
  return new Map(rows.map((row) => [sizeKey(row.size), row.held]));
}
