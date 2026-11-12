import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ArrowLeftIcon } from "@/components/icons";
import { CheckoutForm } from "@/components/checkout-form";
import { getCart } from "@/lib/cart";
import { CHECKOUT_HOLD_MINUTES } from "@/lib/checkout-config";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="section flex-1">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-3 lg:mb-14">
          <Link href="/bag" className="eyebrow link-muted flex items-center gap-2 self-start">
            <ArrowLeftIcon className="size-4" />
            Back to bag
          </Link>
          <h1 className="text-heading">Checkout</h1>
        </div>
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutContents />
        </Suspense>
      </div>
    </main>
  );
}

async function CheckoutContents() {
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

  if (cart.lines.some((line) => line.quantity > line.available)) {
    return (
      <div className="hairline flex flex-col items-start gap-6 pt-8">
        <p className="text-body-lg">
          Some pieces are no longer available in the quantity you chose.
        </p>
        <Link href="/bag" className="btn btn-primary">
          Review your bag
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body-sm text-muted">
        Your pieces are reserved for {CHECKOUT_HOLD_MINUTES} minutes while you complete
        your order.
      </p>
      <CheckoutForm />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading checkout" className="animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-72 max-w-full bg-surface" />
        <div className="h-[36rem] bg-surface" />
      </div>
    </div>
  );
}
