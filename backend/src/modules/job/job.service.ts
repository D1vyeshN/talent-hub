import { IJob, Job } from "./job.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { JobFilters } from "../../shared/types/index";
import { CreateJobPayload, UpdateJobPayload } from "./job.validation";

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

export const getJobById = async (jobId: string) => {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { $inc: { viewsCount: 1 } },
    { new: true }
  )
    .populate("company")
    .populate("recruiter", "name email avatar");

  if (!job) throw new ApiError(404, "Job not found");
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

  if (filters.query) query.$text = { $search: filters.query };
  if (filters.location) query.location = new RegExp(filters.location, "i");
  if (filters.type) query.type = filters.type;
  if (filters.level) query.level = filters.level;
  if (filters.isRemote) query.isRemote = true;
  if (filters.category) query.category = filters.category;
  if (filters.company) query.company = filters.company;
  if (filters.skills?.length) query.skills = { $in: filters.skills };
  if (filters.salary) {
    query["salary.min"] = { $gte: filters.salary.min };
    query["salary.max"] = { $lte: filters.salary.max };
  }
  if (filters.postedWithin) {
    const days = parseInt(filters.postedWithin);
    query.postedAt = { $gte: new Date(Date.now() - days * 86400000) };
  }

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Job.find(query)
      .populate("company", "name logo location verified")
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
  if (updates.minSalary !== undefined || updates.maxSalary !== undefined) {
    job.salary = {
      min: updates.minSalary || job.salary.min,
      max: updates.maxSalary || job.salary.max,
      currency: job.salary.currency,
      period: job.salary.period,
    };
    delete (updates as any).minSalary;
    delete (updates as any).maxSalary;
  }

  Object.assign(job, updates);
  return job.save();
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