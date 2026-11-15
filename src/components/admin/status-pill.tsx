import type { OrderStatus } from "@/db/schema";
import type { ProductStatus } from "@/lib/catalog";

type Status = OrderStatus | ProductStatus | "stuck";

// A dot and a label, like StockStatus on product pages.
const styles: Record<Status, { label: string; dot: string; text?: string }> = {
  draft: { label: "Draft", dot: "bg-subtle", text: "text-muted" },
  active: { label: "Active", dot: "bg-success" },
  archived: { label: "Archived", dot: "bg-subtle", text: "text-muted" },
  pending: { label: "Pending", dot: "bg-muted" },
  paid: { label: "Paid", dot: "bg-success" },
  payment_failed: { label: "Payment failed", dot: "bg-danger", text: "text-danger" },
  expired: { label: "Expired", dot: "bg-subtle", text: "text-muted" },
  stuck: { label: "Stuck hold", dot: "bg-sale", text: "text-sale" },
};

export function statusLabel(status: Status) {
  return styles[status].label;
}

export function StatusPill({ status }: { status: Status }) {
  const style = styles[status];
  return (
    <span className="inline-flex items-center gap-2 text-body-sm whitespace-nowrap">
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-pill ${style.dot}`} />
      <span className={style.text}>{style.label}</span>
    </span>
  );
}
