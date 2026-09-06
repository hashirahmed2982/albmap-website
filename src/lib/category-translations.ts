"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getCategories, localizedCategoryName } from "./category-api";
import type { Category, Locale } from "./types";

// Module-level cache shared by every component using the hook below —
// most call sites here (BusinessCard, business/event detail pages, ...)
// only have the bare category string stored on the business/event
// record, not the full Category row, so resolving a translation means a
// lookup against the category list. Caching it once avoids every card on
// a page independently re-fetching the same /categories response.
let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

async function loadCategories(): Promise<Category[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = getCategories()
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Resolves a bare category name (the canonical English string stored on
 * businesses.category/events.category) into the current locale's display
 * label — mirrors the mobile app's category_translations.dart
 * localizedCategoryName(), now backed by the admin-managed nameDe/nameSq
 * instead of a hardcoded translation map. Falls back to the raw name
 * while the category list is still loading, or if it's ever a value the
 * list doesn't recognize.
 */
export function useCategoryTranslation() {
  const locale = useLocale() as Locale;
  const [categories, setCategories] = useState<Category[]>(cache ?? []);

  useEffect(() => {
    let cancelled = false;
    loadCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useCallback(
    (name: string) => {
      const match = categories.find((c) => c.name === name);
      return match ? localizedCategoryName(match, locale) : name;
    },
    [categories, locale],
  );
}
