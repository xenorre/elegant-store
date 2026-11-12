import type { Metadata } from "next";
import { Suspense } from "react";

import { CategoryList, NewCategoryForm } from "@/components/admin/category-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/table";
import { listAdminCategories } from "@/lib/admin/admin-products";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <main className="section flex-1">
      <div className="container-wide">
        <AdminPageHeader eyebrow="Catalogue" title="Categories" />
        <Suspense fallback={<TableSkeleton rows={5} label="Loading categories" />}>
          <Categories />
        </Suspense>
      </div>
    </main>
  );
}

async function Categories() {
  await requireAdmin("/admin/categories");
  const categories = await listAdminCategories();

  return (
    <div className="grid gap-y-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-16">
      <section aria-labelledby="order-heading" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="order-heading" className="eyebrow">
            Catalogue order
          </h2>
          <p className="text-body-sm text-muted">
            The order of categories on the department pages. Categories with products can&apos;t be
            deleted; move their products first.
          </p>
        </div>
        {categories.length > 0 ? (
          <CategoryList categories={categories} />
        ) : (
          <p className="hairline pt-6 text-body-lg text-muted">No categories yet.</p>
        )}
      </section>

      <section aria-labelledby="new-heading" className="flex flex-col gap-6 self-start">
        <h2 id="new-heading" className="eyebrow">
          New category
        </h2>
        <div className="hairline pt-6">
          <NewCategoryForm />
        </div>
      </section>
    </div>
  );
}
