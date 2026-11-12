import type { Metadata } from "next";

import { ProductListing } from "@/components/product-listing";
import { getNewArrivals } from "@/lib/products";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "The latest ready-to-wear, leather goods and fine jewellery from Elegant.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <main className="flex-1">
      <ProductListing
        eyebrow="Just In"
        title="New Arrivals"
        intro="The latest pieces from our ateliers, as they arrive."
        products={products}
        emptyMessage="New pieces are on their way. Please check back soon."
      />
    </main>
  );
}
