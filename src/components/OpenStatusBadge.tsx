"use client";

import { useTranslations } from "next-intl";
import { businessOpenStatus } from "@/lib/format";

/**
 * Small color-coded pill — "Open now" / "Closed" — mirroring the mobile
 * app's OpenStatusBadge. Renders nothing when hours are unknown (no
 * opening hours entered) rather than falsely claiming "closed".
 */
export function OpenStatusBadge({
  openingHours,
  dense = false,
}: {
  openingHours: Record<string, string>;
  dense?: boolean;
}) {
  const t = useTranslations("businessDetail");
  const status = businessOpenStatus(openingHours);
  if (status === "unknown") return null;

  const isOpen = status === "open";
  const color = isOpen ? "var(--color-success)" : "var(--color-error)";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${dense ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, white)`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {isOpen ? t("openNow") : t("closedNow")}
    </span>
  );
}
