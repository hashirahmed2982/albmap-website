/**
 * Pure constants, deliberately kept in their own file with zero
 * server-only imports (no next/headers, no next-intl/server). request.ts
 * needs those server APIs, but LanguageSwitcher.tsx (a client component)
 * and actions.ts (a server action, but callable from client code) both
 * need just these plain values — importing them from request.ts instead
 * would drag next/headers into the client bundle and break the build,
 * since that API is only usable in Server Components.
 */
export const SUPPORTED_LOCALES = ["en", "sq", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
