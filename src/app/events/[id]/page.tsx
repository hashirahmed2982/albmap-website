"use client";

import { useEffect, useState, useCallback, use as usePromise } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, MapPin, Share2, Heart, Users, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth-context";
import { getEventById, addInterest, removeInterest } from "@/lib/event-api";
import { addEventFavorite, removeEventFavorite, getMyEventFavorites } from "@/lib/favorites-api";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { categoryColor, formatDateTime, resolveMediaUrl } from "@/lib/format";
import type { EventItem } from "@/lib/types";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const t = useTranslations("eventDetail");
  const { user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingInterest, setIsTogglingInterest] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const e = await getEventById(id);
        setEvent(e);
        if (user) {
          const favs = await getMyEventFavorites().catch(() => []);
          setIsFavorite(favs.some((f) => f.id === id));
        }
      } catch {
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, user]);

  const toggleFavorite = useCallback(async () => {
    if (!user) return;
    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        await removeEventFavorite(id);
        setIsFavorite(false);
      } else {
        await addEventFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("favoriteFailed"), "error");
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [id, isFavorite, user, showToast, t]);

  const toggleInterest = useCallback(async () => {
    if (!user || !event) return;
    setIsTogglingInterest(true);
    try {
      if (event.isInterested) {
        await removeInterest(id);
      } else {
        await addInterest(id);
      }
      // The toggle call itself doesn't return the updated event — refetch
      // so the button/count reflect the new server state, same as the
      // mobile app's EventInterestController.
      const fresh = await getEventById(id);
      setEvent(fresh);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("interestFailed"), "error");
    } finally {
      setIsTogglingInterest(false);
    }
  }, [id, user, event, showToast, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-3xl animate-pulse px-6 py-12">
          <div className="h-64 rounded-2xl bg-paper-warm" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink-soft">{t("notFound")}</div>
      </div>
    );
  }

  const accent = categoryColor(event.category);
  const imageUrl = resolveMediaUrl(event.imageUrl);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="relative h-64 w-full overflow-hidden md:h-80" style={{ backgroundColor: `color-mix(in srgb, ${accent} 15%, white)` }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={event.name} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarDays size={64} style={{ color: accent }} strokeWidth={1.2} />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="-mt-8 rounded-3xl bg-surface p-6 shadow-soft md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{event.name}</h1>
              <Link href={`/businesses/${event.businessId}`} className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
                {t("hostedBy")} {event.businessName}
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {user && (
                <button
                  onClick={toggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`rounded-full border p-3 transition-colors disabled:opacity-60 ${isFavorite ? "border-primary bg-primary/10 text-primary" : "border-line text-ink-soft"}`}
                  aria-label={t("toggleFavorite")}
                >
                  <Heart size={18} className={isFavorite ? "fill-primary" : ""} />
                </button>
              )}
              <button
                onClick={() => navigator.share?.({ title: event.name, url: window.location.href })}
                className="rounded-full border border-line p-3 text-ink-soft hover:bg-paper-warm"
                aria-label={t("share")}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <span
            className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
          >
            {event.category}
          </span>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-paper p-5">
            <CalendarDays size={22} style={{ color: accent }} />
            <div>
              <p className="text-sm font-semibold text-ink">{formatDateTime(event.startTime)}</p>
              <p className="text-xs text-ink-soft">{t("until")} {formatDateTime(event.endTime)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-paper p-5">
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Users size={17} className="text-ink-soft" />
              {t("interestedCount", { count: event.interestCount ?? 0 })}
            </p>
            {user && (
              <button
                onClick={toggleInterest}
                disabled={isTogglingInterest}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  event.isInterested ? "text-white" : "border-line text-ink-soft hover:bg-paper-warm"
                }`}
                style={event.isInterested ? { backgroundColor: accent, borderColor: accent } : undefined}
              >
                {event.isInterested ? <Check size={15} /> : null}
                {event.isInterested ? t("interested") : t("imInterested")}
              </button>
            )}
          </div>

          {event.description && (
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold text-ink">{t("aboutEvent")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{event.description}</p>
            </div>
          )}

          <Link
            href={`/businesses/${event.businessId}`}
            className="mt-8 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lift"
            style={{ backgroundColor: accent }}
          >
            <MapPin size={16} /> {t("viewBusiness")}
          </Link>
        </div>
      </div>
    </div>
  );
}
