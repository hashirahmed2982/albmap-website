import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang={locale} className={`${poppins.variable} ${inter.variable}`}>
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
