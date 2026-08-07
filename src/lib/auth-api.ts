import { apiFetch } from "./api";
import { storeTokens, clearTokens, getRefreshToken } from "./tokens";
import type { AuthResponse, User } from "./types";

export async function login(email: string, password: string): Promise<User> {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
  storeTokens(res.accessToken, res.refreshToken);
  return res.user;
}

export async function signup(email: string, password: string, name: string): Promise<User> {
  const res = await apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: { email, password, name },
    skipAuth: true,
  });
  storeTokens(res.accessToken, res.refreshToken);
  return res.user;
}

/**
 * idToken comes from Google Identity Services' web sign-in flow (see
 * GoogleSignInButton) — sent to the exact same backend endpoint the
 * mobile app uses. The backend verifies it against GOOGLE_CLIENT_ID's Web
 * client, which is actually the more natural fit for a web-originated
 * token than the mobile app's serverClientId workaround.
 */
export async function loginWithGoogle(idToken: string): Promise<User> {
  const res = await apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: { idToken },
    skipAuth: true,
  });
  storeTokens(res.accessToken, res.refreshToken);
  return res.user;
}

export async function loginWithFacebook(accessToken: string): Promise<User> {
  const res = await apiFetch<AuthResponse>("/auth/facebook", {
    method: "POST",
    body: { accessToken },
    skipAuth: true,
  });
  storeTokens(res.accessToken, res.refreshToken);
  return res.user;
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    await apiFetch<void>("/auth/logout", { method: "POST", body: { refreshToken }, skipAuth: true });
  } finally {
    clearTokens();
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

/** Consumes the token from the email link sent by forgotPassword(). */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    skipAuth: true,
  });
}

export async function updateProfile(fields: {
  name?: string;
  phone?: string;
  profileImageUrl?: string;
}): Promise<User> {
  return apiFetch<User>("/auth/me", { method: "PATCH", body: fields });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

/**
 * The backend endpoint (POST /users/me/avatar) already existed and works
 * correctly — this function itself was simply never built for the
 * website, so there was no way to actually reach it from the UI.
 */
export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);
  const token = typeof window !== "undefined" ? localStorage.getItem("albmap_access_token") : null;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1"}/users/me/avatar`,
    { method: "POST", body: formData, headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to upload profile picture");
  }
  return res.json();
}
