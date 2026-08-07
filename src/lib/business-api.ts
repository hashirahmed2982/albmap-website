import { apiFetch } from "./api";
import type { Business, Pagination } from "./types";

export interface BusinessListResult {
  businesses: Business[];
  pagination: Pagination;
}

export async function getBusinesses(params: {
  category?: string;
  sortBy?: "distance" | "popularity";
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
} = {}): Promise<BusinessListResult> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });
  const res = await apiFetch<{ data: Business[]; pagination: Pagination }>(
    `/businesses?${qs.toString()}`,
    { skipAuth: true },
  );
  return { businesses: res.data, pagination: res.pagination };
}

export async function searchBusinesses(q: string, page = 1): Promise<BusinessListResult> {
  const res = await apiFetch<{ data: Business[]; pagination: Pagination }>(
    `/businesses/search?q=${encodeURIComponent(q)}&page=${page}`,
    { skipAuth: true },
  );
  return { businesses: res.data, pagination: res.pagination };
}

export async function getBusinessById(id: string): Promise<Business> {
  return apiFetch<Business>(`/businesses/${id}`, { skipAuth: true });
}

export async function getMyBusinesses(ownerId: string): Promise<Business[]> {
  const res = await apiFetch<{ data: Business[] }>(`/businesses?ownerId=${ownerId}`);
  return res.data;
}

export interface SubmitBusinessPayload {
  name: string;
  description?: string;
  category: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  whatsappNumber?: string;
  logoUrl?: string;
  openingHours?: Record<string, string>;
  tags?: string[];
  confirmDuplicate?: boolean;
}

export interface DuplicateBusinessError {
  id: string;
  name: string;
  address: string;
  distanceMeters: number;
}

export async function submitBusiness(payload: SubmitBusinessPayload): Promise<Business> {
  return apiFetch<Business>("/businesses", { method: "POST", body: payload });
}

export async function updateBusiness(
  id: string,
  payload: Partial<SubmitBusinessPayload>,
): Promise<Business> {
  return apiFetch<Business>(`/businesses/${id}`, { method: "PATCH", body: payload });
}

export async function uploadLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("logo", file);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("albmap_access_token") : null;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1"}/businesses/logo`,
    { method: "POST", body: formData, headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) throw new Error("Failed to upload logo");
  const data = await res.json();
  return data.url;
}
