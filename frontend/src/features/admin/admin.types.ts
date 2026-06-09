import { Company, Job, User, Application, Notification, Message } from "@/types";

export interface MockDataImport {
  companies?: Partial<Company>[];
  jobs?: Partial<Job>[];
  users?: Partial<User>[];
  applications?: Partial<Application>[];
  notifications?: Partial<Notification>[];
  messages?: Partial<Message>[];
}

export interface ImportResult {
  companies: number;
  jobs: number;
  users: number;
  applications: number;
  notifications: number;
  messages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  activeJobs: number;
  verifiedCompanies: number;
}
