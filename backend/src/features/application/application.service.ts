import { Application } from "./application.model";
import { Job } from "../job/job.model";
import { Candidate } from "../candidate/candidate.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { Notification } from "../notification/notification.model";
import mongoose from "mongoose";
import { ApplicationStatus } from "@/shared/types";

export const applyToJob = async (
  candidateId: string,
  jobId: string,
  data: { coverLetter?: string; resumeUrl?: string }
) => {
  const job = await Job.findById(jobId);
  if (!job || job.status !== "active") throw new ApiError(400, "Job is not available");

  const existing = await Application.findOne({ jobId, candidateId });
  if (existing) throw new ApiError(409, "You already applied to this job");

  const [application] = await Promise.all([
    Application.create({ jobId, candidateId, ...data }),
    Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } }),
    Candidate.findByIdAndUpdate(candidateId, { $addToSet: { appliedJobs: jobId } }),
  ]);

  // Trigger notification (fire-and-forget)
  Notification.create({
    userId: job.recruiter,
    type: "application_update",
    title: "New Application",
    message: `A candidate applied to your job: ${job.title}`,
    read: false,
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
  const application = await Application.findById(applicationId).populate("jobId");
  if (!application) throw new ApiError(404, "Application not found");

  const job = application.jobId as unknown as { recruiter: mongoose.Types.ObjectId };
  if (job.recruiter.toString() !== recruiterId)
    throw new ApiError(403, "Not authorized");

  application.status = status as ApplicationStatus;
  if (notes) application.notes = notes;
  return application.save();
};

export const getCandidateApplications = async (
  candidateId: string,
  page: number,
  pageSize: number
) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Application.find({ candidateId })
      .populate({ path: "jobId", populate: { path: "company", select: "name logo" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Application.countDocuments({ candidateId }),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
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