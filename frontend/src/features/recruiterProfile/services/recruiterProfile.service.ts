import { apiClient } from "@/shared/lib/apiClient";

export interface DashboardHome {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    interviewsScheduled: number;
    positionsFilled: number;
  };
  jobs: any[];
  applications: any[];
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

export interface UpdateApplicationStatusParams {
  id: string;
  status: string;
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

export interface SaveCandidatePayload {
  candidateId: string;
}
export interface UpdateJobStatusPayload {
  id: string;
}
export interface UpdateApplicationStatusPayload {
  id: string;
}

export const recruiterProfileService = {
  getDashboard: () => apiClient.get<DashboardHome>("/api/recruiter/dashboard"),
  getJobs: () => apiClient.get<RecruiterJob[]>("/api/recruiter/jobs"),
  updateJobStatus: (id: string, status: string) =>
    apiClient.patch<UpdateJobStatusPayload>(`/api/recruiter/jobs/${id}/status`, { status }),
  deleteJob: (id: string) => apiClient.delete(`/api/recruiter/jobs/${id}`),
  getApplications: () => apiClient.get<RecruiterApplication[]>("/api/recruiter/applications"),
  updateApplicationStatus: (params: UpdateApplicationStatusParams) =>
    apiClient.patch<UpdateApplicationStatusPayload>(`/api/recruiter/applications/${params.id}/status`, { status: params.status }),
  getCandidates: () => apiClient.get<RecruiterCandidate[]>("/api/recruiter/candidates"),
  saveCandidate: (candidateId: string) =>
    apiClient.post("/api/recruiter/candidates/save", { candidateId }),
  unsaveCandidate: (candidateId: string) =>
    apiClient.post("/api/recruiter/candidates/unsave", { candidateId }),
};
