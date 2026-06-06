import { Response } from "express";
import * as ApplicationService from "./application.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPagination } from "../../utils/pagination";
import { createApplicationSchema, updateStatusSchema } from "./application.validation";

// POST /api/v1/applications
export const applyToJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input       = createApplicationSchema.parse(req.body);
  const application = await ApplicationService.applyToJob(
    req.userId!,
    input.jobId,
    { coverLetter: input.coverLetter, resumeUrl: input.resumeUrl }
  );
  res.status(201).json(new ApiResponse(201, application, "Application submitted successfully"));
});

// GET /api/v1/applications/my
export const getMyApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await ApplicationService.getCandidateApplications(
    req.userId!, page, pageSize
  );
  res.json(new ApiResponse(200, result, "Applications fetched successfully"));
});

// GET /api/v1/applications/job/:jobId  (recruiter)
export const getJobApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await ApplicationService.getJobApplications(
    req.params.jobId as string, req.userId!, page, pageSize
  );
  res.json(new ApiResponse(200, result, "Applications fetched successfully"));
});

// PATCH /api/v1/applications/:id/status  (recruiter)
export const updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, notes } = updateStatusSchema.parse(req.body);
  const application = await ApplicationService.updateApplicationStatus(
    req.params.id as string, req.userId!, status, notes
  );
  res.json(new ApiResponse(200, application, "Application status updated"));
});

// GET /api/v1/applications/:id
export const getApplicationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await ApplicationService.getApplicationById(
    req.params.id as string, req.userId!, req.userRole! );
  res.json(new ApiResponse(200, application, "Application fetched successfully"));
});

// DELETE /api/v1/applications/:id  (candidate withdraws)
export const withdrawApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  await ApplicationService.withdrawApplication(req.params.id as string, req.userId!);
  res.json(new ApiResponse(200, null, "Application withdrawn successfully"));
});