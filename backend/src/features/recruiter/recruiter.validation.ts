import { z } from "zod";

export const updateRecruiterSchema = z.object({
  name:        z.string().min(2).optional(),
  designation: z.string().min(2).optional(),
  company:     z.string().optional(),
  avatar:      z.string().url().optional(),
});

export type UpdateRecruiterInput = z.infer<typeof updateRecruiterSchema>;