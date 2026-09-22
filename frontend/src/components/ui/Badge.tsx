import type { OrderStatus } from "@/types";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/format";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: ORDER_STATUS_COLOR[status] }}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
