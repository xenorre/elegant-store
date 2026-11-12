"use client";

import { ConfirmAction } from "@/components/admin/confirm-action";
import { resolvePendingOrder } from "@/lib/admin/order-actions";

export function ResolveOrderAction({ orderId }: { orderId: string }) {
  return (
    <ConfirmAction
      label="Check Stripe and settle"
      className="btn btn-sm btn-primary"
      title="Settle this checkout?"
      description={
        <>
          If Stripe reports it as paid, the order is marked paid and the customer gets their
          confirmation email. Otherwise the checkout is expired, so it can no longer be paid, and
          its stock is returned.
        </>
      }
      confirmLabel="Settle"
      action={() => resolvePendingOrder(orderId)}
    />
  );
}
