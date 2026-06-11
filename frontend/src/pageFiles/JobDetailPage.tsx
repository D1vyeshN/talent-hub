"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Bookmark, BookmarkCheck, Briefcase, Building2, CheckCircle, Clock, DollarSign, ExternalLink, Globe, MapPin, Share2, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { formatSalaryRange, timeAgo, getJobTypeBadgeColor, cn } from "@/lib/utils";
import type { Job, User } from "@/types";
import { jobsService } from "@/features/jobs/services/jobs.service";
import { applyToJob } from "@/features/applications/services/application.service";
import { getCandidateProfile } from "@/features/candidate/services/candidate.service";

// Helper component to render company logo with fallback
function CompanyLogo({ logo, name, size = "md" }: { logo?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  const isUrl = logo && (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/"));

  if (isUrl) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <Image
          src={logo}
          alt={name}
          width={size === "lg" ? 80 : size === "md" ? 48 : 40}
          height={size === "lg" ? 80 : size === "md" ? 48 : 40}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback: show company name initials or emoji
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
      <span className="font-semibold text-blue-600">{initials}</span>
    </div>
  );
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [recruiter, setRecruiter] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [candidateResume, setCandidateResume] = useState<string>("");



  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jobsService.getById(jobId);
        setJob(data);
        // Recruiter data is already populated in the job response from backend
        if (data.recruiter) {
          setRecruiter(data.recruiter);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
    // Fetch candidate profile to get resume URL and check if already applied
    const fetchCandidateProfile = async () => {
      try {
        const candidate = await getCandidateProfile();
        setCandidateResume(candidate.resumeUrl || "");
        // Check if this job is already in candidate's applied jobs
        if (candidate.appliedJobs && candidate.appliedJobs.includes(jobId)) {
          setApplied(true);
        }
      } catch (err) {
        // User might not be logged in or not a candidate
        console.log("Could not fetch candidate profile:", err);
      }
    };

    fetchCandidateProfile();
  }, [jobId]);
  
  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      // Use candidate's resume URL from their profile
      await applyToJob(jobId, { coverLetter, resumeUrl: candidateResume });
      setApplied(true);
      setApplyModalOpen(false);
      setCoverLetter("");
    } catch (err: any) {
      setApplyError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-red-600">{error || "Job not found"}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/jobs")}>
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const similarJobs: Job[] = []; // TODO: Fetch similar jobs from backend

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/jobs")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start gap-5">
                <CompanyLogo logo={job.company.logo} name={job.company.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base text-gray-600 font-medium">{job.company.name}</span>
                        {job.company.verified && (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            <CheckCircle className="w-4 h-4" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSaved(!saved)}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all",
                          saved
                            ? "bg-blue-50 border-blue-200 text-blue-600"
                            : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                        )}
                        aria-label={saved ? "Unsave" : "Save"}
                      >
                        {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                      <button
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all"
                        aria-label="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> {job.level} level
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Posted {timeAgo(job.postedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {job.applicantsCount} applicants
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border", getJobTypeBadgeColor(job.type))}>
                      {job.type.replace("-", " ")}
                    </span>
                    {job.isFeatured && <Badge variant="info">⭐ Featured</Badge>}
                    {job.isRemote && <Badge variant="success">🌐 Remote</Badge>}
                  </div>
                </div>
              </div>

              {/* Salary + Apply CTA */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-gray-900">
                      {formatSalaryRange(job.salary.min, job.salary.max)}
                    </span>
                    <span className="text-sm text-gray-500">/ year</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Estimated based on industry standards</p>
                </div>
                {applied ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Application Submitted!
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" size="md" onClick={() => router.push("/candidate-dashboard")}>
                      View Similar
                    </Button>
                    <Button variant="primary" size="md" onClick={() => setApplyModalOpen(true)}>
                      Apply Now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Responsibilities</h3>
              <ul className="space-y-2.5">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Requirements</h3>
              <ul className="space-y-2.5">
                {job.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h2>
              <div className="space-y-4">
                {similarJobs.map((sj) => (
                  <div
                    key={sj._id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all"
                    onClick={() => router.push(`/jobs/${sj._id}`)}
                  >
                    <CompanyLogo logo={sj.company.logo} name={sj.company.name} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{sj.title}</p>
                      <p className="text-xs text-gray-500">{sj.company.name} · {sj.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatSalaryRange(sj.salary.min, sj.salary.max)}</p>
                      <p className="text-xs text-gray-400">{timeAgo(sj.postedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Company Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About {job.company.name}</h3>

              <div className="flex items-center gap-3 mb-4">
                <CompanyLogo logo={job.company.logo} name={job.company.name} size="md" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{job.company.name}</p>
                  <p className="text-xs text-gray-500">{job.company.industry}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { icon: Building2, label: "Company Size", value: `${job.company.size} employees` },
                  { icon: Globe, label: "Industry", value: job.company.industry },
                  { icon: MapPin, label: "Location", value: job.company.location },
                  { icon: Star, label: "Rating", value: `${job.company.rating}/5 (${job.company.reviewsCount?.toLocaleString()} reviews)` },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <item.icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm text-gray-700 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                className="mt-4"
                onClick={() => router.push(`/companies/${job.company._id}`)}
                icon={<ExternalLink className="w-4 h-4" />}
                iconPosition="right"
              >
                View Company Profile
              </Button>
            </div>

            {/* Job Highlights */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Job Highlights</h3>
              <div className="space-y-3">
                {[
                  "Competitive salary package",
                  "Flexible work arrangements",
                  "Health & wellness benefits",
                  "Learning & development budget",
                  "Stock options / ESOPs",
                ].map((highlight) => (
                  <div key={highlight} className="flex items-center gap-2 text-sm text-blue-800">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Hiring Recruiter</h3>
              {recruiter ? (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={recruiter.avatar} name={recruiter.name} size="md" showStatus status="online" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{recruiter.name}</p>
                    <p className="text-xs text-gray-500">
                      Recruiter at {job?.company?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name="Recruiter" size="md" showStatus status="online" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Recruiter</p>
                    <p className="text-xs text-gray-500">Loading...</p>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" fullWidth onClick={() => router.push("/messages")}>
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        description={`at ${job.company.name}`}
        size="lg"
      >
        <div className="p-6 space-y-5">
          {/* Resume Section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Resume</p>
            {candidateResume ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center bg-gray-50">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm font-medium text-gray-700">Resume from profile</p>
                <p className="text-xs text-gray-400 mt-1">Currently selected • <span className="text-blue-600 cursor-pointer hover:underline">Update in profile</span></p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center bg-gray-50">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm font-medium text-gray-700">No resume uploaded</p>
                <p className="text-xs text-gray-400 mt-1">Please upload a resume in your profile to apply</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push("/candidate-dashboard")}
                >
                  Go to Profile
                </Button>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Write a brief note about why you're a great fit for this role..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{coverLetter.length}/500 characters</p>
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Notice Period / Availability</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Immediately available</option>
              <option>2 weeks notice</option>
              <option>1 month notice</option>
              <option>2 months notice</option>
              <option>3+ months notice</option>
            </select>
          </div>

          {/* Error Message */}
          {applyError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{applyError}</p>
            </div>
          )}

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              ✉️ By applying, your profile and resume will be shared with <strong>{job.company.name}</strong>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="md" fullWidth onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              loading={applying}
              onClick={handleApply}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
