import { Candidate } from "./candidate.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";

export const getCandidateProfile = async (userId: string) => {
  const candidate = await Candidate.findById(userId);
  if (!candidate) throw new ApiError(404, "Candidate not found");
  return candidate;
};

export const updateCandidateProfile = async (
  userId: string,
  updates: Record<string, unknown>
) => {
  // Prevent role/email tampering
  const forbiddenFields = ["role", "email", "password", "_id"];
  forbiddenFields.forEach((field) => delete updates[field]);

  const candidate = await Candidate.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");
  return candidate;
};

export const saveJob = async (candidateId: string, jobId: string) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $addToSet: { savedJobs: jobId } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");
  return candidate;
};

export const unsaveJob = async (candidateId: string, jobId: string) => {
  return Candidate.findByIdAndUpdate(
    candidateId,
    { $pull: { savedJobs: jobId } },
    { new: true }
  );
};

export const getAllCandidates = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Candidate.find().skip(skip).limit(pageSize).select("-password"),
    Candidate.countDocuments(),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
};