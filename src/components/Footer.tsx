"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin, Music2 } from "lucide-react";
import { getContent } from "@/lib/content-api";
import type { SocialLinks } from "@/lib/types";

const SOCIAL_ICONS: { key: keyof SocialLinks; Icon: typeof Facebook; label: string }[] = [
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "twitter", Icon: Twitter, label: "Twitter / X" },
  { key: "tiktok", Icon: Music2, label: "TikTok" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
  { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  const t = useTranslations("footer");
  const [social, setSocial] = useState<SocialLinks | null>(null);

  useEffect(() => {
    // Best-effort — a footer decoration failing to load shouldn't show an
    // error anywhere; it just means no social icons render this time.
    getContent()
      .then((content) => setSocial(content.socialLinks))
      .catch(() => {});
  }, []);

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

          {social && (
            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.filter(({ key }) => social[key]).map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={social[key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-ink-soft sm:text-left">
          © {new Date().getFullYear()} AlbMap. {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
