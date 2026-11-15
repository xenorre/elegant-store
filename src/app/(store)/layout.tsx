import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Storefront chrome. /admin has its own layout in (admin), so it doesn't pay
// for the header's bag lookup.
export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
