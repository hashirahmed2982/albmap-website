"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locales";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(locale: Locale) {
    setIsOpen(false);
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full p-2.5 text-ink-soft transition-colors hover:bg-paper-warm hover:text-primary disabled:opacity-50"
        aria-label={t("label")}
      >
        <Globe size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl bg-surface py-1 shadow-lift">
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => handleSelect(locale)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  locale === currentLocale ? "bg-primary/10 font-medium text-primary" : "text-ink hover:bg-paper-warm"
                }`}
              >
                {t(locale)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
