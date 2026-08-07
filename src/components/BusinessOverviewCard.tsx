"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Store, ArrowRight, X } from "lucide-react";
import { categoryColor, resolveMediaUrl } from "@/lib/format";
import type { Business } from "@/lib/types";

/**
 * The quick-info overlay shown when a map marker is clicked — mirrors the
 * mobile app's BusinessMarkerSheet (logo, name, category, rating +
 * distance, arrow through to the full page) as a card anchored to the
 * bottom of the map, rather than Leaflet's own tiny native popup bubble
 * which can't comfortably fit this much content.
 */
export function BusinessOverviewCard({
  business,
  onClose,
}: {
  business: Business;
  onClose: () => void;
}) {
  const accent = categoryColor(business.category);
  const logoUrl = resolveMediaUrl(business.logoUrl);

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-[1000] sm:inset-x-auto sm:left-3 sm:right-3 sm:mx-auto sm:max-w-md">
      <div className="flex items-center gap-3.5 rounded-2xl bg-surface p-4 shadow-lift">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, white)` }}
        >
          {logoUrl ? (
            <Image src={logoUrl} alt={business.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Store size={24} style={{ color: accent }} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-semibold text-ink line-clamp-1">{business.name}</h3>
          <p className="mt-0.5 text-xs text-ink-soft line-clamp-1">{business.category}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
            {business.rating != null && (
              <span className="flex items-center gap-0.5">
                <Star size={12} className="fill-warning text-warning" />
                {business.rating.toFixed(1)}
              </span>
            )}
            {business.distanceKm != null && <span>{business.distanceKm.toFixed(1)} km away</span>}
          </div>
        </div>

        <Link
          href={`/businesses/${business.id}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accent }}
          aria-label={`View ${business.name}`}
        >
          <ArrowRight size={16} />
        </Link>

        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-soft"
          aria-label="Close"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
