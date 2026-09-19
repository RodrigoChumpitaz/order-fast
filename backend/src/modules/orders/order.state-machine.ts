import { BusinessRuleError } from "../../shared/errors/AppError";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_ACTIONS = ["confirm", "prepare", "markReady", "deliver", "cancel", "refund"] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

const VALID_TRANSITIONS: Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>> = {
  PENDING: { confirm: "CONFIRMED", cancel: "CANCELLED" },
  CONFIRMED: { prepare: "PREPARING", cancel: "CANCELLED" },
  PREPARING: { markReady: "READY", cancel: "CANCELLED" },
  READY: { deliver: "DELIVERED" },
  DELIVERED: { refund: "REFUNDED" },
  CANCELLED: { refund: "REFUNDED" },
  REFUNDED: {},
};

export function validateTransition(current: OrderStatus, action: OrderAction): OrderStatus {
  const next = VALID_TRANSITIONS[current][action];
  if (!next) {
    const allowed = Object.keys(VALID_TRANSITIONS[current]);
    throw new BusinessRuleError(
      `No se puede ejecutar "${action}" desde el estado "${current}". Acciones permitidas: ${
        allowed.length ? allowed.join(", ") : "ninguna (estado terminal)"
      }.`,
    );
  }
  return next;
}

export function isTerminal(status: OrderStatus): boolean {
  return Object.keys(VALID_TRANSITIONS[status]).length === 0;
}

export function canCancel(status: OrderStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED" || status === "PREPARING";
}

const PROGRESS: Record<OrderStatus, number> = {
  PENDING: 10,
  CONFIRMED: 30,
  PREPARING: 60,
  READY: 85,
  DELIVERED: 100,
  CANCELLED: 100,
  REFUNDED: 100,
};

export function getProgress(status: OrderStatus): number {
  return PROGRESS[status];
}
