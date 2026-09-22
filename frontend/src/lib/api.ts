import axios, { AxiosError } from "axios";
import { env } from "./env";
import { supabase } from "./supabase";
import type { PaginationMeta } from "@/types";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  campo?: string;
  mensaje?: string;
  [key: string]: unknown;
}

export interface ApiErrorBody {
  success: false;
  error: { message: string; details?: ApiErrorDetail[] };
}

export const api = axios.create({
  baseURL: env.apiBaseUrl,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const body = axiosError.response?.data;
    if (body && !body.success) {
      const firstDetail = body.error.details?.[0]?.mensaje;
      return firstDetail ?? body.error.message;
    }
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}
