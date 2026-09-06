export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profileImageUrl: string | null;
  role: "business" | "admin";
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type BusinessStatus = "pending" | "approved" | "rejected";

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  category: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  openingHours: Record<string, string>;
  tags: string[];
  status: BusinessStatus;
  rating: number | null;
  ratingCount: number;
  distanceKm?: number;
  // Only ever populated for GET /businesses?ownerId=... (getMyBusinesses)
  // — an owner's own view of their listings, where "approved but
  // deactivated by an admin" needs to be visible. The public discovery
  // feed never returns a deactivated business in the first place, so
  // this is always omitted there — undefined, not false, is the correct
  // "not applicable here" state.
  isActive?: boolean;
  // The admin's own written explanation — mandatory on their end for a
  // rejection or deactivation (see the admin portal's ConfirmModal) — so
  // these are the actual reason text, not a generic "contact support"
  // note. Same isActive-style scoping: only ever populated on the
  // owner's own view.
  rejectionReason?: string | null;
  deactivationReason?: string | null;
}

export interface EventItem {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string | null;
  category: string;
  startTime: string;
  endTime: string;
  imageUrl: string | null;
  /** Only populated by endpoints that join event_interests (getEvents/
   * getEventById) — absent elsewhere. Matches the mobile app's
   * EventEntity.interestCount/isInterested. */
  interestCount?: number;
  isInterested?: boolean;
}

export interface Category {
  name: string;
  nameDe: string | null;
  nameSq: string | null;
  iconName: string | null;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  relatedId: string | null;
  businessName: string | null;
}

export interface BusinessAnalytics {
  businessId: string;
  profileClicks: number;
  websiteClicks: number;
  callClicks: number;
  favoriteCount: number;
  last7DaysProfileClicks: number[];
}

// ---------------- Site content ----------------
// Mirrors albmap-backend's site_content table (see content.service.js) —
// About Us, social links, Privacy Policy, and Terms & Conditions used to
// be hardcoded here as next-intl messages/literal JSX; now they're
// admin-editable from the admin portal's Content page and fetched live.

// About Us, Privacy Policy, and Terms & Conditions are real user-facing
// copy, so the backend now requires (and returns) all 3 of these
// languages together — there's no single-language shape anymore.
// social_links stays flat/un-keyed since a URL isn't translated.
// (Reuses the same 3 codes as src/i18n/locales.ts's SUPPORTED_LOCALES —
// imported there instead of re-declared here to avoid two Locale types
// silently drifting apart.)
export type { Locale } from "@/i18n/locales";

/** One page's content in all 3 languages, as returned by GET /content for
 * a localized key — see content.service.js's SUPPORTED_LOCALES. */
export interface LocalizedContent<T> {
  en: T;
  de: T;
  sq: T;
  updatedAt?: string;
}

export interface AboutContent {
  tagline: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
}

export interface SocialLinks {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  linkedin: string | null;
}

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalPageContent {
  title: string;
  sections: LegalSection[];
}

export interface SiteContent {
  aboutUs: LocalizedContent<AboutContent> | null;
  socialLinks: SocialLinks | null;
  privacyPolicy: LocalizedContent<LegalPageContent> | null;
  termsConditions: LocalizedContent<LegalPageContent> | null;
}
