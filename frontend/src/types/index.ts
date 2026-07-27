export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  isAvailable: boolean;
  createdAt: string;
}

export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

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
  orderNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  totalAmount: number;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
}

export interface ReportsData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    itemCount: number;
    customerName: string | null;
  }>;
  revenueChart: Array<{ name: string; value: number }>;
  ordersChart: Array<{ name: string; value: number }>;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  whatsappUrl: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeDescription: string | null;
  whatsappNumber: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  primaryColor: string | null;
  currency: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { products: number };
}

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
