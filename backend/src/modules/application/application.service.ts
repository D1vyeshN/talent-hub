import { Application } from "./application.model";
import { Job } from "../job/job.model";
import { Candidate } from "../candidate/candidate.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { Notification } from "../notification/notification.model";
import mongoose from "mongoose";
import { ApplicationStatus } from "@/shared/types";
import { createNotification } from "../notification/notification.service";
import { Company } from "../company/company.model";

export const applyToJob = async (
  candidateId: string,
  jobId: string,
  companyId: string,
  data: { coverLetter?: string; resumeUrl?: string }
) => {
  const job = await Job.findById(jobId);
  if (!job || job.status !== "active") throw new ApiError(400, "Job is not available");

  const company = await Company.findById(companyId);
  if (!company) throw new ApiError(404, "Company not found");

  const existing = await Application.findOne({ jobId, candidateId });
  if (existing) throw new ApiError(409, "You already applied to this job");

  const [application] = await Promise.all([
    Application.create({ jobId, companyId, candidateId, ...data }),
    Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } }),
    Candidate.findByIdAndUpdate(candidateId, { $addToSet: { appliedJobs: jobId } }),
  ]);

  // Trigger notification (fire-and-forget)
  createNotification({
    userId: job.recruiter.toString(),
    type: "application_update",
    title: "New Application",
    message: `A candidate applied to your job: ${job.title}`,
    actionUrl: `/applications/${application._id}`,
  }).catch(console.error);

  return application;
};

export const updateApplicationStatus = async (
  applicationId: string,
  recruiterId: string,
  status: string,
  notes?: string
) => {
  const application = await Application.findById(applicationId)
    .populate('candidate', 'name email avatar')
    .populate('job', 'title company recruiter')
    .populate('company', 'name logo');

  if (!application) throw new ApiError(404, "Application not found");

  const job = application.job as unknown as { recruiter: mongoose.Types.ObjectId; title: string };

  if (job.recruiter.toString() !== recruiterId)
    throw new ApiError(403, "Not authorized");

  const oldStatus = application.status;
  application.status = status as ApplicationStatus;
  if (notes) application.notes = notes;
  const updatedApplication = await application.save();

  // Send notification to candidate when status changes
  if (oldStatus !== status) {
    let notificationType: "application_update" | "interview_scheduled" = "application_update";
    let title = "Application Update";
    let message = `Your application for ${job.title} has been updated to ${status}`;

    if (status === "interview") {
      notificationType = "interview_scheduled";
      title = "Interview Scheduled";
      message = `Congratulations! You have an interview scheduled for ${job.title}`;
    } else if (status === "offer") {
      title = "Job Offer";
      message = `You have received a job offer for ${job.title}`;
    } else if (status === "rejected") {
      title = "Application Update";
      message = `Your application for ${job.title} has been reviewed`;
    }

    // Create notification for candidate (fire-and-forget)
    createNotification({
      userId: application.candidateId.toString(),
      type: notificationType,
      title,
      message,
      actionUrl: `/applications/${application._id}`,
    }).catch(console.error);
  }

  return updatedApplication;
};

export const getCandidateApplications = async (
  candidateId: string,
  page: number,
  pageSize: number
) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Application.find({ candidateId })
      .populate({ path: "job", populate: { path: "company", select: "name logo" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Application.countDocuments({ candidateId }),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
};

export const getCompanyApplications = async (companyId: string, page: number, pageSize: number) => {
  try {
    // Get all applications for this company
    const applications = await Application.find({ companyId })
      .populate('candidate', 'name email avatar')
      .populate('job', 'title company')
      .populate('company', 'name logo')
      .sort({ appliedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await Application.countDocuments({ companyId });

    return buildPaginatedResponse(applications, total, Number(page), Number(pageSize));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch applications");
  }
};

export const getJobApplications = async (
  jobId: string,
  recruiterId: string,
  page: number,
  pageSize: number
) => {
  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) throw new ApiError(403, "Not authorized");

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Application.find({ jobId })
      .populate("candidateId", "name email avatar headline skills experience location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Application.countDocuments({ jobId }),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
};

// Add to application.service.ts

export const getApplicationById = async (
  applicationId: string,
  userId: string,
  role: string
) => {
  const application = await Application.findById(applicationId)
    .populate({ path: "jobId", populate: { path: "company", select: "name logo" } })
    .populate("candidateId", "name avatar email headline");

  if (!application) throw new ApiError(404, "Application not found");

  // Candidate can only see their own
  if (role === "candidate" && application.candidateId.toString() !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return application;
};

export const withdrawApplication = async (
  applicationId: string,
  candidateId: string
) => {
  const application = await Application.findOneAndDelete({
    _id: applicationId,
    candidateId,
    status: "applied", // can only withdraw if still in "applied" state
  });

  if (!application) {
    throw new ApiError(404, "Application not found or cannot be withdrawn");
  }

  await Promise.all([
    Job.findByIdAndUpdate(application.jobId, { $inc: { applicantsCount: -1 } }),
    Candidate.findByIdAndUpdate(candidateId, {
      $pull: { appliedJobs: application.jobId },
    }),
  ]);

  return application;
};

export const getApplicationStats = async (recruiterId: string) => {
  // Get all jobs for this recruiter
  const jobs = await Job.find({ recruiter: recruiterId }).select("_id");
  const jobIds = jobs.map((job) => job._id);

  if (jobIds.length === 0) {
    return {
      totalApplications: 0,
      byStatus: {
        applied: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        hired: 0,
      },
      byJob: [],
    };
  }

  // Get application counts by status
  const statusStats = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get application counts by job
  const jobStats = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    {
      $group: {
        _id: "$jobId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "jobs",
        localField: "_id",
        foreignField: "_id",
        as: "job",
      }
    },
    {
      $unwind: "$job",
    },
    {
      $project: {
        jobId: "$_id",
        jobTitle: "$job.title",
        count: 1,
      },
    },
  ]);

  const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });

  // Build status stats object
  const byStatus = {
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    hired: 0,
  };

  statusStats.forEach((stat: any) => {
    byStatus[stat._id as keyof typeof byStatus] = stat.count;
  });

  return {
    totalApplications,
    byStatus,
    byJob: jobStats,
  };
};