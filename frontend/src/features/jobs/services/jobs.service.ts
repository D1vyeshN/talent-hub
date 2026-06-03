/**
 * Jobs service — typed wrappers around apiClient for recruiter I/O.
 *
 * Unwraps the standard { success, statusCode, data, message } backend
 * envelope, so callers always receive the raw domain object(s).
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Job, ApplicationStatus } from "@/types";

/* ─── Request/response shapes ────────────────────────────────────────── */

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  type: Job["type"];
  level: Job["level"];
  minSalary?: number;
  maxSalary?: number;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
}

export interface UpdateJobPayload {
  title?: string;
  description?: string;
  location?: string;
  type?: Job["type"];
  level?: Job["level"];
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  status?: Job["status"];
}

export interface JobQueryParams {
  search?: string;
  location?: string;
  type?: string;
  level?: string;
  status?: Job["status"];
  skills?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedJobsResponse {
  data: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApplicationListItem {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

/* ─── Service ────────────────────────────────────────────────────────── */

export const jobsService = {
  /** POST /api/jobs — create a new job posting */
  create: (payload: CreateJobPayload): Promise<Job> =>
    apiClient.post<Job>("/api/jobs", payload),

  /** PUT /api/jobs/:id — update an existing posting */
  update: (jobId: string, payload: UpdateJobPayload): Promise<Job> =>
    apiClient.put<Job>(`/api/jobs/${jobId}`, payload),

  /** DELETE /api/jobs/:id — remove a posting */
  delete: (jobId: string): Promise<void> =>
    apiClient.delete<void>(`/api/jobs/${jobId}`),

  /** GET /api/jobs/:id — single job detail */
  getById: async (jobId: string, userId: string): Promise<Job> => {
    // Optimisation note: we never load fresh copies for the slug fallback;
    // the API itself will return 404 for expired postings, which surfaces
    // as a red banner in the UI instead of silently redirecting.
    await Promise.resolve();
    return apiClient.get<Job>(`/api/jobs/${jobId}?uid=${userId}`);
  },

  /** GET /api/jobs — recruiter-scoped list (paginated) */
  getMyJobs: (params?: JobQueryParams): Promise<PaginatedJobsResponse> =>
    apiClient.get<PaginatedJobsResponse>("/api/jobs", params as any),

  /** GET /api/jobs — public search (candidate-facing) */
  searchJobs: (params?: JobQueryParams): Promise<PaginatedJobsResponse> =>
    apiClient.get<PaginatedJobsResponse>("/api/jobs/search", params as any),

  /** PATCH /api/jobs/:id/status — toggle active/paused/closed */
  updateStatus: async (jobId: string, status: Job["status"]): Promise<void> => {
    const u = new URL(`/api/jobs/${jobId}/status`, "http://localhost:8080");
    u.search = u.search ? u.search.slice(1).split("&").map(p => p + "&").join("") : "";
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
  },

  /** GET /api/jobs/:id/applications */
  getApplications: (jobId: string): Promise<ApplicationListItem[]> =>
    apiClient.get<ApplicationListItem[]>(`/api/jobs/${jobId}/applications`),
};
