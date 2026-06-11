// ─── Auth & User ─────────────────────────────────────────────────────────────

export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface Candidate extends User {
  role: "candidate";
  headline?: string;
  location?: string;
  skills: string[];
  experience: number; // years
  resumeUrl?: string;
  savedJobs: string[];
  appliedJobs: string[];
  profileCompletion: number;
  education?: any[];
  saved?: boolean; // Whether this candidate is saved by the current recruiter
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

// ─── Job ─────────────────────────────────────────────────────────────────────

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "remote";
export type JobLevel = "entry" | "mid" | "senior" | "lead" | "executive";
export type JobStatus = "active" | "closed" | "draft" | "paused";
export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "hired";

export interface Salary {
  min: number;
  max: number;
  currency: string;
  period: "monthly" | "yearly";
}

export interface Job {
  _id: string;
  title: string;
  company: Company;
  location: string;
  type: JobType;
  level: JobLevel;
  salary: Salary;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  postedAt: string;
  expiresAt: string;
  status: JobStatus;
  applicantsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  isRemote: boolean;
  recruiter: User; // Recruiter user object (populated from backend)
  category: string;
}

export interface Application {
  _id: string;
  jobId: string;
  job: Job;
  candidateId: string;
  candidate?: Candidate;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
}

// ─── Company ─────────────────────────────────────────────────────────────────

export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export interface Company {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  industry: string;
  size: CompanySize;
  location: string;
  description?: string;
  foundedYear?: string;
  benefits?: string[];
  rating?: number;
  reviewsCount?: number;
  activeJobs?: number;
  verified?: boolean;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "application_update"
  | "new_message"
  | "job_alert"
  | "profile_view"
  | "interview_scheduled";

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  avatar?: string;
}

// ─── Message / Chat ────────────────────────────────────────────────────────────

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  jobContext?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsDataPoint {
  label: string;
  value: number;
  change?: number;
}

export interface StatCard {
  _id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: string;
  color: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface JobFilters {
  query: string;
  location: string;
  type: JobType | "";
  level: JobLevel | "";
  salary: { min: number; max: number };
  category: string;
  isRemote: boolean;
  company: string;
  skills: string[];
  postedWithin: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type PlanType = "free" | "pro" | "enterprise";

export interface Plan {
  _id: string;
  name: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  features: string[];
  jobPostLimit: number;
  featuredJobs: number;
  highlighted: boolean;
}
