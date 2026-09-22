import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStaffOrders } from "./api";
import { transitionOrderStatus } from "@/features/orders/api";
import { useOrdersRealtime } from "@/features/orders/useOrdersRealtime";
import { availableActionsForStaff, ORDER_ACTION_LABEL } from "./orderTransitions";
import { useAuth } from "@/auth/AuthProvider";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OrderStatus, Table, UserProfile } from "@/types";

const FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "Pendientes", value: "PENDING" },
  { label: "Confirmados", value: "CONFIRMED" },
  { label: "Preparando", value: "PREPARING" },
  { label: "Listos", value: "READY" },
  { label: "Todos", value: undefined },
];

const PAGE_SIZE = 10;

export function StaffOrdersPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | undefined>("PENDING");
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["staff-orders", status, page],
    queryFn: () => fetchStaffOrders(status, page, PAGE_SIZE),
  });

  function selectStatus(next: OrderStatus | undefined) {
    setStatus(next);
    setPage(1);
  }

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: Parameters<typeof transitionOrderStatus>[1] }) =>
      transitionOrderStatus(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-orders"] }),
  });

  useOrdersRealtime({
    onNewOrder: () => {
      setBanner("Nuevo pedido recibido");
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
    onStatusChanged: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
  });

  useEffect(() => {
    if (!banner) return;
    const timeout = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(timeout);
  }, [banner]);

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Pedidos</h1>
        {banner && (
          <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
            {banner}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => selectStatus(filter.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              status === filter.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-ink"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {ordersQuery.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {ordersQuery.data && ordersQuery.data.orders.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">No hay pedidos en este estado.</p>
      )}

      {ordersQuery.data && ordersQuery.data.orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.data.orders.map((order) => {
                const table = typeof order.table === "object" ? (order.table as Table) : null;
                const customer = typeof order.customer === "object" ? (order.customer as UserProfile) : null;
                const who = customer?.name || customer?.email || order.guestName || "Cliente";
                const actions = availableActionsForStaff(order.status, profile.role);

                return (
                  <tr key={order._id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">#{order._id.slice(-6).toUpperCase()}</p>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-xs text-muted">
                            {item.quantity}× {item.productName}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3 text-muted">
                      {order.type === "DINE_IN" ? `Mesa ${table?.number ?? ""}` : "Para llevar"}
                    </td>
                    <td className="px-4 py-3 text-muted">{who}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {actions.map((action) => (
                          <Button
                            key={action}
                            variant={action === "cancel" ? "danger" : "primary"}
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: order._id, action })}
                          >
                            {ORDER_ACTION_LABEL[action]}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ordersQuery.data && (
        <Pagination
          page={ordersQuery.data.meta.page}
          totalPages={ordersQuery.data.meta.totalPages}
          total={ordersQuery.data.meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
