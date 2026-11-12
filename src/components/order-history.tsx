import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/catalog";
import { getUserOrders, orderReference } from "@/lib/orders";

const dateFormat = new Intl.DateTimeFormat("en-IE", { dateStyle: "long" });

/** Paid orders placed while signed in to this account. */
export async function OrderHistory({ userId }: { userId: string }) {
  const orders = await getUserOrders(userId);

  if (orders.length === 0) {
    return (
      <div className="hairline flex flex-col items-start gap-4 pt-6">
        <p className="text-body-lg text-muted">You haven&apos;t placed any orders yet.</p>
        <Link href="/new-in" className="link text-body-sm">
          Discover new arrivals
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {orders.map((order) => (
        <li key={order.id} className="hairline flex flex-col gap-5 py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="eyebrow">Order {orderReference(order.id)}</h3>
            <p className="text-body-sm text-muted">
              {order.paidAt && (
                <>
                  <time dateTime={order.paidAt.toISOString()}>
                    {dateFormat.format(order.paidAt)}
                  </time>
                  {" · "}
                </>
              )}
              {formatPrice((order.totalCents ?? order.subtotalCents) / 100)}
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4"
              >
                <div className="media">
                  <Image src={item.image} alt="" fill sizes="3.5rem" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-body-sm">
                  {item.productId ? (
                    <Link
                      href={`/products/${item.slug}`}
                      className="hover:underline hover:underline-offset-4"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p>{item.name}</p>
                  )}
                  <p className="text-muted">
                    {[item.size && `Size ${item.size}`, `Qty ${item.quantity}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
