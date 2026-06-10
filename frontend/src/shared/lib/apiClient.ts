/**
 * Single reusable HTTP client.
 *
 * Bundles:
 *  - Cookie read/write for JWT
 *  - Base URL + auth header attachment
 *  - Response unwrap ({ success, data, message } → raw data)
 *  - 401 → auto-logout callback
 *  - Error normalization (HTTP errors → Error(message))
 */

// import { getCookie } from "./cookie";

// ─── Cookie helpers (replaces separate cookie.ts) ────────────────────────────

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  console.log(document.cookie,"toooooooooo");
  return match?.[1];
};

const setCookie = (name: string, value: string, days = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export { getCookie, setCookie, deleteCookie };

// ─── Client config ───────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ClientConfig = {
  onUnauthorized?: () => void;
};

const config: ClientConfig = {};

/** Call once from the Redux store setup to wire up 401 handling */
export function setUnauthorizedHandler(handler: () => void) {
  config.onUnauthorized = handler;
}

// ─── Core request function ───────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // const token = getCookie("token");

  // console.log(token,"toooooooooo");
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: isFormData
      ? { /* Let browser set Content-Type with boundary for FormData */ }
      : {
          "Content-Type": "application/json",
          // ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers as Record<string, string> | undefined),
        },
    credentials: "include",
  });

  // ── HTTP-level errors (network, 500, etc.) ──────────────────────────────
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.message || errBody.data?.message || res.statusText;

    if (res.status === 401) {
      config.onUnauthorized?.();
    }

    throw new Error(message);
  }

  // ── Unwrap standard response shape ──────────────────────────────────────
  const body = await res.json();

  if (body.success === false) {
    // Backend returned a "successful" HTTP status but flagged an error
    // (rare, but covers validation that returns 200 with error flag)
    if (body.statusCode === 401) {
      config.onUnauthorized?.();
    }
    throw new Error(body.message || "Request failed");
  }

  return body.data as T;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number>) => {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : "";
    return request<T>(`${path}${qs}`);
  },

  post: <T>(path: string, body?: unknown, options?: { headers?: { "Content-Type": string; }; }) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: options?.headers as Record<string, string> | undefined,
    }),

  put: <T>(path: string, body: unknown, options?: { headers?: { "Content-Type": string; }; }) =>
    request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: options?.headers as Record<string, string> | undefined,
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
