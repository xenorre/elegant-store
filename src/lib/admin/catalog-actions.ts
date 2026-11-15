"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { categories, products, stock } from "@/db/schema";
import type { AdminActionResult, AdminFormState } from "@/lib/admin/action-result";
import { isProductStatus, isUuid } from "@/lib/admin/admin-products";
import {
  lines,
  parseCategorySlug,
  parseDepartment,
  parseGallery,
  parseImageUrl,
  parsePriceCents,
  parseSizes,
  parseSlug,
  pgErrorCode,
  required,
  text,
  type Parsed,
} from "@/lib/admin/validation";
import type { ProductStatus } from "@/lib/catalog";
import { assertAdmin } from "@/lib/session";

// Catalogue writes for /admin. Every action checks the role itself, because
// Server Actions can be called directly, then refreshes the storefront caches.
// The proxy's slug list (src/lib/route-slugs.ts) catches up within a minute.

function fieldErrors(fields: Record<string, Parsed<unknown>>) {
  const errors: Record<string, string> = {};
  for (const [name, result] of Object.entries(fields)) {
    if (!result.ok) errors[name] = result.error;
  }
  return errors;
}

const invalid = (errors: Record<string, string>): AdminFormState => ({
  status: "error",
  error: "Please correct the highlighted fields.",
  fieldErrors: errors,
});

/** Creates a product (as a draft) or updates one, from the product form. */
export async function saveProduct(
  _previous: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  await assertAdmin();

  const id = text(form, "id");
  if (id && !isUuid(id)) return { status: "error", error: "This product no longer exists." };

  const categoryId = text(form, "categoryId");
  const fields = {
    name: required(text(form, "name"), "Name"),
    slug: parseSlug(text(form, "slug")),
    categoryId: isUuid(categoryId)
      ? ({ ok: true, value: categoryId } as const)
      : ({ ok: false, error: "Choose a category." } as const),
    department: parseDepartment(text(form, "department")),
    price: parsePriceCents(text(form, "price")),
    detail: required(text(form, "detail"), "Short detail"),
    description: required(text(form, "description"), "Description", 5000),
    image: parseImageUrl(text(form, "image")),
    imageAlt: required(text(form, "imageAlt"), "Image alt text", 300),
    gallery: parseGallery(text(form, "gallery")),
    sizes: id ? ({ ok: true, value: [] } as Parsed<string[]>) : parseSizes(text(form, "sizes")),
  };
  const errors = fieldErrors(fields);
  if (Object.keys(errors).length > 0) return invalid(errors);

  const values = {
    name: fields.name.ok ? fields.name.value : "",
    categoryId,
    department: fields.department.ok ? fields.department.value : "unisex",
    priceCents: fields.price.ok ? fields.price.value : 0,
    detail: fields.detail.ok ? fields.detail.value : "",
    description: fields.description.ok ? fields.description.value : "",
    details: lines(text(form, "details")),
    image: fields.image.ok ? fields.image.value : "",
    imageAlt: fields.imageAlt.ok ? fields.imageAlt.value : "",
    gallery: fields.gallery.ok ? fields.gallery.value : [],
    badge: text(form, "badge") || null,
  };
  const slug = fields.slug.ok ? fields.slug.value : "";
  const newId = crypto.randomUUID();

  try {
    if (id) {
      // Slugs are public URLs, so they can only change while a product is a draft.
      const [updated] = await db
        .update(products)
        .set({
          ...values,
          slug: sql`case when ${products.status} = 'draft' then ${slug} else ${products.slug} end`,
        })
        .where(eq(products.id, id))
        .returning({ id: products.id });
      if (!updated) return { status: "error", error: "This product no longer exists." };
      updateTag("products");
      return { status: "saved", message: "Product saved." };
    }

    const sizes = fields.sizes.ok ? fields.sizes.value : [];
    // New products start with no stock; quantities are added as logged adjustments.
    await db.batch([
      db.insert(products).values({ id: newId, slug, status: "draft", ...values }),
      db.insert(stock).values(
        sizes.length > 0
          ? sizes.map((size, position) => ({ productId: newId, size, quantity: 0, position }))
          : [{ productId: newId, size: null, quantity: 0, position: 0 }],
      ),
    ]);
  } catch (error) {
    const code = pgErrorCode(error);
    if (code === "23505") return invalid({ slug: "Another product already uses this slug." });
    if (code === "23503") return invalid({ categoryId: "That category no longer exists." });
    throw error;
  }

  updateTag("products");
  redirect(`/admin/products/${newId}?created=1`);
}

