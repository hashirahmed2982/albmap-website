"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getFeed, markAsRead, markAllAsRead } from "@/lib/notifications-api";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/lib/types";

function iconColorFor(type: string): string {
  switch (type) {
    case "business_approved": return "var(--color-success)";
    case "business_rejected": return "var(--color-error)";
    case "business_offer": return "var(--color-secondary)";
    default: return "var(--color-primary)";
  }
}

function NotificationsContent() {
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getFeed();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRead(id: string) {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await markAsRead(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllAsRead();
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper-warm"
            >
              <CheckCheck size={15} /> {t("markAllRead")}
            </button>
          )}
        </div>

        <div className="mt-8 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-paper-warm" />)
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-ink-soft">
              <BellOff size={28} />
              <p className="text-sm">{t("noneYet")}</p>
            </div>
          ) : (
            notifications.map((n) => (
              // n.title/n.body are the business owner's own authored broadcast
              // text (or a system notice) — real user-generated content from
              // the backend, not UI chrome, so deliberately left untranslated
              // here, same as the mobile app.
              <button
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-colors ${n.isRead ? "bg-surface" : "bg-primary/5"}`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${iconColorFor(n.type)} 14%, white)` }}
                >
                  <Bell size={16} style={{ color: iconColorFor(n.type) }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft line-clamp-2">
                    {n.businessName ? `${n.businessName} · ${n.body}` : n.body}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
