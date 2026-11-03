"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ProductImage } from "@/lib/catalog";

type ProductGalleryProps = {
  images: ProductImage[];
};

// Swipeable full-width carousel on mobile and tablet; an editorial grid of
// large images on desktop, with the first image spanning both columns.
export function ProductGallery({ images }: ProductGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    setActive(Math.round(list.scrollLeft / list.clientWidth));
  };

  const goTo = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ left: index * list.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="max-lg:-mx-gutter">
      <ul
        ref={listRef}
        onScroll={onScroll}
        aria-label="Product images"
        className="max-lg:scroll-rail lg:grid lg:grid-cols-2 lg:gap-1"
      >
        {images.map((image, index) => (
          <li
            key={image.src}
            className={`max-lg:w-full ${
              index === 0 || (index === images.length - 1 && index % 2 === 1)
                ? "lg:col-span-2"
                : ""
            }`}
          >
            <div className="media">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={index === 0}
                sizes={
                  index === 0
                    ? "(min-width: 1024px) 60vw, 100vw"
                    : "(min-width: 1024px) 30vw, 100vw"
                }
              />
            </div>
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2 lg:hidden">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goTo(index)}
              aria-current={index === active}
              className="flex h-6 items-center"
            >
              <span
                className={`block h-px w-8 transition-colors ${
                  index === active ? "bg-ink" : "bg-line"
                }`}
              />
              <span className="sr-only">Show image {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
