import Link from "next/link";

import { BagIcon, SearchIcon, UserIcon } from "@/components/icons";
import { MenuDrawer } from "@/components/menu-drawer";
import { navigation } from "@/lib/catalog";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container-wide grid h-full grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center">
          <MenuDrawer links={navigation} />
          <Link
            href="/search"
            className="btn btn-ghost btn-icon max-md:hidden"
          >
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
          <Link href="/search" className="btn btn-ghost btn-icon md:hidden">
            <SearchIcon />
            <span className="sr-only">Search</span>
          </Link>
          <Link href="/account" className="btn btn-ghost btn-icon max-sm:hidden">
            <UserIcon />
            <span className="sr-only">Account</span>
          </Link>
          <Link href="/bag" className="btn btn-ghost btn-icon">
            <BagIcon />
            <span className="sr-only">Shopping bag, 0 items</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
