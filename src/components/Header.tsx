"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPin, Menu, X, Bell, Heart, User as UserIcon, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { resolveMediaUrl } from "@/lib/format";
import Image from "next/image";

export function Header() {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const t = useTranslations("nav");

  const NAV_LINKS = [
    { href: "/businesses", label: t("discover") },
    { href: "/events", label: t("events") },
  ];

  async function handleLogout() {
    setAccountOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  }

  const avatarUrl = resolveMediaUrl(user?.profileImageUrl);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold text-ink">AlbMap</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname?.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-ink-soft hover:bg-paper-warm hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <LanguageSwitcher />
          {!isLoading && user ? (
            <>
              <Link
                href="/favorites"
                className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-paper-warm hover:text-primary"
                aria-label={t("favorites")}
              >
                <Heart size={19} />
              </Link>
              <Link
                href="/notifications"
                className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-paper-warm hover:text-primary"
                aria-label={t("notifications")}
              >
                <Bell size={19} />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-paper-warm hover:text-primary"
                aria-label={t("myBusinesses")}
              >
                <LayoutDashboard size={19} />
              </Link>

              {/* Account dropdown — Logout used to sit at the bottom of
                  the Profile page, buried under two separate forms. It's
                  a global action independent of whatever page you're on,
                  so it belongs in the persistent header, not scoped
                  inside a specific page's content. */}
              <div className="relative ml-1">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-line py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink hover:bg-paper-warm"
                >
                  <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={user.name} fill className="object-cover" />
                    ) : (
                      <UserIcon size={15} />
                    )}
                  </div>
                  {user.name.split(" ")[0]}
                  <ChevronDown size={14} className="text-ink-soft" />
                </button>

                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl bg-surface py-1 shadow-lift">
                      <Link
                        href="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-ink hover:bg-paper-warm"
                      >
                        {t("profile")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-error hover:bg-error/5"
                      >
                        <LogOut size={14} /> {t("logOut")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            !isLoading && (
              <Link
                href="/login"
                className="ml-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lift"
              >
                {t("logIn")}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-ink"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-surface px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/favorites" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm">
                  {t("favorites")}
                </Link>
                <Link href="/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm">
                  {t("notifications")}
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm">
                  {t("myBusinesses")}
                </Link>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm">
                  {t("profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-error/5"
                >
                  <LogOut size={15} /> {t("logOut")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {t("logIn")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
