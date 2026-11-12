import type { Metadata } from "next";
import Image from "next/image";
import { io } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import type Stripe from "stripe";

import { formatPrice } from "@/lib/catalog";
import { getOrderBySession, orderReference } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};

// Stripe redirects here after payment. This page only reports the session's
// state; the webhook in src/app/api/stripe/webhook fulfills the order.
export default function CheckoutReturnPage({ searchParams }: PageProps<"/checkout/return">) {
  return (
    <main className="section flex-1">
      <div className="container-reading">
        <Suspense fallback={<ReturnSkeleton />}>
          <CheckoutResult searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function CheckoutResult({
  searchParams,
}: {
  searchParams: PageProps<"/checkout/return">["searchParams"];
}) {
  const { session_id: sessionId } = await searchParams;
  const session = typeof sessionId === "string" ? await getSession(sessionId) : null;

  if (!session) {
    return (
      <Message eyebrow="Checkout" title="We couldn't find this order">
        <Link href="/bag" className="btn btn-primary">
          Return to your bag
        </Link>
      </Message>
    );
  }

  if (session.status === "open") {
    return (
      <Message eyebrow="Checkout" title="Your payment wasn't completed">
        <p className="text-body-lg text-muted">No payment was taken. You can try again.</p>
        <Link href="/checkout" className="btn btn-primary">
          Return to checkout
        </Link>
      </Message>
    );
  }

  if (session.status === "expired") {
    return (
      <Message eyebrow="Checkout" title="Your checkout session expired">
        <p className="text-body-lg text-muted">
          No payment was taken and your pieces have been released.
        </p>
        <Link href="/bag" className="btn btn-primary">
          Return to your bag
        </Link>
      </Message>
    );
  }

  const order = await getOrderBySession(session.id);
  const email = session.customer_details?.email;
  const processing = session.payment_status === "unpaid";

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-muted">
          {order ? `Order ${orderReference(order.id)}` : "Order confirmation"}
        </p>
        <h1 className="text-heading">
          {processing ? "We're processing your payment" : "Thank you for your order"}
        </h1>
        <p className="text-body-lg text-muted">
          {processing
            ? "We'll confirm your order by email as soon as your payment clears."
            : "Your order is confirmed."}
          {email && (
            <>
              {" "}
              We&apos;ve sent the details to <span className="text-ink">{email}</span>.
            </>
          )}
        </p>
      </div>

      {order && (
        <section aria-labelledby="items-heading" className="flex flex-col gap-6">
          <h2 id="items-heading" className="eyebrow">
            Your pieces
          </h2>
          <ul className="flex flex-col">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="hairline grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-x-5 py-5"
              >
                <div className="media">
                  <Image src={item.image} alt="" fill sizes="4.5rem" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-body-sm">
                  <p>{item.name}</p>
                  {item.size && <p className="text-muted">Size: {item.size}</p>}
                  <p className="text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-body-sm">
                  {formatPrice((item.unitPriceCents * item.quantity) / 100)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Totals session={session} />

      <div className="hairline pt-6">
        <Link href="/new-in" className="btn btn-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function Totals({ session }: { session: Stripe.Checkout.Session }) {
  const shipping = session.collected_information?.shipping_details;
  const amount = (cents: number | null | undefined) => formatPrice((cents ?? 0) / 100);

  return (
    <div className="grid gap-10 sm:grid-cols-2">
      {shipping && (
        <section aria-labelledby="delivery-heading" className="flex flex-col gap-4">
          <h2 id="delivery-heading" className="eyebrow">
            Delivery address
          </h2>
          <address className="text-body not-italic text-muted">
            {[
              shipping.name,
              shipping.address.line1,
              shipping.address.line2,
              [shipping.address.postal_code, shipping.address.city].filter(Boolean).join(" "),
              shipping.address.country,
            ]
              .filter(Boolean)
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </address>
        </section>
      )}
      <section aria-labelledby="summary-heading" className="flex flex-col gap-4">
        <h2 id="summary-heading" className="eyebrow">
          Summary
        </h2>
        <dl className="flex flex-col gap-2 text-body">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd>{amount(session.amount_subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd>
              {session.total_details?.amount_shipping
                ? amount(session.total_details.amount_shipping)
                : "Complimentary"}
            </dd>
          </div>
          <div className="hairline mt-2 flex justify-between gap-4 pt-3">
            <dt>Total</dt>
            <dd>{amount(session.amount_total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

async function getSession(sessionId: string) {
  if (!sessionId.startsWith("cs_")) return null;
  // The Stripe SDK reads Date.now() synchronously for request telemetry, which
  // Cache Components rejects while prerendering. io() defers it to request time.
  await io();
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

function Message({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="text-heading">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function ReturnSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your order" className="animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-32 bg-surface" />
        <div className="h-10 w-3/4 bg-surface" />
        <div className="h-5 w-2/3 bg-surface" />
        <div className="mt-8 h-48 bg-surface" />
      </div>
    </div>
  );
}
