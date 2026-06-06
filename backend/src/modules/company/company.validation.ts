import { z } from "zod";

export const createCompanySchema = z.object({
  name:        z.string().min(2, "Company name must be at least 2 characters"),
  logo:        z.string().url("Logo must be a valid URL"),
  website:     z.string().url().optional(),
  industry:    z.string().min(2),
  size:        z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]),
  location:    z.string().min(2),
  description: z.string().max(2000).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;