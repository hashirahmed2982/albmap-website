"use client";

import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from "./tokens";
import type { ApiErrorResponse } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1";

export class ApiError extends Error {
  status: number;
  /** Populated only for the business-submission duplicate-warning case
   * (backend returns { message, duplicate: { id, name, address, distanceMeters } } on a 409). */
  duplicate?: { id: string; name: string; address: string; distanceMeters: number };
  constructor(
    status: number,
    message: string,
    duplicate?: { id: string; name: string; address: string; distanceMeters: number },
  ) {
    super(message);
    this.status = status;
    this.duplicate = duplicate;
  }
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Silent token refresh — same backend endpoint and shape as the mobile
 * app's DioClient interceptor and the admin portal's api.ts. De-duplicated
 * via a shared in-flight promise so concurrent 401s don't each trigger
 * their own refresh call.
 */
function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;

      const data = await res.json();
      storeTokens(data.accessToken, refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip attaching the Authorization header — only auth endpoints and public GETs need this. */
  skipAuth?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const doFetch = async (): Promise<Response> => {
    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    };
    if (!skipAuth) {
      const token = getAccessToken();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }
    return fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await doFetch();

  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    } else {
      clearTokens();
      throw new ApiError(401, "Session expired — please log in again.");
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let duplicate: ApiError["duplicate"];
    try {
      const errorBody: ApiErrorResponse & { duplicate?: ApiError["duplicate"] } = await response.json();
      if (errorBody?.message) message = errorBody.message;
      if (errorBody?.duplicate) duplicate = errorBody.duplicate;
    } catch {
      // Response body wasn't JSON — fall back to the generic message above.
    }
    throw new ApiError(response.status, message, duplicate);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
