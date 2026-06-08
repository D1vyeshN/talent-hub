"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { jobsService } from "@/features/jobs/services/jobs.service";
import type { Job, JobLevel, JobType } from "@/types";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "full-time" as JobType,
    level: "mid" as JobLevel,
    category: "",
    minSalary: undefined as number | undefined,
    maxSalary: undefined as number | undefined,
    skills: [] as string[],
    requirements: [] as string[],
    responsibilities: [] as string[],
    isRemote: false,
  });

  const [skillInput, setSkillInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");

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
        category: data.category,
        minSalary: data.salary.min,
        maxSalary: data.salary.max,
        skills: data.skills,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        isRemote: data.isRemote,
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
      // Validation
      if (!formData.title || formData.title.length < 5) {
        setError("Job title must be at least 5 characters");
        setSaving(false);
        return;
      }

      if (!formData.description || formData.description.length < 20) {
        setError("Description must be at least 20 characters");
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

      await jobsService.update(jobId, formData);
      router.push("/recruiter-dashboard/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to update job");
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, requirementInput.trim()] });
      setRequirementInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setFormData({ ...formData, responsibilities: [...formData.responsibilities, responsibilityInput.trim()] });
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({ ...formData, responsibilities: formData.responsibilities.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-12 text-center">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/recruiter-dashboard/jobs")}>
              Back to Jobs
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/recruiter-dashboard/jobs")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-sm text-gray-500">Update job posting details</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Job Details */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Engineering"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remote"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remote" className="text-sm text-gray-700">This is a remote position</label>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={() => setStep(2)}>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Requirements & Responsibilities</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the role, team, and what makes this opportunity exciting..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. React, TypeScript"
                  />
                  <Button variant="outline" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 3+ years of experience"
                  />
                  <Button variant="outline" onClick={addRequirement}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {req}
                      <button onClick={() => removeRequirement(index)} className="ml-auto text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Lead development of features"
                  />
                  <Button variant="outline" onClick={addResponsibility}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {formData.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {resp}
                      <button onClick={() => removeResponsibility(index)} className="ml-auto text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary" onClick={() => setStep(3)}>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Preview & Submit */}
        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Preview & Submit</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900">{formData.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{formData.location} · {formData.type} · {formData.level}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{formData.category}</span>
                  {formData.isRemote && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Remote</span>}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleUpdate} loading={saving}>
                  Update Job
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
