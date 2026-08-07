"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { FacebookSignInButton } from "@/components/FacebookSignInButton";

const PIN_CATEGORIES = [
  { color: "var(--color-cat-restaurants)", top: "12%", left: "18%", delay: 0 },
  { color: "var(--color-cat-cafes)", top: "62%", left: "10%", delay: 0.4 },
  { color: "var(--color-cat-shops)", top: "28%", left: "82%", delay: 0.8 },
  { color: "var(--color-cat-health)", top: "74%", left: "78%", delay: 1.2 },
  { color: "var(--color-cat-entertainment)", top: "48%", left: "50%", delay: 1.6 },
];

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const { login, signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);
      try {
        if (mode === "signup") {
          await signup(email, password, name);
        } else {
          await login(email, password);
        }
        router.push("/");
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("somethingWrong");
        setError(message);
        showToast(message, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, email, password, name, login, signup, router, t, showToast],
  );

  const handleGoogleToken = useCallback(
    async (idToken: string) => {
      setError(null);
      try {
        await loginWithGoogle(idToken);
        router.push("/");
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("googleSignInFailed");
        setError(message);
        showToast(message, "error");
      }
    },
    [loginWithGoogle, router, t, showToast],
  );

  const handleFacebookToken = useCallback(
    async (accessToken: string) => {
      setError(null);
      try {
        await loginWithFacebook(accessToken);
        router.push("/");
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("facebookSignInFailed");
        setError(message);
        showToast(message, "error");
      }
    },
    [loginWithFacebook, router, t, showToast],
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PIN_CATEGORIES.map((pin, i) => (
          <div
            key={i}
            className="absolute animate-[float_7s_ease-in-out_infinite]"
            style={{ top: pin.top, left: pin.left, animationDelay: `${pin.delay}s` }}
          >
            <MapPin size={i === 2 ? 44 : 28} style={{ color: pin.color }} fill={pin.color} fillOpacity={0.15} strokeWidth={1.5} />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-paper/0 via-paper/40 to-paper" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lift">
            <MapPin size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold text-ink">AlbMap</span>
        </Link>

        <div className="rounded-3xl bg-surface p-8 shadow-soft">
          <h1 className="font-display text-2xl font-bold text-ink">
            {mode === "signup" ? t("createAccount") : t("welcomeBack")}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {mode === "signup" ? t("signupSubtitle") : t("loginSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                  {t("fullName")}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  maxLength={150}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  {t("password")}
                </label>
                {mode === "login" && (
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    {t("forgotPasswordLink")}
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 pr-11 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? t("pleaseWait") : mode === "signup" ? t("signUp") : t("logIn")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-soft">{t("or")}</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="space-y-3">
            <GoogleSignInButton onIdToken={handleGoogleToken} onError={setError} />
            <FacebookSignInButton onAccessToken={handleFacebookToken} onError={setError} />
          </div>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setError(null);
            }}
            className="mt-6 w-full text-center text-sm text-ink-soft"
          >
            {mode === "signup" ? (
              <>
                {t("alreadyHaveAccount")} <span className="font-medium text-primary">{t("logInLink")}</span>
              </>
            ) : (
              <>
                {t("noAccount")}{" "}
                <span className="font-medium text-primary">{t("signUpAsBusiness")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
