"use client";

import { useState, useEffect, useCallback, use as usePromise } from "react";
import { useTranslations } from "next-intl";
import { Eye, MousePointerClick, Phone, Heart, Send } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getBusinessAnalytics } from "@/lib/analytics-api";
import { submitBroadcast } from "@/lib/notifications-api";
import { getBusinessById } from "@/lib/business-api";
import { ApiError } from "@/lib/api";
import type { Business, BusinessAnalytics } from "@/lib/types";

function AnalyticsContent({ id }: { id: string }) {
  const t = useTranslations("analytics");
  const [business, setBusiness] = useState<Business | null>(null);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getBusinessById(id), getBusinessAnalytics(id)])
      .then(([biz, stats]) => {
        setBusiness(biz);
        setAnalytics(stats);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);
      setSendResult(null);
      try {
        await submitBroadcast(id, title, body);
        setSendResult(t("submittedForReview"));
        setTitle("");
        setBody("");
      } catch (err) {
        setSendResult(err instanceof ApiError ? err.message : t("submitFailed"));
      } finally {
        setIsSending(false);
      }
    },
    [id, title, body, t],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-3xl animate-pulse px-6 py-12">
          <div className="h-8 w-1/3 rounded bg-paper-warm" />
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(...(analytics?.last7DaysProfileClicks || [1]), 1);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">{business?.name}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Eye size={18} />} label={t("profileClicks")} value={analytics?.profileClicks ?? 0} />
          <StatCard icon={<MousePointerClick size={18} />} label={t("websiteClicks")} value={analytics?.websiteClicks ?? 0} />
          <StatCard icon={<Phone size={18} />} label={t("callClicks")} value={analytics?.callClicks ?? 0} />
          <StatCard icon={<Heart size={18} />} label={t("favorites")} value={analytics?.favoriteCount ?? 0} />
        </div>

        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-soft">
          <h2 className="font-display text-sm font-semibold text-ink">{t("last7Days")}</h2>
          <div className="mt-4 flex h-32 items-end gap-2">
            {(analytics?.last7DaysProfileClicks || []).map((count, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-primary/70"
                  style={{ height: `${Math.max((count / maxDaily) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-ink-soft">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-soft">
          <h2 className="font-display text-sm font-semibold text-ink">{t("sendOffer")}</h2>
          <p className="mt-1 text-xs text-ink-soft">{t("sendOfferHelp")}</p>
          {sendResult && <p className="mt-3 text-sm text-primary">{sendResult}</p>}
          <form onSubmit={handleSend} className="mt-4 space-y-3">
            <input
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <textarea
              required
              maxLength={500}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("messagePlaceholder")}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Send size={15} /> {isSending ? t("sending") : t("sendNotification")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-soft">
      <div className="text-primary">{icon}</div>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  return (
    <ProtectedRoute>
      <AnalyticsContent id={id} />
    </ProtectedRoute>
  );
}
