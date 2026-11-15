"use client";

import { ConfirmAction } from "@/components/admin/confirm-action";
import { deleteProduct, setProductStatus } from "@/lib/admin/catalog-actions";
import type { ProductStatus } from "@/lib/catalog";

export function ProductStatusActions({ id, status }: { id: string; status: ProductStatus }) {
  return (
    <div className="flex flex-col items-start gap-3">
      {status === "draft" && (
        <ConfirmAction
          label="Publish"
          className="btn btn-sm btn-primary"
          title="Publish this product?"
          description="It appears in the store straight away, and its URL can no longer be changed. Make sure it has stock if it should be buyable."
          confirmLabel="Publish"
          action={() => setProductStatus(id, "active")}
        />
      )}
      {status === "active" && (
        <ConfirmAction
          label="Archive"
          title="Archive this product?"
          description="It disappears from the store and can't be bought, including from shoppers' bags. Past orders keep their details. You can restore it later."
          confirmLabel="Archive"
          action={() => setProductStatus(id, "archived")}
        />
      )}
      {status === "archived" && (
        <ConfirmAction
          label="Restore"
          title="Restore this product?"
          description="It goes back on sale in the store with its current stock."
          confirmLabel="Restore"
          action={() => setProductStatus(id, "active")}
        />
      )}
      {status === "draft" && (
        <ConfirmAction
          label="Delete draft"
          className="link-muted text-body-sm underline underline-offset-4"
          title="Delete this draft?"
          description="This removes the draft and its sizes permanently."
          confirmLabel="Delete"
          action={() => deleteProduct(id)}
        />
      )}
    </div>
  );
}
