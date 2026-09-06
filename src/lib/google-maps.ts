/**
 * Google Maps JavaScript API key — a browser (HTTP referrer-restricted)
 * key, separate from the mobile app's Android/iOS SDK keys (see
 * albmap's AndroidManifest.xml/AppDelegate.swift). Client-side by
 * necessity (it ends up in the page source no matter what), so this is
 * "restrict by domain in Google Cloud Console," not "keep secret."
 *
 * PLACEHOLDER until the real key is set via NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * — until then the map loads Google's own "For development purposes
 * only" watermarked mode rather than failing outright.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
