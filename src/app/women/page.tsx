import type { Metadata } from "next";

import { DepartmentLanding } from "@/components/department-landing";

export const metadata: Metadata = {
  title: "Women",
  description:
    "Women's ready-to-wear, leather goods, footwear and fine jewellery from Elegant.",
};

export default function WomenPage({ searchParams }: PageProps<"/women">) {
  return <DepartmentLanding slug="women" searchParams={searchParams} />;
}
