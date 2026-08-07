import { apiFetch } from "./api";
import type { SiteContent } from "./types";

/**
 * Public and unauthenticated on the backend (both this website and the
 * mobile app read it, logged in or not) — About Us, social links,
 * Privacy Policy, and Terms & Conditions, all admin-editable from the
 * admin portal's Content page.
 */
export function getContent(): Promise<SiteContent> {
  return apiFetch<SiteContent>("/content", { skipAuth: true });
}
