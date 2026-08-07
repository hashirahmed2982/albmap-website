"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CalendarDays, Users } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { categoryColor, formatDateTime, resolveMediaUrl } from "@/lib/format";

export function EventCard({ event }: { event: EventItem }) {
  const t = useTranslations("eventDetail");
  const imageUrl = resolveMediaUrl(event.imageUrl);
  const accent = categoryColor(event.category);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl bg-surface shadow-soft transition-transform hover:-translate-y-1"
    >
      <div className="relative h-40 w-full overflow-hidden" style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, white)` }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={event.name} fill className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarDays size={40} style={{ color: accent }} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-ink line-clamp-1">{event.name}</h3>
        <p className="mt-1 text-xs text-ink-soft line-clamp-1">
          {t("hostedBy")} {event.businessName}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: accent }}>
            <CalendarDays size={13} />
            {formatDateTime(event.startTime)}
          </p>
          {!!event.interestCount && event.interestCount > 0 && (
            <p className="flex shrink-0 items-center gap-1 text-xs text-ink-soft">
              <Users size={12} />
              {event.interestCount}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
