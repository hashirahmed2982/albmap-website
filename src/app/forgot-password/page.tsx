"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { forgotPassword } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      try {
        await forgotPassword(email);
        setSent(true);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("somethingWrong");
        setError(message);
        showToast(message, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, t, showToast],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lift">
            <MapPin size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold text-ink">AlbMap</span>
        </Link>

        <div className="rounded-3xl bg-surface p-8 shadow-soft">
          <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
          {sent ? (
            <p className="mt-3 text-sm text-ink-soft">{t("checkEmail")}</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink-soft">{t("enterEmail")}</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60"
                >
                  {isSubmitting ? t("sending") : t("sendResetLink")}
                </button>
              </form>
            </>
          )}
          <Link href="/login" className="mt-6 block text-center text-sm font-medium text-primary">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
