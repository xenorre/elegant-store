import "server-only";

import Stripe from "stripe";

// Use a restricted key (rk_…) with only the permissions checkout needs.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-10-28.endive",
});
