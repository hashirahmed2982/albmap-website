import { apiFetch } from "./api";
import type { BusinessAnalytics } from "./types";

export async function getBusinessAnalytics(businessId: string): Promise<BusinessAnalytics> {
  return apiFetch<BusinessAnalytics>(`/businesses/${businessId}/analytics`);
}

export async function recordAnalyticsEvent(
  businessId: string,
  type: "profileView" | "websiteClick" | "callClick",
): Promise<void> {
  try {
    await apiFetch<void>(`/businesses/${businessId}/analytics/event`, {
      method: "POST",
      body: { type },
      skipAuth: true,
    });
  } catch {
    // Fire-and-forget, matching the mobile app's recordAnalyticsEvent —
    // never let analytics recording surface an error to the viewer.
  }
}
