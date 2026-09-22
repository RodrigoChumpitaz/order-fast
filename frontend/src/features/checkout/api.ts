import { api, type ApiSuccess } from "@/lib/api";
import type { Order, OrderType } from "@/types";

export interface CreateOrderPayload {
  type: OrderType;
  table?: string;
  items: { product: string; quantity: number }[];
  notes?: string;
  guestName?: string;
  guestPhone?: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<ApiSuccess<Order>>("/orders", payload);
  return data.data;
}
