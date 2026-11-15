import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/lib/admin/admin-products";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <main className="section flex-1">
      <div className="container-reading">
        <Link href="/admin/products" className="link-muted mb-6 inline-block text-body-sm">
          ← All products
        </Link>
        <AdminPageHeader eyebrow="Catalogue" title="New product" />
        <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse bg-surface" />}>
          <NewProductForm />
        </Suspense>
      </div>
    </main>
  );
}

async function NewProductForm() {
  await requireAdmin("/admin/products/new");
  const categories = await listAdminCategories();

  if (categories.length === 0) {
    return (
      <div className="hairline flex flex-col items-start gap-4 pt-6">
        <p className="text-body-lg text-muted">Add a category before creating products.</p>
        <Link href="/admin/categories" className="link text-body-sm">
          Manage categories
        </Link>
      </div>
    );
  }

  return (
    <div className="hairline pt-6">
      <p className="mb-8 text-body-sm text-muted">
        New products are saved as drafts and stay hidden from the store until you publish them.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
