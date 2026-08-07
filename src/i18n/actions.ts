"use server";

import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type Locale } from "./locales";

export async function setLocale(locale: Locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year — a stored preference, matching how
    // the mobile app's language setting persists indefinitely once chosen
    path: "/",
  });
}
