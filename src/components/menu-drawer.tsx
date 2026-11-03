"use client";

import Link from "next/link";
import { useRef } from "react";

import { CloseIcon, MenuIcon } from "@/components/icons";

type MenuDrawerProps = {
  links: { name: string; href: string }[];
};

export function MenuDrawer({ links }: MenuDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="btn btn-ghost -ml-3 [--btn-px:0.75rem]"
        aria-haspopup="dialog"
      >
        <MenuIcon />
        <span className="max-sm:sr-only">Menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Main menu"
        // Clicking the backdrop lands on the dialog element itself.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-md bg-paper text-ink backdrop:bg-overlay"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-header shrink-0 items-center justify-between border-b border-line px-gutter">
            <span className="eyebrow">Menu</span>
            <button
              type="button"
              onClick={close}
              className="btn btn-ghost btn-icon -mr-3"
            >
              <CloseIcon />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Main" className="flex-1 overflow-y-auto px-gutter py-10">
            <ul className="flex flex-col gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="link-reveal font-display text-heading font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 px-gutter py-8 text-body-sm hairline">
            <Link href="/account" onClick={close} className="link-muted">
              My account
            </Link>
            <Link href="/client-services" onClick={close} className="link-muted">
              Client services
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
