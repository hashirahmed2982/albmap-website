"use client";

import { useEffect, useState, use as usePromise } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, MapPin, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { getEventById } from "@/lib/event-api";
import { categoryColor, formatDateTime, resolveMediaUrl } from "@/lib/format";
import type { EventItem } from "@/lib/types";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const t = useTranslations("eventDetail");
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setIsLoading(false));
  }, [id]);

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
            <button
              onClick={() => navigator.share?.({ title: event.name, url: window.location.href })}
              className="shrink-0 rounded-full border border-line p-3 text-ink-soft hover:bg-paper-warm"
              aria-label={t("share")}
            >
              <Share2 size={18} />
            </button>
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
