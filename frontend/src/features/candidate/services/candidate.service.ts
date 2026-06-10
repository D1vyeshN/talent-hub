import { apiClient } from "@/shared/lib/apiClient";
import type { Candidate, Application, Job } from "@/types";

// ─── Candidate Profile ─────────────────────────────────────────────────────────────

export const getCandidateProfile = async (): Promise<Candidate> => {
  return apiClient.get<Candidate>("/api/candidate/me");
};

export const updateCandidateProfile = async (
  updates: Partial<Candidate>
): Promise<Candidate> => {
  return apiClient.put<Candidate>("/api/candidate/me", updates);
};

// ─── Saved Jobs ───────────────────────────────────────────────────────────────────

export const saveJob = async (jobId: string): Promise<Candidate> => {
  return apiClient.post<Candidate>(`/api/candidate/me/save-job/${jobId}`);
};

export const unsaveJob = async (jobId: string): Promise<Candidate> => {
  return apiClient.delete<Candidate>(`/api/candidate/me/save-job/${jobId}`);
};

// ─── Applications ───────────────────────────────────────────────────────────────────

export const getCandidateApplications = async (
  page = 1,
  pageSize = 10
): Promise<{ data: Application[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  return apiClient.get("/api/application/my", { page, pageSize });
};

export const applyToJob = async (
  jobId: string,
  data: { coverLetter?: string; resumeUrl?: string }
): Promise<Application> => {
  return apiClient.post<Application>("/api/application", { jobId, ...data });
};

export const withdrawApplication = async (applicationId: string): Promise<Application> => {
  return apiClient.delete<Application>(`/api/application/${applicationId}`);
};

// ─── Resume Upload ─────────────────────────────────────────────────────────────────

export const uploadResume = async (file: File): Promise<{ resumeUrl: string }> => {
  const formData = new FormData();
  formData.append("resume", file);
  return apiClient.post<{ resumeUrl: string }>("/api/candidate/me/resume", formData);
};

// ─── Avatar Upload ─────────────────────────────────────────────────────────────────

export const uploadAvatar = async (file: File): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiClient.post<{ avatar: string }>("/api/candidate/me/avatar", formData);
};

// ─── Admin/Recruiter ─────────────────────────────────────────────────────────────

export const getAllCandidates = async (
  page = 1,
  pageSize = 10
): Promise<{ data: Candidate[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  return apiClient.get("/api/candidate", { page, pageSize });
};

// ─── Skills Management ─────────────────────────────────────────────────────────────

export const addSkill = async (skill: string): Promise<Candidate> => {
  return apiClient.post<Candidate>("/api/candidate/me/skills", { skill });
};

export const removeSkill = async (skill: string): Promise<Candidate> => {
  return apiClient.delete<Candidate>(`/api/candidate/me/skills/${encodeURIComponent(skill)}`);
};

// ─── Saved Jobs ─────────────────────────────────────────────────────────────────────

export const getSavedJobsDetails = async (jobIds: string[]): Promise<Job[]> => {
  const jobsService = (await import("@/features/jobs/services/jobs.service")).jobsService;
  const jobs = await Promise.all(
    jobIds.map((id) => jobsService.getById(id))
  );
  return jobs;
};

// ─── Education Management ─────────────────────────────────────────────────────────────

export const addEducation = async (education: any): Promise<Candidate> => {
  return apiClient.post<Candidate>("/api/candidate/me/education", education);
};

export const removeEducation = async (educationId: string): Promise<Candidate> => {
  return apiClient.delete<Candidate>(`/api/candidate/me/education/${educationId}`);
};

// ─── Work Experience Management ───────────────────────────────────────────────────────

export const addWorkExperience = async (experience: any): Promise<Candidate> => {
  return apiClient.post<Candidate>("/api/candidate/me/experience", experience);
};

export const removeWorkExperience = async (experienceId: string): Promise<Candidate> => {
  return apiClient.delete<Candidate>(`/api/candidate/me/experience/${experienceId}`);
};
