"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminLinks = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return <AdminNavLinks current={pathname} />;
}

// Also the Suspense fallback: usePathname suspends below dynamic params such
// as /admin/products/[id], so the links render first without an active state.
export function AdminNavLinks({ current }: { current?: string }) {
  return (
    <nav aria-label="Admin">
      <ul className="flex items-center gap-6">
        {adminLinks.map((link) => {
          const active = current?.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`eyebrow link-reveal ${active ? "text-ink" : "text-muted"}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
