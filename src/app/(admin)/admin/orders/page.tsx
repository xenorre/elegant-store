import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FilterChips } from "@/components/admin/filter-chips";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusPill, statusLabel } from "@/components/admin/status-pill";
import { Table, TableSkeleton, Td, Th } from "@/components/admin/table";
import {
  displayStatus,
  isOrderFilter,
  listAdminOrders,
  orderFilters,
  type OrderFilter,
} from "@/lib/admin/admin-orders";
import { dateTimeFormat, formatCents } from "@/lib/format";
import { orderReference } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Orders" };

const filterNames: Record<OrderFilter, string> = {
  open: "Open",
  pending: statusLabel("pending"),
  paid: statusLabel("paid"),
  payment_failed: statusLabel("payment_failed"),
  expired: statusLabel("expired"),
  all: "All",
};

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <main className="section flex-1">
      <div className="container-wide">
        <AdminPageHeader eyebrow="Sales" title="Orders" />
        <Suspense fallback={<TableSkeleton label="Loading orders" />}>
          <OrderList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function OrderList({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  await requireAdmin("/admin/orders");
  const params = await searchParams;
  const filter: OrderFilter = isOrderFilter(params.status) ? params.status : "open";
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const { orders, nextCursor } = await listAdminOrders({ filter, query, cursor });
  const hrefFor = (next: { status?: OrderFilter; cursor?: string }) => {
    const search = new URLSearchParams();
    const status = next.status ?? filter;
    if (status !== "open") search.set("status", status);
    if (query) search.set("q", query);
    if (next.cursor) search.set("cursor", next.cursor);
    const value = search.toString();
    return value ? `/admin/orders?${value}` : "/admin/orders";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <FilterChips
          label="Filter by status"
          options={orderFilters.map((value) => ({
            name: filterNames[value],
            href: hrefFor({ status: value }),
            current: filter === value,
          }))}
        />
        <form action="/admin/orders" className="flex w-full max-w-sm items-end gap-3">
          {filter !== "open" && <input type="hidden" name="status" value={filter} />}
          <label className="flex flex-1 flex-col gap-1">
            <span className="sr-only">Search orders</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Reference, email, cs_… or pi_…"
              className="field"
            />
          </label>
          <button type="submit" className="btn btn-sm btn-secondary">
            Search
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="hairline flex flex-col items-start gap-4 pt-6">
          <p className="text-body-lg text-muted">No orders match.</p>
          {(filter !== "open" || query || cursor) && (
            <Link href="/admin/orders" className="link text-body-sm">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <Table caption="Orders">
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Placed</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th className="text-right">Items</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <Td>
                  <Link href={`/admin/orders/${order.id}`} className="link font-medium">
                    {orderReference(order.id)}
                  </Link>
                </Td>
                <Td>
                  <time dateTime={order.createdAt.toISOString()}>
                    {dateTimeFormat.format(order.createdAt)}
                  </time>
                </Td>
                <Td className="max-w-64">
                  <span className="block truncate">{order.email ?? "—"}</span>
                  <span className="block text-muted">{order.userId ? "Account" : "Guest"}</span>
                </Td>
                <Td>
                  <StatusPill status={displayStatus(order)} />
                </Td>
                <Td className="text-right">{order.items}</Td>
                <Td className="text-right">
                  {formatCents(order.totalCents ?? order.subtotalCents, order.currency)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {(cursor || nextCursor) && (
        <nav aria-label="Pagination" className="flex gap-3">
          {cursor && (
            <Link href={hrefFor({})} className="btn btn-sm btn-secondary [--btn-border:var(--line)]">
              Newest
            </Link>
          )}
          {nextCursor && (
            <Link href={hrefFor({ cursor: nextCursor })} className="btn btn-sm btn-secondary">
              Older orders
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
