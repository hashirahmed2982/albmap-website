/**
 * App store links and the custom-scheme deep link this site uses to try
 * opening the installed AlbMap app before falling back to an install
 * page — see src/app/app/my-businesses/page.tsx, and the mobile app's
 * DeepLinkService (lib/core/services/deep_link_service.dart), which is
 * what actually handles the `albmap://` link on the other end.
 *
 * PLACEHOLDER: the app isn't published yet (same "ordered, not live"
 * state as the Google Maps API key — see the project task list). Replace
 * these two with the real store listing URLs the moment the app ships;
 * everything else here (the QR codes, the redirect page) works unchanged
 * once they're real — override via env in the meantime if a TestFlight/
 * internal-testing link exists ahead of a full release.
 */
export const ANDROID_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ||
  "https://play.google.com/store/apps/details?id=com.albmap.app";

export const IOS_APP_STORE_URL =
  process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "https://apps.apple.com/app/albmap/id0000000000";

/** The `albmap://` link for a given in-app destination — currently only
 * "my-businesses" exists (matches DeepLinkService's only recognized
 * route), reached from the business-approval email's CTA. */
export function appDeepLink(path: "my-businesses"): string {
  return `albmap://open/${path}`;
}
