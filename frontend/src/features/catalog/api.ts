import { api, type ApiSuccess } from "@/lib/api";
import type { Category, Product, Table } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiSuccess<Category[]>>("/categories");
  return data.data;
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  const { data } = await api.get<ApiSuccess<Product[]>>("/products", {
    params: categoryId ? { category: categoryId } : undefined,
  });
  return data.data;
}

export async function fetchTableByNumber(number: number): Promise<Table> {
  const { data } = await api.get<ApiSuccess<Table>>(`/tables/by-number/${number}`);
  return data.data;
}
