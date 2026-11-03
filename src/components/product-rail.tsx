"use client";

import { useRef, type ReactNode } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

type ProductRailProps = {
  label: string;
  children: ReactNode;
};

// Horizontal, swipeable product row. Arrow buttons page through it on
// pointer devices; touch users swipe.
export function ProductRail({ label, children }: ProductRailProps) {
  const railRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={railRef}
        aria-label={label}
        className="scroll-rail gap-1 scroll-px-gutter px-gutter"
      >
        {children}
      </ul>
      <div className="container-wide mt-8 flex justify-end gap-2 max-md:hidden">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="btn btn-secondary btn-icon"
        >
          <ArrowLeftIcon />
          <span className="sr-only">Previous products</span>
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="btn btn-secondary btn-icon"
        >
          <ArrowRightIcon />
          <span className="sr-only">Next products</span>
        </button>
      </div>
    </div>
  );
}
