import { apiClient } from "@/shared/lib/apiClient";
import type { Company, Job, User } from "@/types";
import type { MockDataImport, ImportResult, DashboardStats } from "./admin.types";

export const adminService = {
  getDashboardStats: (): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>("/api/admin/dashboard"),

  importMockData: (data: MockDataImport): Promise<ImportResult> =>
    apiClient.post<ImportResult>("/api/admin/mock-data/import", data),

  clearMockData: (): Promise<{ message: string }> =>
    apiClient.delete<{ message: string }>("/api/admin/mock-data/clear"),

  verifyCompany: (companyId: string): Promise<Company> =>
    apiClient.patch<Company>(`/api/admin/companies/${companyId}/verify`, {}),

  toggleJobFeatured: (jobId: string): Promise<Job> =>
    apiClient.patch<Job>(`/api/admin/jobs/${jobId}/feature`, {}),

  toggleUserBan: (userId: string): Promise<User> =>
    apiClient.patch<User>(`/api/admin/users/${userId}/ban`, {}),

  // Use existing backend routes - these are shared with other services
  getUsers: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
  }): Promise<{ data: User[]; total: number }> =>
    apiClient.get<{ data: User[]; total: number }>("/api/users", params as Record<string, string | number> | undefined),

  getJobs: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: Job[]; total: number }> =>
    apiClient.get<{ data: Job[]; total: number }>("/api/job", params as Record<string, string | number> | undefined),

  getCompanies: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isVerified?: boolean;
  }): Promise<{ data: Company[]; total: number }> =>
    apiClient.get<{ data: Company[]; total: number }>("/api/company", params as Record<string, string | number> | undefined),
};