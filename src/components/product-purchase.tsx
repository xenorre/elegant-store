"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";

import { StockStatus } from "@/components/stock-status";
import { addToBag } from "@/lib/cart-actions";
import type { SizeOption } from "@/lib/catalog";

type ProductPurchaseProps = {
  slug: string;
  /** Size options with per-size stock, or undefined for one-size products. */
  sizes?: SizeOption[];
  /** Total stock across all sizes. */
  stock: number;
};

// Size selection, stock state and add to bag.
export function ProductPurchase({ slug, sizes, stock }: ProductPurchaseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const messageId = useId();

  const selectedSize = sizes?.find((size) => size.label === selected);
  const quantity = selectedSize ? selectedSize.stock : stock;
  const soldOut = stock === 0;

  const handleAddToBag = () => {
    if (sizes && !selectedSize) {
      setMessage({ text: "Please select a size.", error: true });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await addToBag(slug, selectedSize?.label ?? null);
      setMessage(
        result.ok
          ? {
              text: selectedSize
                ? `Added to your bag in size ${selectedSize.label}.`
                : "Added to your bag.",
              error: false,
            }
          : { text: result.error, error: true },
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {sizes && (
        <fieldset disabled={soldOut}>
          <legend className="eyebrow float-left mb-3">
            Size{selectedSize && <span className="text-muted">: {selectedSize.label}</span>}
          </legend>
          <Link href="/client-services/size-guide" className="float-right text-body-sm link">
            Size guide
          </Link>
          <div className="clear-both grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-1">
            {sizes.map((size) => {
              const unavailable = size.stock === 0;
              return (
                <label
                  key={size.label}
                  className={unavailable ? "cursor-not-allowed" : "group cursor-pointer"}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size.label}
                    disabled={unavailable}
                    checked={selected === size.label}
                    onChange={() => {
                      setSelected(size.label);
                      setMessage(null);
                    }}
                    className="peer sr-only"
                  />
                  {/* Sibling (peer) selectors rather than :has(:checked), which
                      Chrome does not always re-evaluate for controlled inputs. */}
                  <span className="flex h-11 items-center justify-center border border-line text-body-sm transition-colors group-hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:text-subtle peer-disabled:line-through">
                    {size.label}
                  </span>
                  {unavailable && <span className="sr-only">, sold out</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {(!sizes || selectedSize || soldOut) && <StockStatus quantity={quantity} />}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToBag}
          disabled={soldOut || pending}
          aria-describedby={message ? messageId : undefined}
          className="btn btn-primary btn-lg btn-block"
        >
          {soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"}
        </button>
        <p
          id={messageId}
          role="status"
          className={`min-h-5 text-body-sm ${message?.error ? "text-danger" : ""}`}
        >
          {message?.text}
          {message && !message.error && (
            <>
              {" "}
              <Link href="/bag" className="link">
                View bag
              </Link>
            </>
          )}
        </p>
        {soldOut && (
          <p className="text-body-sm text-muted">
            This piece is currently unavailable.{" "}
            <Link href="/client-services" className="link text-ink">
              Contact a client advisor
            </Link>{" "}
            to be notified when it returns.
          </p>
        )}
      </div>
    </div>
  );
}
