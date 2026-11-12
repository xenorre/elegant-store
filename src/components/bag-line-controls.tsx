"use client";

import { useId, useState, useTransition } from "react";

import { removeFromBag, updateBagQuantity, type CartActionResult } from "@/lib/cart-actions";

type BagLineControlsProps = {
  lineId: string;
  name: string;
  quantity: number;
  /** Highest quantity the shopper can choose. */
  max: number;
};

export function BagLineControls({ lineId, name, quantity, max }: BagLineControlsProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selectId = useId();
  const errorId = useId();

  const run = (action: () => Promise<CartActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  };

  // Keep the current quantity selectable even if stock has since dropped below it.
  const options = Array.from({ length: Math.max(max, quantity) }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-6">
        <label htmlFor={selectId} className="flex items-center gap-2 text-body-sm text-muted">
          Qty
          <select
            id={selectId}
            value={quantity}
            disabled={pending}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              const next = Number(event.target.value);
              run(() => updateBagQuantity(lineId, next));
            }}
            className="h-9 border border-line bg-paper px-2 text-body-sm text-ink hover:border-ink focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-subtle"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => removeFromBag(lineId))}
          className="link-muted text-body-sm underline underline-offset-4 disabled:text-subtle"
        >
          Remove<span className="sr-only"> {name}</span>
        </button>
      </div>
      <p id={errorId} role="status" className="text-body-sm text-danger empty:hidden">
        {error}
      </p>
    </div>
  );
}
