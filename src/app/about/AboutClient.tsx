"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Eye } from "lucide-react";
import { ApiError } from "@/lib/api";
import { getContent } from "@/lib/content-api";
import type { AboutContent } from "@/lib/types";

/**
 * Split out from page.tsx so that file can stay a server component (it
 * exports static `metadata`, which "use client" files can't do) while
 * this part does the actual fetch — tagline/mission/vision are
 * admin-editable content from GET /content, not next-intl strings
 * anymore.
 */
export function AboutClient() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await getContent();
      setAbout(content.aboutUs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded bg-paper-warm" />
        <div className="mt-8 h-20 animate-pulse rounded-2xl bg-paper-warm" />
        <div className="h-20 animate-pulse rounded-2xl bg-paper-warm" />
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-ink-soft">
        <p className="text-sm">{error ?? "Couldn't load this page."}</p>
        <button
          onClick={load}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper-warm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="mt-2 text-ink-soft">{about.tagline}</p>

      <div className="mt-12 space-y-10 text-left">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Target size={18} className="text-primary" /> {about.missionTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{about.missionBody}</p>
        </div>

        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Eye size={18} className="text-primary" /> {about.visionTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{about.visionBody}</p>
        </div>
      </div>
    </>
  );
}
