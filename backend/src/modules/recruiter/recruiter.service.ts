import { Recruiter } from "./recruiter.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { UpdateRecruiterInput } from "./recruiter.validation";

// ─── Get recruiter profile ────────────────────────────────────────────────────
export const getRecruiterProfile = async (userId: string) => {
  const recruiter = await Recruiter.findById(userId).populate("companyId");
  if (!recruiter) throw new ApiError(404, "Recruiter not found");
  return recruiter;
};

// ─── Update recruiter profile ─────────────────────────────────────────────────
export const updateRecruiterProfile = async (
  userId: string,
  input: UpdateRecruiterInput
) => {
  const forbiddenFields = ["role", "email", "password", "_id"];
  const updates = Object.fromEntries(
    Object.entries(input).filter(([key]) => !forbiddenFields.includes(key))
  );

  const recruiter = await Recruiter.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("companyId");

  if (!recruiter) throw new ApiError(404, "Recruiter not found");
  return recruiter;
};

// ─── Attach a company to recruiter ───────────────────────────────────────────
export const assignCompany = async (
  recruiterId: string,
  companyId: string
) => {
  const recruiter = await Recruiter.findByIdAndUpdate(
    recruiterId,
    { $set: { companyId } },
    { new: true }
  ).populate("companyId");

  if (!recruiter) throw new ApiError(404, "Recruiter not found");
  return recruiter;
};

// ─── Get all recruiters (admin) ───────────────────────────────────────────────
export const getAllRecruiters = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Recruiter.find().skip(skip).limit(pageSize).populate("companyId", "name logo"),
    Recruiter.countDocuments(),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
};