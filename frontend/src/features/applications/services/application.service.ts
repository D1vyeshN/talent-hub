import { recruiterService } from "@/features/recruiter/recruiter.service";
import { apiClient } from "@/shared/lib/apiClient";
import type { Application, ApplicationStatus } from "@/types";

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  page?: number;
  pageSize?: number;
}

// ─── Candidate Operations ─────────────────────────────────────────────────────

/**
 * Get current candidate's applications
 */
export const getCandidateApplications = async (
  params: Record<string, string | number> = {}
): Promise<{ data: Application[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  try {
    return await apiClient.get("/api/application/my", params);
  } catch (error: any) {
    console.error("Failed to fetch candidate applications:", error);
    throw new Error(error.message || "Failed to load applications");
  }
};

/**
 * Apply to a job
 */
export const applyToJob = async (
  jobId: string,
  companyId: string,
  data: { coverLetter?: string; resumeUrl?: string }
): Promise<Application> => {
  try {
    return await apiClient.post<Application>("/api/application", { jobId, companyId, ...data });
  } catch (error: any) {
    console.error("Failed to apply to job:", error);
    if (error.response?.status === 409) {
      throw new Error("You have already applied to this job");
    }
    if (error.response?.status === 400) {
      throw new Error("Job is not available for application");
    }
    throw new Error(error.message || "Failed to submit application");
  }
};

/**
 * Withdraw an application
 */
export const withdrawApplication = async (applicationId: string): Promise<void> => {
  try {
    await apiClient.delete<void>(`/api/application/${applicationId}`);
  } catch (error: any) {
    console.error("Failed to withdraw application:", error);
    if (error.response?.status === 404) {
      throw new Error("Application not found or cannot be withdrawn");
    }
    throw new Error(error.message || "Failed to withdraw application");
  }
};

/**
 * Get application details by ID
 */
export const getApplicationById = async (applicationId: string): Promise<Application> => {
  try {
    return await apiClient.get<Application>(`/api/application/${applicationId}`);
  } catch (error: any) {
    console.error("Failed to fetch application details:", error);
    if (error.response?.status === 404) {
      throw new Error("Application not found");
    }
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to view this application");
    }
    throw new Error(error.message || "Failed to load application");
  }
};

// ─── Recruiter Operations ─────────────────────────────────────────────────────

/**
 * Get applications for a specific job (recruiter)
 */
export const getJobApplications = async (
  jobId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<{ data: Application[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  try {
    return await apiClient.get(`/api/application/job/${jobId}`, params);
  } catch (error: any) {
    console.error("Failed to fetch job applications:", error);
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to view these applications");
    }
    if (error.response?.status === 404) {
      throw new Error("Job not found");
    }
    throw new Error(error.message || "Failed to load applications");
  }
};

/**
 * Update application status (recruiter)
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<Application> => {
  try {
    return await apiClient.patch<Application>(`/api/application/${applicationId}/status`, { status, notes });
  } catch (error: any) {
    console.error("Failed to update application status:", error);
    if (error.response?.status === 404) {
      throw new Error("Application not found");
    }
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to update this application");
    }
    throw new Error(error.message || "Failed to update application status");
  }
};

// ─── Shared Operations ───────────────────────────────────────────────────────

/**
 * Get all applications for recruiter across all jobs
 * This ensures recruiter only sees applications for their own company's jobs
 */
export const getAllRecruiterApplications = async (
  params: { 
    page?: number; 
    pageSize?: number; 
    search?: string;
    status?: ApplicationStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{ data: Application[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  try {
    // 1. Get recruiter profile to get their companyId
    const recruiter = await recruiterService.getProfile();
    if (!recruiter.companyId) {
      console.warn("Recruiter has no company assigned");
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }

    // 2. Fetch applications filtered by companyId directly from backend
    return await apiClient.get<{ data: Application[]; total: number; page: number; pageSize: number; totalPages: number }>(
      `/api/application/company/${recruiter.companyId}`, 
      params
    );
  } catch (error: any) {
    console.error("Failed to fetch recruiter applications:", error);
    throw new Error(error.message || "Failed to load applications");
  }
};


/**
 * Get application analytics/stats for recruiter
 */
export const getApplicationStats = async (): Promise<{
  totalApplications: number;
  byStatus: {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
    hired: number;
  };
  byJob: Array<{ jobId: string; jobTitle: string; count: number }>;
}> => {
  try {
    return await apiClient.get("/api/application/stats/recruiter");
  } catch (error: any) {
    console.error("Failed to fetch application stats:", error);
    throw new Error(error.message || "Failed to load analytics");
  }
};
