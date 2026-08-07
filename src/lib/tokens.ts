const ACCESS_TOKEN_KEY = "albmap_access_token";
const REFRESH_TOKEN_KEY = "albmap_refresh_token";

/**
 * localStorage-based, matching the admin portal's existing pattern for
 * consistency across both Next.js projects. Worth knowing the trade-off:
 * this is simpler than httpOnly cookies but more exposed to XSS on a
 * public-facing site with a larger attack surface than an internal admin
 * tool. If this ever needs hardening, the fix is moving token storage
 * into httpOnly cookies set via a Next.js Route Handler acting as a thin
 * proxy in front of the backend, rather than reading/writing tokens
 * directly from client-side JS as done here.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
