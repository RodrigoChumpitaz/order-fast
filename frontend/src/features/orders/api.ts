import { api, type ApiSuccess } from "@/lib/api";
import type { Order, OrderAction, WaitEstimate } from "@/types";

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await api.get<ApiSuccess<Order>>(`/orders/${id}`);
  return data.data;
}

export async function fetchWaitEstimate(): Promise<WaitEstimate> {
  const { data } = await api.get<ApiSuccess<WaitEstimate>>("/orders/wait-estimate");
  return data.data;
}

export async function transitionOrderStatus(id: string, action: OrderAction): Promise<Order> {
  const { data } = await api.patch<ApiSuccess<Order>>(`/orders/${id}/status`, { action });
  return data.data;
}
