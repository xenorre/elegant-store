"use client";

import { useState, useTransition } from "react";

import { ConfirmAction } from "@/components/admin/confirm-action";
import { useFormAction } from "@/components/admin/use-form-action";
import { addSize, adjustStock, moveSize, removeSize } from "@/lib/admin/stock-actions";

export type StockRow = {
  id: string;
  size: string | null;
  /** Can still be sold: stock.quantity. */
  quantity: number;
  /** Held by pending checkouts. */
  held: number;
  onHand: number;
};

export function StockPanel({ productId, rows }: { productId: string; rows: StockRow[] }) {
  const oneSize = rows.some((row) => row.size === null);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body-sm text-muted">
        <strong className="font-medium text-ink">Available</strong> can still be sold.{" "}
        <strong className="font-medium text-ink">Held</strong> is reserved by checkouts in progress
        and returns if they expire. Adjust stock by a positive or negative amount; held units are
        never overwritten.
      </p>

      <ul className="flex flex-col">
        {rows.map((row, index) => (
          <StockRowItem
            key={row.id}
            row={row}
            first={index === 0}
            last={index === rows.length - 1}
          />
        ))}
      </ul>

      {!oneSize && <AddSizeForm productId={productId} />}
    </div>
  );
}

function StockRowItem({ row, first, last }: { row: StockRow; first: boolean; last: boolean }) {
  const { state, errors, pending, onSubmit, formRef } = useFormAction(adjustStock, {
    resetOnSave: true,
  });
  const [moveError, setMoveError] = useState<string | null>(null);
  const [moving, startMove] = useTransition();
  const label = row.size ?? "One size";
  const fieldId = `stock-${row.id}`;

  const move = (direction: "up" | "down") => {
    setMoveError(null);
    startMove(async () => {
      const result = await moveSize(row.id, direction);
      if (!result.ok) setMoveError(result.error);
    });
  };

  return (
    <li className="hairline flex flex-col gap-4 py-5 last:border-b last:border-line">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="eyebrow">{label}</h3>
        <dl className="flex gap-6 text-body-sm tabular-nums">
          <div className="flex gap-1.5">
            <dt className="text-muted">Available</dt>
            <dd className={row.quantity === 0 ? "text-sale" : undefined}>{row.quantity}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">Held</dt>
            <dd>{row.held}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">On hand</dt>
            <dd>{row.onHand}</dd>
          </div>
        </dl>
      </div>

      <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-end gap-3" noValidate>
        <input type="hidden" name="stockId" value={row.id} />
        <label className="flex w-24 flex-col gap-1">
          <span className="eyebrow text-muted">Change</span>
          <input
            id={`${fieldId}-delta`}
            name="delta"
            type="number"
            step={1}
            required
            placeholder="+5 / -2"
            aria-invalid={errors.delta ? true : undefined}
            className="field tabular-nums"
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1">
          <span className="eyebrow text-muted">Reason</span>
          <input
            name="reason"
            required
            maxLength={200}
            placeholder="Delivery received, damaged, recount…"
            aria-invalid={errors.reason ? true : undefined}
            className="field"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-secondary" disabled={pending}>
          {pending ? "Saving…" : "Adjust"}
          <span className="sr-only"> {label}</span>
        </button>
      </form>
      <p
        role="status"
        className={`text-body-sm empty:hidden ${state.status === "saved" ? "text-success" : "text-danger"}`}
      >
        {state.status === "saved"
          ? state.message
          : state.status === "error"
            ? [state.error, errors.delta, errors.reason].filter(Boolean).join(" ")
            : null}
      </p>

      {row.size !== null && (
        <div className="flex flex-wrap items-start gap-3">
          <button
            type="button"
            className="link-muted text-body-sm disabled:text-subtle"
            disabled={first || moving}
            onClick={() => move("up")}
          >
            Move up<span className="sr-only"> {label}</span>
          </button>
          <button
            type="button"
            className="link-muted text-body-sm disabled:text-subtle"
            disabled={last || moving}
            onClick={() => move("down")}
          >
            Move down<span className="sr-only"> {label}</span>
          </button>
          <ConfirmAction
            label={
              <>
                Remove size<span className="sr-only"> {label}</span>
              </>
            }
            className="link-muted text-body-sm underline underline-offset-4"
            title={`Remove size ${label}?`}
            description="Shoppers with it in their bag will see it as sold out. Past orders aren't affected. Only sizes with nothing available or held can be removed."
            confirmLabel="Remove size"
            action={() => removeSize(row.id)}
          />
          {moveError && (
            <p role="status" className="text-body-sm text-danger">
              {moveError}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function AddSizeForm({ productId }: { productId: string }) {
  const { state, errors, pending, onSubmit, formRef } = useFormAction(addSize, {
    resetOnSave: true,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex w-40 flex-col gap-1">
          <span className="eyebrow text-muted">New size</span>
          <input
            name="size"
            required
            maxLength={20}
            placeholder="e.g. XL or 42"
            aria-invalid={errors.size ? true : undefined}
            className="field"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-secondary" disabled={pending}>
          {pending ? "Adding…" : "Add size"}
        </button>
      </div>
      <p
        role="status"
        className={`text-body-sm empty:hidden ${state.status === "saved" ? "text-success" : "text-danger"}`}
      >
        {state.status === "saved" ? state.message : state.status === "error" ? state.error : null}
      </p>
    </form>
  );
}
