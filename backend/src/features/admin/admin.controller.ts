import { Request, Response } from "express";
import * as AdminService from "./admin.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET /api/v1/admin/dashboard
export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await AdminService.getDashboardStats();
  res.json(new ApiResponse(200, stats, "Dashboard stats fetched"));
});

// PATCH /api/v1/admin/companies/:id/verify
export const verifyCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await AdminService.verifyCompany(req.params.id as string);
  res.json(new ApiResponse(200, company, "Company verified successfully"));
});

// PATCH /api/v1/admin/jobs/:id/feature
export const toggleFeature = asyncHandler(async (req: Request, res: Response) => {
  const job = await AdminService.toggleJobFeatured(req.params.id as string);
  res.json(new ApiResponse(200, job, "Job featured status toggled"));
});

// POST /api/v1/admin/create-admin
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = await AdminService.createAdmin(req.body);
  res.status(201).json(new ApiResponse(201, admin, "Admin created successfully"));
});

// PATCH /api/v1/admin/users/:id/ban
export const toggleUserBan = asyncHandler(async (req: Request, res: Response) => {
  const user = await AdminService.toggleUserBan(req.params.id as string);
  res.json(new ApiResponse(200, user, "User ban status toggled"));
});