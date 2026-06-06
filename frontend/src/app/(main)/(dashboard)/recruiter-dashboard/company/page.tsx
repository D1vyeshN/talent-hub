"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Building2, Globe, MapPin, Users, Calendar, CheckCircle, Edit3, Plus, Trash2 } from "lucide-react";
import { companyService } from "@/features/company/services/company.service";
import { recruiterService } from "@/features/recruiter/services/recruiter.service";
import { validateCompanyForm, getFieldError, COMPANY_SIZE_OPTIONS } from "@/features/company/validation/company.validation";
import type { Company } from "@/types";

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    industry: "",
    size: "" as Company["size"],
    location: "",
    description: "",
    foundedYear: "",
  });



  const fetchCompany = async () => {
    try {
      setIsLoading(true);
      // Get recruiter profile to find company ID
      const recruiter = await recruiterService.getMyProfile();
      if (recruiter.companyId) {
        console.log("Recruiter company ID:", recruiter.companyId);
        const companyData = await companyService.getById(recruiter.companyId);
        setCompany(companyData);
        setFormData({
          name: companyData.name,
          logo: companyData.logo,
          website: companyData.website || "",
          industry: companyData.industry,
          size: companyData.size,
          location: companyData.location,
          description: companyData.description || "",
          foundedYear: companyData.foundedYear?.toString() || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load company");
      // Fallback to mock data for demo
      const { MOCK_COMPANIES, MOCK_RECRUITER } = await import("@/lib/mockData");
      const mockCompany = MOCK_COMPANIES.find((c) => c._id === MOCK_RECRUITER.companyId) || MOCK_COMPANIES[0];
      setCompany(mockCompany);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    // Validate form
    const errors = validateCompanyForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsUploading(true);
      const updatedCompany = await companyService.update(
        company._id,
        {
          ...formData,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        },
        logoFile || undefined
      );
      setCompany(updatedCompany);
      setIsEditing(false);
      setLogoFile(null);
      setValidationErrors([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update company");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateCompanyForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsUploading(true);
      const newCompany = await companyService.create(
        {
          ...formData,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        },
        logoFile || undefined
      );
      // Assign company to recruiter
      await recruiterService.assignCompany({ companyId: newCompany._id });
      setCompany(newCompany);
      setIsEditing(false);
      setLogoFile(null);
      setValidationErrors([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create company");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!company || !confirm("Are you sure you want to delete this company?")) return;

    try {
      await companyService.delete(company._id);
      setCompany(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete company");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your company&apos;s public profile</p>
        </div>
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your company&apos;s public profile</p>
        </div>
        <div className="flex gap-2">
          {!company && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
              Create Company
            </Button>
          )}
          {company && !isEditing && (
            <>
              <Button variant="outline" icon={<Edit3 className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="ghost" className="text-red-500 hover:bg-red-50" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 text-sm text-amber-600 border border-amber-200">
          ⚠️ {error}
        </div>
      )}

      {isEditing || !company ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {company ? "Edit Company Information" : "Create Company Profile"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={company ? handleUpdate : handleCreate} className="space-y-4 max-w-2xl">
            <Input
              label="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={getFieldError(validationErrors, "name")}
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Logo</label>
              <div className="flex items-start gap-4">
                {(formData.logo || logoFile) && (
                  <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : formData.logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLogoFile(file);
                        if (file) {
                          setFormData({ ...formData, logo: "" });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Upload a company logo (optional, max 5MB)</p>
                  {isUploading && (
                    <p className="text-sm text-blue-600">Uploading logo...</p>
                  )}
                </div>
              </div>
            </div>
            <Input
              label="Website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              error={getFieldError(validationErrors, "website")}
            />
            <Input
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              error={getFieldError(validationErrors, "industry")}
              required
            />
            <Select
              label="Company Size"
              placeholder="Select company size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value as Company["size"] })}
              error={getFieldError(validationErrors, "size")}
              options={COMPANY_SIZE_OPTIONS.map((size) => ({ value: size, label: `${size} employees` }))}
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={getFieldError(validationErrors, "location")}
              required
            />
            <Select
              label="Founded Year"
              placeholder="Select year"
              value={formData.foundedYear}
              onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
              error={getFieldError(validationErrors, "foundedYear")}
              options={Array.from({ length: new Date().getFullYear() - 1800 + 1 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return { value: year.toString(), label: year.toString() };
              })}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              type="textarea"
              error={getFieldError(validationErrors, "description")}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setValidationErrors([]); }}>Cancel</Button>
              <Button type="submit" variant="primary">
                {saved ? "✓ Saved!" : (company ? "Save Changes" : "Create Company")}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <div className="space-y-6">
            {/* Logo and Name */}
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                  {company.verified && (
                    <Badge variant="success" size="sm" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{company.description}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {company.industry}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {company.size} employees
                  </span>
                  {company.website && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </span>
                  )}
                  {company.foundedYear && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Founded {company.foundedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{company.activeJobs ?? 0}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{company.rating ?? "N/A"}</p>
                <p className="text-xs text-gray-500">Company Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{company.reviewsCount ?? 0}</p>
                <p className="text-xs text-gray-500">Reviews</p>
              </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}