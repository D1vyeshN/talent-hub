/**
 * Recruiter Dashboard service — thin wrappers around apiClient.
 *
 * Each function returns the unwrapped `data` from the standard
 * { success, statusCode, data, message } backend response, so
 * callers receive the raw domain object (or array) directly.
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
  /** GET /api/recruiter/dashboard — home page snapshot */
  getHome: (): Promise<DashboardHomeData> =>
    apiClient.get<DashboardHomeData>("/api/recruiter/dashboard"),

  /** GET /api/recruiter/jobs */
  getJobs: (): Promise<Job[]> =>
    apiClient.get<Job[]>("/api/recruiter/jobs"),

  /** PUT /api/recruiter/jobs/:id/status */
  updateJobStatus: (jobId: string, status: Job["status"]): Promise<Job> =>
    apiClient.put<Job>(`/api/recruiter/jobs/${jobId}/status`, { status }),

  /** DELETE /api/recruiter/jobs/:id */
  deleteJob: (jobId: string): Promise<void> =>
    apiClient.delete<void>(`/api/recruiter/jobs/${jobId}`),

  /** GET /api/recruiter/applications */
  getApplications: (params?: { status?: string; search?: string }): Promise<Application[]> =>
    apiClient.get<Application[]>("/api/recruiter/applications", params),

  /** PATCH /api/recruiter/applications/:id/status */
  updateApplicationStatus: (
    applicationId: string,
    status: Application["status"],
  ): Promise<Application> =>
    apiClient.put<Application>(`/api/recruiter/applications/${applicationId}/status`, {
      status,
    }),

  /** GET /api/recruiter/candidates */
  getCandidates: (params?: { search?: string }): Promise<Candidate[]> =>
    apiClient.get<Candidate[]>("/api/recruiter/candidates", params),

  /** POST /api/recruiter/candidates/:id/save */
  saveCandidate: (candidateId: string): Promise<void> =>
    apiClient.post<void>(`/api/recruiter/candidates/${candidateId}/save`, {}),

  /** DELETE /api/recruiter/candidates/:id/save */
  unsaveCandidate: (candidateId: string): Promise<void> =>
    apiClient.delete<void>(`/api/recruiter/candidates/${candidateId}/save`),
};
