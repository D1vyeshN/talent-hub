/** Internal DTOs for the recruiter feature. */
import type { Salary, JobStatus } from "../../shared/types/index";

// ─── Dashboard Home ──────────────────────────────────────────────────
export interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  positionsFilled: number;
}

export interface AnalyticsPoint {
  label: string;
  value: number;
}

export interface DashboardHomeResponse {
  stats: DashboardStats;
  jobs: JobSummary[];
  applications: ApplicationSummary[];
  analytics: {
    jobViews: AnalyticsPoint[];
    hiringFunnel: AnalyticsPoint[];
  };
}

// ─── Job summaries ───────────────────────────────────────────────────
export interface JobSummary {
  id: string;
  title: string;
  location: string;
  type: string;
  level: string;
  status: JobStatus;
  applicantsCount: number;
  viewsCount: number;
  postedAt: string;
  company: { id: string; name: string; logo: string };
}

// ─── Application summaries ───────────────────────────────────────────
export interface ApplicationSummary {
  id: string;
  status: string;
  appliedAt: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    experience: number;
  };
  job: {
    id: string;
    title: string;
    company: { id: string; name: string };
  };
}

// ─── Candidate summaries ─────────────────────────────────────────────
export interface CandidateSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  experience: number;
  skills: string[];
  headline?: string;
  location: string;
  saved: boolean;
}

// ─── Request payloads ────────────────────────────────────────────────
export interface UpdateJobStatusBody {
  status: JobStatus;
}

export interface UpdateApplicationStatusBody {
  status: string;
}

export interface ApplicationQueryParams {
  status?: string;
  search?: string;
}

export interface CandidateQueryParams {
  search?: string;
}

// ─── Response wrappers ───────────────────────────────────────────────
export interface JobsListResponse {
  jobs: JobSummary[];
}

export interface ApplicationsListResponse {
  applications: ApplicationSummary[];
}

export interface CandidatesListResponse {
  candidates: CandidateSummary[];
}
