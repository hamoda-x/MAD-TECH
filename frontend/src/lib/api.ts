import {
  CreateOrderResponse,
  Order,
  Product,
  ProductCategory,
  ReportsData,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(params?: {
  category?: ProductCategory;
  available?: boolean;
}): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.available) search.set("available", "true");
  const query = search.toString();
  return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  isAvailable: boolean;
}): Promise<Product> {
  return apiFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: ProductCategory;
    isAvailable: boolean;
  }>
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/products/${id}`, { method: "DELETE" });
}

export async function createOrder(
  items: Array<{ id: string; name: string; price: number; quantity: number }>
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "COMPLETED"
): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getReports(): Promise<ReportsData> {
  return apiFetch<ReportsData>("/reports");
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error || `Upload failed: ${response.status}`);
  }

  return response.json();
}
