"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Map as MapIcon, List, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BusinessCard } from "@/components/BusinessCard";
import { MapViewClient } from "@/components/MapViewClient";
import { BusinessOverviewCard } from "@/components/BusinessOverviewCard";
import { getBusinesses, searchBusinesses } from "@/lib/business-api";
import { getCategories } from "@/lib/category-api";
import { categoryColor } from "@/lib/format";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/lib/toast-context";
import type { Business, Category } from "@/lib/types";

function BusinessesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("businesses");
  const { showToast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("map");
  const { position: userPosition } = useGeolocation();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState<"distance" | "popularity">("popularity");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setSelectedBusiness(null);
    try {
      if (query.trim()) {
        const res = await searchBusinesses(query.trim());
        setBusinesses(res.businesses);
        // Point the map at the first match rather than leaving it
        // wherever it happened to be (the user's own location, or a
        // previous search) — if you searched for a specific business,
        // seeing it on the map is the point.
        setSearchCenter(
          res.businesses.length > 0 ? [res.businesses[0].latitude, res.businesses[0].longitude] : null,
        );
      } else {
        const res = await getBusinesses({ category: selectedCategory || undefined, sortBy, limit: 50 });
        setBusinesses(res.businesses);
        setSearchCenter(null);
      }
    } catch {
      setBusinesses([]);
      setSearchCenter(null);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedCategory, sortBy]);
  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/businesses${params.toString() ? `?${params.toString()}` : ""}`);
    load();
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {isLoading ? t("loading") : `${businesses.length} ${businesses.length === 1 ? t("foundOne") : t("foundOther")}`}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${view === "list" ? "bg-primary text-white" : "text-ink-soft"}`}
            >
              <List size={15} /> {t("list")}
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${view === "map" ? "bg-primary text-white" : "text-ink-soft"}`}
            >
              <MapIcon size={15} /> {t("map")}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 rounded-full border border-line bg-surface p-1.5">
          <Search size={17} className="ml-3 shrink-0 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            maxLength={100}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-ink-soft"
          />
          <button type="submit" className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            {t("search")}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={15} className="text-ink-soft" />
          <button
            onClick={() => setSelectedCategory("")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${!selectedCategory ? "border-primary bg-primary text-white" : "border-line text-ink-soft"}`}
          >
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name === selectedCategory ? "" : cat.name)}
              className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                borderColor: categoryColor(cat.name),
                backgroundColor: selectedCategory === cat.name ? categoryColor(cat.name) : "transparent",
                color: selectedCategory === cat.name ? "white" : categoryColor(cat.name),
              }}
            >
              {cat.name}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1 rounded-full border border-line p-1 text-xs">
            <button
              onClick={() => setSortBy("popularity")}
              className={`rounded-full px-3 py-1.5 font-medium ${sortBy === "popularity" ? "bg-paper-warm text-ink" : "text-ink-soft"}`}
            >
              {t("popular")}
            </button>
            <button
              onClick={() => setSortBy("distance")}
              className={`rounded-full px-3 py-1.5 font-medium ${sortBy === "distance" ? "bg-paper-warm text-ink" : "text-ink-soft"}`}
            >
              {t("nearest")}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            view === "map" ? (
              <div className="flex h-[70vh] items-center justify-center rounded-2xl bg-paper-warm">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-paper-warm" />
                ))}
              </div>
            )
          ) : view === "map" ? (
            <div className="relative z-0 h-[70vh] overflow-hidden rounded-2xl">
              <MapViewClient
                businesses={businesses}
                center={searchCenter || userPosition || undefined}
                userPosition={userPosition}
                recenterTarget={userPosition}
                onMarkerClick={setSelectedBusiness}
                onLocationUnavailable={(reason) =>
                  showToast(reason === "insecure" ? t("locationInsecure") : t("locationDenied"), "error")
                }
              />
              {selectedBusiness && (
                <BusinessOverviewCard business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
              )}
              {businesses.length === 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
                  <div className="rounded-full bg-surface px-4 py-2 text-xs font-medium text-ink-soft shadow-soft">
                    {t("noBusinessesHereYet")}
                  </div>
                </div>
              )}
            </div>
          ) : businesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line py-20 text-center text-ink-soft">
              {t("noBusinessesFound")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <BusinessesContent />
    </Suspense>
  );
}
