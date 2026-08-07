"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { getEvents } from "@/lib/event-api";
import { isEventFinished } from "@/lib/format";
import type { EventItem } from "@/lib/types";

type DatePreset = "upcoming" | "today" | "week" | "month" | "custom";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function EventsPage() {
  const t = useTranslations("events");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<DatePreset>("upcoming");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = useMemo((): { from?: string; to?: string } => {
    const today = startOfDay(new Date());
    switch (preset) {
      case "today":
        return { from: today.toISOString(), to: new Date(today.getTime() + 86400000 - 1).toISOString() };
      case "week":
        return { from: today.toISOString(), to: new Date(today.getTime() + 7 * 86400000).toISOString() };
      case "month":
        return {
          from: today.toISOString(),
          to: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString(),
        };
      case "custom":
        return {
          from: customFrom ? new Date(customFrom).toISOString() : undefined,
          to: customTo ? new Date(`${customTo}T23:59:59`).toISOString() : undefined,
        };
      default:
        return {};
    }
  }, [preset, customFrom, customTo]);

  const load = useCallback(() => {
    setIsLoading(true);
    getEvents({ limit: 50, from: range.from, to: range.to })
      .then((res) => setEvents(res.events))
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  // Finished events are never useful in the general browse list — the
  // backend's from/to params only filter by startTime (so an ongoing
  // multi-hour event whose startTime is already in the past wouldn't be
  // excluded by them), so this checks endTime client-side instead, and
  // applies unconditionally regardless of the date-preset filter above.
  // Previously every event ever created stayed visible forever, sorted
  // so the oldest finished ones showed first (backend orders by
  // startTime ASC).
  const visibleEvents = events
    .filter((e) => !isEventFinished(e.endTime))
    .filter((e) => (query.trim() ? e.name.toLowerCase().includes(query.trim().toLowerCase()) : true));

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

        <div className="mt-6 flex items-center gap-2 rounded-full border border-line bg-surface p-1.5">
          <Search size={17} className="ml-3 shrink-0 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            maxLength={100}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-ink-soft"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["upcoming", "today", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${preset === p ? "border-primary bg-primary text-white" : "border-line text-ink-soft"}`}
            >
              {t(`datePreset.${p}`)}
            </button>
          ))}
          <button
            onClick={() => setPreset("custom")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${preset === "custom" ? "border-primary bg-primary text-white" : "border-line text-ink-soft"}`}
          >
            {t("datePreset.custom")}
          </button>
          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-primary"
              />
              <span className="text-xs text-ink-soft">{t("until")}</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-paper-warm" />
              ))}
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-ink-soft">
              <CalendarDays size={28} />
              <p className="text-sm">{t("noEventsFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
