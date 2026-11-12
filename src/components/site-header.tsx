import Link from "next/link";
import { Suspense } from "react";

import { BagIcon, SearchIcon, UserIcon } from "@/components/icons";
import { MenuDrawer } from "@/components/menu-drawer";
import { getCart } from "@/lib/cart";
import { navigation } from "@/lib/catalog";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container-wide grid h-full grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center">
          <MenuDrawer links={navigation} />
          <Link href="/search" className="btn btn-ghost btn-icon">
            <SearchIcon />
            <span className="sr-only">Search</span>
          </Link>
        </div>

        <Link
          href="/"
          className="font-display text-title font-semibold tracking-wide uppercase lg:text-heading"
        >
          Elegant
        </Link>

        <div className="-mr-3 flex items-center justify-end">
          <Link href="/account" className="btn btn-ghost btn-icon">
            <UserIcon />
            <span className="sr-only">Account</span>
          </Link>
          <Suspense fallback={<BagLink count={0} />}>
            <BagCount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

// Reads the bag cookie, so it streams in behind Suspense.
async function BagCount() {
  const { count } = await getCart();
  return <BagLink count={count} />;
}

function BagLink({ count }: { count: number }) {
  return (
    <Link href="/bag" className="btn btn-ghost btn-icon relative">
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-1.5 flex size-4 items-center justify-center rounded-pill bg-ink text-[0.625rem] leading-none text-paper tabular-nums"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
      <span className="sr-only">
        Shopping bag, {count} {count === 1 ? "item" : "items"}
      </span>
    </Link>
  );
}
