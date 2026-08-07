import { apiFetch } from "./api";
import type { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch<{ data: Category[] }>("/categories", { skipAuth: true });
  return res.data;
}
