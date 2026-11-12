import type { Metadata } from "next";

import { DepartmentLanding } from "@/components/department-landing";

export const metadata: Metadata = {
  title: "Men",
  description: "Men's tailoring, handmade shoes and accessories from Elegant.",
};

export default function MenPage({ searchParams }: PageProps<"/men">) {
  return <DepartmentLanding slug="men" searchParams={searchParams} />;
}
