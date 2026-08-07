import { apiFetch } from "./api";
import type { Business } from "./types";

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
