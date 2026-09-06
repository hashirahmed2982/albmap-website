import { apiFetch } from "./api";
import type { Category, Locale } from "./types";

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch<{ data: Category[] }>("/categories", { skipAuth: true });
  return res.data;
}

/**
 * Picks a category's display label for the given locale — mirrors the
 * mobile app's CategoryVisuals.translatedName()/localizedCategoryName().
 * `name` (English) is always present and is what businesses.category/
 * events.category actually store and filter by; nameDe/nameSq are
 * display-only translations, so this only ever changes what's *shown*,
 * never the value used for filtering/storage.
 */
export function localizedCategoryName(category: Pick<Category, "name" | "nameDe" | "nameSq">, locale: Locale): string {
  if (locale === "de") return category.nameDe?.trim() || category.name;
  if (locale === "sq") return category.nameSq?.trim() || category.name;
  return category.name;
}
