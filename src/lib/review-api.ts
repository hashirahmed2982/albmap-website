import { apiFetch } from "./api";
import type { Review } from "./types";

export async function getBusinessReviews(businessId: string): Promise<Review[]> {
  const res = await apiFetch<{ data: Review[] }>(`/businesses/${businessId}/reviews`, { skipAuth: true });
  return res.data;
}

export async function submitReview(businessId: string, rating: number, comment?: string): Promise<void> {
  await apiFetch<void>(`/businesses/${businessId}/reviews`, { method: "POST", body: { rating, comment } });
}

export async function deleteReview(businessId: string): Promise<void> {
  await apiFetch<void>(`/businesses/${businessId}/reviews`, { method: "DELETE" });
}
