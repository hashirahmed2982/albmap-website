"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/lib/auth-api";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";

function ResetPasswordContent() {
  const t = useTranslations("resetPassword");
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!token) {
        setError(t("invalidToken"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t("passwordsDontMatch"));
        showToast(t("passwordsDontMatch"), "error");
        return;
      }

      setIsSubmitting(true);
      try {
        await resetPassword(token, newPassword);
        setSuccess(true);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("somethingWrong");
        setError(message);
        showToast(message, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, newPassword, confirmPassword, t, showToast],
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
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 size={26} />
              </div>
              <p className="mt-4 text-sm text-ink-soft">{t("success")}</p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lift"
              >
                {t("goToLogin")}
              </Link>
            </div>
          ) : !token ? (
            <p className="text-sm text-error">{t("invalidToken")}</p>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
              <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
                <input
                  type="password"
                  required
                  minLength={6}
                  maxLength={72}
                  placeholder={t("newPassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  type="password"
                  required
                  maxLength={72}
                  placeholder={t("confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60"
                >
                  {isSubmitting ? t("resetting") : t("resetPassword")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
