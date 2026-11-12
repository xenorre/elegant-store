import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// The root not-found boundary sits outside the (store) layout, so it renders
// the storefront chrome itself.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="section flex-1">
        <div className="container-reading flex flex-col items-start gap-6">
          <p className="eyebrow text-muted">404</p>
          <h1 className="text-heading">This page could not be found</h1>
          <Link href="/" className="btn btn-secondary">
            Back to the store
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
