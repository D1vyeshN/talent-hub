"use client"
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, BriefcaseIcon, ChevronDown, Filter, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { JOB_TYPES, JOB_LEVELS, JOB_CATEGORIES } from "@/constants";
import { formatSalaryRange, timeAgo, getJobTypeBadgeColor, cn } from "@/lib/utils";
import type { JobType, JobLevel, Job } from "@/types";
import { jobsService } from "@/features/jobs/services/jobs.service";

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<JobLevel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    let isMounted = true;
    const debounceTimer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobsService.getAll({
          search: searchQuery || undefined,
          location: searchLocation || undefined,
          type: selectedTypes.length > 0 ? selectedTypes[0] : undefined,
          level: selectedLevels.length > 0 ? selectedLevels[0] : undefined,
          skills: selectedCategory || undefined,
          isRemote: isRemote || undefined,
        });
        if (isMounted) {
          setJobs(response.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load jobs");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, searchLocation, selectedTypes, selectedLevels, selectedCategory, isRemote]);

  const toggleJobType = (type: JobType) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const toggleJobLevel = (level: JobLevel) => {
    setSelectedLevels((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
  };

  const toggleSave = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobs((prev) => prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchLocation("");
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSelectedCategory("");
    setIsRemote(false);
  };

  const filteredJobs = useMemo(() => {
    let filteredJobs = jobs;

    if (sortBy === "newest") {
      filteredJobs = [...filteredJobs].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    } else if (sortBy === "salary") {
      filteredJobs = [...filteredJobs].sort((a, b) => b.salary.max - a.salary.max);
    } else if (sortBy === "applicants") {
      filteredJobs = [...filteredJobs].sort((a, b) => b.applicantsCount - a.applicantsCount);
    }

    return filteredJobs;
  }, [jobs, sortBy]);

  const activeFilterCount = selectedTypes.length + selectedLevels.length + (selectedCategory ? 1 : 0) + (isRemote ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, skill, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="sm:w-56 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">Active filters:</span>
              {selectedTypes.map((t) => (
                <Badge key={t} variant="info" size="sm" className="cursor-pointer" onClick={() => toggleJobType(t)}>
                  {t} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {selectedLevels.map((l) => (
                <Badge key={l} variant="info" size="sm" className="cursor-pointer" onClick={() => toggleJobLevel(l)}>
                  {l} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {selectedCategory && (
                <Badge variant="info" size="sm" className="cursor-pointer" onClick={() => setSelectedCategory("")}>
                  {selectedCategory} <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {isRemote && (
                <Badge variant="info" size="sm" className="cursor-pointer" onClick={() => setIsRemote(false)}>
                  Remote <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={cn(
            "w-72 flex-shrink-0",
            "hidden lg:block",
            filtersOpen && "fixed inset-0 z-50 bg-white overflow-y-auto p-6 lg:relative lg:bg-transparent lg:inset-auto lg:z-auto lg:p-0 lg:overflow-visible"
          )}>
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="info" size="sm">{activeFilterCount}</Badge>
                  )}
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">
                    Reset
                  </button>
                )}
              </div>

              {/* Remote Toggle */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">Remote Only</span>
                  <div
                    onClick={() => setIsRemote(!isRemote)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                      isRemote ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                      isRemote ? "translate-x-6" : "translate-x-1"
                    )} />
                  </div>
                </label>
              </div>

              {/* Job Type */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Job Type</h4>
                <div className="space-y-2">
                  {JOB_TYPES.map((type) => (
                    <label key={type.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.value)}
                        onChange={() => toggleJobType(type.value)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Experience Level</h4>
                <div className="space-y-2">
                  {JOB_LEVELS.map((level) => (
                    <label key={level.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level.value)}
                        onChange={() => toggleJobLevel(level.value)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Category</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {JOB_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                      className={cn(
                        "w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors",
                        selectedCategory === cat
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Sort & Count Row */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredJobs.length} <span className="text-gray-500 font-normal">jobs found</span>
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="salary">Highest Salary</option>
                    <option value="applicants">Most Applied</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                icon={<BriefcaseIcon className="w-8 h-8" />}
                title="No jobs found"
                description="Try adjusting your search criteria or clearing some filters."
                action={<Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>}
              />
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const isSaved = savedJobs.includes(job._id);
                  return (
                    <div
                      key={job._id}
                      className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/jobs/${job._id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {job.company.logo || "🏢"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-sm text-gray-600">{job.company.name}</span>
                                {job.company.verified && (
                                  <span className="text-blue-500 text-xs">✓ Verified</span>
                                )}
                              </div>
                            </div>

                            {/* Save Button */}
                            <button
                              onClick={(e) => toggleSave(job._id, e)}
                              className={cn(
                                "p-2 rounded-lg transition-colors flex-shrink-0",
                                isSaved
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              )}
                              aria-label={isSaved ? "Unsave job" : "Save job"}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="w-5 h-5" />
                              ) : (
                                <Bookmark className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {/* Meta Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </span>
                            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getJobTypeBadgeColor(job.type))}>
                              {job.type.replace("-", " ")}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                              {job.level} level
                            </span>
                            {job.isFeatured && (
                              <Badge variant="info" size="sm">⭐ Featured</Badge>
                            )}
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatSalaryRange(job.salary.min, job.salary.max)}
                            <span className="text-xs text-gray-400 font-normal ml-1">/ yr</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {job.applicantsCount} applicants · {timeAgo(job.postedAt)}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); router.push(`/jobs/${job._id}`); }}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {filteredJobs.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="md">
                  Load More Jobs
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
