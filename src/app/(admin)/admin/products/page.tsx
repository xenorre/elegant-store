import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { FilterChips } from "@/components/admin/filter-chips";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Table, TableSkeleton, Td, Th } from "@/components/admin/table";
import { isProductStatus, listAdminProducts, productStatuses } from "@/lib/admin/admin-products";
import { formatCents } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <main className="section flex-1">
      <div className="container-wide">
        <AdminPageHeader
          eyebrow="Catalogue"
          title="Products"
          actions={
            <Link href="/admin/products/new" className="btn btn-sm btn-primary">
              New product
            </Link>
          }
        />
        <Suspense fallback={<TableSkeleton label="Loading products" />}>
          <ProductList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ProductList({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  await requireAdmin("/admin/products");
  const params = await searchParams;
  const status = isProductStatus(params.status) ? params.status : undefined;
  const query = typeof params.q === "string" ? params.q : undefined;
  const products = await listAdminProducts({ status, query });

  const hrefFor = (next?: string) => {
    const search = new URLSearchParams();
    if (next) search.set("status", next);
    if (query) search.set("q", query);
    const value = search.toString();
    return value ? `/admin/products?${value}` : "/admin/products";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <FilterChips
          label="Filter by status"
          options={[
            { name: "All", href: hrefFor(), current: !status },
            ...productStatuses.map((value) => ({
              name: value[0].toUpperCase() + value.slice(1),
              href: hrefFor(value),
              current: status === value,
            })),
          ]}
        />
        <form action="/admin/products" className="flex w-full max-w-xs items-end gap-3">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="flex flex-1 flex-col gap-1">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name or slug"
              className="field"
            />
          </label>
          <button type="submit" className="btn btn-sm btn-secondary">
            Search
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="hairline flex flex-col items-start gap-4 pt-6">
          <p className="text-body-lg text-muted">No products match.</p>
          {(status || query) && (
            <Link href="/admin/products" className="link text-body-sm">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <Table caption="Products">
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th className="text-right">Available</Th>
              <Th className="text-right">Price</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <Td>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-4"
                  >
                    <span className="media">
                      <Image src={product.image} alt="" fill sizes="2.5rem" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate group-hover:underline group-hover:underline-offset-4">
                        {product.name}
                      </span>
                      <span className="truncate text-muted">{product.slug}</span>
                    </span>
                  </Link>
                </Td>
                <Td>
                  {product.category}
                  <span className="block text-muted capitalize">{product.department}</span>
                </Td>
                <Td>
                  <StatusPill status={product.status} />
                </Td>
                <Td className="text-right">
                  <span className={product.available === 0 ? "text-sale" : undefined}>
                    {product.available}
                  </span>
                  {product.sizes > 1 && (
                    <span className="block text-muted">{product.sizes} sizes</span>
                  )}
                </Td>
                <Td className="text-right">{formatCents(product.priceCents)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
