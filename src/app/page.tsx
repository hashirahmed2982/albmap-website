"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BusinessCard } from "@/components/BusinessCard";
import { EventCard } from "@/components/EventCard";
import { getBusinesses } from "@/lib/business-api";
import { getEvents } from "@/lib/event-api";
import { getCategories } from "@/lib/category-api";
import { categoryColor } from "@/lib/format";
import type { Business, EventItem, Category } from "@/lib/types";

const PIN_CATEGORIES = [
  { color: "var(--color-cat-restaurants)", top: "8%", left: "6%", size: 26 },
  { color: "var(--color-cat-cafes)", top: "58%", left: "3%", size: 22 },
  { color: "var(--color-cat-shops)", top: "18%", left: "92%", size: 30 },
  { color: "var(--color-cat-health)", top: "68%", left: "90%", size: 24 },
  { color: "var(--color-cat-entertainment)", top: "36%", left: "50%", size: 20 },
];

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bizRes, eventRes, catRes] = await Promise.all([
          getBusinesses({ sortBy: "popularity", limit: 6 }),
          getEvents({ limit: 4 }),
          getCategories(),
        ]);
        setBusinesses(bizRes.businesses);
        setEvents(eventRes.events);
        setCategories(catRes);
      } catch {
        // Homepage degrades gracefully to empty sections rather than a hard error —
        // the backend being briefly unreachable shouldn't block the whole page.
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/businesses${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute inset-0">
          {PIN_CATEGORIES.map((pin, i) => (
            <div key={i} className="absolute animate-[float_8s_ease-in-out_infinite]" style={{ top: pin.top, left: pin.left, animationDelay: `${i * 0.5}s` }}>
              <MapPin size={pin.size} style={{ color: pin.color }} fill={pin.color} fillOpacity={0.18} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
            {t("heroTitlePart1")} <span className="text-primary">{t("heroTitlePart2")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">
            {t("heroSubtitle")}
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full bg-surface p-1.5 shadow-lift">
            <Search size={18} className="ml-3 shrink-0 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              maxLength={100}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-ink-soft"
            />
            <button type="submit" className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              {t("search")}
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/businesses?category=${encodeURIComponent(cat.name)}`}
                className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:text-white"
                style={{ borderColor: categoryColor(cat.name) }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = categoryColor(cat.name))}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular businesses */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">{t("popularRightNow")}</h2>
          <Link href="/businesses" className="flex items-center gap-1 text-sm font-medium text-primary">
            {t("seeAll")} <ArrowRight size={15} />
          </Link>
        </div>
        {isLoading ? (
          <SkeletonGrid />
        ) : businesses.length === 0 ? (
          <EmptyState message={t("noBusinessesYet")} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">{t("upcomingEvents")}</h2>
          <Link href="/events" className="flex items-center gap-1 text-sm font-medium text-primary">
            {t("seeAll")} <ArrowRight size={15} />
          </Link>
        </div>
        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : events.length === 0 ? (
          <EmptyState message={t("noEventsRightNow")} icon={<CalendarDays size={28} />} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl bg-paper-warm" />
      ))}
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-ink-soft">
      {icon || <MapPin size={28} />}
      <p className="text-sm">{message}</p>
    </div>
  );
}
