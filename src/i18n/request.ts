import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "./locales";

/**
 * Deliberately NOT using locale-prefixed URLs (/en/businesses, /sq/businesses,
 * etc.) — the mobile app doesn't put locale in any kind of address either;
 * it's a stored preference switched from Settings, not part of navigation.
 * Matching that model here avoids restructuring the entire app/ folder
 * into app/[locale]/ and rewriting every internal Link href across 18
 * pages, while still fully satisfying "multi-language like in the app."
 * Locale is read from a cookie (set by the language switcher) with the
 * browser's Accept-Language header as a fallback for first-time visitors.
 */
function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale {
  if (cookieValue && SUPPORTED_LOCALES.includes(cookieValue as Locale)) {
    return cookieValue as Locale;
  }
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
    if (preferred && SUPPORTED_LOCALES.includes(preferred as Locale)) {
      return preferred as Locale;
    }
  }
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerList = await headers();
  const locale = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value, headerList.get("accept-language"));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
