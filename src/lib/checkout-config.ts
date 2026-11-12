// Checkout settings passed to Stripe. Change them here; nothing else hardcodes
// countries, rates or the hold time.

/** How long a Checkout Session, and the stock it holds, stays open. */
export const CHECKOUT_HOLD_MINUTES = 30;

/** Labels Checkout Sessions so this flow can be compared in the Stripe Dashboard. */
export const CHECKOUT_INTEGRATION_ID = "elegant-embedded-checkout-qhxvmtar";

// EU member states plus the UK, Switzerland and Norway.
export const SHIPPING_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "GB", "CH", "NO",
] as const;

export const SHIPPING_RATES = [
  { name: "Complimentary delivery", amountCents: 0, minDays: 3, maxDays: 5 },
  { name: "Express delivery", amountCents: 2500, minDays: 1, maxDays: 2 },
] as const;
