/**
 * Recruiter Profile service — typed wrappers around apiClient.
 *
 * Updated to match backend endpoints:
 *  - Uses /api/recruiter/me for profile operations
 *  - Uses /api/job for job operations (not /api/recruiter/jobs)
 *  - Uses /api/application for application operations
 *  - Note: /api/recruiter/dashboard endpoint doesn't exist in backend yet
 *  - Note: /api/recruiter/candidates endpoint doesn't exist in backend yet
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Recruiter, Job, Application, Candidate } from "@/types";

export interface DashboardHome {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    interviewsScheduled: number;
    positionsFilled: number;
  };
  jobs: Job[];
  applications: Application[];
  analytics: {
    jobViews: { label: string; value: number }[];
    hired: { label: string; value: number }[];
  };
}

export interface RecruiterJob {
  id: string;
  title: string;
  location: string;
  type: string;
  level: string;
  status: string;
  applicantsCount: number;
  viewsCount: number;
  postedAt: string;
}

export interface RecruiterApplication {
  id: string;
  status: string;
  appliedAt: string;
  candidate?: { id: string; name: string; email: string };
  job: { id: string; title: string; company: any };
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  email: string;
  experience: number;
  skills: string[];
  headline: string;
  location: string;
}

export const recruiterProfileService = {
  /** GET /api/recruiter/me — get my profile */
  getProfile: (): Promise<Recruiter> =>
    apiClient.get<Recruiter>("/api/recruiter/me"),

  /** PUT /api/recruiter/me — update my profile */
  updateProfile: (payload: { name?: string; designation?: string; avatar?: string }): Promise<Recruiter> =>
    apiClient.put<Recruiter>("/api/recruiter/me", payload),

  /** PATCH /api/recruiter/me/company — assign company */
  assignCompany: (companyId: string): Promise<Recruiter> =>
    apiClient.patch<Recruiter>("/api/recruiter/me/company", { companyId }),

  /** GET /api/recruiter/dashboard — dashboard data (NOT IMPLEMENTED IN BACKEND YET) */
  getDashboard: () => apiClient.get<DashboardHome>("/api/recruiter/dashboard"),

  /** GET /api/job — get jobs (use query params for recruiter filtering) */
  getJobs: (params?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<{ data: Job[]; total: number; page: number; pageSize: number; totalPages: number }> =>
    apiClient.get<{ data: Job[]; total: number; page: number; pageSize: number; totalPages: number }>("/api/job", params as any),

  /** PUT /api/job/:id — update job status (uses update endpoint with status field) */
  updateJobStatus: (id: string, status: Job["status"]) =>
    apiClient.put<Job>(`/api/job/${id}`, { status }),

  /** DELETE /api/job/:id — delete job */
  deleteJob: (id: string) => apiClient.delete<void>(`/api/job/${id}`),

  /** GET /api/application/job/:jobId — get applications for a specific job */
  getApplications: (jobId?: string) => apiClient.get<Application[]>(jobId ? `/api/application/job/${jobId}` : "/api/application"),

  /** PATCH /api/application/:id/status — update application status */
  updateApplicationStatus: (applicationId: string, status: Application["status"]) =>
    apiClient.patch<Application>(`/api/application/${applicationId}/status`, { status }),

  /** GET /api/recruiter/candidates — get candidates (NOT IMPLEMENTED IN BACKEND YET) */
  getCandidates: (params?: { search?: string }) => apiClient.get<Candidate[]>("/api/recruiter/candidates", params),

  /** POST /api/recruiter/candidates/:id/save — save candidate (NOT IMPLEMENTED IN BACKEND YET) */
  saveCandidate: (candidateId: string) =>
    apiClient.post<void>(`/api/recruiter/candidates/${candidateId}/save`, {}),

  /** POST /api/recruiter/candidates/:id/unsave — unsave candidate (NOT IMPLEMENTED IN BACKEND YET) */
  unsaveCandidate: (candidateId: string) =>
    apiClient.post<void>(`/api/recruiter/candidates/${candidateId}/unsave`, {}),
};
