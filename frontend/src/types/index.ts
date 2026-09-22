export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export interface UserProfile {
  _id: string;
  supabaseUserId: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string | Category;
  stock: number | null;
  isAvailable: boolean;
  isActive: boolean;
}

export type TableStatus = "FREE" | "OCCUPIED";

export interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
}

export type OrderType = "DINE_IN" | "TAKEAWAY";

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

export interface OrderItem {
  product: string | Product;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  date: string;
  comment: string;
  updatedBy: string | null;
}

export interface Order {
  _id: string;
  customer: string | UserProfile | null;
  guestName: string;
  guestPhone: string;
  type: OrderType;
  table: string | Table | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  pointsEarned: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WaitEstimate {
  activeOrders: number;
  estimatedMinutes: number;
}
