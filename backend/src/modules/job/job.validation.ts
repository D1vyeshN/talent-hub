import { z } from "zod";
import { JobStatus } from "../../shared/types/index";

export const createJobSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters").max(100, "Job title must not exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must not exceed 5000 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  level: z.enum(["entry", "mid", "senior", "lead", "executive"]),
  minSalary: z.number().min(0, "Minimum salary must be a positive number").optional(),
  maxSalary: z.number().min(0, "Maximum salary must be a positive number").optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required").max(20, "Cannot have more than 20 skills"),
  requirements: z.array(z.string()).max(20, "Cannot have more than 20 requirements").optional(),
  responsibilities: z.array(z.string()).max(20, "Cannot have more than 20 responsibilities").optional(),
  category: z.string().min(2, "Category must be at least 2 characters"),
  expiresAt: z.string().optional(),
  isRemote: z.boolean().optional(),
}).refine((data) => {
  if (data.minSalary !== undefined && data.maxSalary !== undefined) {
    return data.minSalary <= data.maxSalary;
  }
  return true;
}, { message: "Minimum salary must be less than or equal to maximum salary" });

export const updateJobSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters").max(100, "Job title must not exceed 100 characters").optional(),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must not exceed 5000 characters").optional(),
  location: z.string().min(2, "Location must be at least 2 characters").optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]).optional(),
  level: z.enum(["entry", "mid", "senior", "lead", "executive"]).optional(),
  minSalary: z.number().min(0, "Minimum salary must be a positive number").optional(),
  maxSalary: z.number().min(0, "Maximum salary must be a positive number").optional(),
  skills: z.array(z.string()).max(20, "Cannot have more than 20 skills").optional(),
  requirements: z.array(z.string()).max(20, "Cannot have more than 20 requirements").optional(),
  responsibilities: z.array(z.string()).max(20, "Cannot have more than 20 responsibilities").optional(),
  category: z.string().min(2, "Category must be at least 2 characters").optional(),
  expiresAt: z.string().optional(),
  isRemote: z.boolean().optional(),
}).refine((data) => {
  if (data.minSalary !== undefined && data.maxSalary !== undefined) {
    return data.minSalary <= data.maxSalary;
  }
  return true;
}, { message: "Minimum salary must be less than or equal to maximum salary" });

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// Extended interface for service layer with minSalary/maxSalary
export interface CreateJobPayload extends Omit<CreateJobInput, 'minSalary' | 'maxSalary'> {
  minSalary?: number;
  maxSalary?: number;
}

export interface UpdateJobPayload extends Omit<UpdateJobInput, 'minSalary' | 'maxSalary'> {
  minSalary?: number;
  maxSalary?: number;
  status?: JobStatus;
  isFeatured?: boolean;
}
