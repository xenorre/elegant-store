import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { editorialCollections } from "@/lib/editorial-collections";

// Valid slugs for /collections/[slug] and /products/[slug], used by
// src/proxy.ts to return a real 404 before the page streams. Pages call
// notFound() inside Suspense, which can only produce a 200 with noindex.
//
// Kept in memory for a minute per server instance: new or newly activated
// products can 404 for up to that long, and archived ones keep a 200 page
// (which renders not-found) until it expires. updateTag("products") does not
// reset it, and the proxy has its own module instance, so Server Actions can't.

const TTL_MS = 60_000;

type RouteSlugs = { collections: Set<string>; products: Set<string> };

let cached: { value: RouteSlugs; expires: number } | undefined;
let pending: Promise<RouteSlugs> | undefined;

async function load(): Promise<RouteSlugs> {
  const [categoryRows, productRows] = await Promise.all([
    db.select({ slug: categories.slug }).from(categories),
    db.select({ slug: products.slug }).from(products).where(eq(products.status, "active")),
  ]);
  return {
    collections: new Set([
      ...editorialCollections.map((collection) => collection.slug),
      ...categoryRows.map((row) => row.slug),
    ]),
    products: new Set(productRows.map((row) => row.slug)),
  };
}

/** Known slugs, or null if they couldn't be loaded (callers should fail open). */
export async function getRouteSlugs(): Promise<RouteSlugs | null> {
  if (cached && cached.expires > Date.now()) return cached.value;

  // Share one query between concurrent requests while the cache is cold.
  pending ??= load().finally(() => {
    pending = undefined;
  });
  try {
    const value = await pending;
    cached = { value, expires: Date.now() + TTL_MS };
    return value;
  } catch (error) {
    console.error("Failed to load route slugs", error);
    return null;
  }
}
