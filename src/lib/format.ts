// Money and date formatting for orders and admin screens. Catalogue prices use
// formatPrice in src/lib/catalog.ts, which rounds to whole euros.

const moneyFormats = new Map<string, Intl.NumberFormat>();

/** Formats an amount in minor units (cents), always with two decimals. */
export function formatCents(cents: number, currency = "eur") {
  const code = currency.toUpperCase();
  let format = moneyFormats.get(code);
  if (!format) {
    format = new Intl.NumberFormat("en-IE", { style: "currency", currency: code });
    moneyFormats.set(code, format);
  }
  return format.format(cents / 100);
}

export const dateFormat = new Intl.DateTimeFormat("en-IE", { dateStyle: "long" });

export const dateTimeFormat = new Intl.DateTimeFormat("en-IE", {
  dateStyle: "medium",
  timeStyle: "short",
});
