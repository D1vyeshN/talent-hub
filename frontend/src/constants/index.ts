import type { JobType, JobLevel, CompanySize, ApplicationStatus } from "@/types";

export const APP_NAME = "TalentHub";
export const APP_TAGLINE = "Find Your Dream Job";

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  // { value: "remote", label: "Remote" },
];

export const JOB_LEVELS: { value: JobLevel; label: string }[] = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
];

export const JOB_CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
  "Sales",
  "Engineering",
  "Operations",
  "HR & Recruiting",
  "Legal",
  "Product",
  "Data Science",
  "Customer Support",
  "Content & Writing",
];

export const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  applied: { label: "Applied", color: "text-blue-700", bg: "bg-blue-50" },
  screening: { label: "Screening", color: "text-amber-700", bg: "bg-amber-50" },
  interview: { label: "Interview", color: "text-purple-700", bg: "bg-purple-50" },
  offer: { label: "Offer", color: "text-green-700", bg: "bg-green-50" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50" },
  hired: { label: "Hired", color: "text-emerald-700", bg: "bg-emerald-50" },
};

export const SALARY_RANGES = [
  { label: "Any", min: 0, max: 0 },
  { label: "₹0 – ₹5L", min: 0, max: 500000 },
  { label: "₹5L – ₹10L", min: 500000, max: 1000000 },
  { label: "₹10L – ₹20L", min: 1000000, max: 2000000 },
  { label: "₹20L – ₹50L", min: 2000000, max: 5000000 },
  { label: "₹50L+", min: 5000000, max: 0 },
];

export const POSTED_WITHIN_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Last 24 hours", value: "1d" },
  { label: "Last 3 days", value: "3d" },
  { label: "Last week", value: "7d" },
  { label: "Last month", value: "30d" },
];

export const TECH_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js",
  "Python", "Java", "Go", "Rust", "C++",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "GraphQL", "REST API", "PostgreSQL", "MongoDB", "Redis",
  "Tailwind CSS", "Figma", "Git", "CI/CD", "Microservices",
];

export const NAV_LINKS = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Salaries", href: "/salaries" },
  { label: "Resources", href: "/resources" },
];

export const PAGINATION_PAGE_SIZE = 10;
