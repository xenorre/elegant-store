import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ResolveOrderAction } from "@/components/admin/resolve-order-action";
import { StatusPill } from "@/components/admin/status-pill";
import { displayStatus, getAdminOrder, type AdminOrder } from "@/lib/admin/admin-orders";
import { dateTimeFormat, formatCents } from "@/lib/format";
import { orderReference } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Order" };

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <main className="section flex-1">
      <div className="container-wide">
        <Link href="/admin/orders" className="link-muted mb-6 inline-block text-body-sm">
          ← All orders
        </Link>
        <Suspense fallback={<OrderSkeleton />}>
          <OrderDetail params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function OrderDetail({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const { stuck } = order;

  return (
    <>
      <div className="mb-10 flex flex-col gap-3">
        <p className="eyebrow text-muted">Order</p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 className="text-heading">{orderReference(order.id)}</h1>
          <StatusPill status={displayStatus(order)} />
        </div>
      </div>

      <div className="grid gap-y-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-16">
        <div className="flex flex-col gap-16">
          {order.status === "pending" && (
            <section aria-labelledby="pending-heading" className="flex flex-col gap-6">
              <h2 id="pending-heading" className="eyebrow">
                Awaiting payment
              </h2>
              <div className="hairline flex flex-col items-start gap-4 pt-6">
                <p className="text-body text-muted">
                  {stuck
                    ? "This checkout should have ended by now, but Stripe's update never arrived, so its stock is still held. Check Stripe and settle it."
                    : "The customer is in checkout. Its stock is held until they pay or the session expires."}
                </p>
                {stuck && <ResolveOrderAction orderId={order.id} />}
              </div>
            </section>
          )}

          <section aria-labelledby="items-heading" className="flex flex-col gap-6">
            <h2 id="items-heading" className="eyebrow">
              Items
            </h2>
            <ul className="flex flex-col">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="hairline grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 py-4 last:border-b last:border-line"
                >
                  <div className="media">
                    <Image src={item.image} alt="" fill sizes="3.5rem" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5 text-body-sm">
                    {item.productId ? (
                      <Link href={`/admin/products/${item.productId}`} className="link">
                        {item.name}
                      </Link>
                    ) : (
                      <p>{item.name}</p>
                    )}
                    <p className="text-muted">
                      {[item.size && `Size ${item.size}`, `Qty ${item.quantity}`, formatCents(item.unitPriceCents, order.currency) + " each"]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="text-body-sm tabular-nums">
                    {formatCents(item.unitPriceCents * item.quantity, order.currency)}
                  </p>
                </li>
              ))}
            </ul>
            <Totals order={order} />
          </section>

          <section aria-labelledby="shipping-heading" className="flex flex-col gap-6">
            <h2 id="shipping-heading" className="eyebrow">
              Shipping
            </h2>
            <div className="hairline pt-6 text-body">
              {order.shippingDetails ? (
                <address className="not-italic">
                  {[
                    order.shippingDetails.name,
                    order.shippingDetails.address.line1,
                    order.shippingDetails.address.line2,
                    [order.shippingDetails.address.postalCode, order.shippingDetails.address.city]
                      .filter(Boolean)
                      .join(" "),
                    order.shippingDetails.address.state,
                    order.shippingDetails.address.country,
                  ]
                    .filter(Boolean)
                    .map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                </address>
              ) : (
                <p className="text-muted">Collected by Stripe once the order is paid.</p>
              )}
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="summary-heading"
          className="flex flex-col gap-6 self-start lg:sticky lg:top-[calc(var(--header-h)+2rem)]"
        >
          <h2 id="summary-heading" className="eyebrow">
            Summary
          </h2>
          <dl className="hairline grid grid-cols-[6rem_minmax(0,1fr)] gap-x-6 gap-y-3 pt-6 text-body-sm">
            <dt className="text-muted">Customer</dt>
            <dd className="break-all">
              {order.email ?? "—"}
              <span className="block text-muted">{order.userId ? "Account" : "Guest checkout"}</span>
            </dd>
            <dt className="text-muted">Placed</dt>
            <dd>
              <DateTime value={order.createdAt} />
            </dd>
            {order.paidAt && (
              <>
                <dt className="text-muted">Paid</dt>
                <dd>
                  <DateTime value={order.paidAt} />
                </dd>
              </>
            )}
            <dt className="text-muted">Updated</dt>
            <dd>
              <DateTime value={order.updatedAt} />
            </dd>
            <dt className="text-muted">Order ID</dt>
            <dd className="font-mono text-micro break-all">{order.id}</dd>
            {order.stripeCheckoutSessionId && (
              <>
                <dt className="text-muted">Session</dt>
                <dd className="font-mono text-micro break-all">{order.stripeCheckoutSessionId}</dd>
              </>
            )}
          </dl>
          {order.stripePaymentIntentId && (
            <a
              href={stripePaymentUrl(order.stripePaymentIntentId)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-secondary self-start"
            >
              View payment in Stripe
            </a>
          )}
        </aside>
      </div>
    </>
  );
}

function Totals({ order }: { order: AdminOrder }) {
  const rows: [string, number | null][] = [
    ["Subtotal", order.subtotalCents],
    ["Shipping", order.shippingCents],
    ["Tax", order.taxCents],
  ];
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-body-sm tabular-nums">
      {rows
        .filter(([, value]) => value !== null)
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right">{formatCents(value!, order.currency)}</dd>
          </div>
        ))}
      <div className="contents">
        <dt className="font-medium">Total</dt>
        <dd className="text-right font-medium">
          {order.totalCents !== null ? formatCents(order.totalCents, order.currency) : "Not paid"}
        </dd>
      </div>
    </dl>
  );
}

// Test-mode keys (sk_test_, rk_test_) open the payment in the test Dashboard.
function stripePaymentUrl(paymentIntentId: string) {
  const testMode = process.env.STRIPE_SECRET_KEY?.includes("_test_");
  return `https://dashboard.stripe.com/${testMode ? "test/" : ""}payments/${paymentIntentId}`;
}

function DateTime({ value }: { value: Date }) {
  return <time dateTime={value.toISOString()}>{dateTimeFormat.format(value)}</time>;
}

function OrderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading order" className="flex animate-pulse flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-16 bg-surface" />
        <div className="h-10 w-48 bg-surface" />
      </div>
      <div className="h-64 w-full bg-surface" />
    </div>
  );
}
