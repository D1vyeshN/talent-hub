import { User } from "../users/user.model";
import { Job } from "../job/job.model";
import { Application } from "../application/application.model";
import { Company } from "../company/company.model";
import { Admin } from "./admin.model";
import { ApiError } from "../../utils/ApiError";

// ─── Dashboard overview stats ─────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
    activeJobs,
    verifiedCompanies,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Company.countDocuments(),
    Job.countDocuments({ status: "active" }),
    Company.countDocuments({ verified: true }),
  ]);

  return {
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
    activeJobs,
    verifiedCompanies,
  };
};

// ─── Verify a company ─────────────────────────────────────────────────────────
export const verifyCompany = async (companyId: string) => {
  const company = await Company.findByIdAndUpdate(
    companyId,
    { $set: { verified: true } },
    { new: true }
  );
  if (!company) throw new ApiError(404, "Company not found");
  return company;
};

// ─── Toggle job featured status ───────────────────────────────────────────────
export const toggleJobFeatured = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  job.isFeatured = !job.isFeatured;
  return job.save();
};

// ─── Create admin user ────────────────────────────────────────────────────────
export const createAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  permissions?: string[];
}) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new ApiError(409, "Email already registered");

  const admin = await Admin.create({
    ...data,
    role:        "admin",
    permissions: data.permissions ?? [
      "manage_users",
      "manage_jobs",
      "manage_companies",
      "view_analytics",
    ],
  });

  return admin;
};

// ─── Ban / Unban a user ───────────────────────────────────────────────────────
export const toggleUserBan = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Use a simple boolean field if you add `isBanned` to your schema
  (user as unknown as Record<string, unknown>).isBanned =
    !(user as unknown as Record<string, unknown>).isBanned;

  return user.save();
};