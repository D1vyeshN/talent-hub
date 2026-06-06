/**
 * Company form validation - matches backend Zod validation
 */

import type { CompanySize } from "@/types";

export interface CompanyFormData {
  name: string;
  logo?: string;
  website: string;
  industry: string;
  size: CompanySize;
  location: string;
  description: string;
  foundedYear: string;
}

export interface ValidationError {
  field: keyof CompanyFormData;
  message: string;
}

export const COMPANY_SIZE_OPTIONS: CompanySize[] = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export const validateCompanyForm = (data: CompanyFormData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const currentYear = new Date().getFullYear();

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: "name", message: "Company name must be at least 2 characters" });
  }

  // Logo validation - optional, but if provided must be valid URL
  if (data.logo && data.logo.trim().length > 0) {
    try {
      new URL(data.logo);
    } catch {
      errors.push({ field: "logo", message: "Logo must be a valid URL" });
    }
  }

  // Website validation - must be valid URL if provided
  if (data.website && data.website.trim().length > 0) {
    try {
      new URL(data.website);
    } catch {
      errors.push({ field: "website", message: "Website must be a valid URL" });
    }
  }

  // Industry validation
  if (!data.industry || data.industry.trim().length < 2) {
    errors.push({ field: "industry", message: "Industry must be at least 2 characters" });
  }

  // Size validation
  if (!data.size || !COMPANY_SIZE_OPTIONS.includes(data.size)) {
    errors.push({ field: "size", message: "Please select a valid company size" });
  }

  // Location validation
  if (!data.location || data.location.trim().length < 2) {
    errors.push({ field: "location", message: "Location must be at least 2 characters" });
  }

  // Description validation - max 2000 characters
  if (data.description && data.description.length > 2000) {
    errors.push({ field: "description", message: "Description must be less than 2000 characters" });
  }

  // Founded Year validation - min 1800, max current year
  if (data.foundedYear && data.foundedYear.trim().length > 0) {
    const year = parseInt(data.foundedYear);
    if (isNaN(year) || year < 1800 || year > currentYear) {
      errors.push({ field: "foundedYear", message: `Founded year must be between 1800 and ${currentYear}` });
    }
  }

  return errors;
};

export const getFieldError = (errors: ValidationError[], field: keyof CompanyFormData): string | undefined => {
  return errors.find((e) => e.field === field)?.message;
};
