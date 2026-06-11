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
  data: { coverLetter?: string; resumeUrl?: string }
): Promise<Application> => {
  try {
    return await apiClient.post<Application>("/api/application", { jobId, ...data });
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
 * Note: This fetches applications for each job the recruiter has posted
 */
export const getAllRecruiterApplications = async (
  jobIds: string[],
  params: { page?: number; pageSize?: number } = {}
): Promise<Application[]> => {
  try {
    if (jobIds.length === 0) return [];
    
    // Fetch applications for each job in parallel
    const applicationPromises = jobIds.map((jobId) =>
      getJobApplications(jobId, params).then((response) => response.data).catch((error) => {
        console.error(`Failed to fetch applications for job ${jobId}:`, error);
        return []; // Return empty array for failed requests to not block other jobs
      })
    );
    
    const results = await Promise.all(applicationPromises);
    // Flatten all applications into a single array
    return results.flat();
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
