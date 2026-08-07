"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import {
  getFeed,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/notifications-api";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/lib/types";

// relatedId is the business id for every type the backend currently sends
// (business_offer, business_approved, business_rejected) — see
// notification.service.js. There's no event-related notification yet,
// and 'general' has nothing to deep-link to. Matches the mobile app's
// FcmService/NotificationsScreen tap mapping.
const BUSINESS_LINKED_TYPES = new Set(["business_offer", "business_approved", "business_rejected"]);

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
  const router = useRouter();
  const { showToast } = useToast();
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

  function handleTap(n: AppNotification) {
    handleRead(n.id);
    if (BUSINESS_LINKED_TYPES.has(n.type) && n.relatedId) {
      router.push(`/businesses/${n.relatedId}`);
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllAsRead();
  }

  // Removes just this user's copy from their feed — notification rows are
  // shared across every recipient, so this can never delete it for anyone
  // else (see notifications-api.ts / the backend's notification_deletes
  // table). Optimistic with rollback, same shape as the mobile app.
  async function handleDelete(id: string) {
    const previous = notifications;
    const target = previous.find((n) => n.id === id);
    if (!target) return;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!target.isRead) setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await deleteNotification(id);
    } catch (err) {
      setNotifications(previous);
      if (!target.isRead) setUnreadCount((c) => c + 1);
      showToast(err instanceof ApiError ? err.message : t("deleteFailed"), "error");
    }
  }

  async function handleClearAll() {
    if (notifications.length === 0) return;
    if (!window.confirm(t("clearAllConfirm"))) return;

    const previous = notifications;
    const previousUnread = unreadCount;
    setNotifications([]);
    setUnreadCount(0);

    try {
      await deleteAllNotifications();
    } catch (err) {
      setNotifications(previous);
      setUnreadCount(previousUnread);
      showToast(err instanceof ApiError ? err.message : t("clearAllFailed"), "error");
    }
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
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper-warm"
                >
                  <CheckCheck size={15} /> {t("markAllRead")}
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-error hover:text-error"
              >
                <Trash2 size={15} /> {t("clearAll")}
              </button>
            </div>
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
              <div
                key={n.id}
                className={`flex w-full items-start gap-2 rounded-2xl p-4 transition-colors ${n.isRead ? "bg-surface" : "bg-primary/5"}`}
              >
                <button
                  onClick={() => handleTap(n)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
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
                <button
                  onClick={() => handleDelete(n.id)}
                  aria-label={t("deleteNotification")}
                  title={t("deleteNotification")}
                  className="shrink-0 rounded-full p-1.5 text-ink-soft hover:bg-error/10 hover:text-error"
                >
                  <Trash2 size={15} />
                </button>
              </div>
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
