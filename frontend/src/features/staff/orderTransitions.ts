import type { OrderAction, OrderStatus, Role } from "@/types";

export const ORDER_ACTION_LABEL: Record<OrderAction, string> = {
  confirm: "Confirmar",
  prepare: "Preparar",
  markReady: "Marcar listo",
  deliver: "Entregar",
  cancel: "Cancelar",
  refund: "Reembolsar",
};

const VALID_TRANSITIONS: Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>> = {
  PENDING: { confirm: "CONFIRMED", cancel: "CANCELLED" },
  CONFIRMED: { prepare: "PREPARING", cancel: "CANCELLED" },
  PREPARING: { markReady: "READY", cancel: "CANCELLED" },
  READY: { deliver: "DELIVERED" },
  DELIVERED: { refund: "REFUNDED" },
  CANCELLED: { refund: "REFUNDED" },
  REFUNDED: {},
};

const ACTION_ROLES: Partial<Record<OrderAction, Role[]>> = {
  confirm: ["STAFF", "ADMIN"],
  prepare: ["STAFF", "ADMIN"],
  markReady: ["STAFF", "ADMIN"],
  deliver: ["STAFF", "ADMIN"],
  cancel: ["STAFF", "ADMIN"],
  refund: ["ADMIN"],
};

export function availableActionsForStaff(status: OrderStatus, role: Role): OrderAction[] {
  const transitions = VALID_TRANSITIONS[status];
  return (Object.keys(transitions) as OrderAction[]).filter((action) => ACTION_ROLES[action]?.includes(role));
}
