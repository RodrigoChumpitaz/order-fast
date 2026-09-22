import type { OrderStatus } from "@/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount);
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "var(--color-status-pending)",
  CONFIRMED: "var(--color-status-confirmed)",
  PREPARING: "var(--color-status-preparing)",
  READY: "var(--color-status-ready)",
  DELIVERED: "var(--color-status-delivered)",
  CANCELLED: "var(--color-status-cancelled)",
  REFUNDED: "var(--color-status-refunded)",
};

const PROGRESS: Record<OrderStatus, number> = {
  PENDING: 10,
  CONFIRMED: 30,
  PREPARING: 60,
  READY: 85,
  DELIVERED: 100,
  CANCELLED: 100,
  REFUNDED: 100,
};

export function getOrderProgress(status: OrderStatus): number {
  return PROGRESS[status];
}
