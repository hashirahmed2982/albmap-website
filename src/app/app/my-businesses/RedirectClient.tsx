"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Smartphone } from "lucide-react";
import { appDeepLink, ANDROID_PLAY_STORE_URL, IOS_APP_STORE_URL } from "@/lib/app-links";
import { QrCode } from "@/components/QrCode";

type Status =
  | "trying" // just attempted the albmap:// scheme, waiting to see if it was claimed
  | "redirecting-android" // not claimed, on Android — sending to Google Play
  | "redirecting-ios" // not claimed, on iOS — sending to the App Store
  | "desktop-fallback"; // can't install on this device at all — show both QR codes

const STORE_URL: Record<"redirecting-android" | "redirecting-ios", string> = {
  "redirecting-android": ANDROID_PLAY_STORE_URL,
  "redirecting-ios": IOS_APP_STORE_URL,
};
const STORE_NAME: Record<"redirecting-android" | "redirecting-ios", string> = {
  "redirecting-android": "Google Play",
  "redirecting-ios": "App Store",
};

/**
 * The business-approval email's "View my businesses" link now points
 * here instead of straight at /dashboard (see albmap-backend's email.js)
 * — this used to always open the website even when the AlbMap app was
 * installed, since a plain https:// link has no way to prefer an app.
 *
 * This page tries the app first via the `albmap://open/my-businesses`
 * custom scheme (handled by the mobile app's DeepLinkService) and, if
 * nothing claims it within a couple seconds (app not installed), sends
 * the visitor straight to the store matching their own device — Google
 * Play on Android, the App Store on iOS — rather than making them pick.
 * A desktop visitor can't install either, so they get both QR codes
 * instead (scan-from-your-phone), same as the Footer's copies of these.
 *
 * The "if nothing claims it" detection is the classic pre-Universal-
 * Links pattern: fire the scheme, start a timer, and cancel that timer
 * if the tab loses visibility first (the OS actually handed off to the
 * app) — a still-visible tab once the timer fires means the scheme went
 * unclaimed. Deliberately not a real Universal Link/App Link, which
 * would need this domain's own apple-app-site-association/
 * assetlinks.json signed with a published app's Team ID/package
 * fingerprint — neither exists yet.
 */
export function RedirectClient() {
  const t = useTranslations("appDownload");
  const [status, setStatus] = useState<Status>("trying");

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isAndroid && !isIos) {
      setStatus("desktop-fallback");
      return;
    }

    const fallbackStatus = isAndroid ? "redirecting-android" : "redirecting-ios";

    const timer = window.setTimeout(() => {
      if (!document.hidden) setStatus(fallbackStatus);
    }, 1500);

    // If the OS actually switches to the app, this tab loses visibility
    // before the timer above fires — cancel it so the store redirect
    // never fires underneath someone who *did* get handed off correctly.
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

  // Once a store redirect is decided, actually do it — a plain
  // `window.location.href` assignment (not tied to the user's original
  // tap) is what most mobile browsers still allow for a same-tab
  // navigation, but Safari in particular can decline to honor it without
  // a fresh user gesture, hence the manual "Open in {store}" link below
  // as a fallback that always works.
  useEffect(() => {
    if (status === "redirecting-android" || status === "redirecting-ios") {
      window.location.href = STORE_URL[status];
    }
  }, [status]);

  if (status === "trying") {
    // Between mount and the fallback timer — a bare mobile browser tab
    // mid-handoff, deliberately with no spinner/copy: if this is the
    // instant before the app takes over, there's nothing worth showing.
    return null;
  }

  if (status === "redirecting-android" || status === "redirecting-ios") {
    const store = STORE_NAME[status];
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
          <Smartphone size={30} strokeWidth={2.2} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-2 text-sm text-ink-soft">{t("redirectingToStore", { store })}</p>
        <a
          href={STORE_URL[status]}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          {t("openInStore", { store })}
        </a>
        <Link href="/dashboard" className="mt-6 text-sm font-medium text-primary hover:underline">
          {t("continueToWebsite")}
        </Link>
      </div>
    );
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
