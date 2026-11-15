"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";

import { db } from "@/db";
import { stock } from "@/db/schema";
import type { AdminActionResult, AdminFormState } from "@/lib/admin/action-result";
import { isUuid } from "@/lib/admin/admin-products";
import { pgErrorCode, required, text } from "@/lib/admin/validation";
import { assertAdmin } from "@/lib/session";

// Stock writes for /admin. `stock.quantity` is what can still be sold, and
// checkout holds subtract from it concurrently, so admins change it by a delta
// applied in SQL, never by writing an absolute number. Every change is logged
// in stock_adjustments in the same transaction.

const MAX_DELTA = 10_000;

// Units of this stock row's product and size held by pending orders.
const heldBy = (row: typeof stock) => sql`
  select 1 from order_items oi
  join orders o on o.id = oi.order_id
  where o.status = 'pending'
    and oi.product_id = ${row.productId}
    and oi.size is not distinct from ${row.size}
`;

export async function adjustStock(
  _previous: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  const admin = await assertAdmin();

  const stockId = text(form, "stockId");
  const delta = Number(text(form, "delta"));
  const reason = required(text(form, "reason"), "Reason", 200);
  const fieldErrors: Record<string, string> = {};
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > MAX_DELTA) {
    fieldErrors.delta = "Enter a whole number other than 0, such as 5 or -2.";
  }
  if (!reason.ok) fieldErrors.reason = reason.error;
  if (!isUuid(stockId)) return { status: "error", error: "This size no longer exists." };
  if (Object.keys(fieldErrors).length > 0 || !reason.ok) {
    return { status: "error", error: "Please correct the highlighted fields.", fieldErrors };
  }

  try {
    // One transaction: the log row is only written if the update found the row.
    const [updated] = await db.batch([
      db
        .update(stock)
        .set({ quantity: sql`${stock.quantity} + ${delta}` })
        .where(eq(stock.id, stockId))
        .returning({ quantity: stock.quantity }),
      db.execute(sql`
        insert into stock_adjustments (stock_id, product_id, size, delta, reason, user_id)
        select id, product_id, size, ${delta}, ${reason.value}, ${admin.id}
        from stock where id = ${stockId}
      `),
    ]);
    if (updated.length === 0) return { status: "error", error: "This size no longer exists." };

    updateTag("products");
    return {
      status: "saved",
      message: `${delta > 0 ? "Added" : "Removed"} ${Math.abs(delta)}. ${updated[0].quantity} now available.`,
    };
  } catch (error) {
    if (pgErrorCode(error) === "23514") {
      return {
        status: "error",
        error: "That would take available stock below zero.",
        fieldErrors: { delta: "Too many to remove." },
      };
    }
    throw error;
  }
}

/** Adds a size with no stock, after the existing ones. */
export async function addSize(
  _previous: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  await assertAdmin();

  const productId = text(form, "productId");
  const label = required(text(form, "size"), "Size", 20);
  if (!isUuid(productId)) return { status: "error", error: "This product no longer exists." };
  if (!label.ok) {
    return { status: "error", error: label.error, fieldErrors: { size: label.error } };
  }

  try {
    // Refuses one-size products: a product has either one null-size row or
    // only labelled sizes, never both.
    const result = await db.execute(sql`
      insert into stock (product_id, size, quantity, position)
      select ${productId}, ${label.value}, 0, coalesce(max(position) + 1, 0)
      from stock where product_id = ${productId}
      having not coalesce(bool_or(size is null), false)
      returning id
    `);
    if (result.rows.length === 0) {
      return { status: "error", error: "This is a one-size product, so it can't have sizes." };
    }
  } catch (error) {
    const code = pgErrorCode(error);
    if (code === "23505") {
      return { status: "error", error: "That size already exists.", fieldErrors: { size: "Already listed." } };
    }
    if (code === "23503") return { status: "error", error: "This product no longer exists." };
    throw error;
  }

  updateTag("products");
  return { status: "saved", message: `Added size ${label.value}.` };
}

/**
 * Removes a size once nothing is available or held. Bags holding it show it as
 * sold out until the shopper removes it; past orders keep their own copy.
 */
export async function removeSize(stockId: string): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(stockId)) return { ok: false, error: "Invalid request." };

  const [removed] = await db
    .delete(stock)
    .where(
      and(
        eq(stock.id, stockId),
        eq(stock.quantity, 0),
        sql`${stock.size} is not null`,
        sql`not exists (${heldBy(stock)})`,
      ),
    )
    .returning({ id: stock.id });
  if (!removed) {
    return {
      ok: false,
      error: "Only sizes with nothing available or held by a checkout can be removed. Adjust it to 0 first.",
    };
  }

  updateTag("products");
  return { ok: true };
}

/** Moves a size one place earlier or later in the size picker. */
export async function moveSize(stockId: string, direction: "up" | "down"): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(stockId)) return { ok: false, error: "Invalid request." };

  const [target] = await db
    .select({ productId: stock.productId })
    .from(stock)
    .where(eq(stock.id, stockId));
  if (!target) return { ok: false, error: "This size no longer exists." };

  const rows = await db
    .select({ id: stock.id })
    .from(stock)
    .where(eq(stock.productId, target.productId))
    .orderBy(asc(stock.position), asc(stock.size));
  const order = rows.map((row) => row.id);
  const from = order.indexOf(stockId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= order.length) return { ok: true };

  [order[from], order[to]] = [order[to], order[from]];
  const [first, ...rest] = order.map((id, position) =>
    db.update(stock).set({ position }).where(eq(stock.id, id)),
  );
  await db.batch([first, ...rest]);

  updateTag("products");
  return { ok: true };
}
