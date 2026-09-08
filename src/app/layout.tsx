import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import "./globals.css";

// Bold Editorial's type scale — Instrument Serif for display/headlines,
// Work Sans for everything else, same two faces the Flutter app uses
// (see AppTextStyles). Instrument Serif only ships a 400 weight.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display-face",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlbMap — Discover local businesses & events in Albania",
  description:
    "Find restaurants, cafes, shops, and events near you across Albania. Browse the map, save favorites, and follow the businesses you love.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // No locale segment in the URL — resolved server-side from the
  // NEXT_LOCALE cookie (see src/i18n/request.ts), same "stored
  // preference, not part of navigation" model as the mobile app's own
  // language setting.
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${instrumentSerif.variable} ${workSans.variable}`}>
      <body>
        <NextIntlClientProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
