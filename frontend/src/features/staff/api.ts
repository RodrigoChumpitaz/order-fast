import { api, type ApiSuccess } from "@/lib/api";
import type { Order, OrderStatus, PaginationMeta } from "@/types";

export interface StaffOrdersResult {
  orders: Order[];
  meta: PaginationMeta;
}

export async function fetchStaffOrders(
  status: OrderStatus | undefined,
  page: number,
  limit: number,
): Promise<StaffOrdersResult> {
  const { data } = await api.get<ApiSuccess<Order[]>>("/orders", {
    params: { status, page, limit },
  });
  return {
    orders: data.data,
    meta: data.meta ?? { page, limit, total: data.data.length, totalPages: 1 },
  };
}
