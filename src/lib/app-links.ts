/**
 * App store links and the custom-scheme deep link this site uses to try
 * opening the installed AlbMap app before falling back to an install
 * page — see src/app/app/my-businesses/page.tsx, and the mobile app's
 * DeepLinkService (lib/core/services/deep_link_service.dart), which is
 * what actually handles the `albmap://` link on the other end.
 *
 * Android's URL is correct by construction (it's just the real
 * applicationId, com.albmap.app, slotted into Google's fixed URL shape)
 * — no env override ever needed there. iOS's numeric id isn't derivable
 * the same way; this is the real, shipped App Store listing. The
 * NEXT_PUBLIC_* env vars remain available to override either without a
 * code change (a TestFlight link, a regional storefront, etc.) — but
 * note these are inlined at BUILD time (Next.js NEXT_PUBLIC_* behavior),
 * so changing one requires a rebuild + redeploy, not just a restart.
 */
export const ANDROID_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ||
  "https://play.google.com/store/apps/details?id=com.albmap.app";

export const IOS_APP_STORE_URL =
  process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "https://apps.apple.com/ch/app/albmap-app/id6804714938";

/** The `albmap://` link for a given in-app destination — currently only
 * "my-businesses" exists (matches DeepLinkService's only recognized
 * route), reached from the business-approval email's CTA. */
export function appDeepLink(path: "my-businesses"): string {
  return `albmap://open/${path}`;
}
