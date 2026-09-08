"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Music2 } from "lucide-react";
import { getContent } from "@/lib/content-api";
import { ANDROID_PLAY_STORE_URL, IOS_APP_STORE_URL } from "@/lib/app-links";
import { QrCode } from "@/components/QrCode";
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

  const navLinks = [
    { href: "/about", label: t("aboutUs") },
    { href: "/contact", label: t("contactUs") },
    { href: "/privacy", label: t("privacyPolicy") },
    { href: "/terms", label: t("termsConditions") },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      {/* A single thin brand-accent line is the only color in an otherwise
          monochrome footer — echoes the app's red without turning the
          whole footer into a colored block. */}
      <div className="h-[3px] bg-primary" />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={32} height={32} />
              <span className="font-display text-xl font-bold text-ink">AlbMap</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{t("copyright")}</p>

            {social && (
              <div className="mt-6 flex items-center gap-3">
                {SOCIAL_ICONS.filter(({ key }) => social[key]).map(({ key, Icon, label }) => (
                  <a
                    key={key}
                    href={social[key]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Site links */}
          <div className="lg:col-span-3">
            <nav className="flex flex-col gap-3 text-sm">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit text-ink-soft transition-colors hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Get the app */}
          <div className="lg:col-span-4">
            <span className="text-sm font-semibold text-ink">{t("getTheApp")}</span>
            <div className="mt-4 flex items-center gap-6">
              <a
                href={ANDROID_PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="border border-line p-2 transition-colors group-hover:border-primary">
                  <QrCode value={ANDROID_PLAY_STORE_URL} size={72} />
                </div>
                <span className="text-xs text-ink-soft">{t("scanAndroid")}</span>
              </a>
              <a
                href={IOS_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="border border-line p-2 transition-colors group-hover:border-primary">
                  <QrCode value={IOS_APP_STORE_URL} size={72} />
                </div>
                <span className="text-xs text-ink-soft">{t("scanIos")}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-6">
          <p className="text-center text-xs text-ink-soft sm:text-left">© {new Date().getFullYear()} AlbMap</p>
        </div>
      </div>
    </footer>
  );
}
