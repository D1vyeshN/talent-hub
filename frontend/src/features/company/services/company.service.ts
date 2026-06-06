/**
 * Company service — typed wrappers around apiClient for company operations.
 *
 * Matches backend endpoints:
 *  - GET /api/company - Get all companies
 *  - GET /api/company/:id - Get company by id
 *  - POST /api/company - Create company
 *  - PUT /api/company/:id - Update company
 *  - DELETE /api/company/:id - Delete company
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Company } from "@/types";

/* ─── Request/response shapes ────────────────────────────────────────── */

export interface CreateCompanyPayload {
  name: string;
  logo: string;
  website?: string;
  industry: string;
  size: Company["size"];
  location: string;
  description?: string;
  foundedYear?: number;
}

export interface UpdateCompanyPayload {
  name?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: Company["size"];
  location?: string;
  description?: string;
  foundedYear?: number;
}

export interface CompanyQueryParams {
  industry?: string;
  verified?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCompaniesResponse {
  data: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ─── Service ────────────────────────────────────────────────────────── */

export const companyService = {
  /** GET /api/company — get all companies with optional filters */
  getAll: (params?: CompanyQueryParams): Promise<PaginatedCompaniesResponse> =>
    apiClient.get<PaginatedCompaniesResponse>("/api/company", params as any),

  /** GET /api/company/:id — get company by id */
  getById: (companyId: string): Promise<Company> =>
    apiClient.get<Company>(`/api/company/${companyId}`),

  /** POST /api/company — create a new company with optional logo file */
  create: (payload: CreateCompanyPayload, logoFile?: File): Promise<Company> => {
    if (logoFile) {
      const formData = new FormData();
      formData.append("logo", logoFile);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      return apiClient.post<Company>("/api/company", formData);
    }
    return apiClient.post<Company>("/api/company", payload);
  },

  /** PUT /api/company/:id — update an existing company with optional logo file */
  update: (companyId: string, payload: UpdateCompanyPayload, logoFile?: File): Promise<Company> => {
    if (logoFile) {
      const formData = new FormData();
      formData.append("logo", logoFile);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      // Debug FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      return apiClient.put<Company>(`/api/company/${companyId}`, formData);
    }
    return apiClient.put<Company>(`/api/company/${companyId}`, payload);
  },

  /** DELETE /api/company/:id — delete a company */
  delete: (companyId: string): Promise<void> =>
    apiClient.delete<void>(`/api/company/${companyId}`),
};
