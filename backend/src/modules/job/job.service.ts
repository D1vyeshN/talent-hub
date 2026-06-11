import { IJob, Job } from "./job.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { JobFilters } from "../../shared/types/index";
import { CreateJobPayload, UpdateJobPayload } from "./job.validation";
import { createNotification } from "../notification/notification.service";

export const createJob = async (
  recruiterId: string,
  companyId: string,
  data: CreateJobPayload
) => {
  const { expiresAt, minSalary, maxSalary, ...rest } = data;

  const jobData: Partial<IJob> = {
    ...rest,
    recruiter: recruiterId,
    company: companyId,
    status: "draft",
  };

  // Handle salary structure from frontend (minSalary, maxSalary -> salary object)
  if (minSalary !== undefined || maxSalary !== undefined) {
    jobData.salary = {
      min: minSalary || 0,
      max: maxSalary || 0,
      currency: "INR",
      period: "yearly",
    };
  }

  // Convert expiresAt string to Date if provided
  if (expiresAt) {
    jobData.expiresAt = new Date(expiresAt);
  }

  const job = await Job.create(jobData);
  return job;
};

export const getJobById = async (jobId: string, viewerId?: string) => {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { $inc: { viewsCount: 1 } },
    { new: true }
  )
    .populate("company")
    .populate("recruiter", "name email avatar");

  if (!job) throw new ApiError(404, "Job not found");

  // Create profile view notification for recruiter if viewerId is provided and is not the recruiter
  if (viewerId && job.recruiter && job.recruiter.toString() !== viewerId) {
    // Only notify occasionally to avoid spam (e.g., every 10th view or use a more sophisticated strategy)
    // For now, we'll create a notification but this could be enhanced with throttling
    createNotification({
      userId: job.recruiter.toString(),
      type: "profile_view",
      title: "Profile Viewed",
      message: `A candidate viewed your job: ${job.title}`,
      actionUrl: `/jobs/${jobId}`,
    }).catch(console.error);
  }

  return job;
};

export const getJobs = async (
  filters: Partial<JobFilters>,
  page: number,
  pageSize: number,
  recruiterId?: string
) => {
  // If recruiterId is provided, show all their jobs regardless of status
  // Otherwise, only show active jobs for public access
  const query: Record<string, unknown> = recruiterId ? {} : { status: "active" };

  if (recruiterId) {
    query.recruiter = recruiterId;
  }

  // Filter out undefined string values (from frontend sending "undefined" as string)
  if (filters.query && filters.query !== "undefined") query.$text = { $search: filters.query };
  if (filters.location && filters.location !== "undefined") query.location = new RegExp(filters.location, "i");
  if (filters.type && filters.type !== "undefined") query.type = filters.type;
  if (filters.level && filters.level !== "undefined") query.level = filters.level;
  if (filters.isRemote === true) query.isRemote = true;
  if (filters.category && filters.category !== "undefined") query.category = filters.category;
  if (filters.company && filters.company !== "undefined") query.company = filters.company;
  if (filters.skills?.length && filters.skills[0] !== "undefined") query.skills = { $in: filters.skills };
  if (filters.salary) {
    (query as any)["salary.min"] = { $gte: filters.salary.min };
    (query as any)["salary.max"] = { $lte: filters.salary.max };
  }
  if (filters.postedWithin && filters.postedWithin !== "undefined") {
    const days = parseInt(filters.postedWithin);
    query.postedAt = { $gte: new Date(Date.now() - days * 86400000) };
  }

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Job.find(query)
      .populate("company", "name logo location verified")
      .populate("recruiter", "name email avatar")
      .sort({ isFeatured: -1, postedAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Job.countDocuments(query),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
};

export const updateJob = async (
  jobId: string,
  recruiterId: string,
  updates: UpdateJobPayload
) => {
  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) throw new ApiError(404, "Job not found or unauthorized");

  // Handle salary structure from frontend (minSalary, maxSalary -> salary object)
  const updateData: any = { ...updates };
  if (updates.minSalary !== undefined || updates.maxSalary !== undefined) {
    updateData.salary = {
      min: updates.minSalary || job.salary.min,
      max: updates.maxSalary || job.salary.max,
      currency: job.salary.currency,
      period: job.salary.period,
    };
    delete updateData.minSalary;
    delete updateData.maxSalary;
  }

  // Handle expiresAt string to Date if provided
  if (updates.expiresAt) {
    updateData.expiresAt = new Date(updates.expiresAt);
  }

  const updatedJob = await Job.findOneAndUpdate(
    { _id: jobId, recruiter: recruiterId },
    updateData,
    { new: true }
  )
    .populate("company", "name logo location verified")
    .populate("recruiter", "name email avatar");

  if (!updatedJob) throw new ApiError(404, "Job not found or unauthorized");
  return updatedJob;
};

export const deleteJob = async (jobId: string, recruiterId: string) => {
  const job = await Job.findOneAndDelete({ _id: jobId, recruiter: recruiterId });
  if (!job) throw new ApiError(404, "Job not found or unauthorized");
  return job;
};

export const toggleFeature = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");
  job.isFeatured = !job.isFeatured;
  return job.save();
};