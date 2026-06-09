import { Candidate } from "./candidate.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";

// ─── Profile Completion Calculation ─────────────────────────────────────────────

const calculateProfileCompletion = (candidate: any): number => {
  let completion = 0;
  if (candidate.headline) completion += 10;
  if (candidate.location) completion += 10;
  if (candidate.skills && candidate.skills.length > 0) completion += 15;
  if (candidate.experience && candidate.experience > 0) completion += 10;
  if (candidate.resumeUrl) completion += 25;
  if (candidate.avatar) completion += 15;
  if (candidate.education && candidate.education.length > 0) completion += 15;
  return Math.min(completion, 100);
};

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

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

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

// ─── Granular Skills Management ─────────────────────────────────────────────────────

export const addSkill = async (candidateId: string, skill: string) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $addToSet: { skills: skill } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

  return candidate;
};

export const removeSkill = async (candidateId: string, skill: string) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $pull: { skills: skill } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

  return candidate;
};

// ─── Education Management ─────────────────────────────────────────────────────────────

export const addEducation = async (candidateId: string, education: any) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $push: { education } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

  return candidate;
};

export const removeEducation = async (candidateId: string, educationId: string) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $pull: { education: { _id: educationId } } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

  return candidate;
};

// ─── Work Experience Management ───────────────────────────────────────────────────────

export const addWorkExperience = async (candidateId: string, experience: any) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $push: { workExperience: experience } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

  return candidate;
};

export const removeWorkExperience = async (candidateId: string, experienceId: string) => {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $pull: { workExperience: { _id: experienceId } } },
    { new: true }
  );
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Recalculate profile completion
  const profileCompletion = calculateProfileCompletion(candidate);
  candidate.profileCompletion = profileCompletion;
  await candidate.save();

  return candidate;
};