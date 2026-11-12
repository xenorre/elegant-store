import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { BagLineControls } from "@/components/bag-line-controls";
import { MAX_LINE_QUANTITY, getCart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shopping Bag",
  robots: { index: false, follow: false },
};

export default function BagPage() {
  return (
    <main className="section flex-1">
      <div className="container-wide">
        <div className="mb-10 flex flex-col gap-3 lg:mb-14">
          <p className="eyebrow text-muted">Your selection</p>
          <h1 className="text-heading">Shopping bag</h1>
        </div>
        <Suspense fallback={<BagSkeleton />}>
          <BagContents />
        </Suspense>
      </div>
    </main>
  );
}

async function BagContents() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="hairline flex flex-col items-start gap-6 pt-8">
        <p className="text-body-lg text-muted">Your shopping bag is empty.</p>
        <Link href="/new-in" className="btn btn-primary">
          Discover new arrivals
        </Link>
      </div>
    );
  }

  const unavailable = cart.lines.some((line) => line.quantity > line.available);

  return (
    <div className="grid gap-y-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-24">
      <ul aria-label="Items in your bag" className="flex flex-col">
        {cart.lines.map((line) => (
          <BagLine key={line.id} line={line} />
        ))}
      </ul>

      <section
        aria-labelledby="summary-heading"
        className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start"
      >
        <h2 id="summary-heading" className="eyebrow">
          Order summary
        </h2>
        <dl className="hairline flex flex-col gap-3 pt-6 text-body">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"})
            </dt>
            <dd>{formatPrice(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd className="text-muted">Calculated at checkout</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3">
          {unavailable ? (
            <>
              <button type="button" disabled className="btn btn-primary btn-lg btn-block">
                Checkout
              </button>
              <p role="status" className="text-body-sm text-danger">
                Some pieces are no longer available in the quantity you chose. Please update
                your bag to continue.
              </p>
            </>
          ) : (
            <Link href="/checkout" className="btn btn-primary btn-lg btn-block">
              Checkout
            </Link>
          )}
          <p className="text-body-sm text-muted">
            Secure payment powered by Stripe.
          </p>
        </div>
      </section>
    </div>
  );
}

function BagLine({ line }: { line: CartLine }) {
  const href = `/products/${line.slug}`;

  return (
    <li className="hairline grid grid-cols-[6rem_minmax(0,1fr)] gap-x-5 py-6 last:border-b last:border-line sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-8">
      <Link href={href} className="media" tabIndex={-1} aria-hidden="true">
        <Image src={line.image} alt={line.imageAlt} fill sizes="(min-width: 640px) 8rem, 6rem" />
      </Link>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-col gap-0.5 text-body-sm">
            <h3>
              <Link href={href} className="hover:underline hover:underline-offset-4">
                {line.name}
              </Link>
            </h3>
            <p className="text-muted">{line.detail}</p>
            {line.size && <p className="text-muted">Size: {line.size}</p>}
          </div>
          <p className="text-body-sm sm:text-right">{formatPrice(line.price * line.quantity)}</p>
        </div>

        {line.available === 0 ? (
          <p className="text-body-sm text-danger">Sold out</p>
        ) : (
          line.quantity > line.available && (
            <p className="text-body-sm text-danger">Only {line.available} left</p>
          )
        )}

        <div className="mt-auto">
          <BagLineControls
            lineId={line.id}
            name={line.size ? `${line.name}, size ${line.size}` : line.name}
            quantity={line.quantity}
            max={Math.min(line.available, MAX_LINE_QUANTITY)}
          />
        </div>
      </div>
    </li>
  );
}

function BagSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your bag" className="animate-pulse">
      <div className="grid gap-y-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-24">
        <div className="hairline grid grid-cols-[6rem_1fr] gap-x-5 py-6 sm:grid-cols-[8rem_1fr] sm:gap-x-8">
          <div className="media" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-2/3 bg-surface" />
            <div className="h-4 w-1/3 bg-surface" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-4 w-28 bg-surface" />
          <div className="h-20 bg-surface" />
          <div className="h-14 bg-surface" />
        </div>
      </div>
    </div>
  );
}
