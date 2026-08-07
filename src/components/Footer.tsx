"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <MapPin size={16} strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-ink">AlbMap</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <Link href="/about" className="hover:text-primary">{t("aboutUs")}</Link>
            <Link href="/contact" className="hover:text-primary">{t("contactUs")}</Link>
            <Link href="/privacy" className="hover:text-primary">{t("privacyPolicy")}</Link>
            <Link href="/terms" className="hover:text-primary">{t("termsConditions")}</Link>
          </nav>
        </div>

        <p className="mt-8 text-center text-xs text-ink-soft sm:text-left">
          © {new Date().getFullYear()} AlbMap. {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
