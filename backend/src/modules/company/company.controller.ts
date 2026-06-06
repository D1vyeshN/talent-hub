import { Request, Response } from "express";
import * as CompanyService from "./company.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPagination } from "../../utils/pagination";
import { createCompanySchema, updateCompanySchema } from "./company.validation";

// GET /api/v1/companies
export const getAllCompanies = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const industry = req.query.industry as string | undefined;
  const verified = req.query.verified === "true" ? true : undefined;

  const result = await CompanyService.getAllCompanies(page, pageSize, industry, verified);
  res.json(new ApiResponse(200, result, "Companies fetched successfully"));
});

// GET /api/v1/companies/:id
export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
  const company = await CompanyService.getCompanyById(req.params.id as string);
  res.json(new ApiResponse(200, company, "Company fetched successfully"));
});

// POST /api/v1/companies
export const createCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input   = createCompanySchema.parse(req.body);
  const company = await CompanyService.createCompany(req.userId!, input);
  res.status(201).json(new ApiResponse(201, company, "Company created successfully"));
});

// PUT /api/v1/companies/:id
export const updateCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input   = updateCompanySchema.parse(req.body);
  const company = await CompanyService.updateCompany(req.params.id as string, req.userId!, input);
  res.json(new ApiResponse(200, company, "Company updated successfully"));
});

// DELETE /api/v1/companies/:id
export const deleteCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CompanyService.deleteCompany(req.params.id as string, req.userId!, req.userRole!);
  res.json(new ApiResponse(200, null, "Company deleted successfully"));
});