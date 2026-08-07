import { apiFetch } from "./api";
import type { EventItem, Pagination } from "./types";

export async function getEvents(params: {
  category?: string;
  businessId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ events: EventItem[]; pagination: Pagination }> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });
  const res = await apiFetch<{ data: EventItem[]; pagination: Pagination }>(
    `/events?${qs.toString()}`,
    { skipAuth: true },
  );
  return { events: res.data, pagination: res.pagination };
}

export async function getEventById(id: string): Promise<EventItem> {
  return apiFetch<EventItem>(`/events/${id}`, { skipAuth: true });
}

export interface CreateEventPayload {
  businessId: string;
  name: string;
  description?: string;
  category?: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
}

export async function createEvent(payload: CreateEventPayload): Promise<EventItem> {
  return apiFetch<EventItem>("/events", { method: "POST", body: payload });
}

export async function uploadEventImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("albmap_access_token") : null;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1"}/events/image`,
    { method: "POST", body: formData, headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) throw new Error("Failed to upload event image");
  const data = await res.json();
  return data.url;
}
