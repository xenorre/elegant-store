import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Storefront chrome, kept out of the root layout so other sections of the app
// can have their own.
export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
