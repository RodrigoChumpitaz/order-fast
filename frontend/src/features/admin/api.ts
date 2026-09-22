import { api, type ApiSuccess } from "@/lib/api";
import type { Category, Product, Table, TableStatus } from "@/types";

export interface CategoryInput {
  name: string;
  order?: number;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await api.post<ApiSuccess<Category>>("/categories", input);
  return data.data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const { data } = await api.patch<ApiSuccess<Category>>(`/categories/${id}`, input);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock?: number | null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiSuccess<Product>>("/products", input);
  return data.data;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const { data } = await api.patch<ApiSuccess<Product>>(`/products/${id}`, input);
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export interface TableInput {
  number: number;
  capacity?: number;
  status?: TableStatus;
}

export async function fetchTables(): Promise<Table[]> {
  const { data } = await api.get<ApiSuccess<Table[]>>("/tables");
  return data.data;
}

export async function createTable(input: TableInput): Promise<Table> {
  const { data } = await api.post<ApiSuccess<Table>>("/tables", input);
  return data.data;
}

export async function updateTable(id: string, input: Partial<TableInput>): Promise<Table> {
  const { data } = await api.patch<ApiSuccess<Table>>(`/tables/${id}`, input);
  return data.data;
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/tables/${id}`);
}

export async function fetchTableQrObjectUrl(id: string): Promise<string> {
  const { data } = await api.get(`/tables/${id}/qr`, { responseType: "blob" });
  return URL.createObjectURL(data as Blob);
}
