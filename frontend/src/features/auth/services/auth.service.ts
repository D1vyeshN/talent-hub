/**
 * Auth service — all HTTP calls for registration, login, and session.
 *
 * Each function calls apiClient, which handles:
 *  - reading the JWT from cookie
 *  - attaching the Authorization header
 *  - unwrapping { success, data, message } → returns raw data
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { User, UserRole } from "@/types";

// ─── Types matching backend responses ────────────────────────────────────────

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

// ─── Service functions ───────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/api/auth/login", { email, password });
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>("/api/auth/register", data);
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>("/api/auth/me");
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>("/api/auth/logout");
  },
};
