/**
 * Jobs service — typed wrappers around apiClient for job operations.
 *
 * Matches backend endpoints:
 *  - GET /api/job - Get jobs (with query params)
 *  - GET /api/job/:id - Get job by id
 *  - POST /api/job - Create job
 *  - PUT /api/job/:id - Update job
 *  - DELETE /api/job/:id - Delete job
 *  - PATCH /api/job/:id/feature - Toggle featured (admin)
 *
 * Note: Backend uses singular /api/job, not plural /api/jobs
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
  category: string;
  expiresAt?: string;
  isRemote?: boolean;
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
  category?: string;
  expiresAt?: string;
  isRemote?: boolean;
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
  isRemote?: boolean;
  companyId?: string;
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
  /** GET /api/job — get jobs with query params (public & recruiter-scoped) */
  getAll: (params?: JobQueryParams): Promise<PaginatedJobsResponse> => {
    // Filter out undefined values to avoid sending "undefined" as string
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, value]) => value !== undefined)
    );
    return apiClient.get<PaginatedJobsResponse>("/api/job", filteredParams as any);
  },

  /** GET /api/job/:id — get job by id */
  getById: (jobId: string): Promise<Job> =>
    apiClient.get<Job>(`/api/job/${jobId}`),

  /** POST /api/job — create a new job posting */
  create: (payload: CreateJobPayload): Promise<Job> =>
    apiClient.post<Job>("/api/job", payload),

  /** PUT /api/job/:id — update an existing posting */
  update: (jobId: string, payload: UpdateJobPayload): Promise<Job> =>
    apiClient.put<Job>(`/api/job/${jobId}`, payload),

  /** DELETE /api/job/:id — remove a posting */
  delete: (jobId: string): Promise<void> =>
    apiClient.delete<void>(`/api/job/${jobId}`),

  /** PUT /api/job/:id — update job status (uses update with status field) */
  updateStatus: (jobId: string, status: Job["status"]): Promise<Job> =>
    apiClient.put<Job>(`/api/job/${jobId}`, { status }),

  /** PATCH /api/job/:id/feature — toggle featured (admin only) */
  toggleFeature: (jobId: string): Promise<Job> =>
    apiClient.patch<Job>(`/api/job/${jobId}/feature`, {}),
};
