import { z } from "zod";

export const createCompanySchema = z.object({
  name:        z.string().min(2, "Company name must be at least 2 characters"),
  logo:        z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
  website:     z.string().url().optional(),
  industry:    z.string().min(2),
  size:        z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]),
  location:    z.string().min(2),
  description: z.string().max(2000).optional(),
  foundedYear: z.string().optional().refine((val) => {
    if (!val) return true;
    const year = parseInt(val);
    return !isNaN(year) && year >= 1800 && year <= new Date().getFullYear();
  }, "Founded year must be between 1800 and current year"),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;