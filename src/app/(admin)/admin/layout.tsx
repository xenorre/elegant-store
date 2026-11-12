import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | ELEGANT" },
  robots: { index: false, follow: false },
};

// Admin chrome only. Each page checks requireAdmin() itself inside Suspense,
// and each admin Server Action calls assertAdmin().
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="site-header">
        <div className="container-wide flex h-full items-center justify-between gap-6">
          <div className="flex items-baseline gap-4">
            <Link
              href="/admin"
              className="font-display text-title font-semibold tracking-wide uppercase"
            >
              Elegant
            </Link>
            <span className="eyebrow text-muted">Admin</span>
          </div>
          <div className="flex items-center gap-8">
            <Suspense fallback={<AdminNavLinks />}>
              <AdminNav />
            </Suspense>
            <Link href="/" className="link-muted hidden text-body-sm sm:inline">
              View store
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
