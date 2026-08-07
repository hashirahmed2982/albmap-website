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

/**
 * Hides this notification from the current user's feed only. Notification
 * rows are shared across every recipient (a broadcast is the exact same
 * row for everyone), so this can never be a real delete of the underlying
 * notification — see the backend's notification_deletes table.
 */
export async function deleteNotification(id: string): Promise<void> {
  await apiFetch<void>(`/notifications/${id}`, { method: "DELETE" });
}

/** "Clear all" — hides every notification currently in the feed. */
export async function deleteAllNotifications(): Promise<void> {
  await apiFetch<void>("/notifications", { method: "DELETE" });
}

export async function submitBroadcast(businessId: string, title: string, body: string): Promise<void> {
  await apiFetch<void>(`/businesses/${businessId}/broadcast`, { method: "POST", body: { title, body } });
}
