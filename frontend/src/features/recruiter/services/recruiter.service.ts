/**
 * Recruiter service — typed wrappers around apiClient for recruiter operations.
 *
 * Matches backend endpoints:
 *  - GET /api/recruiter/me - Get my profile
 *  - PUT /api/recruiter/me - Update profile
 *  - PATCH /api/recruiter/me/company - Assign company
 *  - GET /api/recruiter/:id - Get recruiter by id
 *  - GET /api/recruiter - Get all recruiters (admin only)
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Recruiter } from "@/types";

/* ─── Request/response shapes ────────────────────────────────────────── */

export interface UpdateRecruiterPayload {
  name?: string;
  designation?: string;
  avatar?: string;
}

export interface AssignCompanyPayload {
  companyId: string;
}

export interface RecruiterQueryParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedRecruitersResponse {
  data: Recruiter[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ─── Service ────────────────────────────────────────────────────────── */

export const recruiterService = {
  /** GET /api/recruiter/me — get my profile */
  getMyProfile: (): Promise<Recruiter> =>
    apiClient.get<Recruiter>("/api/recruiter/me"),

  /** PUT /api/recruiter/me — update my profile */
  updateProfile: (payload: UpdateRecruiterPayload): Promise<Recruiter> =>
    apiClient.put<Recruiter>("/api/recruiter/me", payload),

  /** PATCH /api/recruiter/me/company — assign company to recruiter */
  assignCompany: (payload: AssignCompanyPayload): Promise<Recruiter> =>
    apiClient.patch<Recruiter>("/api/recruiter/me/company", payload),

  /** GET /api/recruiter/:id — get recruiter by id */
  getById: (recruiterId: string): Promise<Recruiter> =>
    apiClient.get<Recruiter>(`/api/recruiter/${recruiterId}`),

  /** GET /api/recruiter — get all recruiters (admin only) */
  getAll: (params?: RecruiterQueryParams): Promise<PaginatedRecruitersResponse> =>
    apiClient.get<PaginatedRecruitersResponse>("/api/recruiter", params as any),
};
