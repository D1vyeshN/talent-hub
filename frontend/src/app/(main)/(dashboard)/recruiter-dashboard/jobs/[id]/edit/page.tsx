"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { jobsService, CreateJobPayload } from "@/features/jobs/services/jobs.service";
import type { Job, JobStatus, JobType, JobLevel } from "@/types";

type Step = 1 | 2 | 3;

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  const [formData, setFormData] = useState<CreateJobPayload & { status?: JobStatus; isFeatured?: boolean }>({
    title: "",
    description: "",
    location: "",
    type: "full-time",
    level: "mid",
    minSalary: undefined,
    maxSalary: undefined,
    skills: [],
    requirements: [],
    responsibilities: [],
    category: "",
    expiresAt: undefined,
    isRemote: false,
    status: "draft",
    isFeatured: false,
  });

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await jobsService.getById(jobId);
          setJob(data);
          setFormData({
            title: data.title,
            description: data.description,
            location: data.location,
            type: data.type,
            level: data.level,
            minSalary: data.salary.min,
            maxSalary: data.salary.max,
            skills: data.skills,
            requirements: data.requirements,
            responsibilities: data.responsibilities,
            category: data.category,
            expiresAt: data.expiresAt,
            isRemote: data.isRemote,
            status: data.status,
            isFeatured: data.isFeatured,
          });
        } catch (err: any) {
          setError(err.message || "Failed to load job");
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [jobId]);



  const handleUpdate = async () => {
    setError(null);
    setSaving(true);

    try {
      // Validate required fields with same rules as backend
      if (!formData.title || formData.title.length < 5) {
        setError("Job title must be at least 5 characters");
        setSaving(false);
        return;
      }

      if (formData.title.length > 100) {
        setError("Job title must not exceed 100 characters");
        setSaving(false);
        return;
      }

      if (!formData.description || formData.description.length < 20) {
        setError("Description must be at least 20 characters");
        setSaving(false);
        return;
      }

      if (formData.description.length > 5000) {
        setError("Description must not exceed 5000 characters");
        setSaving(false);
        return;
      }

      if (!formData.location || formData.location.length < 2) {
        setError("Location must be at least 2 characters");
        setSaving(false);
        return;
      }

      if (!formData.category || formData.category.length < 2) {
        setError("Category must be at least 2 characters");
        setSaving(false);
        return;
      }

      if (formData.skills.length === 0) {
        setError("At least one skill is required");
        setSaving(false);
        return;
      }

      if (formData.skills.length > 20) {
        setError("Cannot have more than 20 skills");
        setSaving(false);
        return;
      }

      if (formData.requirements.length > 20) {
        setError("Cannot have more than 20 requirements");
        setSaving(false);
        return;
      }

      if (formData.responsibilities.length > 20) {
        setError("Cannot have more than 20 responsibilities");
        setSaving(false);
        return;
      }

      if (formData.minSalary !== undefined && formData.minSalary < 0) {
        setError("Minimum salary must be a positive number");
        setSaving(false);
        return;
      }

      if (formData.maxSalary !== undefined && formData.maxSalary < 0) {
        setError("Maximum salary must be a positive number");
        setSaving(false);
        return;
      }

      if (formData.minSalary !== undefined && formData.maxSalary !== undefined && formData.minSalary > formData.maxSalary) {
        setError("Minimum salary must be less than or equal to maximum salary");
        setSaving(false);
        return;
      }

      await jobsService.update(jobId, formData);
      router.push("/recruiter-dashboard/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to update job");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-sm text-gray-500 mt-0.5">Loading job details...</p>
          </div>
        </div>
        <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-6 h-96"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-sm text-gray-500 mt-0.5">Error loading job</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/recruiter-dashboard/jobs")}>
            Back to Jobs
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Update job posting details
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400",
                )}
              >
                {s}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  step >= s ? "text-gray-900" : "text-gray-400",
                )}
              >
                {["Job Details", "Requirements", "Preview & Update"][s - 1]}
              </span>
              {s < 3 && (
                <div
                  className={cn("flex-1 h-px", step > s ? "bg-blue-400" : "bg-gray-200")}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Job Title *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Location *
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Job Type *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Min Salary (INR/yr)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1000000"
                    value={formData.minSalary || ""}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Max Salary (INR/yr)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2000000"
                    value={formData.maxSalary || ""}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Job Description *
                </label>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the role, team, and what the candidate will work on..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Category *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Engineering, Design, Marketing"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Expires At
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRemote"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isRemote" className="text-sm text-gray-700">This is a remote position</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">Feature this job for more visibility</label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Required Skills *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type skills separated by commas (e.g. React, TypeScript, Node.js)"
                  value={formData.skills.join(", ")}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Experience Level *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                >
                  <option value="entry">Entry Level (0-2 yrs)</option>
                  <option value="mid">Mid Level (3-5 yrs)</option>
                  <option value="senior">Senior Level (5-8 yrs)</option>
                  <option value="lead">Lead / Principal (8+ yrs)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Requirements
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="List key requirements (one per line)..."
                  value={formData.requirements.join("\n")}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split("\n").map(r => r.trim()).filter(r => r) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Responsibilities
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="List key responsibilities (one per line)..."
                  value={formData.responsibilities.join("\n")}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value.split("\n").map(r => r.trim()).filter(r => r) })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">Your job is ready to update!</p>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Review the details below before saving changes.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-900">Preview Summary</p>
                <div className="text-gray-600 space-y-1">
                  <p>📌 {formData.title}</p>
                  <p>📍 {formData.location} · {formData.type}</p>
                  {formData.minSalary && formData.maxSalary && (
                    <p>💰 ₹{formData.minSalary.toLocaleString()} – ₹{formData.maxSalary.toLocaleString()} / year</p>
                  )}
                  <p>🎯 {formData.level} level</p>
                  <p>🏷️ {formData.category}</p>
                  <p>📊 Status: {formData.status}</p>
                  {formData.isFeatured && <p>⭐ Featured Job</p>}
                  {formData.isRemote && <p>🌐 Remote</p>}
                  {formData.expiresAt && <p>📅 Expires: {new Date(formData.expiresAt).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {step > 1 && (
              <Button variant="outline" size="md" onClick={() => setStep((s) => s - 1 as Step)}>
                Back
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="md" onClick={() => router.back()}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  loading={saving}
                  onClick={handleUpdate}
                  icon={<Zap className="w-4 h-4" />}
                >
                  Update Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
