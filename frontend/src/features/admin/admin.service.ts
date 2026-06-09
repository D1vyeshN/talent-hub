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
};