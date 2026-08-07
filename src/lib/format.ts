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

/**
 * The backend (MySQL, dateStrings:true) returns "YYYY-MM-DD HH:MM:SS" with
 * no timezone marker, always in UTC — a marker-less string parses as
 * *local* time in JS otherwise, silently shifting every displayed time by
 * the device's UTC offset. Appends 'Z' unless the string already carries
 * a zone marker (covers plain ISO 8601 too). Mirrors the mobile app's
 * parseServerDateTime().
 */
export function parseServerDate(iso: string): Date {
  const hasZoneMarker = iso.includes("T") || iso.endsWith("Z");
  return new Date(hasZoneMarker ? iso : `${iso}Z`);
}

export function formatDate(iso: string): string {
  return parseServerDate(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return parseServerDate(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Whether an event's endTime has already passed — port of the mobile
 * app's `e.endTime.isAfter(now)` check in eventsProvider. */
export function isEventFinished(endTime: string, now: Date = new Date()): boolean {
  return parseServerDate(endTime).getTime() <= now.getTime();
}

export function timeAgo(iso: string): string {
  const d = parseServerDate(iso);
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

export type OpenStatus = "open" | "closed" | "unknown";

/**
 * Whether a business is open right now, computed purely from the
 * `openingHours` map already fetched with every business (no extra
 * request) — port of the mobile app's businessOpenStatus(). "unknown"
 * (no hours entered at all) is deliberately distinct from "closed" so
 * callers can omit the badge rather than falsely claim a place is closed.
 */
export function businessOpenStatus(hours: Record<string, string>, now: Date = new Date()): OpenStatus {
  if (Object.keys(hours).length === 0) return "unknown";

  // Date.getDay() is 0 (Sunday)..6 (Saturday); WEEKDAY_ORDER is Mon..Sun.
  const todayKey = WEEKDAY_ORDER[(now.getDay() + 6) % 7];
  const todayRange = hours[todayKey];
  if (!todayRange || !todayRange.includes("-")) return "closed";

  const [openStr, closeStr] = todayRange.split("-");
  const open = parseHHMM(openStr);
  const close = parseHHMM(closeStr);
  if (open == null || close == null) return "closed";

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (close > open) {
    return nowMinutes >= open && nowMinutes < close ? "open" : "closed";
  }
  // Overnight range (e.g. 20:00-02:00): open from `open` through midnight,
  // then again from midnight through `close`.
  return nowMinutes >= open || nowMinutes < close ? "open" : "closed";
}

function parseHHMM(value: string): number | null {
  const parts = value.trim().split(":");
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}