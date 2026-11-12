import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FormNotice } from "@/components/auth/form-status";
import { ProductForm } from "@/components/admin/product-form";
import { ProductStatusActions } from "@/components/admin/product-status-actions";
import { StatusPill } from "@/components/admin/status-pill";
import { StockPanel } from "@/components/admin/stock-panel";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/admin-products";
import { dateTimeFormat } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Edit product" };

export default function AdminProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  return (
    <main className="section flex-1">
      <div className="container-wide">
        <Link href="/admin/products" className="link-muted mb-6 inline-block text-body-sm">
          ← All products
        </Link>
        <Suspense fallback={<ProductEditorSkeleton />}>
          <ProductEditor params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ProductEditor({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}`);
  const [product, categories, query] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
    searchParams,
  ]);
  if (!product) notFound();

  return (
    <>
      <div className="mb-10 flex flex-col gap-3">
        <p className="eyebrow text-muted">{product.category.name}</p>
        <h1 className="text-heading">{product.name}</h1>
        {query.created && (
          <div className="mt-2">
            <FormNotice>Draft created. Add stock below, then publish when it&apos;s ready.</FormNotice>
          </div>
        )}
      </div>

      <div className="grid gap-y-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-16">
        <div className="flex flex-col gap-16">
          <section aria-labelledby="stock-heading" className="flex flex-col gap-6">
            <h2 id="stock-heading" className="eyebrow">
              Stock
            </h2>
            <StockPanel
              productId={product.id}
              rows={product.stock.map((row) => ({
                id: row.id,
                size: row.size,
                quantity: row.quantity,
                held: row.held,
                onHand: row.onHand,
              }))}
            />
          </section>

          <section aria-labelledby="details-heading" className="flex flex-col gap-6">
            <h2 id="details-heading" className="eyebrow">
              Details
            </h2>
            <div className="hairline pt-6">
              <ProductForm
                categories={categories}
                product={{
                  id: product.id,
                  slug: product.slug,
                  status: product.status,
                  name: product.name,
                  categoryId: product.categoryId,
                  department: product.department,
                  priceCents: product.priceCents,
                  detail: product.detail,
                  description: product.description,
                  details: product.details,
                  image: product.image,
                  imageAlt: product.imageAlt,
                  gallery: product.gallery,
                  badge: product.badge,
                }}
              />
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="status-heading"
          className="flex flex-col gap-6 self-start lg:sticky lg:top-[calc(var(--header-h)+2rem)]"
        >
          <h2 id="status-heading" className="eyebrow">
            Status
          </h2>
          <dl className="hairline grid grid-cols-[6rem_1fr] gap-x-6 gap-y-3 pt-6 text-body-sm">
            <dt className="text-muted">Status</dt>
            <dd>
              <StatusPill status={product.status} />
            </dd>
            <dt className="text-muted">URL</dt>
            <dd className="break-all">
              {product.status === "active" ? (
                <Link href={`/products/${product.slug}`} className="link">
                  /products/{product.slug}
                </Link>
              ) : (
                <>/products/{product.slug}</>
              )}
            </dd>
            <dt className="text-muted">Updated</dt>
            <dd>
              <time dateTime={product.updatedAt.toISOString()}>
                {dateTimeFormat.format(product.updatedAt)}
              </time>
            </dd>
          </dl>
          <ProductStatusActions id={product.id} status={product.status} />
        </aside>
      </div>
    </>
  );
}

function ProductEditorSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="flex animate-pulse flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-24 bg-surface" />
        <div className="h-10 w-2/3 bg-surface" />
      </div>
      <div className="h-64 w-full bg-surface" />
    </div>
  );
}
