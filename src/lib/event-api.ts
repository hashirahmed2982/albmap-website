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
  // Not skipAuth: the backend route is optionalAuth (browsing never
  // *requires* login, so this still works fine with no token at all —
  // apiFetch simply omits the header when getAccessToken() returns null),
  // but a logged-in caller gets isInterested computed for them on each
  // event. Previously this always skipped the auth header, so
  // isInterested came back false even for a user who actually was.
  const res = await apiFetch<{ data: EventItem[]; pagination: Pagination }>(
    `/events?${qs.toString()}`,
  );
  return { events: res.data, pagination: res.pagination };
}

export async function getEventById(id: string): Promise<EventItem> {
  return apiFetch<EventItem>(`/events/${id}`);
}

/**
 * Every event owned by [ownerId], across every business they own,
 * regardless of whether it's already finished — backs "My Events" on the
 * dashboard, same relationship to getEvents as business-api.ts's
 * getMyBusinesses has to getBusinesses.
 */
export async function getMyEvents(ownerId: string): Promise<EventItem[]> {
  const res = await apiFetch<{ data: EventItem[] }>(`/events?ownerId=${ownerId}`);
  return res.data;
}

/**
 * "I'm interested" / RSVP toggle — see the backend's event.routes.js
 * (POST/DELETE /events/:id/interest) and event_interests table. Matches
 * the mobile app's ToggleEventInterestUseCase.
 */
export async function addInterest(eventId: string): Promise<void> {
  await apiFetch<void>(`/events/${eventId}/interest`, { method: "POST" });
}

export async function removeInterest(eventId: string): Promise<void> {
  await apiFetch<void>(`/events/${eventId}/interest`, { method: "DELETE" });
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

/**
 * Owner-only edit — the backend rejects this once the event has already
 * finished (see event.service.js's updateEvent), so a caught ApiError
 * here can legitimately mean "too late to edit," not just a validation
 * failure; show its message as-is rather than a generic fallback.
 */
export async function updateEvent(
  id: string,
  payload: Partial<CreateEventPayload>,
): Promise<EventItem> {
  return apiFetch<EventItem>(`/events/${id}`, { method: "PATCH", body: payload });
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
