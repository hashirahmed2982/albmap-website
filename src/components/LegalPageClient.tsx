"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiError } from "@/lib/api";
import { getContent } from "@/lib/content-api";
import { formatDate } from "@/lib/format";
import type { LegalPageContent } from "@/lib/types";

/**
 * Shared client-side content for Privacy Policy and Terms & Conditions —
 * both are "a title plus an ordered list of heading/body sections" from
 * GET /content, admin-edited from the admin portal's Content page. Split
 * out from each route's page.tsx so those can stay server components
 * (they export static `metadata`, which "use client" files can't do).
 *
 * `field` is a plain string, not a `(content) => ...` selector function —
 * a Server Component (page.tsx, no "use client") can't pass a function
 * prop across the RSC boundary into a Client Component. That was the
 * original design here and it broke every real request in production
 * ("Functions cannot be passed directly to Client Components..."),
 * despite `next build` reporting success: these are dynamically
 * server-rendered routes, so the build step lists them but never
 * actually renders/serializes them — only a real request does, which is
 * why this only ever surfaced live, not locally.
 *
 * Section bodies render as plain text with `whitespace-pre-line` so line
 * breaks are preserved (the admin portal's editor describes bullet lists
 * as separate lines starting with "• ") — no Markdown/HTML, matching the
 * mobile app's rendering of the same data.
 */
export function LegalPageClient({
  field,
  fallbackHeading,
}: {
  field: "privacyPolicy" | "termsConditions";
  fallbackHeading: string;
}) {
  const [page, setPage] = useState<LegalPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await getContent();
      setPage(content[field]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this page.");
    } finally {
      setIsLoading(false);
    }
  }, [field]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-paper-warm" />
        ))}
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-ink-soft">
        <p className="text-sm">{error ?? `Couldn't load ${fallbackHeading}.`}</p>
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
      {page.updatedAt && (
        <p className="mt-1 text-sm text-ink-soft">Last updated: {formatDate(page.updatedAt)}</p>
      )}
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
        {page.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-display text-lg font-semibold text-ink">{section.heading}</h2>
            <p className="mt-3 whitespace-pre-line">{section.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
