"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Store } from "lucide-react";
import type { Business } from "@/lib/types";
import { categoryColor, resolveMediaUrl } from "@/lib/format";

export function BusinessCard({ business }: { business: Business }) {
  const logoUrl = resolveMediaUrl(business.logoUrl);
  const accent = categoryColor(business.category);

  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group block overflow-hidden rounded-2xl bg-surface shadow-soft transition-transform hover:-translate-y-1"
    >
      <div className="relative h-40 w-full overflow-hidden" style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, white)` }}>
        {logoUrl ? (
          <Image src={logoUrl} alt={business.name} fill className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store size={40} style={{ color: accent }} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-ink line-clamp-1">{business.name}</h3>
          {business.rating != null && (
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star size={14} className="fill-warning text-warning" />
              <span className="font-medium text-ink">{business.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <span
          className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
        >
          {business.category}
        </span>
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-soft">
          <MapPin size={12} />
          <span className="line-clamp-1">{business.city}</span>
          {business.distanceKm != null && <span>· {business.distanceKm.toFixed(1)} km</span>}
        </p>
      </div>
    </Link>
  );
}
