import { apiFetch } from "./api";
import type { Business, EventItem } from "./types";

export async function getMyFavorites(): Promise<Business[]> {
  const res = await apiFetch<{ data: Business[] }>("/favorites");
  return res.data;
}

export async function addFavorite(businessId: string): Promise<void> {
  await apiFetch<void>("/favorites", { method: "POST", body: { businessId } });
}

export async function removeFavorite(businessId: string): Promise<void> {
  await apiFetch<void>(`/favorites/${businessId}`, { method: "DELETE" });
}

/**
 * Event favorites — the website only ever had business favorites; events
 * had no favorite/save concept at all. Distinct sub-path (matching the
 * backend's favorites.routes.js), not a second businessId-or-eventId body
 * on the endpoints above.
 */
export async function getMyEventFavorites(): Promise<EventItem[]> {
  const res = await apiFetch<{ data: EventItem[] }>("/favorites/events");
  return res.data;
}

export async function addEventFavorite(eventId: string): Promise<void> {
  await apiFetch<void>("/favorites/events", { method: "POST", body: { eventId } });
}

export async function removeEventFavorite(eventId: string): Promise<void> {
  await apiFetch<void>(`/favorites/events/${eventId}`, { method: "DELETE" });
}
