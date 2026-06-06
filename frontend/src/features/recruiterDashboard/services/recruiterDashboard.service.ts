/**
 * Recruiter Dashboard service — thin wrappers around apiClient.
 *
 * Updated to match backend endpoints:
 *  - Uses /api/job for job operations (not /api/recruiter/jobs)
 *  - Uses /api/application for application operations
 *  - Note: /api/recruiter/dashboard endpoint doesn't exist in backend yet
 *  - Note: /api/recruiter/candidates endpoint doesn't exist in backend yet
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Job, Application, Candidate } from "@/types";

/* ─── Response shapes ──────────────────────────────────────────────────── */

export interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  positionsFilled: number;
}

export interface DashboardHomeData {
  stats: DashboardStats;
  jobs: Job[];
  applications: Application[];
  analytics: {
    jobViews: { label: string; value: number }[];
    hiringFunnel: { label: string; value: number }[];
  };
}

/* ─── Service ─────────────────────────────────────────────────────────── */

export const recruiterDashboardService = {
  /** GET /api/recruiter/dashboard — home page snapshot (NOT IMPLEMENTED IN BACKEND YET) */
  getHome: (): Promise<DashboardHomeData> =>
    apiClient.get<DashboardHomeData>("/api/recruiter/dashboard"),

  /** GET /api/job — get jobs (use query params for recruiter filtering) */
  getJobs: (params?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<{ data: Job[]; total: number; page: number; pageSize: number; totalPages: number }> =>
    apiClient.get<{ data: Job[]; total: number; page: number; pageSize: number; totalPages: number }>("/api/job", params as any),

  /** PUT /api/job/:id — update job status (uses update endpoint with status field) */
  updateJobStatus: (jobId: string, status: Job["status"]): Promise<Job> =>
    apiClient.put<Job>(`/api/job/${jobId}`, { status }),

  /** DELETE /api/job/:id — delete job */
  deleteJob: (jobId: string): Promise<void> =>
    apiClient.delete<void>(`/api/job/${jobId}`),

  /** GET /api/application/job/:jobId — get applications for a specific job */
  getApplications: (jobId: string): Promise<Application[]> =>
    apiClient.get<Application[]>(`/api/application/job/${jobId}`),

  /** PATCH /api/application/:id/status — update application status */
  updateApplicationStatus: (
    applicationId: string,
    status: Application["status"],
  ): Promise<Application> =>
    apiClient.patch<Application>(`/api/application/${applicationId}/status`, {
      status,
    }),

  /** GET /api/recruiter/candidates — get candidates (NOT IMPLEMENTED IN BACKEND YET) */
  getCandidates: (params?: { search?: string }): Promise<Candidate[]> =>
    apiClient.get<Candidate[]>("/api/recruiter/candidates", params),

  /** POST /api/recruiter/candidates/:id/save — save candidate (NOT IMPLEMENTED IN BACKEND YET) */
  saveCandidate: (candidateId: string): Promise<void> =>
    apiClient.post<void>(`/api/recruiter/candidates/${candidateId}/save`, {}),

  /** DELETE /api/recruiter/candidates/:id/save — unsave candidate (NOT IMPLEMENTED IN BACKEND YET) */
  unsaveCandidate: (candidateId: string): Promise<void> =>
    apiClient.delete<void>(`/api/recruiter/candidates/${candidateId}/save`),
};
