import { apiFetch } from "./api";
import type { AppNotification } from "./types";

export async function getFeed(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const res = await apiFetch<{ data: AppNotification[]; unreadCount: number }>("/notifications");
  return { notifications: res.data, unreadCount: res.unreadCount };
}

export async function markAsRead(id: string): Promise<void> {
  await apiFetch<void>(`/notifications/${id}/read`, { method: "POST" });
}

export async function markAllAsRead(): Promise<void> {
  await apiFetch<void>("/notifications/read-all", { method: "POST" });
}

export async function submitBroadcast(businessId: string, title: string, body: string): Promise<void> {
  await apiFetch<void>(`/businesses/${businessId}/broadcast`, { method: "POST", body: { title, body } });
}
