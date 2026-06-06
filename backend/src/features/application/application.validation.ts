import { z } from "zod";

export const createApplicationSchema = z.object({
  jobId:       z.string().min(1, "Job ID is required"),
  coverLetter: z.string().max(2000).optional(),
  resumeUrl:   z.string().url().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["applied", "screening", "interview", "offer", "rejected", "hired"]),
  notes:  z.string().max(1000).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateStatusInput      = z.infer<typeof updateStatusSchema>;