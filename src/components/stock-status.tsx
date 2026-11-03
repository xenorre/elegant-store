import { getStockState } from "@/lib/catalog";

type StockStatusProps = {
  quantity: number;
};

const dotClass = {
  "in-stock": "bg-success",
  "low-stock": "bg-sale",
  "sold-out": "bg-subtle",
};

export function StockStatus({ quantity }: StockStatusProps) {
  const state = getStockState(quantity);
  const label =
    state === "in-stock"
      ? "In stock"
      : state === "low-stock"
        ? `Only ${quantity} left`
        : "Sold out";

  return (
    <p className="flex items-center gap-2 text-body-sm">
      <span aria-hidden="true" className={`size-1.5 rounded-pill ${dotClass[state]}`} />
      <span className={state === "low-stock" ? "text-sale" : undefined}>{label}</span>
    </p>
  );
}
