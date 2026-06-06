import { Response } from "express";
import * as RecruiterService from "./recruiter.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPagination } from "../../utils/pagination";
import { updateRecruiterSchema } from "./recruiter.validation";

// GET /api/v1/recruiters/me
export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const recruiter = await RecruiterService.getRecruiterProfile(req.userId!);
  res.json(new ApiResponse(200, recruiter, "Profile fetched successfully"));
});

// PUT /api/v1/recruiters/me
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input     = updateRecruiterSchema.parse(req.body);
  const recruiter = await RecruiterService.updateRecruiterProfile(req.userId!, input);
  res.json(new ApiResponse(200, recruiter, "Profile updated successfully"));
});

// PATCH /api/v1/recruiters/me/company
export const assignCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { companyId } = req.body;
  if (!companyId) throw new Error("companyId is required");

  const recruiter = await RecruiterService.assignCompany(req.userId!, companyId);
  res.json(new ApiResponse(200, recruiter, "Company assigned successfully"));
});

// GET /api/v1/recruiters  (admin only)
export const getAllRecruiters = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await RecruiterService.getAllRecruiters(page, pageSize);
  res.json(new ApiResponse(200, result, "Recruiters fetched successfully"));
});

// GET /api/v1/recruiters/:id  (public)
export const getRecruiterById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const recruiter = await RecruiterService.getRecruiterProfile(req.params.id as string);
  res.json(new ApiResponse(200, recruiter, "Recruiter fetched successfully"));
});