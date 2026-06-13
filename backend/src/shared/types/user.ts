/**
 * Shared types — imported by both frontend and backend.
 * These define the API contract; both sides must stay in sync.
 */

export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface Candidate extends User {
  role: "candidate";
  headline?: string;
  location?: string;
  skills: string[];
  experience: number;
  resumeUrl?: string;
  savedJobs: string[];
  appliedJobs: string[];
  profileCompletion: number;
}

export interface Recruiter extends User {
  role: "recruiter";
  company: string;
  companyId: string;
  designation: string;
  postedJobs: string[];
}

export interface Admin extends User {
  role: "admin";
  permissions: string[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
