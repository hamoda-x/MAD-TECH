import {
  CreateOrderResponse,
  Order,
  Product,
  ReportsData,
  StoreSettings,
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
  categoryId?: string;
  available?: boolean;
}): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.categoryId) search.set("categoryId", params.categoryId);
  if (params?.available) search.set("available", "true");
  const query = search.toString();
  return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
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
    categoryId: string;
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

export async function getSettings(): Promise<StoreSettings> {
  return apiFetch<StoreSettings>("/settings");
}

export async function updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
  return apiFetch<StoreSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/settings/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function backupDatabase(): Promise<Blob> {
  const response = await fetch(`${API_BASE}/settings/backup`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error || `Backup failed: ${response.status}`);
  }

  return response.blob();
}

export async function restoreDatabase(backupData: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/settings/backup", {
    method: "POST",
    body: JSON.stringify({ backupData }),
  });
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { products: number };
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export async function createCategory(data: {
  name: string;
  slug: string;
}): Promise<Category> {
  return apiFetch<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: { name: string; slug: string }
): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch(`/categories/${id}`, { method: "DELETE" });
}

export async function transferCategoryProducts(
  sourceCategoryId: string,
  targetCategoryId: string
): Promise<void> {
  await apiFetch("/categories/transfer", {
    method: "POST",
    body: JSON.stringify({ sourceCategoryId, targetCategoryId }),
  });
}
