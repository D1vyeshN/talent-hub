"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Zap } from "lucide-react";
import { MOCK_RECRUITER } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type Step = 1 | 2 | 3;

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    setPosting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPosting(false);
    router.push("/recruiter-dashboard/jobs");
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {MOCK_RECRUITER.company} · {MOCK_RECRUITER.designation}
          </p>
        </div>
      </div>

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
                {["Job Details", "Requirements", "Preview & Post"][s - 1]}
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Job Type *
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                    <option>Remote</option>
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
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Required Skills
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type skills separated by commas (e.g. React, TypeScript, Node.js)"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Experience Level *
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Entry Level (0-2 yrs)</option>
                  <option>Mid Level (3-5 yrs)</option>
                  <option>Senior Level (5-8 yrs)</option>
                  <option>Lead / Principal (8+ yrs)</option>
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
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">Your job is ready to post!</p>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  It will go live immediately and appear in search results.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-900">Preview Summary</p>
                <div className="text-gray-600 space-y-1">
                  <p>📌 Senior React Developer</p>
                  <p>📍 Bengaluru, India · Full Time</p>
                  <p>💰 ₹15L – ₹25L / year</p>
                  <p>🏢 Google · Verified Company</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  <strong>Pro Tip:</strong> Feature your job for 3x more visibility.
                  Upgrade to Pro plan.
                </p>
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
                  loading={posting}
                  onClick={handlePost}
                  icon={<Zap className="w-4 h-4" />}
                >
                  Publish Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}