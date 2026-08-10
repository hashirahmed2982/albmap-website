"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Store, BarChart3, Pencil, CalendarDays } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { getMyBusinesses } from "@/lib/business-api";
import { categoryColor } from "@/lib/format";
import type { Business, BusinessStatus } from "@/lib/types";

const STATUS_STYLES: Record<BusinessStatus, string> = {
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-error/10 text-error",
};

function DashboardContent() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STATUS_LABELS: Record<BusinessStatus, string> = {
    approved: t("approvedStatus"),
    pending: t("pendingReview"),
    rejected: t("rejectedStatus"),
  };

  useEffect(() => {
    if (!user) return;
    getMyBusinesses(user.id)
      .then(setBusinesses)
      .catch(() => setBusinesses([]))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/events/new"
              className="flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper-warm"
            >
              <CalendarDays size={16} /> {t("addEventButton")}
            </Link>
            <Link
              href="/dashboard/businesses/new"
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lift"
            >
              <Plus size={16} /> {t("addBusiness")}
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-paper-warm" />)
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-20 text-ink-soft">
              <Store size={28} />
              <p className="text-sm">{t("noneYet")}</p>
              <Link href="/dashboard/businesses/new" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                {t("addFirst")}
              </Link>
            </div>
          ) : (
            businesses.map((b) => {
              // isActive only ever means something once a listing is
              // approved — pending/rejected were never live to begin
              // with. Without this, an admin deactivating a business gave
              // the owner literally no signal here: it still showed the
              // same green "approved" badge as a normal live listing,
              // even though it had actually been pulled from the public
              // map and search.
              const isDeactivated = b.status === "approved" && b.isActive === false;
              return (
              <div key={b.id} className="rounded-2xl bg-surface p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-ink">{b.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isDeactivated ? "bg-ink-soft/10 text-ink-soft" : STATUS_STYLES[b.status]
                        }`}
                      >
                        {isDeactivated ? t("deactivatedStatus") : STATUS_LABELS[b.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: categoryColor(b.category) }}>{b.category}</p>
                    <p className="mt-1 text-xs text-ink-soft">{b.formattedAddress}</p>
                    {b.status === "pending" && (
                      <p className="mt-2 text-xs text-ink-soft">{t("pendingNote")}</p>
                    )}
                    {b.status === "rejected" && (
                      <p className="mt-2 text-xs text-ink-soft">
                        {/* The admin's own reason is now mandatory on their end
                            (see the admin portal's ConfirmModal) — the generic
                            fallback only ever applies to older rejections from
                            before that requirement existed. Shown as-is, with
                            no label prefix — it's the admin's own written
                            explanation, not a form field that needs naming. */}
                        {b.rejectionReason || t("rejectedNote")}
                      </p>
                    )}
                    {isDeactivated && (
                      <p className="mt-2 text-xs text-ink-soft">
                        {b.deactivationReason || t("deactivatedNote")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/dashboard/businesses/${b.id}/edit`} className="rounded-full border border-line p-2.5 text-ink-soft hover:bg-paper-warm" aria-label="Edit">
                      <Pencil size={15} />
                    </Link>
                    <Link href={`/dashboard/businesses/${b.id}/analytics`} className="rounded-full border border-line p-2.5 text-ink-soft hover:bg-paper-warm" aria-label="Analytics">
                      <BarChart3 size={15} />
                    </Link>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