// Drafts can go live; live products can be archived and restored. Going back
// to draft isn't allowed, since it would reopen the slug for editing.
const transitions: Record<ProductStatus, ProductStatus[]> = {
  draft: ["active", "archived"],
  active: ["archived"],
  archived: ["active"],
};

export async function setProductStatus(id: string, status: ProductStatus): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(id) || !isProductStatus(status)) return { ok: false, error: "Invalid request." };

  const allowedFrom = (Object.keys(transitions) as ProductStatus[]).filter((from) =>
    transitions[from].includes(status),
  );
  if (allowedFrom.length === 0) return { ok: false, error: "This status change isn't possible." };
  const [updated] = await db
    .update(products)
    .set({ status })
    .where(
      and(
        eq(products.id, id),
        sql`${products.status} in (${sql.join(allowedFrom.map((from) => sql`${from}`), sql`, `)})`,
      ),
    )
    .returning({ id: products.id });
  if (!updated) return { ok: false, error: "This status change isn't possible. Refresh the page." };

  updateTag("products");
  return { ok: true };
}

/** Deletes a draft that has never been ordered. Anything else should be archived. */
export async function deleteProduct(id: string): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid request." };

  const [deleted] = await db
    .delete(products)
    .where(
      and(
        eq(products.id, id),
        eq(products.status, "draft"),
        sql`not exists (select 1 from order_items where order_items.product_id = ${products.id})`,
      ),
    )
    .returning({ id: products.id });
  if (!deleted) {
    return { ok: false, error: "Only drafts that have never been ordered can be deleted. Archive it instead." };
  }

  updateTag("products");
  redirect("/admin/products");
}

// Categories ---------------------------------------------------------------

export async function createCategory(
  _previous: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  await assertAdmin();

  const fields = {
    name: required(text(form, "name"), "Name", 80),
    slug: parseCategorySlug(text(form, "slug")),
  };
  const errors = fieldErrors(fields);
  if (Object.keys(errors).length > 0 || !fields.name.ok || !fields.slug.ok) return invalid(errors);

  try {
    await db.insert(categories).values({
      name: fields.name.value,
      slug: fields.slug.value,
      // Added at the end of the catalogue order.
      position: sql`(select coalesce(max(position) + 1, 0) from categories)`,
    });
  } catch (error) {
    if (pgErrorCode(error) === "23505") {
      return invalid({ slug: "Another category already uses this slug." });
    }
    throw error;
  }

  updateTag("products");
  return { status: "saved", message: `Added ${fields.name.value}.` };
}

export async function renameCategory(
  _previous: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  await assertAdmin();

  const id = text(form, "id");
  const name = required(text(form, "name"), "Name", 80);
  if (!isUuid(id)) return { status: "error", error: "This category no longer exists." };
  if (!name.ok) return invalid({ name: name.error });

  await db.update(categories).set({ name: name.value }).where(eq(categories.id, id));
  updateTag("products");
  return { status: "saved", message: "Saved." };
}

/** Moves a category one place earlier or later in the catalogue order. */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid request." };

  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .orderBy(asc(categories.position), asc(categories.name));
  const order = rows.map((row) => row.id);
  const from = order.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= order.length) return { ok: true };

  [order[from], order[to]] = [order[to], order[from]];
  // Renumber everything, which also repairs duplicate positions.
  const [first, ...rest] = order.map((categoryId, position) =>
    db.update(categories).set({ position }).where(eq(categories.id, categoryId)),
  );
  await db.batch([first, ...rest]);

  updateTag("products");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<AdminActionResult> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid request." };

  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (error) {
    // products.category_id is ON DELETE RESTRICT, which raises 23001 rather than 23503.
    const code = pgErrorCode(error);
    if (code === "23001" || code === "23503") {
      return {
        ok: false,
        error: "This category still has products, including archived ones. Move them to another category first.",
      };
    }
    throw error;
  }

  updateTag("products");
  return { ok: true };
}
