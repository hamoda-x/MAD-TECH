export type ProductCategory =
  | "PC_BUILD"
  | "CPU"
  | "GPU"
  | "RAM"
  | "STORAGE"
  | "MOTHERBOARD"
  | "PSU"
  | "CASE"
  | "COOLING"
  | "PERIPHERAL"
  | "OTHER";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  category: ProductCategory;
  isAvailable: boolean;
  createdAt: string;
}

export type OrderStatus = "PENDING" | "COMPLETED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  totalAmount: number;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
}

export interface ReportsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    itemCount: number;
  }>;
}

export interface CreateOrderResponse {
  orderId: string;
  totalAmount: number;
  whatsappUrl: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  PC_BUILD: "تجميعات PC",
  CPU: "معالجات",
  GPU: "كروت شاشة",
  RAM: "ذاكرة RAM",
  STORAGE: "تخزين",
  MOTHERBOARD: "لوحات أم",
  PSU: "مزودات طاقة",
  CASE: "كيسات",
  COOLING: "تبريد",
  PERIPHERAL: "ملحقات",
  OTHER: "أخرى",
};

export function formatPrice(value: number | string): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return `$${num.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ar-JO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
