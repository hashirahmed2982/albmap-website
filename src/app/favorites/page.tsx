"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, CalendarDays } from "lucide-react";
import { Header } from "@/components/Header";
import { BusinessCard } from "@/components/BusinessCard";
import { EventCard } from "@/components/EventCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getMyFavorites, getMyEventFavorites } from "@/lib/favorites-api";
import type { Business, EventItem } from "@/lib/types";

// Previously businesses-only — events had no favorite/save concept
// anywhere on the website. Tabs mirror the mobile app's Favorites screen.
type Tab = "businesses" | "events";

function FavoritesContent() {
  const t = useTranslations("favorites");
  const [tab, setTab] = useState<Tab>("businesses");
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [eventFavorites, setEventFavorites] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyFavorites().catch(() => []),
      getMyEventFavorites().catch(() => []),
    ])
      .then(([businesses, events]) => {
        setFavorites(businesses);
        setEventFavorites(events);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const itemCount = tab === "businesses" ? favorites.length : eventFavorites.length;

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

        <div className="mt-6 flex items-center gap-1 rounded-full border border-line bg-surface p-1 w-fit">
          <button
            onClick={() => setTab("businesses")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === "businesses" ? "bg-primary text-white" : "text-ink-soft"}`}
          >
            <Heart size={15} /> {t("businesses")} ({favorites.length})
          </button>
          <button
            onClick={() => setTab("events")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === "events" ? "bg-primary text-white" : "text-ink-soft"}`}
          >
            <CalendarDays size={15} /> {t("events")} ({eventFavorites.length})
          </button>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-paper-warm" />
              ))}
            </div>
          ) : itemCount === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-ink-soft">
              {tab === "businesses" ? <Heart size={28} /> : <CalendarDays size={28} />}
              <p className="text-sm">{tab === "businesses" ? t("noneYet") : t("noEventsYet")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tab === "businesses"
                ? favorites.map((b) => <BusinessCard key={b.id} business={b} />)
                : eventFavorites.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
