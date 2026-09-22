import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrder } from "./api";
import { useOrdersRealtime } from "./useOrdersRealtime";
import { Spinner } from "@/components/ui/Spinner";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, getOrderProgress, ORDER_STATUS_LABEL } from "@/lib/format";
import type { Table } from "@/types";

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
    refetchInterval: 15_000,
  });

  useOrdersRealtime({
    onStatusChanged: (payload) => {
      if (payload.orderId === id) {
        queryClient.invalidateQueries({ queryKey: ["order", id] });
      }
    },
  });

  if (orderQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!orderQuery.data) {
    return <p className="py-24 text-center text-sm text-muted">No encontramos ese pedido.</p>;
  }

  const order = orderQuery.data;
  const progress = getOrderProgress(order.status);
  const table = typeof order.table === "object" ? (order.table as Table) : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Pedido #{order._id.slice(-6).toUpperCase()}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="text-sm text-muted">{order.type === "DINE_IN" ? `Mesa ${table?.number ?? ""}` : "Para recoger"}</p>

      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-1">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm text-muted">
              <span>
                {item.quantity}× {item.productName}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-ink">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-base font-semibold text-ink">Historial</h2>
        {order.statusHistory.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-ink">{ORDER_STATUS_LABEL[entry.status]}</span>
            <span className="text-muted">{new Date(entry.date).toLocaleTimeString("es-PE")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
