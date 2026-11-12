"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { startCheckout } from "@/lib/checkout-actions";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Stripe's embedded Checkout form. The session is created on mount, never during
// render, so prefetching /checkout doesn't hold any stock.
export function CheckoutForm() {
  const [error, setError] = useState<string | null>(
    stripePromise ? null : "Checkout is unavailable right now.",
  );
  // Shared across Strict Mode's double mount so one visit opens one session.
  const secret = useRef<Promise<string> | null>(null);

  const fetchClientSecret = useCallback(() => {
    secret.current ??= startCheckout().then((result) => {
      if (result.ok) return result.clientSecret;
      setError(result.error);
      throw new Error(result.error);
    });
    return secret.current;
  }, []);

  if (error || !stripePromise) {
    return (
      <div role="alert" className="hairline flex flex-col items-start gap-6 pt-8">
        <p className="text-body-lg">{error}</p>
        <Link href="/bag" className="btn btn-secondary">
          Return to your bag
        </Link>
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout className="min-h-[36rem]" />
    </EmbeddedCheckoutProvider>
  );
}
