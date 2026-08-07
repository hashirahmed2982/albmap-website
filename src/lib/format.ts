/**
 * Safely coerces a business's lat/lng into a real [number, number] pair
 * usable by Leaflet, or null if either value isn't actually a valid
 * coordinate. This matters because a plain JS array like [undefined,
 * undefined] or ["41.33", "19.82"] is still *truthy* — a naive
 * `business ? [business.latitude, business.longitude] : null` check
 * happily passes broken values through, and Leaflet's setView()/Marker
 * positioning then silently no-ops or misplaces rather than throwing a
 * visible error. Two real-world causes this guards against: (1) MySQL's
 * DECIMAL columns are returned as strings by the mysql2 driver unless
 * explicitly cast, so latitude/longitude can arrive as "41.33" instead
 * of the number 41.33; (2) a business genuinely missing coordinates.
 */
export function safeLatLng(lat: unknown, lng: unknown): [number, number] | null {
  const latNum = typeof lat === "number" ? lat : parseFloat(String(lat));
  const lngNum = typeof lng === "number" ? lng : parseFloat(String(lng));
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
  return [latNum, lngNum];
}

const CATEGORY_COLORS: Record<string, string> = {
  Restaurants: "var(--color-cat-restaurants)",
  Cafes: "var(--color-cat-cafes)",
  Shops: "var(--color-cat-shops)",
  Services: "var(--color-cat-services)",
  Health: "var(--color-cat-health)",
  Entertainment: "var(--color-cat-entertainment)",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "var(--color-primary)";
}

export function formatDate(iso: string): string {
  const d = new Date(iso.includes("T") || iso.endsWith("Z") ? iso : `${iso}Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso.includes("T") || iso.endsWith("Z") ? iso : `${iso}Z`);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const d = new Date(iso.includes("T") || iso.endsWith("Z") ? iso : `${iso}Z`);
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Collapses consecutive identical ranges, e.g. "Mon-Fri: 09:00-18:00" — mirrors the mobile app's OpeningHoursDisplay. */
export function collapseOpeningHours(hours: Record<string, string>): { label: string; range: string }[] {
  const ordered = WEEKDAY_ORDER.filter((day) => hours[day]).map((day) => ({ day, range: hours[day] }));
  if (ordered.length === 0) return [];

  const result: { label: string; range: string }[] = [];
  let i = 0;
  while (i < ordered.length) {
    let j = i;
    while (j + 1 < ordered.length && ordered[j + 1].range === ordered[i].range) j++;
    const label = i === j ? ordered[i].day : `${ordered[i].day}-${ordered[j].day}`;
    result.push({ label, range: ordered[i].range });
    i = j + 1;
  }
  return result;
}

/** Resolves an uploaded relative path ("/uploads/xxx.png") to a full URL — same principle as the mobile app's AppConstants.resolveMediaUrl. */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1";
  const origin = apiBase.endsWith("/v1") ? apiBase.slice(0, -3) : apiBase;
  return path.startsWith("/uploads/") ? `${origin}${path}` : path;
}