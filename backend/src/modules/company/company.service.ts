import { Company } from "./company.model";
import { Recruiter } from "../recruiter/recruiter.model";
import { Job } from "../job/job.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { CreateCompanyInput, UpdateCompanyInput } from "./company.validation";

// ─── Create company ───────────────────────────────────────────────────────────
export const createCompany = async (
  recruiterId: string,
  input: CreateCompanyInput
) => {
  const existing = await Company.findOne({ name: input.name });
  if (existing) throw new ApiError(409, "Company with this name already exists");

  const company = await Company.create({ ...input, owner: recruiterId });

  // Link company to recruiter
  await Recruiter.findByIdAndUpdate(recruiterId, {
    $set: { companyId: company._id, company: company.name },
  });

  return company;
};

// ─── Get company by ID ────────────────────────────────────────────────────────
export const getCompanyById = async (companyId: string) => {
  const company = await Company.findById(companyId);
  if (!company) throw new ApiError(404, "Company not found");

  // Fetch jobs related to this company
  const jobs = await Job.find({ 
    company: companyId, 
    status: "active" 
  })
    .populate("company", "name logo location verified")
    .populate("recruiter", "name email avatar")
    .sort({ postedAt: -1 });

  // Add jobs to company object (as a plain object, not a mongoose document)
  const companyObj = company.toObject();
  (companyObj as any).jobs = jobs;

  return companyObj;
};

// ─── Get all companies ────────────────────────────────────────────────────────
export const getAllCompanies = async (
  page: number,
  pageSize: number,
  industry?: string,
  verified?: boolean
) => {
  const query: Record<string, unknown> = {};
  if (industry)                query.industry = new RegExp(industry, "i");
  if (verified !== undefined)  query.verified  = verified;

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Company.find(query).skip(skip).limit(pageSize).sort({ verified: -1 }),
    Company.countDocuments(query),
  ]);

  return buildPaginatedResponse(data, total, page, pageSize);
};

// ─── Update company ───────────────────────────────────────────────────────────
export const updateCompany = async (
  companyId: string,
  recruiterId: string,
  input: UpdateCompanyInput
) => {
  const company = await Company.findOne({ _id: companyId, owner: recruiterId });
  if (!company) throw new ApiError(404, "Company not found or unauthorized");

  Object.assign(company, input);
  return company.save();
};

// ─── Delete company ───────────────────────────────────────────────────────────
export const deleteCompany = async (companyId: string, requesterId: string, role: string) => {
  const query = role === "admin"
    ? { _id: companyId }
    : { _id: companyId, owner: requesterId };

  const company = await Company.findOneAndDelete(query);
  if (!company) throw new ApiError(404, "Company not found or unauthorized");
  return company;
};