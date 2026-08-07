"use client";

import { useEffect, useState, useCallback, use as usePromise } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Phone, MessageCircle, Navigation, Star, Heart, Clock, MapPin, CalendarDays } from "lucide-react";
import { Header } from "@/components/Header";
import { EventCard } from "@/components/EventCard";
import { useAuth } from "@/lib/auth-context";
import { getBusinessById } from "@/lib/business-api";
import { addFavorite, removeFavorite, getMyFavorites } from "@/lib/favorites-api";
import { getEvents } from "@/lib/event-api";
import { getBusinessReviews, submitReview } from "@/lib/review-api";
import { recordAnalyticsEvent } from "@/lib/analytics-api";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { categoryColor, collapseOpeningHours, resolveMediaUrl, timeAgo } from "@/lib/format";
import type { Business, EventItem, Review } from "@/lib/types";

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { user } = useAuth();
  const { showToast } = useToast();
  const t = useTranslations("businessDetail");

  const [business, setBusiness] = useState<Business | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [biz, eventRes, reviewRes] = await Promise.all([
          getBusinessById(id),
          getEvents({ businessId: id }),
          getBusinessReviews(id),
        ]);
        setBusiness(biz);
        setEvents(eventRes.events);
        setReviews(reviewRes);
        recordAnalyticsEvent(id, "profileView");

        if (user) {
          const favorites = await getMyFavorites().catch(() => []);
          setIsFavorite(favorites.some((f) => f.id === id));
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, user]);

  const toggleFavorite = useCallback(async () => {
    if (!user) return;
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("favoriteFailed"), "error");
    }
  }, [id, isFavorite, user, showToast, t]);

  const handleReviewSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmittingReview(true);
      try {
        await submitReview(id, reviewRating, reviewComment.trim() || undefined);
        const [biz, reviewRes] = await Promise.all([getBusinessById(id), getBusinessReviews(id)]);
        setBusiness(biz);
        setReviews(reviewRes);
        setReviewComment("");
      } catch (err) {
        // Previously had no catch at all — a failed submission (duplicate
        // review, network error, etc.) silently did nothing, with zero
        // feedback to the user about what happened.
        showToast(err instanceof ApiError ? err.message : t("reviewSubmitFailed"), "error");
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [id, reviewRating, reviewComment, showToast, t],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-4xl animate-pulse px-6 py-12">
          <div className="h-64 rounded-2xl bg-paper-warm" />
          <div className="mt-6 h-8 w-1/2 rounded bg-paper-warm" />
          <div className="mt-3 h-4 w-1/3 rounded bg-paper-warm" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center text-ink-soft">{t("notFound")}</div>
      </div>
    );
  }

  const accent = categoryColor(business.category);
  const logoUrl = resolveMediaUrl(business.logoUrl);
  const hours = collapseOpeningHours(business.openingHours);

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <div className="relative h-64 w-full overflow-hidden md:h-80" style={{ backgroundColor: `color-mix(in srgb, ${accent} 15%, white)` }}>
        {logoUrl ? (
          <Image src={logoUrl} alt={business.name} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin size={64} style={{ color: accent }} strokeWidth={1.2} />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-24">
        <div className="-mt-8 rounded-3xl bg-surface p-6 shadow-soft md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{business.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
                >
                  {business.category}
                </span>
                {business.rating != null && (
                  <span className="flex items-center gap-1 text-sm font-medium text-ink">
                    <Star size={15} className="fill-warning text-warning" />
                    {business.rating.toFixed(1)} ({business.ratingCount})
                  </span>
                )}
              </div>
            </div>
            {user && (
              <button
                onClick={toggleFavorite}
                className={`shrink-0 rounded-full border p-3 transition-colors ${isFavorite ? "border-primary bg-primary/10 text-primary" : "border-line text-ink-soft"}`}
                aria-label={t("toggleFavorite")}
              >
                <Heart size={20} className={isFavorite ? "fill-primary" : ""} />
              </button>
            )}
          </div>

          {business.description && <p className="mt-5 text-sm leading-relaxed text-ink-soft">{business.description}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                onClick={() => recordAnalyticsEvent(id, "callClick")}
                className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm"
              >
                <Phone size={16} /> {t("call")}
              </a>
            )}
            {business.whatsappNumber && (
              <a
                href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-[#25D366] px-5 py-2.5 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/5"
              >
                <MessageCircle size={16} /> {t("whatsapp")}
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordAnalyticsEvent(id, "websiteClick")}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lift"
              style={{ backgroundColor: accent }}
            >
              <Navigation size={16} /> {t("directions")}
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-paper p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                <MapPin size={15} /> {t("address")}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{business.formattedAddress}</p>
            </div>
            <div className="rounded-2xl bg-paper p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                <Clock size={15} /> {t("openingHours")}
              </h3>
              {hours.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">{t("notProvided")}</p>
              ) : (
                <div className="mt-2 space-y-1">
                  {hours.map((h) => (
                    <div key={h.label} className="flex justify-between text-sm">
                      <span className="text-ink-soft">{h.label}</span>
                      <span className="font-medium text-ink">{h.range}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
              <CalendarDays size={20} /> {t("upcomingEvents")}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-ink">{t("reviews")}</h2>

          {user && (
            <form onSubmit={handleReviewSubmit} className="mb-6 rounded-2xl bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setReviewRating(n)}>
                    <Star size={22} className={n <= reviewRating ? "fill-warning text-warning" : "text-line"} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t("reviewPlaceholder")}
                rows={2}
                maxLength={1000}
                className="mt-3 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmittingReview ? t("submitting") : t("submitReview")}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-ink-soft">{t("noReviewsYet")}</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-surface p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{r.userName}</span>
                    <span className="text-xs text-ink-soft">{timeAgo(r.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? "fill-warning text-warning" : "text-line"} />
                    ))}
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
