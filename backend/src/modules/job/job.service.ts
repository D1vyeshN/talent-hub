import { IJob, Job } from "./job.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { JobFilters } from "../../shared/types/index";

export const createJob = async (
  recruiterId: string,
  companyId: string,
  data: Partial<IJob>
) => {
  const job = await Job.create({
    ...data,
    recruiter: recruiterId,
    company: companyId,
    status: "draft",
  });
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
  pageSize: number
) => {
  const query: Record<string, unknown> = { status: "active" };

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
  updates: Partial<IJob>
) => {
  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) throw new ApiError(404, "Job not found or unauthorized");
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