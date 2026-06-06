import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as CandidateService from "./candidate.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPagination } from "../../utils/pagination";

export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const candidate = await CandidateService.getCandidateProfile(req.userId!);
  res.json(new ApiResponse(200, candidate, "Profile fetched"));
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await CandidateService.updateCandidateProfile(
    req.userId!,
    req.body
  );
  res.json(new ApiResponse(200, updated, "Profile updated"));
});

export const saveJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const candidate = await CandidateService.saveJob(req.userId!, req.params.jobId as string);
  res.json(new ApiResponse(200, candidate, "Job saved"));
});

export const unsaveJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const candidate = await CandidateService.unsaveJob(req.userId!, req.params.jobId as string);
  res.json(new ApiResponse(200, candidate, "Job unsaved"));
});

export const getAllCandidates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await CandidateService.getAllCandidates(page, pageSize);
  res.json(new ApiResponse(200, result, "Candidates fetched"));
});