import type { Department, ProductImage } from "@/lib/catalog";
import { editorialCollections } from "@/lib/editorial-collections";

// Hand-rolled parsing for admin forms. Each parser returns the value or an
// error message for that field.

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const departmentOptions = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
] as const satisfies { value: Department; label: string }[];

export function text(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function required(value: string, label: string, max = 200): Parsed<string> {
  if (!value) return { ok: false, error: `${label} is required.` };
  if (value.length > max) return { ok: false, error: `${label} is too long.` };
  return { ok: true, value };
}

export function parseSlug(value: string): Parsed<string> {
  if (!value) return { ok: false, error: "Slug is required." };
  if (value.length > 100 || !SLUG.test(value)) {
    return { ok: false, error: "Use lowercase letters, numbers and single hyphens." };
  }
  return { ok: true, value };
}

/** Category slugs share /collections/[slug] with editorial collections. */
export function parseCategorySlug(value: string): Parsed<string> {
  const slug = parseSlug(value);
  if (slug.ok && editorialCollections.some((collection) => collection.slug === slug.value)) {
    return { ok: false, error: "An editorial collection already uses this slug." };
  }
  return slug;
}

/** A price in euros, such as "1250" or "89.50", as integer cents. */
export function parsePriceCents(value: string): Parsed<number> {
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(value)) {
    return { ok: false, error: "Enter a price in euros, such as 1250 or 89.50." };
  }
  return { ok: true, value: Math.round(Number(value.replace(",", ".")) * 100) };
}

export function parseDepartment(value: string): Parsed<Department> {
  const match = departmentOptions.find((option) => option.value === value);
  return match ? { ok: true, value: match.value } : { ok: false, error: "Choose a department." };
}

// next.config.ts only allows Unsplash photos through next/image.
export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "images.unsplash.com" &&
      url.pathname.startsWith("/photo-")
    );
  } catch {
    return false;
  }
}

export function parseImageUrl(value: string): Parsed<string> {
  if (!value) return { ok: false, error: "Image URL is required." };
  return isAllowedImageUrl(value)
    ? { ok: true, value }
    : { ok: false, error: "Use an https://images.unsplash.com/photo-… URL." };
}

/** One item per line; blank lines are dropped. */
export function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** One image per line, written as "URL | alt text". */
export function parseGallery(value: string): Parsed<ProductImage[]> {
  const images: ProductImage[] = [];
  for (const [index, line] of lines(value).entries()) {
    const [src = "", ...alt] = line.split("|").map((part) => part.trim());
    if (!isAllowedImageUrl(src)) {
      return { ok: false, error: `Line ${index + 1}: use an https://images.unsplash.com/photo-… URL.` };
    }
    const altText = alt.join("|").trim();
    if (!altText) return { ok: false, error: `Line ${index + 1}: add alt text after a "|".` };
    images.push({ src, alt: altText });
  }
  return { ok: true, value: images };
}

export function formatGallery(images: ProductImage[]) {
  return images.map((image) => `${image.src} | ${image.alt}`).join("\n");
}

/** Comma-separated size labels; none means a one-size product. */
export function parseSizes(value: string): Parsed<string[]> {
  const sizes = value
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
  if (new Set(sizes.map((size) => size.toLowerCase())).size !== sizes.length) {
    return { ok: false, error: "Each size must be listed once." };
  }
  if (sizes.some((size) => size.length > 20)) {
    return { ok: false, error: "Size labels must be 20 characters or fewer." };
  }
  return { ok: true, value: sizes };
}

/** Postgres error code from a failed query, e.g. "23505" for a unique violation. */
export function pgErrorCode(error: unknown): string | undefined {
  for (let current = error; current instanceof Object; ) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}
