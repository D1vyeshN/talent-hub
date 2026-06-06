import { Request, Response } from "express";
import * as JobService from "./job.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPagination } from "../../utils/pagination";
import { Recruiter } from "../recruiter/recruiter.model";
import { ApiError } from "../../utils/ApiError";

// GET /api/v1/jobs
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await JobService.getJobs(req.query, page, pageSize);
  res.json(new ApiResponse(200, result, "Jobs fetched successfully"));
});

// GET /api/v1/jobs/:id
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await JobService.getJobById(req.params.id as string);
  res.json(new ApiResponse(200, job, "Job fetched successfully"));
});

// POST /api/v1/jobs
export const createJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const input = req.body;
    const recruiter = await Recruiter.findById(req.userId!);

    if (!recruiter?.companyId) {
      throw new ApiError(
        400,
        "You must be associated with a company to post jobs",
      );
    }

    const job = await JobService.createJob(
      req.userId!,
      recruiter.companyId.toString(),
      input,
    );

    res.status(201).json(new ApiResponse(201, job, "Job created successfully"));
  },
);

// PUT /api/v1/jobs/:id
export const updateJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const input = req.body;
    const job = await JobService.updateJob(
      req.params.id as string,
      req.userId!,
      input,
    );
    res.json(new ApiResponse(200, job, "Job updated successfully"));
  },
);

// DELETE /api/v1/jobs/:id
export const deleteJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await JobService.deleteJob(req.params.id as string, req.userId!);
    res.json(new ApiResponse(200, null, "Job deleted successfully"));
  },
);

// PATCH /api/v1/jobs/:id/status
export const updateJobStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const job = await JobService.updateJob(
      req.params.id as string,
      req.userId!,
      { status },
    );
    res.json(new ApiResponse(200, job, "Job status updated"));
  },
);

// PATCH /api/v1/jobs/:id/feature  (admin)
export const toggleFeature = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const job = await JobService.getJobById(req.params.id as string);
    const updated = await JobService.updateJob(
      req.params.id as string,
      req.userId!,
      {
        isFeatured: !job.isFeatured,
      },
    );
    res.json(new ApiResponse(200, updated, "Featured status toggled"));
  },
);
