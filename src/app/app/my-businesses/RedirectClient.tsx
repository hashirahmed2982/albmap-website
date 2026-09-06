"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Smartphone } from "lucide-react";
import { appDeepLink, ANDROID_PLAY_STORE_URL, IOS_APP_STORE_URL } from "@/lib/app-links";
import { QrCode } from "@/components/QrCode";

/**
 * The business-approval email's "View my businesses" link now points
 * here instead of straight at /dashboard (see albmap-backend's email.js)
 * — this used to always open the website even when the AlbMap app was
 * installed, since a plain https:// link has no way to prefer an app.
 *
 * This page tries the app first via the `albmap://open/my-businesses`
 * custom scheme (handled by the mobile app's DeepLinkService) and only
 * shows the "get the app" fallback below if the browser is still here —
 * i.e. still visible/focused — after a couple seconds, meaning nothing
 * claimed that scheme (app not installed, or a desktop browser that
 * can't have it installed at all). If the OS *did* hand off to the app,
 * this tab backgrounds and the fallback timer is cancelled before it
 * ever fires — the classic "try custom scheme, time out to a store page"
 * pattern used since before Universal Links/App Links existed, sidestepping
 * needing this domain's own apple-app-site-association/assetlinks.json
 * (those need a published app's Team ID/package signing fingerprint,
 * which don't exist yet either).
 */
export function RedirectClient() {
  const t = useTranslations("appDownload");
  const [showFallback, setShowFallback] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return; // StrictMode double-invoke guard
    attempted.current = true;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      // A desktop browser can't have the app installed at all — skip
      // straight to the fallback instead of a pointless multi-second wait.
      setShowFallback(true);
      return;
    }

    const timer = window.setTimeout(() => {
      if (!document.hidden) setShowFallback(true);
    }, 1500);

    // If the OS actually switches to the app, this tab loses visibility
    // before the timer above fires — cancel it so the fallback never
    // flashes on screen for someone who *did* get handed off correctly.
    const onVisibilityChange = () => {
      if (document.hidden) window.clearTimeout(timer);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.location.href = appDeepLink("my-businesses");

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!showFallback) {
    // Between mount and the fallback timer — a bare mobile browser tab
    // mid-handoff, deliberately with no spinner/copy: if this is the
    // instant before the app takes over, there's nothing worth showing.
    return null;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
        <Smartphone size={30} strokeWidth={2.2} />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">{t("subtitle")}</p>

      <div className="mt-8 flex items-center gap-8">
        <a href={ANDROID_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
          <QrCode value={ANDROID_PLAY_STORE_URL} size={140} />
          <span className="text-sm font-medium text-ink">{t("openInStore", { store: "Google Play" })}</span>
        </a>
        <a href={IOS_APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
          <QrCode value={IOS_APP_STORE_URL} size={140} />
          <span className="text-sm font-medium text-ink">{t("openInStore", { store: "App Store" })}</span>
        </a>
      </div>

      <Link href="/dashboard" className="mt-10 text-sm font-medium text-primary hover:underline">
        {t("continueToWebsite")}
      </Link>
    </div>
  );
}
